import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import QRTicket from "../components/QRTicket";

export default function BookingHistory() {
  const [tickets, setTickets] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axiosClient.get("/bookings/my").then((r) => setTickets(r.data)).catch(() => setTickets([]));
  }, []);

  if (!tickets) return <p className="tv2-page">Đang tải...</p>;

  return (
    <div className="tv2-page">
      <h2>Lịch sử đặt vé</h2>
      {tickets.length === 0 && <p>Bạn chưa đặt vé nào. Chọn một suất chiếu để bắt đầu.</p>}
      {tickets.map((t) => (
        <div className="tv2-row-card" key={t.id}>
          <div>
            <b>{t.movieTitle}</b>
            <div>{t.showtime}</div>
            <div>Ghế: {t.seats?.join(", ")} · {Number(t.total).toLocaleString()}đ</div>
          </div>
          <button className="tv2-btn" onClick={() => setSelected(t)}>Xem mã QR</button>
        </div>
      ))}
      {selected && <QRTicket ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
