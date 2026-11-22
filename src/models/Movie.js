import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    originalTitle: { type: String, trim: true },
    poster: { type: String },
    backdrop: { type: String },
    duration: { type: Number, required: true, min: 1 },
    genre: [{ type: String }],
    status: { type: String, enum: ['now', 'coming'], default: 'now' },
    releaseDate: { type: Date },
    trailerUrl: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text' });

export default mongoose.model('Movie', movieSchema);
