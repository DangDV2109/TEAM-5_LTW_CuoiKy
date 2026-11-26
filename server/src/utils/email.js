import nodemailer from "nodemailer";
import { formatVND } from "./helpers.js";

let transporter = null;

export function isEmailConfigured() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  return Boolean(EMAIL_USER && EMAIL_PASS && EMAIL_PASS !== "your_gmail_app_password");
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
}

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function buildHtml(ticket, order) {
  const combos = (order.combos || [])
    .map((c) => `<tr><td style="padding:4px 0;color:#666">${esc(c.name)} x${c.quantity}</td><td style="text-align:right">${formatVND(c.price * c.quantity)}</td></tr>`)
    .join("");
  return `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#dc2626,#9333ea);padding:24px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:22px">🎬 PTIT CINEMA</h1>
    <p style="margin:6px 0 0;color:#fde68a">Vé điện tử của bạn</p>
  </div>
  <div style="padding:24px">
    <h2 style="margin:0 0 4px;color:#fff">${esc(ticket.movieTitle)}</h2>
    <p style="margin:0 0 16px;color:#94a3b8">${esc(ticket.format || "2D")} • ${esc(ticket.cinemaName || "")}</p>
    <table style="width:100%;font-size:14px;color:#e2e8f0">
      <tr><td style="padding:4px 0;color:#94a3b8">Mã vé</td><td style="text-align:right;font-weight:bold;font-size:16px;color:#fbbf24">${esc(ticket.code)}</td></tr>
      <tr><td style="padding:4px 0;color:#94a3b8">Suất chiếu</td><td style="text-align:right">${esc(ticket.time)} • ${esc(ticket.date)}</td></tr>
      <tr><td style="padding:4px 0;color:#94a3b8">Phòng</td><td style="text-align:right">${esc(ticket.room)}</td></tr>
      <tr><td style="padding:4px 0;color:#94a3b8">Ghế</td><td style="text-align:right;font-weight:bold">${esc(ticket.seats.join(", "))}</td></tr>
      ${combos}
      <tr><td style="padding:8px 0 0;color:#94a3b8;border-top:1px solid #334155">Tổng thanh toán</td><td style="text-align:right;padding-top:8px;border-top:1px solid #334155;font-weight:bold">${formatVND(order.total)}</td></tr>
    </table>
    <div style="text-align:center;margin-top:20px;background:#fff;border-radius:12px;padding:16px">
      <img src="cid:ticket-qr" alt="QR vé" width="200" height="200" />
      <p style="color:#334155;margin:8px 0 0;font-size:12px">Đưa mã QR này tại quầy soát vé</p>
    </div>
    <p style="color:#64748b;font-size:12px;text-align:center;margin-top:20px">Vui lòng có mặt trước giờ chiếu 15 phút. Cảm ơn bạn đã chọn PTIT Cinema!</p>
  </div>
</div>`;
}

export async function sendTicketEmail(ticket, order) {
  if (!ticket.customerEmail) return false;
  if (!isEmailConfigured()) {
    console.log(`[email] Chưa cấu hình EMAIL_USER/EMAIL_PASS -> bỏ qua gửi vé ${ticket.code} tới ${ticket.customerEmail}`);
    return false;
  }
  const base64 = ticket.qrCode.split(",")[1];
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: ticket.customerEmail,
    subject: `🎟️ Vé xem phim ${ticket.movieTitle} - ${ticket.code}`,
    html: buildHtml(ticket, order),
    attachments: [{ filename: `${ticket.code}.png`, content: Buffer.from(base64, "base64"), cid: "ticket-qr" }],
  });
  console.log(`[email] Đã gửi vé ${ticket.code} tới ${ticket.customerEmail}`);
  return true;
}
