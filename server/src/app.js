import express from "express";
import cors from "cors";
import {
  authRouter, movieRouter, reviewRouter, comboRouter, showtimeRouter,
  bookingRouter, paymentRouter, statsRouter, cinemaRouter, userRouter, adminRouter, supportRouter,
} from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

const origins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:5173").split(",").map((s) => s.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => res.json({ name: "PTIT Cinema API", status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ success: true, uptime: process.uptime() }));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/users", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/movies", movieRouter);
app.use("/api/admin/movies", movieRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/combos", comboRouter);
app.use("/api/admin/combos", comboRouter);
app.use("/api/showtimes", showtimeRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin/stats", statsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/cinemas", cinemaRouter);
app.use("/api/support", supportRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
