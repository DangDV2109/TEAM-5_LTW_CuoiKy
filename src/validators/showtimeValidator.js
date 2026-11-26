import { isObjectId } from '../utils/query.js';

const isValidDate = (v) => (typeof v === 'string' || typeof v === 'number') && !Number.isNaN(new Date(v).getTime());
const isPrice = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 10000000;

export const validateCreateShowtime = ({ movie, room, startTime, price }) => {
  const errors = {};
  if (!isObjectId(movie)) errors.movie = 'Phim không hợp lệ';
  if (!isObjectId(room)) errors.room = 'Phòng chiếu không hợp lệ';
  if (!isValidDate(startTime)) errors.startTime = 'Giờ bắt đầu không hợp lệ';
  if (!price || typeof price !== 'object') {
    errors.price = 'Giá vé là bắt buộc (price.standard, price.vip)';
  } else {
    if (!isPrice(price.standard)) errors['price.standard'] = 'Giá ghế thường không hợp lệ';
    if (!isPrice(price.vip)) errors['price.vip'] = 'Giá ghế VIP không hợp lệ';
  }
  return errors;
};

export const validateUpdateShowtime = ({ startTime, price }) => {
  const errors = {};
  if (startTime !== undefined && !isValidDate(startTime)) errors.startTime = 'Giờ bắt đầu không hợp lệ';
  if (price !== undefined) {
    if (!price || typeof price !== 'object') {
      errors.price = 'Giá vé không hợp lệ';
    } else {
      if (price.standard !== undefined && !isPrice(price.standard)) errors['price.standard'] = 'Giá ghế thường không hợp lệ';
      if (price.vip !== undefined && !isPrice(price.vip)) errors['price.vip'] = 'Giá ghế VIP không hợp lệ';
    }
  }
  return errors;
};
