import Order from "../models/Order.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { ApiError, asyncHandler, ok } from "../utils/helpers.js";
import { fulfillOrder } from "../utils/fulfill.js";
import { getPayOS } from "../utils/payment.js";

export const payosWebhook = asyncHandler(async (req, res) => {
  const client = getPayOS();
  if (!client) throw new ApiError(503, "PayOS chưa được cấu hình");

  let data;
  try {
    data = client.verifyPaymentWebhookData(req.body);
  } catch (e) {
    console.warn("[payos-webhook] Chữ ký không hợp lệ:", e.message);
    throw new ApiError(400, "Chữ ký webhook không hợp lệ");
  }

  const order = data?.orderCode ? await Order.findOne({ orderCode: data.orderCode }) : null;
  if (!order) return res.json({ success: true, message: "Webhook received" });

  if (req.body.success && req.body.code === "00" && data.amount >= order.total) {
    const result = await fulfillOrder(order._id, { paymentLinkId: data.paymentLinkId, method: "PAYOS" });
    console.log(`💰 PayOS: đơn ${order.orderCode} đã thanh toán${result?.ticket ? ` - vé ${result.ticket.code}` : ""}`);
  } else if (req.body.success && data.amount < order.total) {
    console.warn(`⚠️ Đơn ${order.orderCode}: nhận ${data.amount} < cần ${order.total}`);
  }
  res.json({ success: true });
});

export const vietqrWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers.authorization !== `Apikey ${secret}`) throw new ApiError(401, "Sai khoá webhook");

  const { transferType = "in", transferAmount, content = "" } = req.body;
  if (transferType !== "in") return res.json({ success: true });

  const match = String(content).match(/PTIT(\d{10,})/i);
  if (!match) return res.json({ success: true, message: "Không tìm thấy mã đơn trong nội dung" });

  const order = await Order.findOne({ orderCode: Number(match[1]) });
  if (!order) return res.json({ success: true, message: "Không tìm thấy đơn" });
  if (Number(transferAmount) < order.total) {
    console.warn(`⚠️ Đơn ${order.orderCode}: nhận ${transferAmount} < cần ${order.total}`);
    return res.json({ success: true, message: "Số tiền chưa đủ" });
  }
  await fulfillOrder(order._id, { method: "VIETQR" });
  res.json({ success: true });
});

export const simulateSuccess = asyncHandler(async (req, res) => {
  const allowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_SIMULATE === "true";
  if (!allowed) throw new ApiError(403, "Chế độ giả lập thanh toán đã bị tắt ở môi trường production");

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");
  if (order.user && (!req.user || (!order.user.equals(req.user._id) && req.user.role !== "ADMIN"))) {
    throw new ApiError(403, "Bạn không có quyền với đơn hàng này");
  }
  if (order.status === "CANCELLED") throw new ApiError(400, "Đơn hàng đã bị huỷ");
  if (order.status === "EXPIRED") throw new ApiError(410, "Đơn đã hết hạn giữ ghế");
  if (!order.customer?.email) throw new ApiError(400, "Hãy gọi checkout (nhập email) trước khi thanh toán");

  const result = await fulfillOrder(order._id, { method: order.paymentMethod || "SIMULATE" });
  ok(res, { order: result.order, ticket: result.ticket, alreadyPaid: result.alreadyPaid });
});

// Thanh toán đơn vé bằng số dư ví
export const payWithWallet = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Bạn cần đăng nhập để thanh toán bằng ví");
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");
  if (order.user && !order.user.equals(req.user._id)) throw new ApiError(403, "Bạn không có quyền với đơn hàng này");
  if (order.status === "PAID") throw new ApiError(400, "Đơn hàng đã được thanh toán");
  if (order.status === "CANCELLED") throw new ApiError(400, "Đơn hàng đã bị huỷ");
  if (order.status === "EXPIRED") throw new ApiError(410, "Đơn đã hết hạn giữ ghế");
  if (!order.total || order.total <= 0) throw new ApiError(400, "Đơn hàng chưa có tổng tiền, hãy checkout trước");

  // Trừ tiền nguyên tử: chỉ trừ khi đủ số dư
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, balance: { $gte: order.total } },
    { $inc: { balance: -order.total } },
    { new: true }
  );
  if (!user) throw new ApiError(402, "Số dư ví không đủ. Vui lòng nạp thêm tiền");

  const result = await fulfillOrder(order._id, { method: "WALLET" });
  if (!result || result.alreadyPaid) {
    await User.updateOne({ _id: user._id }, { $inc: { balance: order.total } }); // hoàn lại nếu đơn không còn hợp lệ
    throw new ApiError(409, "Không thể thanh toán đơn này");
  }
  await Transaction.create({
    user: user._id, type: "PAYMENT", amount: order.total, method: "WALLET",
    balanceAfter: user.balance, order: order._id, note: `Thanh toán vé ${order.showtime?.movieTitle || ""}`.trim(),
  });
  ok(res, { order: result.order, ticket: result.ticket, balance: user.balance });
});
