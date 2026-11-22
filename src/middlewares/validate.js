import AppError from '../utils/AppError.js';

const validate = (validator) => (req, _res, next) => {
  const result = validator(req.body || {});
  const errors = Object.entries(result).map(([field, message]) => ({ field, message }));
  if (errors.length > 0) return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
  next();
};

export default validate;
