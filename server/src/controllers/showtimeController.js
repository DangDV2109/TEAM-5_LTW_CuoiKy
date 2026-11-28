import { asyncHandler, ok } from "../utils/helpers.js";
import { buildSeatMap, findShowtime, getTakenSeats, cinemaName } from "../utils/seats.js";

export const getSeats = asyncHandler(async (req, res) => {
  const { movie, showtime } = await findShowtime(req.params.id);
  const taken = await getTakenSeats(showtime._id);
  const seats = buildSeatMap(showtime).map((s) => {
    const lock = taken.get(s.seat);
    const typeMap = { standard: "NORMAL", vip: "VIP", couple: "COUPLE" };
    return {
      ...s,
      id: s.seat,
      type: typeMap[s.type] || String(s.type).toUpperCase(),
      status: !lock ? "available" : lock.status === "SOLD" ? "sold" : "holding",
    };
  });
  ok(res, {
    showtime: {
      id: showtime._id,
      movieId: movie._id,
      movieTitle: movie.title,
      poster: movie.poster,
      cinemaId: showtime.cinemaId,
      cinemaName: cinemaName(showtime.cinemaId),
      room: showtime.room,
      date: showtime.date,
      time: showtime.time,
      format: showtime.format,
      rows: showtime.rows,
      seatsPerRow: showtime.seatsPerRow,
    },
    seats,
    summary: {
      total: seats.length,
      available: seats.filter((s) => s.status === "available").length,
      sold: seats.filter((s) => s.status === "sold").length,
      holding: seats.filter((s) => s.status === "holding").length,
    },
  });
});
