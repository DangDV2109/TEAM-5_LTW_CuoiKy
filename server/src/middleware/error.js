import mongoose from "mongoose";
import { ApiError } from "../utils/helpers.js";

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Không tìm thấy ${req.method} ${req.originalUrl}` });

export const validateObjectId = (...params) => (req, _res, next) => {
  for (const p of params) {
    if (!mongoose.isValidObjectId(req.params[p])) {
      return next(new ApiError(400, `ID không hợp lệ: ${p}`));
    }
  }
  next();
};

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || "Lỗi máy chủ";
  const extra = err.extra || {};

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join("; ");
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Giá trị không hợp lệ cho trường ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `Dữ liệu bị trùng: ${Object.keys(err.keyPattern || {}).join(", ")}`;
  }

  if (status >= 500 && !(err instanceof ApiError)) console.error("❌", err);
  res.status(status).json({ success: false, message, ...extra });
};
