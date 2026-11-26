import Theater from '../models/Theater.js';
import Room from '../models/Room.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex, getPagination, buildPagination } from '../utils/query.js';

const FIELDS = ['code', 'name', 'cityId', 'cityName', 'address', 'phone', 'isActive'];
const pick = (body) => Object.fromEntries(Object.entries(body).filter(([k]) => FIELDS.includes(k)));

export const getTheaters = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, 20, 100);
  const filter = {};
  if (typeof req.query.cityId === 'string' && req.query.cityId) filter.cityId = req.query.cityId;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { address: regex }];
  }

  const [data, total] = await Promise.all([
    Theater.find(filter).sort({ cityId: 1, name: 1 }).skip(pg.skip).limit(pg.limit),
    Theater.countDocuments(filter)
  ]);
  res.status(200).json({ success: true, data, pagination: buildPagination(pg, total) });
});

export const getTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);
  if (!theater) throw new AppError('Không tìm thấy rạp', 404);
  res.status(200).json({ success: true, data: theater });
});

export const createTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.create(pick(req.body));
  res.status(201).json({ success: true, message: 'Đã tạo rạp', data: theater });
});

export const updateTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true
  });
  if (!theater) throw new AppError('Không tìm thấy rạp', 404);
  res.status(200).json({ success: true, message: 'Đã cập nhật rạp', data: theater });
});

export const deleteTheater = asyncHandler(async (req, res) => {
  if (await Room.exists({ theater: req.params.id })) {
    throw new AppError('Rạp còn phòng chiếu, hãy xoá các phòng trước', 409);
  }
  const theater = await Theater.findByIdAndDelete(req.params.id);
  if (!theater) throw new AppError('Không tìm thấy rạp', 404);
  res.status(200).json({ success: true, message: 'Đã xoá rạp' });
});
