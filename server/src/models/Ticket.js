import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    movieTitle: String,
    poster: String,
    cinemaName: String,
    room: String,
    date: String,
    time: String,
    format: String,
    seats: [String],
    customerEmail: String,
    qrCode: String,
    used: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
