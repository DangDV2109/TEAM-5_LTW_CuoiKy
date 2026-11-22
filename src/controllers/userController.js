import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'dateOfBirth', 'avatar'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));

  if (typeof updates.name === 'string') updates.name = updates.name.trim();
  if (updates.dateOfBirth === '') updates.dateOfBirth = undefined;

  req.user.set(updates);
  await req.user.save();

  res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công', user: req.user });
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Mật khẩu hiện tại không đúng', 400, [
      { field: 'currentPassword', message: 'Mật khẩu hiện tại không đúng' }
    ]);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Đổi mật khẩu thành công',
    token: generateToken(user._id)
  });
});

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = {};
  if (['user', 'admin'].includes(req.query.role)) filter.role = req.query.role;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});
