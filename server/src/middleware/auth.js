import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../utils/helpers.js";

const getToken = (req) => {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
};

async function resolveUser(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, "Tài khoản không tồn tại");
  return user;
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, "Bạn chưa đăng nhập");
  try {
    req.user = await resolveUser(token);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(401, "Token không hợp lệ hoặc đã hết hạn");
  }
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      req.user = await resolveUser(token);
    } catch {

    }
  }
  next();
});

export const adminOnly = (req, _res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Chỉ quản trị viên mới có quyền thực hiện"));
  }
  next();
};
