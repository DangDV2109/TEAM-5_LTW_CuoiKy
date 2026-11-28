import mongoose from "mongoose";

// Lịch sử giao dịch ví: nạp tiền (TOPUP), thanh toán vé bằng ví (PAYMENT), hoàn tiền (REFUND)
const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["TOPUP", "PAYMENT", "REFUND"], default: "TOPUP", index: true },
    amount: { type: Number, required: true, min: 1 },
    balanceAfter: { type: Number, default: 0 },
    method: { type: String, enum: ["BANK", "MOMO", "VNPAY", "CARD", "WALLET", "ADMIN"], default: "BANK" },
    status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
