import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: String,
    rating: { type: Number, required: [true, "Vui lòng chấm điểm"], min: [1, "Điểm từ 1 đến 10"], max: [10, "Điểm từ 1 đến 10"] },
    comment: { type: String, trim: true, maxlength: 1000 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
