import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import axiosClient from "../api/axiosClient";
import Countdown from "../components/Countdown";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { apiError, vnd } from "../utils";

const QUICK_COUPONS = [
  { code: "PTIT10", desc: "Giảm 10%" },
  { code: "PTIT20K", desc: "Giảm 20K" },
  { code: "SINHVIEN", desc: "SV -15%" },
  { code: "GIAM50K", desc: "-50K (từ 200K)" },
];

export default function Payment() {
  const { booking, reset } = useBooking();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null); // { qrContent, total, subtotal, discountAmount, couponCode }
  const [error, setError] = useState("");
  const [walletMsg, setWalletMsg] = useState("");
  const [paying, setPaying] = useState(false);

  // Nâng cao: Mã giảm giá (Coupon)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const { user, updateUser } = useAuth();

  const runCheckout = (code = "") =>
    axiosClient.post(`/bookings/${booking.bookingId}/checkout`, {
      combos: booking.combos.map((c) => ({ id: c.id, qty: c.qty })),
      couponCode: code || undefined,
    });

  // 1) Tạo yêu cầu thanh toán
  useEffect(() => {
    if (!booking.bookingId) {
      navigate("/");
      return;
    }
    runCheckout("")
      .then((r) => setPayment(r.data))
      .catch((err) => setError(apiError(err, "Không tạo được mã thanh toán")));
  }, []);

  // 2) Cứ 3 giây hỏi BE đã thanh toán chưa (polling có cleanup)
  useEffect(() => {
    if (!payment) return;
    const timer = setInterval(async () => {
      try {
        const { data } = await axiosClient.get(`/bookings/${booking.bookingId}`);
        if (data.status === "PAID") {
          clearInterval(timer);
          navigate(`/ticket/${booking.bookingId}`);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(timer);
  }, [payment, booking.bookingId, navigate]);

  const handleApplyCoupon = async (codeOverride) => {
    const code = String(codeOverride ?? couponInput).trim().toUpperCase();
    setCouponMsg({ type: "", text: "" });
    if (!code) {
      setCouponInput("");
      setAppliedCoupon("");
      const { data } = await runCheckout("").catch(() => ({ data: null }));
      if (data) setPayment(data);
      return;
    }
    setCouponInput(code);
    setApplyingCoupon(true);
    try {
      const { data } = await runCheckout(code);
      setPayment(data);
      setAppliedCoupon(code);
      setCouponMsg({
        type: "ok",
        text: `✅ Áp dụng mã ${code} thành công! Giảm ${vnd(data.discountAmount)}.`,
      });
    } catch (err) {
      setCouponMsg({ type: "err", text: apiError(err, "Mã giảm giá không hợp lệ") });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const payByWallet = async () => {
    setWalletMsg("");
    setPaying(true);
    try {
      const { data } = await axiosClient.post(`/payments/wallet/${booking.bookingId}`);
      if (data?.balance !== undefined) updateUser({ balance: data.balance });
      navigate(`/ticket/${booking.bookingId}`);
    } catch (err) {
      setWalletMsg(apiError(err, "Thanh toán bằng ví thất bại"));
    } finally {
      setPaying(false);
    }
  };

  const onExpire = () => {
    alert("Hết thời gian thanh toán. Ghế đã được nhả.");
    const id = booking.showtimeId;
    reset();
    navigate(id ? `/showtimes/${id}/seats` : "/");
  };

  if (error) return <p className="tv2-page tv2-error">{error}</p>;
  if (!payment) return <p className="tv2-page">Đang tạo mã thanh toán...</p>;

  return (
    <div className="tv2-page center">
      <h2>Quét mã để thanh toán</h2>
      <Countdown expiresAt={booking.expiresAt} onExpire={onExpire} />

      {/* Khu vực nhập Mã giảm giá (Nâng cao) */}
      <div className="tv2-card" style={{ textAlign: "left", marginTop: "14px" }}>
        <div style={{ fontWeight: 700, marginBottom: "8px" }}>🎟️ Mã giảm giá (Voucher)</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="tv2-input"
            placeholder="Nhập mã giảm giá (VD: PTIT10, SINHVIEN)..."
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="tv2-btn sm"
            disabled={applyingCoupon}
            onClick={() => handleApplyCoupon()}
          >
            {applyingCoupon ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
          {appliedCoupon && (
            <button
              type="button"
              className="tv2-btn sm ghost"
              onClick={() => handleApplyCoupon("")}
            >
              Gỡ mã
            </button>
          )}
        </div>
        <div className="tv2-chips" style={{ marginTop: "8px" }}>
          {QUICK_COUPONS.map((c) => (
            <button
              key={c.code}
              type="button"
              className={`tv2-chip ${appliedCoupon === c.code ? "active" : ""}`}
              style={{ padding: "4px 10px", fontSize: "12px" }}
              onClick={() => handleApplyCoupon(c.code)}
            >
              {c.code} ({c.desc})
            </button>
          ))}
        </div>
        {couponMsg.text && (
          <p className={couponMsg.type === "ok" ? "tv2-okmsg small" : "tv2-error small"} style={{ marginBottom: 0 }}>
            {couponMsg.text}
          </p>
        )}
      </div>

      <div className="tv2-qr">
        <QRCodeSVG value={String(payment.qrContent)} size={220} />
      </div>

      {payment.discountAmount > 0 && (
        <p className="tv2-muted small" style={{ margin: "0 0 4px" }}>
          Tạm tính: <s>{vnd(payment.subtotal)}</s> · Giảm giá ({payment.couponCode}):{" "}
          <b style={{ color: "#86efac" }}>-{vnd(payment.discountAmount)}</b>
        </p>
      )}
      <h3>{vnd(payment.total)}</h3>
      <p>Trang sẽ tự chuyển khi hệ thống nhận được tiền.</p>

      <hr style={{ borderColor: "#343949", margin: "18px 0" }} />
      <p>
        Hoặc thanh toán bằng ví (số dư:{" "}
        <b>{Number(user?.balance || 0).toLocaleString("vi-VN")}đ</b>)
      </p>
      <button className="tv2-btn" onClick={payByWallet} disabled={paying}>
        {paying ? "Đang thanh toán..." : "Thanh toán bằng ví"}
      </button>
      {walletMsg && (
        <p className="tv2-error">
          {walletMsg} {walletMsg.includes("Số dư") && <Link to="/wallet">Nạp tiền</Link>}
        </p>
      )}
    </div>
  );
}
