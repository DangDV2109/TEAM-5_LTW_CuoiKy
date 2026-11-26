import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Review, {
  REVIEW_ACTIVE_DURATION_MS,
  REVIEW_RETENTION_AFTER_REMOVE_MS,
} from "../models/Review.js";
import { ApiError, asyncHandler, ok } from "../utils/helpers.js";

/**
 * Bộ lọc chỉ lấy các đánh giá đang hoạt động trên UI (chưa bị xóa và chưa hết hạn 7 ngày)
 */
export function getActiveReviewFilter(extraFilter = {}, now = new Date()) {
  const expireCutoff = new Date(now.getTime() - REVIEW_ACTIVE_DURATION_MS);
  return {
    ...extraFilter,
    deletedAt: null,
    expiredAt: null,
    createdAt: { $gt: expireCutoff },
  };
}

/**
 * Quét định kỳ trên Backend:
 * 1. Đánh dấu hết hạn (expiredAt) cho những bình luận đã qua 7 ngày kể từ lúc tạo,
 *    đặt lịch xóa tự động sau 7 ngày tiếp theo (purgeAt = expiredAt + 7 ngày).
 * 2. Tự động xóa vĩnh viễn mọi dữ liệu của những bình luận đã bị xóa quá 7 ngày
 *    (now - deletedAt >= 7 ngày) hoặc đã hết hạn quá 7 ngày (now - expiredAt >= 7 ngày).
 */
export async function sweepExpiredAndDeletedReviews(now = new Date()) {
  const nowMs = now.getTime();
  const activeExpireCutoff = new Date(nowMs - REVIEW_ACTIVE_DURATION_MS);
  const hardPurgeCutoff = new Date(nowMs - REVIEW_RETENTION_AFTER_REMOVE_MS);
  const maxTotalLifetimeCutoff = new Date(
    nowMs - (REVIEW_ACTIVE_DURATION_MS + REVIEW_RETENTION_AFTER_REMOVE_MS)
  );

  // 1. Những bình luận đã quá hạn 7 ngày nhưng chưa được đánh dấu expiredAt -> đánh dấu expiredAt và giữ thêm 7 ngày
  const newlyExpired = await Review.find({
    deletedAt: null,
    expiredAt: null,
    createdAt: { $lte: activeExpireCutoff },
  }).select("_id movie createdAt");

  const affectedMovies = new Set();

  for (const rev of newlyExpired) {
    const expDate = new Date(rev.createdAt.getTime() + REVIEW_ACTIVE_DURATION_MS);
    const purgeDate = new Date(expDate.getTime() + REVIEW_RETENTION_AFTER_REMOVE_MS);
    await Review.updateOne(
      { _id: rev._id },
      { $set: { expiredAt: expDate, purgeAt: purgeDate } }
    );
    if (rev.movie) affectedMovies.add(String(rev.movie));
  }

  // 2. Xóa vĩnh viễn mọi dữ liệu của bình luận sau 7 ngày kể từ lúc bị xóa hoặc 7 ngày kể từ lúc hết hạn
  const toPurge = await Review.find({
    $or: [
      { purgeAt: { $ne: null, $lte: now } },
      { deletedAt: { $ne: null, $lte: hardPurgeCutoff } },
      { expiredAt: { $ne: null, $lte: hardPurgeCutoff } },
      { createdAt: { $lte: maxTotalLifetimeCutoff } },
    ],
  }).select("_id movie");

  if (toPurge.length > 0) {
    toPurge.forEach((r) => {
      if (r.movie) affectedMovies.add(String(r.movie));
    });
    await Review.deleteMany({ _id: { $in: toPurge.map((r) => r._id) } });
  }

  for (const mId of affectedMovies) {
    await recalcMovieRating(mId);
  }

  return { markedExpired: newlyExpired.length, purged: toPurge.length };
}

export async function recalcMovieRating(movieId) {
  const activeFilter = getActiveReviewFilter({
    movie: new mongoose.Types.ObjectId(movieId),
  });
  const [agg] = await Review.aggregate([
    { $match: activeFilter },
    { $group: { _id: "$movie", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const rating = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const ratingCount = agg ? agg.count : 0;
  await Movie.findByIdAndUpdate(movieId, { rating, ratingCount });
  return { rating, ratingCount };
}

export const listReviews = asyncHandler(async (req, res) => {
  await sweepExpiredAndDeletedReviews();
  if (!(await Movie.exists({ _id: req.params.id })))
    throw new ApiError(404, "Không tìm thấy phim");
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const filter = getActiveReviewFilter({ movie: req.params.id });
  const [data, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-likedBy")
      .lean(),
    Review.countDocuments(filter),
  ]);
  ok(res, data, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const createReview = asyncHandler(async (req, res) => {
  await sweepExpiredAndDeletedReviews();
  const movieId = req.params.id;
  if (!(await Movie.exists({ _id: movieId })))
    throw new ApiError(404, "Không tìm thấy phim");
  const rating = Number(req.body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 10)
    throw new ApiError(400, "Điểm đánh giá phải từ 1 đến 10");

  const now = new Date();
  const expiredAt = null;
  // Khi mới tạo hoặc đăng lại: sau 7 ngày sẽ hết hạn hiển thị, và sau 7 ngày tiếp theo (tổng 14 ngày) sẽ tự xóa khỏi backend
  const purgeAt = new Date(
    now.getTime() + REVIEW_ACTIVE_DURATION_MS + REVIEW_RETENTION_AFTER_REMOVE_MS
  );

  const review = await Review.findOneAndUpdate(
    { movie: movieId, user: req.user._id },
    {
      $set: {
        rating,
        comment: req.body.comment,
        userName: req.user.name,
        createdAt: now,
        deletedAt: null,
        expiredAt,
        purgeAt,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  const summary = await recalcMovieRating(movieId);
  ok(res, { review, movie: summary }, {}, 201);
});

export const toggleLike = asyncHandler(async (req, res) => {
  const review = await Review.findOne(getActiveReviewFilter({ _id: req.params.id }));
  if (!review) throw new ApiError(404, "Không tìm thấy đánh giá");
  const uid = req.user._id;
  const liked = review.likedBy.some((id) => id.equals(uid));
  review.likedBy = liked
    ? review.likedBy.filter((id) => !id.equals(uid))
    : [...review.likedBy, uid];
  review.likes = review.likedBy.length;
  await review.save();
  ok(res, { likes: review.likes, liked: !liked });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || review.deletedAt)
    throw new ApiError(404, "Không tìm thấy đánh giá");
  if (!review.user.equals(req.user._id) && req.user.role !== "ADMIN")
    throw new ApiError(403, "Bạn không có quyền xoá đánh giá này");

  // Xóa mềm: Bình luận vẫn tồn tại ở trong backend, sau 7 ngày kể từ lúc bị xóa backend sẽ tự động xóa mọi dữ liệu
  const deletedAt = new Date();
  const purgeAt = new Date(
    deletedAt.getTime() + REVIEW_RETENTION_AFTER_REMOVE_MS
  );
  review.deletedAt = deletedAt;
  review.purgeAt = purgeAt;
  await review.save();

  await recalcMovieRating(review.movie);
  ok(res, { deleted: true, deletedAt, purgeAt });
});
