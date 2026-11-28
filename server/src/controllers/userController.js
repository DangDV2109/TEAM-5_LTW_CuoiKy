import User from "../models/User.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import SupportTicket from "../models/SupportTicket.js";
import { resetCodesMemory } from "./authController.js";
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
  const [user, counts] = await Promise.all([
    User.findById(req.user._id).lean(),
    User.aggregate([
      { $unwind: "$favorites" },
      { $group: { _id: "$favorites.movieId", count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  ok(
    res,
    (user.favorites || []).map((f) => ({
      ...f,
      id: f.movieId,
      likesCount: countMap.get(String(f.movieId)) || 1,
    }))
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const newName = String(req.body.name || "").trim();
  if (!newName) throw new ApiError(400, "Họ tên không được để trống");
  const patch = { name: newName };
  if (req.body.phone !== undefined) patch.phone = String(req.body.phone || "").trim();
  if (req.body.bankName !== undefined) patch.bankName = String(req.body.bankName || "").trim();
  if (req.body.bankAccount !== undefined) patch.bankAccount = String(req.body.bankAccount || "").trim();
  const user = await User.findByIdAndUpdate(req.user._id, { $set: patch }, { new: true });
  ok(res, { user, message: "Đã cập nhật thông tin tài khoản" });
});

export const changePassword = asyncHandler(async (req, res) => {
  const newPassword = String(req.body.newPassword || "");
  if (newPassword.length < 6) throw new ApiError(400, "Mật khẩu mới tối thiểu 6 ký tự");
  const user = await User.findById(req.user._id).select("+password +resetCode +resetCodeExpiresAt");
  if (!user) throw new ApiError(404, "Không tìm thấy tài khoản");

  if (req.body.mode === "code") {
    const code = String(req.body.code || "").trim();
    const mem = resetCodesMemory.get(user.email);
    const validCode = user.resetCode || mem?.code;
    const validExp = user.resetCodeExpiresAt ? user.resetCodeExpiresAt.getTime() : mem?.expiresAt || 0;
    if (!validCode || validCode !== code) throw new ApiError(400, "Mã xác nhận email không chính xác");
    if (Date.now() > validExp) throw new ApiError(400, "Mã xác nhận đã hết hạn");
    user.resetCode = undefined;
    user.resetCodeExpiresAt = undefined;
    resetCodesMemory.delete(user.email);
  } else {
    const oldPassword = String(req.body.oldPassword || "");
    if (!oldPassword || !(await user.comparePassword(oldPassword))) {
      throw new ApiError(400, "Mật khẩu cũ không chính xác");
    }
  }
  user.password = newPassword;
  await user.save();
  ok(res, { message: "Đổi mật khẩu thành công!" });
});

export const createSupportTicket = asyncHandler(async (req, res) => {
  const category = String(req.body.category || "khac").trim();
  const categoryLabel = String(req.body.categoryLabel || "Khác").trim();
  const customIssue = String(req.body.customIssue || "").trim();
  const detail = String(req.body.detail || "").trim();
  const email = String(req.body.email || "").trim();
  const phone = String(req.body.phone || "").trim();

  if (!detail) throw new ApiError(400, "Vui lòng nhập thông tin chi tiết vấn đề cần hỗ trợ");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, "Vui lòng nhập email hợp lệ");
  if (!phone) throw new ApiError(400, "Vui lòng nhập số điện thoại liên hệ");
  if (category === "khac" && !customIssue) throw new ApiError(400, "Vui lòng nhập tên vấn đề cần hỗ trợ");

  const doc = await SupportTicket.create({
    category,
    categoryLabel: category === "khac" ? `Khác: ${customIssue}` : categoryLabel,
    customIssue,
    detail,
    email,
    phone,
  });
  ok(res, { ...doc.toObject(), id: String(doc._id) }, {}, 201);
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

export const adminUserHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new ApiError(404, "Không tìm thấy tài khoản");
  delete user.password;
  const bankName = user.bankName || "MB Bank (Quân Đội)";
  const bankAccount = user.bankAccount || "0987654321";

  const [orders, transactions, reviews] = await Promise.all([
    Order.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    Transaction.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    Review.find({ user: user._id, deletedAt: null }).sort({ createdAt: -1 }).populate("movie", "title").lean(),
  ]);

  ok(res, {
    user: { ...user, id: String(user._id), bankName, bankAccount },
    orders: orders.map((o) => ({
      id: String(o._id),
      code: o.orderCode ? `PTIT-${o.orderCode}` : String(o._id),
      movieTitle: o.showtime?.movieTitle || "",
      showtime: [o.showtime?.time, o.showtime?.date, o.showtime?.cinemaName, o.showtime?.room].filter(Boolean).join(" · "),
      seats: (o.seats || []).map((s) => s.seat || s),
      seatsTotal: o.ticketTotal || 0,
      comboTotal: o.comboTotal || 0,
      total: o.total || 0,
      status: o.status,
      paymentMethod: o.paymentMethod || "VIETQR",
      bankName,
      bankAccount,
      createdAt: o.createdAt,
    })),
    transactions: transactions.map((t) => ({
      ...t,
      id: String(t._id),
      bankName,
      bankAccount,
    })),
    reviews: reviews.map((r) => ({
      id: String(r._id),
      movieId: r.movie?._id,
      movieTitle: r.movie?.title || "(phim đã xoá)",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  });
});

export const adminRevenue = asyncHandler(async (_req, res) => {
  const [paidOrders, topupTxs] = await Promise.all([
    Order.find({ status: "PAID" }).sort({ createdAt: -1 }).populate("user", "name email").lean(),
    Transaction.find({ type: "TOPUP", status: "SUCCESS" }).lean(),
  ]);

  let directTicketRevenue = 0;
  let directComboRevenue = 0;
  let walletSpentTotal = 0;
  let walletTicketSpent = 0;
  let walletComboSpent = 0;
  let totalTicketSalesAll = 0;
  let totalComboSalesAll = 0;

  paidOrders.forEach((o) => {
    const seatAmt = Number(o.ticketTotal || o.total || 0);
    const comboAmt = Number(o.comboTotal || 0);
    const orderTotal = Number(o.total || seatAmt + comboAmt);

    totalTicketSalesAll += seatAmt;
    totalComboSalesAll += comboAmt;

    if (o.paymentMethod === "WALLET") {
      walletSpentTotal += orderTotal;
      walletTicketSpent += seatAmt;
      walletComboSpent += comboAmt;
    } else {
      directTicketRevenue += seatAmt;
      directComboRevenue += comboAmt;
    }
  });

  const totalTopupRevenue = topupTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalRevenue = directTicketRevenue + directComboRevenue + totalTopupRevenue;

  ok(res, {
    totalRevenue,
    directTicketRevenue,
    directComboRevenue,
    totalTopupRevenue,
    walletSpentTotal,
    walletTicketSpent,
    walletComboSpent,
    totalTicketSalesAll,
    totalComboSalesAll,
    paidOrdersCount: paidOrders.length,
    topupCount: topupTxs.length,
    orders: paidOrders.map((o) => ({
      id: String(o._id),
      code: o.orderCode ? `PTIT-${o.orderCode}` : String(o._id),
      customer: o.user?.name || o.customer?.name || "Khách vãng lai",
      movieTitle: o.showtime?.movieTitle || "",
      seatsTotal: Number(o.ticketTotal || 0),
      comboTotal: Number(o.comboTotal || 0),
      total: Number(o.total || 0),
      paidMethod: o.paymentMethod || "VIETQR",
      createdAt: o.createdAt,
    })),
  });
});

export const adminListSupport = asyncHandler(async (_req, res) => {
  const list = await SupportTicket.find().sort({ createdAt: -1 }).lean();
  ok(res, list.map((x) => ({ ...x, id: String(x._id), createdAt: new Date(x.createdAt).getTime() })));
});

export const adminUpdateSupport = asyncHandler(async (req, res) => {
  const patch = {};
  if (typeof req.body.isMarked === "boolean") patch.isMarked = req.body.isMarked;
  if (req.body.status) patch.status = req.body.status;
  if (req.body.category) patch.category = req.body.category;
  if (req.body.categoryLabel) patch.categoryLabel = req.body.categoryLabel;
  if (req.body.adminNote !== undefined) patch.adminNote = req.body.adminNote;
  const doc = await SupportTicket.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true }).lean();
  if (!doc) throw new ApiError(404, "Không tìm thấy thư hỗ trợ");
  ok(res, { ...doc, id: String(doc._id) });
});

export const adminDeleteSupport = asyncHandler(async (req, res) => {
  await SupportTicket.findByIdAndDelete(req.params.id);
  ok(res, { deleted: true });
});
