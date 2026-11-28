import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Vui lòng nhập họ tên"], trim: true },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: { type: String, required: true, minlength: [6, "Mật khẩu tối thiểu 6 ký tự"], select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    balance: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    // movieId là String để dùng được cả id số của dữ liệu phim phía client lẫn ObjectId của Mongo
    favorites: [{ movieId: { type: String, required: true }, title: String, poster: String, addedAt: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
