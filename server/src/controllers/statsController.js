import Order from "../models/Order.js";
import { asyncHandler, ok } from "../utils/helpers.js";

const TZ = "Asia/Ho_Chi_Minh";

export const getStats = asyncHandler(async (req, res) => {
  const match = { status: "PAID" };
  const range = {};
  if (req.query.from) range.$gte = new Date(`${req.query.from}T00:00:00+07:00`);
  if (req.query.to) range.$lte = new Date(`${req.query.to}T23:59:59.999+07:00`);
  if (Object.keys(range).length) match.paidAt = range;

  const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
  const dailyMatch = { ...match };
  if (!match.paidAt) dailyMatch.paidAt = { $gte: new Date(Date.now() - days * 86400000) };

  const [totals, topMovies, byDay, byCinema, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          ticketRevenue: { $sum: "$ticketTotal" },
          comboRevenue: { $sum: "$comboTotal" },
          totalOrders: { $sum: 1 },
          totalTickets: { $sum: { $size: "$seats" } },
        },
      },
    ]),
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$movie",
          title: { $first: "$showtime.movieTitle" },
          poster: { $first: "$showtime.poster" },
          revenue: { $sum: "$ticketTotal" },
          tickets: { $sum: { $size: "$seats" } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1, tickets: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, movieId: "$_id", title: 1, poster: 1, revenue: 1, tickets: 1, orders: 1 } },
    ]),
    Order.aggregate([
      { $match: dailyMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: TZ } },
          revenue: { $sum: "$total" },
          tickets: { $sum: { $size: "$seats" } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, tickets: 1, orders: 1 } },
    ]),
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$showtime.cinemaId",
          cinemaName: { $first: "$showtime.cinemaName" },
          revenue: { $sum: "$total" },
          tickets: { $sum: { $size: "$seats" } },
        },
      },
      { $sort: { revenue: -1 } },
      { $project: { _id: 0, cinemaId: "$_id", cinemaName: 1, revenue: 1, tickets: 1 } },
    ]),
    Order.find(match)
      .sort({ paidAt: -1 })
      .limit(10)
      .select("orderCode customer showtime.movieTitle seats total paymentMethod paidAt")
      .lean(),
  ]);

  const t = totals[0] || { totalRevenue: 0, ticketRevenue: 0, comboRevenue: 0, totalOrders: 0, totalTickets: 0 };
  delete t._id;
  ok(res, { ...t, topMovies, revenueByDay: byDay, revenueByCinema: byCinema, recentOrders });
});

export const getMovieStats = asyncHandler(async (_req, res) => {
  const data = await Order.aggregate([
    { $match: { status: "PAID" } },
    {
      $group: {
        _id: "$movie",
        title: { $first: "$showtime.movieTitle" },
        revenue: { $sum: "$ticketTotal" },
        tickets: { $sum: { $size: "$seats" } },
      },
    },
    { $sort: { revenue: -1 } },
    { $project: { _id: 0, movieId: "$_id", title: 1, revenue: 1, tickets: 1 } },
  ]);
  ok(res, data);
});
