import QRCode from "qrcode";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import SeatLock from "../models/SeatLock.js";
import { randomTicketCode } from "./helpers.js";
import { sendTicketEmail } from "./email.js";

async function finalizeSeats(order) {
  const res = await SeatLock.updateMany(
    { order: order._id },
    { $set: { status: "SOLD" }, $unset: { expiresAt: 1 } }
  );
  if (res.matchedCount >= order.seats.length) return null;

  const conflicts = [];
  for (const s of order.seats) {
    try {
      await SeatLock.updateOne(
        { showtimeId: order.showtimeId, seat: s.seat, order: order._id },
        { $set: { status: "SOLD" }, $unset: { expiresAt: 1 } },
        { upsert: true }
      );
    } catch (e) {
      if (e.code === 11000) conflicts.push(s.seat);
      else throw e;
    }
  }
  return conflicts.length ? conflicts : null;
}

export async function fulfillOrder(orderId, { paymentLinkId, method } = {}) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: { $in: ["HOLDING", "PENDING_PAYMENT", "EXPIRED"] } },
    {
      $set: {
        status: "PAID",
        paidAt: new Date(),
        ...(paymentLinkId && { paymentLinkId }),
        ...(method && { paymentMethod: method }),
      },
      $unset: { holdExpiresAt: 1 },
    },
    { new: true }
  );

  if (!order) {

    const existing = await Order.findById(orderId);
    const ticket = existing?.status === "PAID" ? await Ticket.findOne({ order: existing._id }) : null;
    return existing ? { order: existing, ticket, alreadyPaid: existing.status === "PAID" } : null;
  }

  const conflicts = await finalizeSeats(order);
  if (conflicts) {
    order.note = `SEAT_CONFLICT: ${conflicts.join(", ")} đã bị người khác giữ - cần hoàn tiền/đổi ghế thủ công`;
    await order.save();
    console.warn(`⚠️ Đơn ${order.orderCode}: ${order.note}`);
  }

  let ticket;
  for (let i = 0; i < 5 && !ticket; i++) {
    const code = randomTicketCode();
    try {
      const qrCode = await QRCode.toDataURL(code, { margin: 1, width: 300 });
      ticket = await Ticket.create({
        code,
        order: order._id,
        user: order.user,
        movie: order.movie,
        movieTitle: order.showtime.movieTitle,
        poster: order.showtime.poster,
        cinemaName: order.showtime.cinemaName,
        room: order.showtime.room,
        date: order.showtime.date,
        time: order.showtime.time,
        format: order.showtime.format,
        seats: order.seats.map((s) => s.seat),
        customerEmail: order.customer?.email,
        qrCode,
      });
    } catch (e) {
      if (e.code !== 11000 || e.keyPattern?.order) throw e;
    }
  }

  sendTicketEmail(ticket, order)
    .then((sent) => sent && Ticket.updateOne({ _id: ticket._id }, { emailSent: true }))
    .catch((e) => console.error("[email] Gửi vé thất bại:", e.message));

  return { order, ticket, alreadyPaid: false };
}

export async function expireStaleOrders() {
  const stale = await Order.find({
    status: { $in: ["HOLDING", "PENDING_PAYMENT"] },
    holdExpiresAt: { $lte: new Date() },
  }).select("_id");
  if (!stale.length) return 0;
  const ids = stale.map((o) => o._id);
  await Order.updateMany({ _id: { $in: ids }, status: { $in: ["HOLDING", "PENDING_PAYMENT"] } }, { status: "EXPIRED" });
  await SeatLock.deleteMany({ order: { $in: ids }, status: "HOLDING" });
  return ids.length;
}
