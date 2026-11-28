import mongoose from "mongoose";

const comboSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Vui lòng nhập tên combo"], trim: true },
    price: { type: Number, required: [true, "Vui lòng nhập giá"], min: 0 },
    description: String,
    image: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Combo", comboSchema);
