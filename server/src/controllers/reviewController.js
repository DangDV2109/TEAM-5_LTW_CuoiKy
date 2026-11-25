import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Review from "../models/Review.js";
import { ApiError, asyncHandler, ok } from "../utils/helpers.js";

async function recalcMovieRating(movieId) {
  const [agg] = await Review.aggregate([
    { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: "$movie", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const rating = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const ratingCount = agg ? agg.count : 0;
  await Movie.findByIdAndUpdate(movieId, { rating, ratingCount });
  return { rating, ratingCount };
}

export const listReviews = asyncHandler(async (req, res) => {
  if (!(await Movie.exists({ _id: req.params.id }))) throw new ApiError(404, "Không tìm thấy phim");
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const filter = { movie: req.params.id };
  const [data, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-likedBy").lean(),
    Review.countDocuments(filter),
  ]);
  ok(res, data, { pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const createReview = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  if (!(await Movie.exists({ _id: movieId }))) throw new ApiError(404, "Không tìm thấy phim");
  const rating = Number(req.body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 10) throw new ApiError(400, "Điểm đánh giá phải từ 1 đến 10");

  const review = await Review.findOneAndUpdate(
    { movie: movieId, user: req.user._id },
    { $set: { rating, comment: req.body.comment, userName: req.user.name } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  const summary = await recalcMovieRating(movieId);
  ok(res, { review, movie: summary }, {}, 201);
});

export const toggleLike = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Không tìm thấy đánh giá");
  const uid = req.user._id;
  const liked = review.likedBy.some((id) => id.equals(uid));
  review.likedBy = liked ? review.likedBy.filter((id) => !id.equals(uid)) : [...review.likedBy, uid];
  review.likes = review.likedBy.length;
  await review.save();
  ok(res, { likes: review.likes, liked: !liked });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Không tìm thấy đánh giá");
  if (!review.user.equals(req.user._id) && req.user.role !== "ADMIN") throw new ApiError(403, "Bạn không có quyền xoá đánh giá này");
  await review.deleteOne();
  await recalcMovieRating(review.movie);
  ok(res, { deleted: true });
});
