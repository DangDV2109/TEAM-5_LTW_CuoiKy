import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import SeatLock from "./models/SeatLock.js";
import Order from "./models/Order.js";
import Ticket from "./models/Ticket.js";
import { expireStaleOrders } from "./utils/fulfill.js";
import { isPayOSConfigured } from "./utils/payment.js";
import { isEmailConfigured } from "./utils/email.js";

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "ptit_cinema_super_secret_jwt_key_2026";
}

async function main() {
  await connectDB();

  await Promise.all([SeatLock.init(), Order.init(), Ticket.init()]);

  setInterval(() => expireStaleOrders().catch((e) => console.error("[sweeper]", e.message)), 60 * 1000);

  app.listen(PORT, () => {
    console.log(`🎬 PTIT Cinema API chạy tại http://localhost:${PORT}`);
    console.log(`   Thanh toán : ${isPayOSConfigured() ? "PayOS" : "VietQR + giả lập (chưa có khoá PayOS)"}`);
    console.log(`   Email vé   : ${isEmailConfigured() ? "Nodemailer đã cấu hình" : "chưa cấu hình (bỏ qua gửi mail)"}`);
  });
}

main().catch((err) => {
  console.error("❌ Không khởi động được server:", err.message);
  process.exit(1);
});
