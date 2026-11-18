import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Countdown from "../components/Countdown";
import { useBooking } from "../context/BookingContext";

export default function ComboSelection() {
  const { booking, update, reset } = useBooking();
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [qty, setQty] = useState({});

  useEffect(() => {
    if (!booking.bookingId) { navigate("/"); return; }
    axiosClient.get("/combos").then((r) => setCombos(r.data));
  }, []);

  const change = (id, d) => setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + d) }));

  const seatTotal = booking.seats.reduce((s, x) => s + x.price, 0);
  const comboTotal = combos.reduce((s, c) => s + Number(c.price) * (qty[c.id] || 0), 0);

  const onExpire = async () => {
    alert("Đã hết thời gian giữ ghế. Vui lòng chọn lại.");
    try { await axiosClient.post(`/bookings/${booking.bookingId}/release`); } catch {}
    const id = booking.showtimeId;
    reset();
    navigate(id ? `/showtimes/${id}/seats` : "/");
  };

  const onNext = () => {
    const chosen = combos
      .filter((c) => qty[c.id] > 0)
      .map((c) => ({ id: c.id, name: c.name, price: Number(c.price), qty: qty[c.id] }));
    update({ combos: chosen });
    navigate("/booking/payment");
  };

  if (!booking.bookingId) return null;

  return (
    <div className="tv2-page">
      <h2>Chọn combo bắp nước</h2>
      <Countdown expiresAt={booking.expiresAt} onExpire={onExpire} />
      {combos.map((c) => (
        <div className="tv2-row-card" key={c.id}>
          <div><b>{c.name}</b><div>{Number(c.price).toLocaleString()}đ</div></div>
          <div className="tv2-qty">
            <button onClick={() => change(c.id, -1)}>−</button>
            <span>{qty[c.id] || 0}</span>
            <button onClick={() => change(c.id, 1)}>+</button>
          </div>
        </div>
      ))}
      <p>Tiền ghế: {seatTotal.toLocaleString()}đ</p>
      <p>Tiền combo: {comboTotal.toLocaleString()}đ</p>
      <h3>Tổng: {(seatTotal + comboTotal).toLocaleString()}đ</h3>
      <button className="tv2-btn" onClick={onNext}>Thanh toán</button>
    </div>
  );
}
