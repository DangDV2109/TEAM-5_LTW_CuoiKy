import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existed = await User.findOne({ email: email.trim().toLowerCase() });
  if (existed) throw new AppError('Email đã được đăng ký', 409, [{ field: 'email', message: 'Email đã được đăng ký' }]);

  const user = await User.create({ name: name.trim(), email, password, phone: phone?.trim() || '' });

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    token: generateToken(user._id),
    user
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    token: generateToken(user._id),
    user
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
