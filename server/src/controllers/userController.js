import User from "../models/User.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import { ApiError, asyncHandler, escapeRegex, ok } from "../utils/helpers.js";

const pageOf = (req, def = 20) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || def, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
const pagination = (page, limit, total) => ({ pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });

/* ===================== NGƯỜI DÙNG ===================== */

// Nạp tiền vào ví (giả lập cổng thanh toán - cộng tiền ngay)
export const topup = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const method = ["BANK", "MOMO", "VNPAY", "CARD"].includes(req.body.method) ? req.body.method : "BANK";
  if (!Number.isInteger(amount) || amount < 10000 || amount > 10000000) {
    throw new ApiError(400, "Số tiền nạp phải từ 10.000đ đến 10.000.000đ");
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $inc: { balance: amount } }, { new: true });
  const tx = await Transaction.create({
    user: user._id, type: "TOPUP", amount, method, balanceAfter: user.balance, note: "Nạp tiền vào ví",
  });
  ok(res, { balance: user.balance, transaction: tx }, {}, 201);
});

export const myTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOf(req, 20);
  const filter = { user: req.user._id };
  const [data, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(filter),
  ]);
  ok(res, data, pagination(page, limit, total));
});

// Lịch sử đánh giá của tôi
export const myReviews = asyncHandler(async (req, res) => {
  const data = await Review.find({ user: req.user._id }).sort({ updatedAt: -1 }).populate("movie", "title poster").lean();
  ok(res, data.map((r) => ({ ...r, id: String(r._id), movieTitle: r.movie?.title || "(phim đã bị xoá)", poster: r.movie?.poster, movieId: r.movie?._id })));
});

export const myFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  ok(res, (user.favorites || []).map((f) => ({ ...f, id: f.movieId })));
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const movieId = String(req.params.movieId);
  const user = await User.findById(req.user._id);
  const has = user.favorites.some((f) => f.movieId === movieId);
  user.favorites = has
    ? user.favorites.filter((f) => f.movieId !== movieId)
    : [...user.favorites, { movieId, title: req.body.title, poster: req.body.poster }];
  await user.save();
  ok(res, { favorite: !has, total: user.favorites.length });
});

/* ===================== ADMIN ===================== */

export const adminListUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOf(req, 20);
  const filter = {};
  if (req.query.verified === "true") filter.isVerified = true;
  if (req.query.verified === "false") filter.isVerified = false;
  if (req.query.locked === "true") filter.isLocked = true;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  ok(res, data.map((u) => { delete u.password; return { ...u, id: String(u._id), favoriteCount: (u.favorites || []).length }; }), pagination(page, limit, total));
});

// Xác thực / khoá tài khoản, đổi vai trò
export const adminUpdateUser = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["isVerified", "isLocked"]) if (typeof req.body[k] === "boolean") patch[k] = req.body[k];
  if (["ADMIN", "USER"].includes(req.body.role)) patch.role = req.body.role;
  if (String(req.params.id) === String(req.user._id) && (patch.isLocked || patch.role === "USER")) {
    throw new ApiError(400, "Không thể tự khoá hoặc hạ quyền chính mình");
  }
  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!user) throw new ApiError(404, "Không tìm thấy tài khoản");
  ok(res, user);
});

export const adminTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOf(req, 20);
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  const [data, total, sum] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email").lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([{ $match: { ...filter, status: "SUCCESS" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  ok(res, data, { ...pagination(page, limit, total), totalAmount: sum[0]?.total || 0 });
});

// Lịch sử mua vé của toàn hệ thống
export const adminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOf(req, 20);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email").lean(),
    Order.countDocuments(filter),
  ]);
  ok(res, data.map((o) => ({
    id: String(o._id),
    code: o.orderCode ? `PTIT-${o.orderCode}` : String(o._id),
    customer: o.user?.name || o.customer?.name || "Khách vãng lai",
    email: o.user?.email || o.customer?.email || "",
    movieTitle: o.showtime?.movieTitle || "",
    showtime: [o.showtime?.time, o.showtime?.date, o.showtime?.cinemaName, o.showtime?.room].filter(Boolean).join(" · "),
    seats: (o.seats || []).map((s) => s.seat),
    total: o.total, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt,
  })), pagination(page, limit, total));
});

// Lịch sử đánh giá của toàn hệ thống
export const adminReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOf(req, 20);
  const [data, total] = await Promise.all([
    Review.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("movie", "title").lean(),
    Review.countDocuments(),
  ]);
  ok(res, data.map((r) => ({ id: String(r._id), movieTitle: r.movie?.title || "(phim đã xoá)", userName: r.userName, rating: r.rating, comment: r.comment, likes: r.likes, createdAt: r.createdAt })), pagination(page, limit, total));
});

// Danh sách yêu thích: phim nào được yêu thích nhiều nhất & ai yêu thích
export const adminFavorites = asyncHandler(async (_req, res) => {
  const data = await User.aggregate([
    { $unwind: "$favorites" },
    { $group: { _id: "$favorites.movieId", title: { $first: "$favorites.title" }, poster: { $first: "$favorites.poster" }, count: { $sum: 1 }, users: { $push: "$name" } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, movieId: "$_id", title: 1, poster: 1, count: 1, users: { $slice: ["$users", 10] } } },
  ]);
  ok(res, data);
});
