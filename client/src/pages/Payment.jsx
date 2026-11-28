import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import axiosClient from "../api/axiosClient";
import Countdown from "../components/Countdown";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";

export default function Payment() {
  const { booking, reset } = useBooking();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null); // { qrContent, total }
  const [error, setError] = useState("");
  const [walletMsg, setWalletMsg] = useState("");
  const [paying, setPaying] = useState(false);
  const { user, updateUser } = useAuth();

  // 1) Tạo yêu cầu thanh toán
  useEffect(() => {
    if (!booking.bookingId) { navigate("/"); return; }
    axiosClient
      .post(`/bookings/${booking.bookingId}/checkout`, {
        combos: booking.combos.map((c) => ({ id: c.id, qty: c.qty })),
      })
      .then((r) => setPayment(r.data))
      .catch((err) => setError(err.response?.data?.message || "Không tạo được mã thanh toán"));
  }, []);

  // 2) Cứ 3 giây hỏi BE đã thanh toán chưa
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
  }, [payment]);

  const payByWallet = async () => {
    setWalletMsg("");
    setPaying(true);
    try {
      const { data } = await axiosClient.post(`/payments/wallet/${booking.bookingId}`);
      if (data?.balance !== undefined) updateUser({ balance: data.balance });
      navigate(`/ticket/${booking.bookingId}`);
    } catch (err) {
      setWalletMsg(err.response?.data?.message || "Thanh toán bằng ví thất bại");
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
      <div className="tv2-qr"><QRCodeSVG value={String(payment.qrContent)} size={240} /></div>
      <h3>{Number(payment.total).toLocaleString()}đ</h3>
      <p>Trang sẽ tự chuyển khi hệ thống nhận được tiền.</p>
      <hr style={{ borderColor: "#343949", margin: "18px 0" }} />
      <p>Hoặc thanh toán bằng ví (số dư: <b>{Number(user?.balance || 0).toLocaleString("vi-VN")}đ</b>)</p>
      <button className="tv2-btn" onClick={payByWallet} disabled={paying}>{paying ? "Đang thanh toán..." : "Thanh toán bằng ví"}</button>
      {walletMsg && <p className="tv2-error">{walletMsg} {walletMsg.includes("Số dư") && <Link to="/wallet">Nạp tiền</Link>}</p>}
    </div>
  );
}
