import AppError from '../utils/AppError.js';
import { isObjectId } from '../utils/query.js';

const validateObjectId =
  (...params) =>
  (req, _res, next) => {
    for (const name of params) {
      if (!isObjectId(req.params[name])) return next(new AppError(`${name} không hợp lệ`, 400));
    }
    next();
  };

export default validateObjectId;
