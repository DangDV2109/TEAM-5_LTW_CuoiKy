import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import QRTicket from "../components/QRTicket";
import BackButton from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { apiError, vnd } from "../utils";

const STATUS = {
  PAID: ["Đã thanh toán", "ok"],
  PENDING_PAYMENT: ["Chờ thanh toán", "warn"],
  CANCELLED: ["Đã huỷ", "bad"],
  EXPIRED: ["Hết hạn", "bad"],
};

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function parseShowtimeMs(ticket) {
  const rawDate = ticket.date || (ticket.showtime || "").match(/(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}-\d{2}-\d{2})/)?.[1];
  const rawTime = ticket.time || (ticket.showtime || "").match(/(\d{1,2}:\d{2})/)?.[1];
  if (!rawDate || !rawTime) return null;
  let isoDate = rawDate;
  const dmy = rawDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmy) isoDate = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(`${isoDate}T${rawTime}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export default function BookingHistory() {
  const [tickets, setTickets] = useState(null);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [cancellingId, setCancellingId] = useState(null);
  const { updateUser } = useAuth();

  const load = () =>
    axiosClient
      .get("/bookings/my")
      .then((r) => setTickets(r.data))
      .catch(() => setTickets([]));

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (t) => {
    setMsg({ type: "", text: "" });
    if (!window.confirm(`Bạn chắc chắn muốn huỷ vé phim "${t.movieTitle}" (Mã: ${t.code})?`)) return;
    setCancellingId(t.id);
    try {
      const { data } = await axiosClient.post(`/bookings/${t.id}/cancel`);
      if (data?.balance !== undefined) updateUser({ balance: data.balance });
      setMsg({
        type: "ok",
        text: data?.refunded
          ? `✅ Đã huỷ vé ${t.code} và hoàn tiền ${vnd(t.total)} vào ví của bạn.`
          : `✅ Đã huỷ vé ${t.code} thành công. Ghế đã được trả lại sơ đồ phòng.`,
      });
      load();
    } catch (err) {
      setMsg({ type: "err", text: apiError(err, "Không thể huỷ vé này") });
    } finally {
      setCancellingId(null);
    }
  };

  if (!tickets) return <p className="tv2-page">Đang tải...</p>;

  return (
    <div className="tv2-page">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Lịch sử mua vé</h2>
      <p className="tv2-muted small" style={{ marginTop: "-6px" }}>
        Quy định: Thành viên được phép huỷ vé miễn phí trước giờ chiếu ít nhất <b>2 tiếng</b>.
      </p>

      {msg.text && (
        <p className={msg.type === "ok" ? "tv2-notice" : "tv2-error"} role="status">
          {msg.text}
        </p>
      )}

      {tickets.length === 0 && (
        <p>Bạn chưa đặt vé nào. Chọn một suất chiếu để bắt đầu.</p>
      )}

      {tickets.map((t) => {
        const [label, cls] = STATUS[t.status] || [];
        const canStatusCancel = t.status === "PAID" || t.status === "PENDING_PAYMENT";
        const startMs = parseShowtimeMs(t);
        const withinTwoHours = startMs !== null && startMs - Date.now() < TWO_HOURS_MS;

        return (
          <div className="tv2-row-card" key={t.id} style={{ flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <b>{t.movieTitle}</b>{" "}
              {label && <span className={`tv2-badge ${cls}`}>{label}</span>}
              <div>{t.showtime}</div>
              <div>
                Ghế: {t.seats?.join(", ")} · {vnd(t.total)}
                {t.couponCode ? ` (Mã ${t.couponCode}: -${vnd(t.discountAmount)})` : ""}
                {t.paymentMethod ? ` · ${t.paymentMethod}` : ""}
              </div>
              {canStatusCancel && withinTwoHours && (
                <div className="tv2-muted small" style={{ color: "#fca5a5" }}>
                  * Đã quá hạn huỷ (dưới 2 tiếng trước giờ chiếu)
                </div>
              )}
            </div>

            <div className="tv2-actions">
              {t.status !== "CANCELLED" && (
                <button className="tv2-btn sm" onClick={() => setSelected(t)}>
                  Xem mã QR
                </button>
              )}
              {canStatusCancel && (
                <button
                  type="button"
                  className="tv2-btn sm ghost"
                  disabled={cancellingId === t.id}
                  onClick={() => handleCancel(t)}
                  style={{
                    color: withinTwoHours ? "#9aa0ae" : "#fca5a5",
                    borderColor: withinTwoHours ? "#4a4f5c" : "rgba(239,68,68,0.5)",
                  }}
                  title={
                    withinTwoHours
                      ? "Chỉ được huỷ vé trước giờ chiếu ít nhất 2 tiếng"
                      : "Huỷ vé này trước giờ chiếu 2 tiếng"
                  }
                >
                  {cancellingId === t.id ? "Đang huỷ..." : "Huỷ vé"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {selected && <QRTicket ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
