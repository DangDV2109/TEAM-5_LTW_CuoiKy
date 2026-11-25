import Movie from "../models/Movie.js";
import Review from "../models/Review.js";
import { ApiError, asyncHandler, escapeRegex, ok } from "../utils/helpers.js";

const SORTS = {
  rating: { rating: -1, ratingCount: -1 },
  newest: { releaseDate: -1, createdAt: -1 },
  title: { title: 1 },
};

export const listMovies = asyncHandler(async (req, res) => {
  const { search, status, genre, tag, cinema, sort = "newest" } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);

  const filter = {};
  if (status) {
    if (!["now", "coming"].includes(status)) throw new ApiError(400, "status chỉ nhận now hoặc coming");
    filter.status = status;
  }
  if (genre) filter.genres = genre;
  if (tag) filter.tags = String(tag).replace(/^#/, "");
  if (cinema) filter.cinemas = cinema;
  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ title: rx }, { originalTitle: rx }, { director: rx }, { cast: rx }];
  }

  const [data, total] = await Promise.all([
    Movie.find(filter)
      .select("-showtimes")
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Movie.countDocuments(filter),
  ]);

  ok(res, data, { pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) throw new ApiError(404, "Không tìm thấy phim");
  const reviews = await Review.find({ movie: movie._id }).sort({ createdAt: -1 }).limit(50).select("-likedBy").lean();
  ok(res, { ...movie, reviews });
});

export const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  ok(res, movie, {}, 201);
});

export const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!movie) throw new ApiError(404, "Không tìm thấy phim");
  ok(res, movie);
});

export const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw new ApiError(404, "Không tìm thấy phim");
  await Review.deleteMany({ movie: movie._id });
  ok(res, { deleted: true });
});
