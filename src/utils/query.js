import AppError from './AppError.js';

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export const isObjectId = (value) => typeof value === 'string' && OBJECT_ID_REGEX.test(value);

export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getPagination = (query, defaultLimit = 10, maxLimit = 50) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPagination = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit)
});

export const parseIdList = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const ids = value.split(',').map((v) => v.trim()).filter(Boolean);
  if (ids.length === 0 || !ids.every(isObjectId)) {
    throw new AppError(`${fieldName} không hợp lệ`, 400);
  }
  return ids;
};

export const parseVietnamDay = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new AppError('date phải có dạng YYYY-MM-DD', 400);
  const start = new Date(`${dateStr}T00:00:00+07:00`);
  if (Number.isNaN(start.getTime())) throw new AppError('date không hợp lệ', 400);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};
