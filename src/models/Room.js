import mongoose from 'mongoose';

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const roomSchema = new mongoose.Schema(
  {
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    name: { type: String, required: [true, 'Tên phòng là bắt buộc'], trim: true },
    rows: { type: Number, required: true, min: 1, max: 26 },
    seatsPerRow: { type: Number, required: true, min: 1, max: 30 },
    vipRows: { type: [String], default: [] }
  },
  { timestamps: true }
);

roomSchema.index({ theater: 1, name: 1 }, { unique: true });

roomSchema.pre('validate', function () {
  const validRows = ROW_LETTERS.slice(0, this.rows).split('');
  this.vipRows = [...new Set((this.vipRows || []).map((r) => String(r).toUpperCase()))];
  const invalid = this.vipRows.filter((r) => !validRows.includes(r));
  if (invalid.length > 0) {
    this.invalidate('vipRows', `Hàng VIP không hợp lệ: ${invalid.join(', ')}`);
  }
});

roomSchema.methods.generateSeats = function () {
  const seats = [];
  for (let r = 0; r < this.rows; r += 1) {
    const row = ROW_LETTERS[r];
    const type = this.vipRows.includes(row) ? 'vip' : 'standard';
    for (let number = 1; number <= this.seatsPerRow; number += 1) {
      seats.push({ row, number, type, status: 'available' });
    }
  }
  return seats;
};

export default mongoose.model('Room', roomSchema);
