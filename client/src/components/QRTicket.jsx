import { QRCodeSVG } from "qrcode.react";

// ticket: { movieTitle, showtime, seats: [..], code }
// Có onClose -> hiện dạng popup; không có -> hiện thẳng trong trang
export default function QRTicket({ ticket, onClose }) {
  const card = (
    <div className="tv2-ticket">
      <h3>{ticket.movieTitle}</h3>
      <p>{ticket.showtime}</p>
      <p>Ghế: {ticket.seats?.join(", ")}</p>
      <div className="tv2-qr"><QRCodeSVG value={String(ticket.code)} size={190} /></div>
      <p className="tv2-code">Mã vé: {ticket.code}</p>
      {onClose && <button className="tv2-btn ghost" onClick={onClose}>Đóng</button>}
    </div>
  );
  return onClose ? <div className="tv2-modal" onClick={onClose}><div onClick={(e) => e.stopPropagation()}>{card}</div></div> : card;
}
