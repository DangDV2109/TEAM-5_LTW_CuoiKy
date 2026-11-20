import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import SeatMap from "../components/SeatMap";
import { useBooking } from "../context/BookingContext";

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { booking, update } = useBooking();
  const location = useLocation();
  // Thông tin suất chiếu do trang chi tiết phim truyền sang (còn lưu lại khi F5)
  const info = location.state?.info || booking.showtimeInfo;
  const infoText = info ? [info.movieTitle, info.cinemaName, info.date, info.time].filter(Boolean).join(" · ") : "";
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadSeats = () =>
    axiosClient
      .get(`/showtimes/${showtimeId}/seats`)
      .then((r) => setSeats(r.data))
      .catch((err) => setError(err.message || "Không tải được sơ đồ ghế"));

  useEffect(() => { loadSeats(); }, [showtimeId]);
  useEffect(() => { if (location.state?.info) update({ showtimeInfo: location.state.info }); }, []);

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
        showtimeInfo: info || undefined,
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
      {infoText && <p style={{ color: "var(--tv2-muted)" }}>{infoText}</p>}
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
