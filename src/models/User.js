import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = Object.freeze({ USER: 'user', ADMIN: 'admin' });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Họ tên là bắt buộc'], trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date },
    avatar: { type: String, default: '' },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    passwordChangedAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
