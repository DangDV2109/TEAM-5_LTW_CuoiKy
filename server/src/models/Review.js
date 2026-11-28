import mongoose from "mongoose";

export const REVIEW_ACTIVE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày hiển thị trên trang web
export const REVIEW_RETENTION_AFTER_REMOVE_MS = 7 * 24 * 60 * 60 * 1000; // Giữ thêm 7 ngày ở backend sau khi bị xóa hoặc hết hạn

const reviewSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: String,
    rating: {
      type: Number,
      required: [true, "Vui lòng chấm điểm"],
      min: [1, "Điểm từ 1 đến 10"],
      max: [10, "Điểm từ 1 đến 10"],
    },
    comment: { type: String, trim: true, maxlength: 1000 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Thời điểm người dùng/admin xóa đánh giá trên trang web (vẫn lưu ở backend thêm 7 ngày)
    deletedAt: { type: Date, default: null, index: true },
    // Thời điểm đánh giá hết hạn hiển thị sau 7 ngày kể từ khi đăng (vẫn lưu ở backend thêm 7 ngày)
    expiredAt: { type: Date, default: null, index: true },
    // Thời điểm backend tự động xóa sạch mọi dữ liệu về đánh giá này (7 ngày sau khi bị xóa hoặc 7 ngày sau khi hết hạn)
    purgeAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });
// MongoDB TTL index: tự động xóa vĩnh viễn document ngay khi đến thời điểm purgeAt
reviewSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Review", reviewSchema);
