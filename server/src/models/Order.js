import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    customer: { name: String, email: String, phone: String },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    showtimeId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    showtime: {
      movieTitle: String,
      poster: String,
      cinemaId: String,
      cinemaName: String,
      room: String,
      date: String,
      time: String,
      format: String,
    },
    seats: [{ seat: String, type: { type: String }, price: Number, _id: false }],
    combos: [
      {
        combo: { type: mongoose.Schema.Types.ObjectId, ref: "Combo" },
        name: String,
        price: Number,
        quantity: Number,
        _id: false,
      },
    ],
    ticketTotal: { type: Number, default: 0 },
    comboTotal: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["HOLDING", "PENDING_PAYMENT", "PAID", "CANCELLED", "EXPIRED"],
      default: "HOLDING",
      index: true,
    },
    holdExpiresAt: Date,
    paymentMethod: { type: String, enum: ["PAYOS", "VIETQR", "SIMULATE", "WALLET"] },
    orderCode: { type: Number, unique: true, sparse: true },
    paymentLinkId: String,
    checkoutUrl: String,
    qrCode: String,
    paidAt: Date,
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
