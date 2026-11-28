import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import QRTicket from "../components/QRTicket";
import BackButton from "../components/BackButton";
import { vnd } from "../utils";

const STATUS = { PAID: ["Đã thanh toán", "ok"], PENDING_PAYMENT: ["Chờ thanh toán", "warn"], CANCELLED: ["Đã huỷ", "bad"], EXPIRED: ["Hết hạn", "bad"] };

export default function BookingHistory() {
  const [tickets, setTickets] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axiosClient.get("/bookings/my").then((r) => setTickets(r.data)).catch(() => setTickets([]));
  }, []);

  if (!tickets) return <p className="tv2-page">Đang tải...</p>;

  return (
    <div className="tv2-page">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Lịch sử mua vé</h2>
      {tickets.length === 0 && <p>Bạn chưa đặt vé nào. Chọn một suất chiếu để bắt đầu.</p>}
      {tickets.map((t) => {
        const [label, cls] = STATUS[t.status] || [];
        return (
          <div className="tv2-row-card" key={t.id}>
            <div>
              <b>{t.movieTitle}</b> {label && <span className={`tv2-badge ${cls}`}>{label}</span>}
              <div>{t.showtime}</div>
              <div>Ghế: {t.seats?.join(", ")} · {vnd(t.total)}{t.paymentMethod ? ` · ${t.paymentMethod}` : ""}</div>
            </div>
            <button className="tv2-btn" onClick={() => setSelected(t)}>Xem mã QR</button>
          </div>
        );
      })}
      {selected && <QRTicket ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
