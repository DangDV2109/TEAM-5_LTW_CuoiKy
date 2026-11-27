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
