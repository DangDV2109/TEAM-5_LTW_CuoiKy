import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import SeatLock from "../models/SeatLock.js";
import Combo from "../models/Combo.js";
import { HOLD_MINUTES, PAYMENT_WINDOW_MINUTES } from "../config/cinemas.js";
import { ApiError, asyncHandler, generateOrderCode, ok, showtimeStart } from "../utils/helpers.js";
import { buildSeatMap, cinemaName, findShowtime } from "../utils/seats.js";
import {
  buildVietQR,
  cancelPayOSLink,
  createPayOSLink,
  isPayOSConfigured,
  qrStringToImage,
  transferContent,
} from "../utils/payment.js";

const MAX_SEATS = 8;
const addMinutes = (m) => new Date(Date.now() + m * 60 * 1000);

function assertAccess(order, user) {
  if (!order.user) return;
  if (!user || (!order.user.equals(user._id) && user.role !== "ADMIN")) {
    throw new ApiError(403, "Bạn không có quyền truy cập đơn hàng này");
  }
}

async function expireIfNeeded(order) {
  if (["HOLDING", "PENDING_PAYMENT"].includes(order.status) && order.holdExpiresAt && order.holdExpiresAt <= new Date()) {
    order.status = "EXPIRED";
    await order.save();
    await SeatLock.deleteMany({ order: order._id, status: "HOLDING" });
  }
  return order;
}

async function loadOrder(req) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");
  assertAccess(order, req.user);
  return expireIfNeeded(order);
}

export const holdSeats = asyncHandler(async (req, res) => {
  const { showtimeId } = req.body;
  const wanted = [...new Set((req.body.seats || []).map((s) => String(s).toUpperCase().trim()))];
  if (!showtimeId) throw new ApiError(400, "Thiếu showtimeId");
  if (!wanted.length) throw new ApiError(400, "Vui lòng chọn ít nhất 1 ghế");
  if (wanted.length > MAX_SEATS) throw new ApiError(400, `Chỉ được đặt tối đa ${MAX_SEATS} ghế mỗi đơn`);

  const { movie, showtime } = await findShowtime(showtimeId);
  const start = showtimeStart(showtime);
  if (start && start <= new Date()) throw new ApiError(400, "Suất chiếu này đã bắt đầu hoặc đã kết thúc");

  const map = new Map(buildSeatMap(showtime).map((s) => [s.seat, s]));
  const invalid = wanted.filter((s) => !map.has(s));
  if (invalid.length) throw new ApiError(400, `Ghế không tồn tại: ${invalid.join(", ")}`);

  const seats = wanted.map((s) => ({ seat: s, type: map.get(s).type, price: map.get(s).price }));
  const ticketTotal = seats.reduce((sum, s) => sum + s.price, 0);
  const expiresAt = addMinutes(HOLD_MINUTES);

  await SeatLock.deleteMany({ showtimeId: showtime._id, seat: { $in: wanted }, expiresAt: { $lte: new Date() } });

  const order = await Order.create({
    user: req.user?._id,
    customer: req.user ? { name: req.user.name, email: req.user.email, phone: req.user.phone } : undefined,
    movie: movie._id,
    showtimeId: showtime._id,
    showtime: {
      movieTitle: movie.title,
      poster: movie.poster,
      cinemaId: showtime.cinemaId,
      cinemaName: cinemaName(showtime.cinemaId),
      room: showtime.room,
      date: showtime.date,
      time: showtime.time,
      format: showtime.format,
    },
    seats,
    ticketTotal,
    total: ticketTotal,
    holdExpiresAt: expiresAt,
  });

  try {
    await SeatLock.insertMany(
      wanted.map((seat) => ({ showtimeId: showtime._id, seat, order: order._id, status: "HOLDING", expiresAt })),
      { ordered: true }
    );
  } catch (e) {

    await SeatLock.deleteMany({ order: order._id });
    await Order.deleteOne({ _id: order._id });
    if (e.code === 11000 || e.writeErrors) {
      const taken = await SeatLock.find({ showtimeId: showtime._id, seat: { $in: wanted } }).lean();
      throw new ApiError(409, "Một số ghế vừa có người khác chọn, vui lòng chọn ghế khác", {
        conflictSeats: taken.map((t) => t.seat),
      });
    }
    throw e;
  }

  ok(res, { orderId: order._id, seats, ticketTotal, total: ticketTotal, holdExpiresAt: expiresAt, holdSeconds: HOLD_MINUTES * 60 }, {}, 201);
});

export const releaseSeats = asyncHandler(async (req, res) => {
  const order = await loadOrder(req);
  if (order.status === "PAID") throw new ApiError(400, "Đơn đã thanh toán, không thể nhả ghế");
  if (["HOLDING", "PENDING_PAYMENT"].includes(order.status)) {
    await cancelPayOSLink(order);
    order.status = "CANCELLED";
    await order.save();
  }
  await SeatLock.deleteMany({ order: order._id, status: "HOLDING" });
  ok(res, { orderId: order._id, status: order.status });
});

