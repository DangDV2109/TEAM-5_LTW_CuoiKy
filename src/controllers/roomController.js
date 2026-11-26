import Room from '../models/Room.js';
import Theater from '../models/Theater.js';
import Showtime from '../models/Showtime.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isObjectId, getPagination, buildPagination } from '../utils/query.js';

const LAYOUT_FIELDS = ['rows', 'seatsPerRow', 'vipRows'];
const FIELDS = ['name', ...LAYOUT_FIELDS];

export const getRooms = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, 50, 100);
  const filter = {};
  if (req.query.theater !== undefined) {
    if (!isObjectId(req.query.theater)) throw new AppError('theater không hợp lệ', 400);
    filter.theater = req.query.theater;
  }
  const [data, total] = await Promise.all([
    Room.find(filter).populate('theater', 'name code').sort({ name: 1 }).skip(pg.skip).limit(pg.limit),
    Room.countDocuments(filter)
  ]);
  res.status(200).json({ success: true, data, pagination: buildPagination(pg, total) });
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('theater', 'name code');
  if (!room) throw new AppError('Không tìm thấy phòng chiếu', 404);
  res.status(200).json({ success: true, data: room });
});

export const createRoom = asyncHandler(async (req, res) => {
  const { theater, name, rows, seatsPerRow, vipRows } = req.body;
  if (!(await Theater.exists({ _id: theater }))) throw new AppError('Không tìm thấy rạp', 404);

  const room = await Room.create({ theater, name, rows, seatsPerRow, vipRows });
  res.status(201).json({ success: true, message: 'Đã tạo phòng chiếu', data: room });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Không tìm thấy phòng chiếu', 404);

  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => FIELDS.includes(k)));
  const changesLayout = LAYOUT_FIELDS.some((f) => updates[f] !== undefined);
  if (changesLayout && (await Showtime.exists({ room: room._id }))) {
    throw new AppError('Phòng đã có suất chiếu, không thể đổi số hàng/ghế/hàng VIP', 409);
  }

  room.set(updates);
  await room.save();
  res.status(200).json({ success: true, message: 'Đã cập nhật phòng chiếu', data: room });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  if (await Showtime.exists({ room: req.params.id })) {
    throw new AppError('Phòng đã có suất chiếu, không thể xoá', 409);
  }
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) throw new AppError('Không tìm thấy phòng chiếu', 404);
  res.status(200).json({ success: true, message: 'Đã xoá phòng chiếu' });
});
