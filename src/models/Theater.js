import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema(
  {

    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: [true, 'Tên rạp là bắt buộc'], trim: true },
    cityId: { type: String, required: true, trim: true },
    cityName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

theaterSchema.index({ cityId: 1 });
theaterSchema.index({ name: 'text', address: 'text' });

export default mongoose.model('Theater', theaterSchema);
