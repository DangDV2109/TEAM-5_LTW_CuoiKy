import AppError from '../utils/AppError.js';
export const notFound = (req, _res, next) => {
  next(new AppError(`Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ';
  let errors = err.errors;

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Dữ liệu JSON không hợp lệ';
  }

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Giá trị không hợp lệ ở trường ${err.path}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'dữ liệu';
    message = `${field === 'email' ? 'Email' : field} đã tồn tại`;
    errors = [{ field, message }];
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
  }

  if (statusCode >= 500) console.error('❌', err);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ' : message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 && { stack: err.stack })
  });
};
