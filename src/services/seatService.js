import Showtime from '../models/Showtime.js';
import AppError from '../utils/AppError.js';
import { parseSeatLabel, toSeatLabel } from '../utils/seats.js';

const holdMinutes = () => Number(process.env.HOLD_MINUTES) || 5;

const canHoldCondition = ({ row, number }, userId, now) => ({
  seats: {
    $elemMatch: {
      row,
      number,
      $or: [
        { status: 'available' },
        { status: 'held', heldUntil: { $lt: now } },
        { status: 'held', heldBy: userId }
      ]
    }
  }
});

const seatMatch = (seats) => ({ $or: seats.map(({ row, number }) => ({ 's.row': row, 's.number': number })) });

export const holdSeats = async ({ showtimeId, userId, labels }) => {
  const seats = [...new Set(labels.map((l) => l.trim().toUpperCase()))].map(parseSeatLabel);
  const now = new Date();
  const heldUntil = new Date(now.getTime() + holdMinutes() * 60 * 1000);

  const updated = await Showtime.findOneAndUpdate(
    {
      _id: showtimeId,
      startTime: { $gt: now },
      $and: seats.map((seat) => canHoldCondition(seat, userId, now))
    },
    {
      $set: {
        'seats.$[s].status': 'held',
        'seats.$[s].heldBy': userId,
        'seats.$[s].heldUntil': heldUntil
      }
    },
    { arrayFilters: [seatMatch(seats)], new: true, projection: { _id: 1 } }
  );

  if (!updated) await explainHoldFailure(showtimeId, seats, now);

  await Showtime.updateOne(
    { _id: showtimeId },
    { $set: { 'seats.$[o].status': 'available', 'seats.$[o].heldBy': null, 'seats.$[o].heldUntil': null } },
    {
      arrayFilters: [
        {
          $and: [
            { 'o.heldBy': userId },
            { 'o.status': 'held' },
            ...seats.map(({ row, number }) => ({ $or: [{ 'o.row': { $ne: row } }, { 'o.number': { $ne: number } }] }))
          ]
        }
      ]
    }
  );

  return { seats: seats.map(toSeatLabel), heldUntil, holdMinutes: holdMinutes(), serverTime: now };
};

const explainHoldFailure = async (showtimeId, seats, now) => {
  const showtime = await Showtime.findById(showtimeId).select('startTime seats');
  if (!showtime) throw new AppError('Không tìm thấy suất chiếu', 404);
  if (showtime.startTime <= now) throw new AppError('Suất chiếu đã bắt đầu, không thể đặt ghế', 400);

  const missing = seats.filter((s) => !showtime.seats.some((x) => x.row === s.row && x.number === s.number));
  if (missing.length > 0) {
    const message = `Ghế không tồn tại: ${missing.map(toSeatLabel).join(', ')}`;
    throw new AppError(message, 400, [{ field: 'seats', message }]);
  }

  const taken = seats
    .filter((s) => {
      const seat = showtime.seats.find((x) => x.row === s.row && x.number === s.number);
      return seat.status === 'sold' || (seat.status === 'held' && seat.heldUntil > now);
    })
    .map(toSeatLabel);
  const message = `Ghế ${taken.join(', ')} đã có người đặt hoặc đang được giữ, vui lòng chọn ghế khác`;
  throw new AppError(message, 409, [{ field: 'seats', message }]);
};

export const releaseSeats = async ({ showtimeId, userId }) => {
  const result = await Showtime.updateOne(
    { _id: showtimeId },
    { $set: { 'seats.$[s].status': 'available', 'seats.$[s].heldBy': null, 'seats.$[s].heldUntil': null } },
    { arrayFilters: [{ 's.heldBy': userId, 's.status': 'held' }] }
  );
  if (result.matchedCount === 0) throw new AppError('Không tìm thấy suất chiếu', 404);
};

export const sellHeldSeats = async ({ showtimeId, userId, labels }) => {
  const seats = [...new Set(labels.map((l) => l.trim().toUpperCase()))].map(parseSeatLabel);
  const now = new Date();

  const result = await Showtime.updateOne(
    {
      _id: showtimeId,
      $and: seats.map(({ row, number }) => ({
        seats: { $elemMatch: { row, number, status: 'held', heldBy: userId, heldUntil: { $gt: now } } }
      }))
    },
    { $set: { 'seats.$[s].status': 'sold', 'seats.$[s].heldUntil': null } },
    { arrayFilters: [{ $and: [{ 's.heldBy': userId }, { 's.status': 'held' }, seatMatch(seats)] }] }
  );

  if (result.modifiedCount === 0) {
    throw new AppError('Thời gian giữ ghế đã hết hoặc ghế đã bị người khác đặt, vui lòng chọn lại', 409);
  }
  return seats.map(toSeatLabel);
};
