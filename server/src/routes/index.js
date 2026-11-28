import { Router } from "express";
import { adminOnly, optionalAuth, protect } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/error.js";
import { CINEMAS } from "../config/cinemas.js";
import { ok } from "../utils/helpers.js";
import * as auth from "../controllers/authController.js";
import * as movies from "../controllers/movieController.js";
import * as combos from "../controllers/comboController.js";
import * as reviews from "../controllers/reviewController.js";
import * as showtimes from "../controllers/showtimeController.js";
import * as bookings from "../controllers/bookingController.js";
import * as payments from "../controllers/paymentController.js";
import * as stats from "../controllers/statsController.js";
import * as users from "../controllers/userController.js";

const admin = [protect, adminOnly];
const id = validateObjectId("id");

export const authRouter = Router();
authRouter.post("/register", auth.register);
authRouter.post("/login", auth.login);
authRouter.post("/forgot-password", auth.forgotPassword);
authRouter.post("/reset-password", auth.resetPassword);
authRouter.get("/me", protect, auth.me);

export const movieRouter = Router();
movieRouter.get("/", movies.listMovies);
movieRouter.post("/", admin, movies.createMovie);
movieRouter.get("/:id", id, movies.getMovie);
movieRouter.put("/:id", id, admin, movies.updateMovie);
movieRouter.delete("/:id", id, admin, movies.deleteMovie);
movieRouter.post("/:id/showtimes", id, admin, movies.addShowtime);
movieRouter.get("/:id/reviews", id, reviews.listReviews);
movieRouter.post("/:id/reviews", id, protect, reviews.createReview);

export const reviewRouter = Router();
reviewRouter.post("/:id/like", id, protect, reviews.toggleLike);
reviewRouter.delete("/:id", id, protect, reviews.deleteReview);

export const comboRouter = Router();
comboRouter.get("/", optionalAuth, combos.listCombos);
comboRouter.post("/", admin, combos.createCombo);
comboRouter.put("/:id", id, admin, combos.updateCombo);
comboRouter.delete("/:id", id, admin, combos.deleteCombo);

export const showtimeRouter = Router();
showtimeRouter.get("/:id/seats", id, showtimes.getSeats);

export const bookingRouter = Router();
bookingRouter.post("/hold", optionalAuth, bookings.holdSeats);
bookingRouter.post("/validate-coupon", optionalAuth, bookings.validateCoupon);
bookingRouter.get("/my", protect, bookings.myBookings);
bookingRouter.get("/:id", id, optionalAuth, bookings.getBooking);
bookingRouter.post("/:id/release", id, optionalAuth, bookings.releaseSeats);
bookingRouter.post("/:id/cancel", id, protect, bookings.cancelBooking);
bookingRouter.post("/:id/checkout", id, optionalAuth, bookings.checkout);

export const paymentRouter = Router();
paymentRouter.post("/payos-webhook", payments.payosWebhook);
paymentRouter.post("/vietqr-webhook", payments.vietqrWebhook);
paymentRouter.post("/wallet/:id", id, protect, payments.payWithWallet);
paymentRouter.post("/simulate-success/:id", id, optionalAuth, payments.simulateSuccess);

export const statsRouter = Router();
statsRouter.get("/", admin, stats.getStats);
statsRouter.get("/movies", admin, stats.getMovieStats);

export const cinemaRouter = Router();
cinemaRouter.get("/", (_req, res) => ok(res, CINEMAS));

// /api/users/me/...  (cần đăng nhập)
export const userRouter = Router();
userRouter.patch("/me/profile", protect, users.updateProfile);
userRouter.put("/me/profile", protect, users.updateProfile);
userRouter.post("/me/change-password", protect, users.changePassword);
userRouter.post("/me/topup", protect, users.topup);
userRouter.get("/me/transactions", protect, users.myTransactions);
userRouter.get("/me/reviews", protect, users.myReviews);
userRouter.get("/me/favorites", protect, users.myFavorites);
userRouter.post("/me/favorites/:movieId", protect, users.toggleFavorite);

export const supportRouter = Router();
supportRouter.post("/", optionalAuth, users.createSupportTicket);

// /api/admin/...  (chỉ ADMIN)
export const adminRouter = Router();
adminRouter.get("/users", admin, users.adminListUsers);
adminRouter.get("/users/:id/history", id, admin, users.adminUserHistory);
adminRouter.patch("/users/:id", id, admin, users.adminUpdateUser);
adminRouter.get("/transactions", admin, users.adminTransactions);
adminRouter.get("/orders", admin, users.adminOrders);
adminRouter.get("/reviews", admin, users.adminReviews);
adminRouter.get("/favorites", admin, users.adminFavorites);
adminRouter.get("/revenue", admin, users.adminRevenue);
adminRouter.get("/support", admin, users.adminListSupport);
adminRouter.patch("/support/:id", id, admin, users.adminUpdateSupport);
adminRouter.delete("/support/:id", id, admin, users.adminDeleteSupport);
