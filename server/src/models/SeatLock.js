import mongoose from "mongoose";

const seatLockSchema = new mongoose.Schema({
  showtimeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  seat: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  status: { type: String, enum: ["HOLDING", "SOLD"], default: "HOLDING" },
  expiresAt: Date,
});

seatLockSchema.index({ showtimeId: 1, seat: 1 }, { unique: true });
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("SeatLock", seatLockSchema);
