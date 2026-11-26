import { isObjectId } from '../utils/query.js';

const build = (partial) => (body) => {
  const errors = {};
  const { theater, name, rows, seatsPerRow, vipRows } = body;

  if (!partial) {
    if (!isObjectId(theater)) errors.theater = 'Rạp không hợp lệ';
    if (name === undefined) errors.name = 'Tên phòng là bắt buộc';
    if (rows === undefined) errors.rows = 'Số hàng là bắt buộc';
    if (seatsPerRow === undefined) errors.seatsPerRow = 'Số ghế mỗi hàng là bắt buộc';
  }
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50)) {
    errors.name = 'Tên phòng phải từ 1 đến 50 ký tự';
  }
  if (rows !== undefined && !(Number.isInteger(rows) && rows >= 1 && rows <= 26)) {
    errors.rows = 'Số hàng phải là số nguyên từ 1 đến 26';
  }
  if (seatsPerRow !== undefined && !(Number.isInteger(seatsPerRow) && seatsPerRow >= 1 && seatsPerRow <= 30)) {
    errors.seatsPerRow = 'Số ghế mỗi hàng phải là số nguyên từ 1 đến 30';
  }
  if (vipRows !== undefined) {
    const ok = Array.isArray(vipRows) && vipRows.every((r) => typeof r === 'string' && /^[A-Za-z]$/.test(r));
    if (!ok) errors.vipRows = 'Hàng VIP phải là mảng các chữ cái, ví dụ ["D","E"]';
  }
  return errors;
};

export const validateCreateRoom = build(false);
export const validateUpdateRoom = build(true);
