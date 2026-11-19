import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import SeatMap from "../components/SeatMap";
import { useBooking } from "../context/BookingContext";

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { update } = useBooking();
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadSeats = () =>
    axiosClient.get(`/showtimes/${showtimeId}/seats`).then((r) => setSeats(r.data));

  useEffect(() => { loadSeats(); }, [showtimeId]);

  const toggle = (seat) =>
    setSelected((cur) =>
      cur.some((s) => s.id === seat.id) ? cur.filter((s) => s.id !== seat.id) : [...cur, seat]
    );

  const total = selected.reduce((sum, s) => sum + Number(s.price), 0);

  const onContinue = async () => {
    setBusy(true);
    setError("");
    try {
      // BE giữ ghế và trả { bookingId, expiresAt }
      const { data } = await axiosClient.post("/bookings/hold", {
        showtimeId,
        seatIds: selected.map((s) => s.id),
      });
      update({
        showtimeId,
        seats: selected.map((s) => ({ id: s.id, label: `${s.row}${s.number}`, price: Number(s.price) })),
        bookingId: data.bookingId,
        expiresAt: data.expiresAt,
        combos: [],
      });
      navigate("/booking/combo");
    } catch (err) {
      setError(err.response?.data?.message || "Có ghế vừa được người khác chọn. Hãy chọn lại.");
      setSelected([]);
      loadSeats();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tv2-page wide">
      <h2>Chọn ghế</h2>
      <SeatMap seats={seats} selectedIds={selected.map((s) => s.id)} onToggle={toggle} />
      {error && <p className="tv2-error">{error}</p>}
      <p>Ghế đã chọn: {selected.map((s) => `${s.row}${s.number}`).join(", ") || "chưa chọn"}</p>
      <p>Tạm tính: <b>{total.toLocaleString()}đ</b></p>
      <button className="tv2-btn" disabled={selected.length === 0 || busy} onClick={onContinue}>
        {busy ? "Đang giữ ghế..." : "Giữ ghế và tiếp tục"}
      </button>
    </div>
  );
}
