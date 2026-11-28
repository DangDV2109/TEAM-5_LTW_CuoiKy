import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import SeatLock from "../models/SeatLock.js";
import { CINEMAS } from "../config/cinemas.js";
import { ApiError } from "./helpers.js";

export async function findShowtime(showtimeId) {
  if (!mongoose.isValidObjectId(showtimeId)) throw new ApiError(400, "showtimeId không hợp lệ");
  const id = new mongoose.Types.ObjectId(showtimeId);
  const movie = await Movie.findOne({ "showtimes._id": id }, { title: 1, poster: 1, showtimes: { $elemMatch: { _id: id } } });
  if (!movie || !movie.showtimes?.length) throw new ApiError(404, "Không tìm thấy suất chiếu");
  return { movie, showtime: movie.showtimes[0] };
}

export const cinemaName = (id) => CINEMAS.find((c) => c.id === id)?.name || id;

export function seatPrice(showtime, row) {
  const isVip = (showtime.vipRows || []).includes(row);
  if (!isVip) return { type: "standard", price: showtime.price };
  const vip = showtime.vipPrice ?? Math.round((showtime.price * 1.25) / 1000) * 1000;
  return { type: "vip", price: vip };
}

export function buildSeatMap(showtime) {
  const seats = [];
  for (const row of showtime.rows) {
    for (let n = 1; n <= showtime.seatsPerRow; n++) {
      seats.push({ seat: `${row}${n}`, row, number: n, ...seatPrice(showtime, row) });
    }
  }
  return seats;
}

export async function getTakenSeats(showtimeId) {
  const locks = await SeatLock.find({
    showtimeId,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }, { expiresAt: null }],
  }).lean();
  return new Map(locks.map((l) => [l.seat, l]));
}