export const checkout = asyncHandler(async (req, res) => {
  const order = await loadOrder(req);
  if (order.status === "PAID") throw new ApiError(400, "Đơn hàng đã được thanh toán");
  if (order.status === "EXPIRED") throw new ApiError(410, "Đơn đã hết thời gian giữ ghế, vui lòng chọn lại ghế");
  if (order.status === "CANCELLED") throw new ApiError(400, "Đơn hàng đã bị huỷ");

  const lockCount = await SeatLock.countDocuments({ order: order._id });
  if (lockCount < order.seats.length) throw new ApiError(410, "Ghế không còn được giữ, vui lòng chọn lại");

  if (order.status === "PENDING_PAYMENT" && order.orderCode && !req.body.combos) {
    return ok(res, await paymentPayload(order));
  }

  const customer = { ...(order.toObject().customer || {}), ...(req.body.customer || {}) };
  if (!customer.email || !/^\S+@\S+\.\S+$/.test(customer.email)) throw new ApiError(400, "Vui lòng nhập email hợp lệ để nhận vé điện tử");
  if (!customer.name) throw new ApiError(400, "Vui lòng nhập họ tên người nhận vé");

  const reqCombos = Array.isArray(req.body.combos) ? req.body.combos.filter((c) => Number(c.quantity) > 0) : [];
  const dbCombos = await Combo.find({ _id: { $in: reqCombos.map((c) => c.comboId) }, active: true }).lean();
  const comboMap = new Map(dbCombos.map((c) => [String(c._id), c]));
  const combos = reqCombos.map((c) => {
    const dbc = comboMap.get(String(c.comboId));
    if (!dbc) throw new ApiError(400, `Combo không tồn tại hoặc ngừng bán: ${c.comboId}`);
    const quantity = Math.min(Math.floor(Number(c.quantity)), 10);
    return { combo: dbc._id, name: dbc.name, price: dbc.price, quantity };
  });
  const comboTotal = combos.reduce((s, c) => s + c.price * c.quantity, 0);
  const total = order.ticketTotal + comboTotal;
  if (total < 2000) throw new ApiError(400, "Tổng tiền không hợp lệ");

  const wantPayOS = (req.body.paymentMethod || "PAYOS").toUpperCase() === "PAYOS";
  const method = wantPayOS && isPayOSConfigured() ? "PAYOS" : "VIETQR";

  const expiresAt = addMinutes(PAYMENT_WINDOW_MINUTES);
  await SeatLock.updateMany({ order: order._id }, { expiresAt });

  order.customer = customer;
  order.combos = combos;
  order.comboTotal = comboTotal;
  order.total = total;
  order.paymentMethod = method;

  if (order.status === "PENDING_PAYMENT") await cancelPayOSLink(order);
  order.orderCode = generateOrderCode();
  order.holdExpiresAt = expiresAt;
  order.status = "PENDING_PAYMENT";

  if (method === "PAYOS") {
    const items = [
      { name: `Ve xem phim ${order.showtime.movieTitle}`.slice(0, 50), quantity: 1, price: order.ticketTotal },
      ...combos.map((c) => ({ name: c.name.slice(0, 50), quantity: c.quantity, price: c.price })),
    ];
    try {
      const link = await createPayOSLink({ order, items, expiresAt });
      order.paymentLinkId = link.paymentLinkId;
      order.checkoutUrl = link.checkoutUrl;
      order.qrCode = link.qrCode;
    } catch (e) {
      console.error("[payos] Tạo link thất bại:", e.message);
      throw new ApiError(502, "Không tạo được liên kết thanh toán PayOS, vui lòng thử lại");
    }
  } else {
    order.qrCode = buildVietQR({ amount: total, orderCode: order.orderCode }).qrImage;
  }
  await order.save();
  ok(res, await paymentPayload(order));
});

async function paymentPayload(order) {
  const payload = {
    orderId: order._id,
    orderCode: order.orderCode,
    status: order.status,
    paymentMethod: order.paymentMethod,
    ticketTotal: order.ticketTotal,
    comboTotal: order.comboTotal,
    total: order.total,
    expiresAt: order.holdExpiresAt,
    transferContent: transferContent(order.orderCode),
    checkoutUrl: order.checkoutUrl || null,
  };
  if (order.paymentMethod === "PAYOS") {
    payload.qrImage = await qrStringToImage(order.qrCode);
    payload.qrCode = order.qrCode;
  } else {
    const vq = buildVietQR({ amount: order.total, orderCode: order.orderCode });
    payload.qrImage = vq.qrImage;
    payload.bankInfo = vq.bankInfo;
  }
  return payload;
}

export const getBooking = asyncHandler(async (req, res) => {
  const order = await loadOrder(req);
  const ticket = order.status === "PAID" ? await Ticket.findOne({ order: order._id }).lean() : null;
  ok(res, { ...order.toObject(), ticket });
});

export const myBookings = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const filter = { user: req.user._id, status: req.query.status || { $in: ["PAID", "PENDING_PAYMENT"] } };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  const tickets = await Ticket.find({ order: { $in: orders.map((o) => o._id) } }).lean();
  const byOrder = new Map(tickets.map((t) => [String(t.order), t]));
  ok(res, orders.map((o) => ({ ...o, ticket: byOrder.get(String(o._id)) || null })), {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
