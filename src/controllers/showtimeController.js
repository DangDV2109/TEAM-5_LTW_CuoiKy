import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
import Room from '../models/Room.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isObjectId, parseIdList, parseVietnamDay, getPagination, buildPagination } from '../utils/query.js';
import { toSeatLabel } from '../utils/seats.js';

const bufferMinutes = () => Number(process.env.SHOWTIME_BUFFER_MINUTES ?? 15);

const populateInfo = [
  { path: 'movie', select: 'title poster duration' },
  { path: 'theater', select: 'name code cityName' },
  { path: 'room', select: 'name' }
];

const assertNoOverlap = async ({ roomId, start, end, excludeId }) => {
  const filter = { room: roomId, startTime: { $lt: end }, endTime: { $gt: start } };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Showtime.exists(filter)) {
    const message = 'Phòng chiếu đã có suất khác trùng giờ';
    throw new AppError(message, 409, [{ field: 'startTime', message }]);
  }
};

const calcEnd = (start, movie) => new Date(start.getTime() + (movie.duration + bufferMinutes()) * 60 * 1000);

const withoutSeats = (doc) => {
  const obj = doc.toObject();
  delete obj.seats;
  return obj;
};

export const getShowtimes = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, 20, 100);
  const filter = {};

  const movies = parseIdList(req.query.movie, 'movie');
  if (movies) filter.movie = { $in: movies };
  const theaters = parseIdList(req.query.theater, 'theater');
  if (theaters) filter.theater = { $in: theaters };
  if (req.query.room !== undefined) {
    if (!isObjectId(req.query.room)) throw new AppError('room không hợp lệ', 400);
    filter.room = req.query.room;
  }

  if (typeof req.query.date === 'string') {
    const { start, end } = parseVietnamDay(req.query.date);
    filter.startTime = { $gte: start, $lt: end };
  } else if (req.query.past !== 'true') {
    filter.startTime = { $gte: new Date() };
  }

  const [data, total] = await Promise.all([
    Showtime.find(filter)
      .select('-seats')
      .populate(populateInfo)
      .sort({ startTime: 1 })
      .skip(pg.skip)
      .limit(pg.limit),
    Showtime.countDocuments(filter)
  ]);
  res.status(200).json({ success: true, data, pagination: buildPagination(pg, total) });
});

export const getShowtime = asyncHandler(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id).select('-seats').populate(populateInfo);
  if (!showtime) throw new AppError('Không tìm thấy suất chiếu', 404);
  res.status(200).json({ success: true, data: showtime });
});

export const createShowtime = asyncHandler(async (req, res) => {
  const { movie: movieId, room: roomId, startTime, price } = req.body;

  const [movie, room] = await Promise.all([Movie.findById(movieId), Room.findById(roomId)]);
  if (!movie) throw new AppError('Không tìm thấy phim', 404);
  if (!room) throw new AppError('Không tìm thấy phòng chiếu', 404);

  const start = new Date(startTime);
  if (start <= new Date()) {
    throw new AppError('Giờ bắt đầu phải ở tương lai', 400, [{ field: 'startTime', message: 'Giờ bắt đầu phải ở tương lai' }]);
  }
  const end = calcEnd(start, movie);
  await assertNoOverlap({ roomId: room._id, start, end });

  const showtime = await Showtime.create({
    movie: movie._id,
    theater: room.theater,
    room: room._id,
    startTime: start,
    endTime: end,
    price: { standard: price.standard, vip: price.vip },
    seats: room.generateSeats()
  });
  res.status(201).json({ success: true, message: 'Đã tạo suất chiếu', data: withoutSeats(showtime) });
});

export const updateShowtime = asyncHandler(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id).populate('movie', 'duration');
  if (!showtime) throw new AppError('Không tìm thấy suất chiếu', 404);
  if (showtime.seats.some((s) => s.status === 'sold')) {
    throw new AppError('Suất chiếu đã có vé bán, không thể chỉnh sửa', 409);
  }

  const { startTime, price } = req.body;
  if (startTime !== undefined) {
    const start = new Date(startTime);
    if (start <= new Date()) {
      throw new AppError('Giờ bắt đầu phải ở tương lai', 400, [{ field: 'startTime', message: 'Giờ bắt đầu phải ở tương lai' }]);
    }
    const end = calcEnd(start, showtime.movie);
    await assertNoOverlap({ roomId: showtime.room, start, end, excludeId: showtime._id });
    showtime.startTime = start;
    showtime.endTime = end;
  }
  if (price?.standard !== undefined) showtime.price.standard = price.standard;
  if (price?.vip !== undefined) showtime.price.vip = price.vip;

  await showtime.save();
  res.status(200).json({ success: true, message: 'Đã cập nhật suất chiếu', data: withoutSeats(showtime) });
});

export const deleteShowtime = asyncHandler(async (req, res) => {
  if (await Showtime.exists({ _id: req.params.id, 'seats.status': 'sold' })) {
    throw new AppError('Suất chiếu đã có vé bán, không thể xoá', 409);
  }
  const showtime = await Showtime.findByIdAndDelete(req.params.id);
  if (!showtime) throw new AppError('Không tìm thấy suất chiếu', 404);
  res.status(200).json({ success: true, message: 'Đã xoá suất chiếu' });
});

export const getSeatMap = asyncHandler(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id).populate([
    { path: 'movie', select: 'title poster duration' },
    { path: 'theater', select: 'name code' },
    { path: 'room', select: 'name rows seatsPerRow vipRows' }
  ]);
  if (!showtime) throw new AppError('Không tìm thấy suất chiếu', 404);

  const now = new Date();
  const myId = String(req.user._id);

  const seats = showtime.seats.map((seat) => {
    const activeHold = seat.status === 'held' && seat.heldUntil > now;
    const heldByMe = activeHold && String(seat.heldBy) === myId;
    return {
      row: seat.row,
      number: seat.number,
      label: toSeatLabel(seat),
      type: seat.type,
      status: seat.status === 'sold' ? 'sold' : activeHold ? 'held' : 'available',
      heldByMe,
      ...(heldByMe && { heldUntil: seat.heldUntil })
    };
  });

  const { seats: _seats, ...info } = showtime.toObject();
  res.status(200).json({
    success: true,
    showtime: info,
    seats,
    serverTime: now,
    holdMinutes: Number(process.env.HOLD_MINUTES) || 5
  });
});
