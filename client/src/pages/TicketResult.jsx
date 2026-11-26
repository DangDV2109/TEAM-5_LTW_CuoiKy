import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import QRTicket from "../components/QRTicket";
import { useBooking } from "../context/BookingContext";

export default function TicketResult() {
  const { bookingId } = useParams();
  const { reset } = useBooking();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    axiosClient.get(`/bookings/${bookingId}`).then((r) => setTicket(r.data));
    reset(); // đặt xong thì xoá dữ liệu tạm
  }, [bookingId]);

  if (!ticket) return <p className="tv2-page">Đang tải vé...</p>;

  return (
    <div className="tv2-page center">
      <h2>Đặt vé thành công</h2>
      <QRTicket ticket={ticket} />
      <p><Link to="/history">Xem lịch sử đặt vé</Link></p>
    </div>
  );
}
