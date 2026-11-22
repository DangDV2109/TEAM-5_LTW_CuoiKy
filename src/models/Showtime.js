import mongoose from 'mongoose';

export const SEAT_STATUS = Object.freeze({ AVAILABLE: 'available', HELD: 'held', SOLD: 'sold' });

const seatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['standard', 'vip'], default: 'standard' },
    status: { type: String, enum: Object.values(SEAT_STATUS), default: SEAT_STATUS.AVAILABLE },
    heldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    heldUntil: { type: Date, default: null }
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: {
      standard: { type: Number, required: true, min: 0 },
      vip: { type: Number, required: true, min: 0 }
    },
    seats: { type: [seatSchema], default: [] }
  },
  { timestamps: true }
);

showtimeSchema.pre('validate', function () {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate('endTime', 'Giờ kết thúc phải sau giờ bắt đầu');
  }
});

showtimeSchema.index({ movie: 1, startTime: 1 });
showtimeSchema.index({ theater: 1, startTime: 1 });
showtimeSchema.index({ room: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Showtime', showtimeSchema);
