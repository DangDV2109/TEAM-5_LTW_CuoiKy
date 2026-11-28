import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError, asyncHandler, ok } from "../utils/helpers.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Vui lòng nhập đủ họ tên, email và mật khẩu");
  if (await User.findOne({ email: String(email).toLowerCase() })) throw new ApiError(409, "Email đã được sử dụng");

  const user = await User.create({ name, email, password, phone, role: "USER" });
  ok(res, { token: signToken(user), user }, {}, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Vui lòng nhập email và mật khẩu");
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  if (user.isLocked) throw new ApiError(403, "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên");
  ok(res, { token: signToken(user), user });
});

export const me = asyncHandler(async (req, res) => ok(res, req.user));

const resetCodesMemory = new Map();

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Vui lòng nhập địa chỉ email hợp lệ");
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  resetCodesMemory.set(email, { code, expiresAt: expiresAt.getTime() });

  await User.findOneAndUpdate(
    { email },
    { $set: { resetCode: code, resetCodeExpiresAt: expiresAt } }
  ).catch(() => {});

  ok(res, {
    message: `Mã xác nhận 6 số đã được gửi tới email ${email}`,
    demoCode: code,
    email,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const code = String(req.body.code || "").trim();
  const newPassword = String(req.body.newPassword || "");
  if (!email || !code) throw new ApiError(400, "Vui lòng nhập đầy đủ email và mã xác nhận");
  if (newPassword.length < 6) throw new ApiError(400, "Mật khẩu mới tối thiểu 6 ký tự");

  const user = await User.findOne({ email }).select("+password +resetCode +resetCodeExpiresAt");
  if (!user) throw new ApiError(404, "Không tìm thấy tài khoản với email này");

  const mem = resetCodesMemory.get(email);
  const validCode = user.resetCode || mem?.code;
  const validExp = user.resetCodeExpiresAt ? user.resetCodeExpiresAt.getTime() : mem?.expiresAt || 0;

  if (!validCode || validCode !== code) throw new ApiError(400, "Mã xác nhận không chính xác");
  if (Date.now() > validExp) throw new ApiError(400, "Mã xác nhận đã hết hạn");

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpiresAt = undefined;
  await user.save();
  resetCodesMemory.delete(email);

  ok(res, { message: "Đặt lại mật khẩu thành công!" });
});
export { resetCodesMemory };
