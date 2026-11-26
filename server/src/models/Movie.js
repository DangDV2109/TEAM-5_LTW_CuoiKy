import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema({
  cinemaId: { type: String, required: true, index: true },
  room: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  format: { type: String, enum: ["2D", "3D", "IMAX"], default: "2D" },
  price: { type: Number, required: true, min: 0 },
  vipPrice: { type: Number, min: 0 },
  rows: { type: [String], default: ["A", "B", "C", "D", "E", "F", "G", "H"] },
  seatsPerRow: { type: Number, default: 10, min: 1 },
  vipRows: { type: [String], default: ["E", "F", "G"] },
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Vui lòng nhập tên phim"], trim: true, index: true },
    originalTitle: String,
    slug: { type: String, index: true },
    poster: String,
    backdrop: String,
    trailer: String,
    description: String,
    genres: { type: [String], default: [], index: true },
    director: String,
    cast: { type: [String], default: [] },
    duration: { type: Number, min: 0 },
    releaseDate: Date,
    country: String,
    language: String,
    ageRating: { type: String, default: "P" },
    formats: { type: [String], default: ["2D"] },
    tags: { type: [String], default: [], index: true },
    status: { type: String, enum: ["now", "coming"], default: "now", index: true },
    cinemas: { type: [String], default: [], index: true },
    showtimes: { type: [showtimeSchema], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", director: "text", cast: "text" });
movieSchema.index({ "showtimes._id": 1 });

export default mongoose.model("Movie", movieSchema);
