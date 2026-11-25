# PTIT CINEMA - BACKEND (NHÓM 5 LẬP TRÌNH WEB)
**Phân công nhiệm vụ: THÀNH VIÊN 4**  
*Mảng phụ trách: Backend (MongoDB) - Phim, Thanh toán QR, Vé & Thống kê*

---

## 🎯 CÁC TÍNH NĂNG ĐÃ TRIỂN KHAI

### 1. Schema & Nhóm Collection (MongoDB / Mongoose)
- **`Movies`**: Lưu trữ toàn diện thông tin phim, poster, trailer, thể loại, đạo diễn, diễn viên, suất chiếu, định dạng 2D/3D, phân loại độ tuổi, tags (`#hot`, `#schedule`, `#vietnam`), rạp chiếu. Tương thích 100% với dữ liệu frontend `moviesData.js`.
- **`Combos`**: Quản lý các gói combo bắp nước rạp phim (tên, giá tiền, mô tả, hình ảnh, trạng thái).
- **`Reviews`**: Đánh giá và nhận xét của khán giả (chấm điểm sao 1-10, bình luận, lượt thích). Tự động cập nhật điểm rating trung bình của phim.
- **`Orders`**: Đơn hàng đặt vé, kiểm soát giữ ghế tạm thời (5 phút) chống tranh chấp ghế (race condition), tính toán tổng tiền vé + combo.
- **`Tickets`**: Vé điện tử được phát hành sau khi thanh toán thành công, chứa mã vé duy nhất `PTIT-XXXXXX`, mã QR Code điện tử và chi tiết phòng/ghế.
- **`Users`**: Tài khoản quản trị viên (`ADMIN`) và khách hàng (`USER`), mã hóa mật khẩu bằng `bcryptjs` và xác thực qua `JWT`.

### 1b. API Xác thực (Auth) & Rạp
- `POST /api/auth/register`: Đăng ký tài khoản (luôn là role `USER`).
- `POST /api/auth/login`: Đăng nhập, trả về `token` JWT. Gửi kèm header `Authorization: Bearer <token>`.
- `GET /api/auth/me`: Thông tin tài khoản đang đăng nhập.
- `GET /api/cinemas`: Danh sách rạp (id dùng cho `?cinema=`).

### 2. API Quản lý Phim & Combo (Admin)
- `POST /api/movies` (hoặc `/api/admin/movies`): Thêm phim mới vào rạp.
- `PUT /api/movies/:id`: Chỉnh sửa thông tin phim, suất chiếu, poster.
- `DELETE /api/movies/:id`: Xóa phim khỏi hệ thống.
- `POST /api/combos` (hoặc `/api/admin/combos`): Thêm combo bắp nước mới.
- `PUT /api/combos/:id`: Cập nhật giá hoặc thông tin combo.
- `DELETE /api/combos/:id`: Xóa combo.
- `GET /api/combos`: Danh sách combo đang bán (công khai).
- *Tất cả API ghi ở trên yêu cầu token của tài khoản `ADMIN`.*

### 3. API Phim Công Khai & Đánh Giá
- `GET /api/movies`: Lấy danh sách phim có hỗ trợ:
  - **Tìm kiếm**: `?search=oppenheimer` (theo tên, đạo diễn, diễn viên).
  - **Lọc theo trạng thái**: `?status=now` (đang chiếu) hoặc `?status=coming` (sắp chiếu).
  - **Lọc theo thể loại**: `?genre=Hành động`.
  - **Lọc theo tag**: `?tag=hot`, `?tag=schedule`, `?tag=vietnam`.
  - **Lọc theo rạp**: `?cinema=hn-hadong`.
  - **Phân trang**: `?page=1&limit=10`.
  - **Sắp xếp**: `?sort=rating` hoặc `?sort=newest` hoặc `?sort=title`.
- `GET /api/movies/:id`: Chi tiết 1 bộ phim và danh sách đánh giá.
- `GET /api/movies/:id/reviews`: Lấy danh sách đánh giá của phim.
- `POST /api/movies/:id/reviews`: Gửi đánh giá sao (1-10) và bình luận (cần đăng nhập). Mỗi người 1 đánh giá/phim, gửi lại sẽ cập nhật. Tự động tính lại điểm số trung bình của phim.
- `POST /api/reviews/:id/like`: Thích / bỏ thích đánh giá.
- `DELETE /api/reviews/:id`: Xóa đánh giá (chủ đánh giá hoặc Admin).

### 4. Thanh toán QR & Vé Điện Tử
- `GET /api/showtimes/:id/seats`: Sơ đồ ghế tự động đánh dấu ghế đã bán (`sold`), ghế đang giữ (`holding`), ghế trống (`available`).
- `POST /api/bookings/hold`: Body `{ showtimeId, seats: ["A1","A2"] }`. Giữ ghế trong 5 phút (tối đa 8 ghế/đơn). Nếu có người khác vừa giữ ghế cùng lúc -> trả về mã lỗi 409 kèm `conflictSeats`. Chống tranh chấp bằng **unique index** `(showtimeId, seat)` ở collection `SeatLock`, nên an toàn ngay cả khi 2 request đến cùng lúc.
- `POST /api/bookings/:id/release`: Nhả ghế khi khách hủy hoặc hết giờ.
- `POST /api/bookings/:id/checkout`: Body `{ combos: [{comboId, quantity}], paymentMethod: "PAYOS"|"VIETQR", customer: {name, email, phone} }`. Giá luôn lấy từ DB (không tin giá client). Sau khi checkout, thời gian giữ ghế được gia hạn thành 10 phút để khách quét QR. Tích hợp cổng QR:
  - **Cổng PayOS**: Tự động tạo link thanh toán và mã QR PayOS qua API chính thức.
  - **Cổng VietQR**: Tạo mã QR chuyển khoản ngân hàng chuẩn NAPAS.
- `POST /api/payments/payos-webhook`: Webhook nhận thông báo khi khách chuyển khoản thành công:
  - Đổi trạng thái đơn sang `PAID`.
  - Tự động sinh `Ticket` với mã vé điện tử duy nhất và tạo ảnh QR Code base64.
  - Tự động gọi **Nodemailer** gửi email vé điện tử cực đẹp tới hòm thư của khách hàng.
- `POST /api/payments/vietqr-webhook`: Nhận biến động số dư từ SePay/Casso (nội dung chuyển khoản chứa `PTIT<orderCode>`, số tiền phải đủ). Bảo vệ bằng `WEBHOOK_SECRET` (header `Authorization: Apikey <khoa>`).
- `POST /api/payments/simulate-success/:id`: Giả lập thanh toán thành công (dành cho demo / thuyết trình đồ án mà không cần chuyển tiền thật). Tự khóa khi `NODE_ENV=production` (trừ khi đặt `ALLOW_SIMULATE=true`). Cần gọi `checkout` trước để có email nhận vé.
- `GET /api/bookings/:id`: Lấy thông tin đơn hàng / vé sau thanh toán.
- `GET /api/bookings/my`: Xem lịch sử vé đã đặt của tài khoản (cần đăng nhập, hỗ trợ `?status=&page=&limit=`).
- `POST /api/bookings/:id/checkout` có thể gọi lại để lấy lại mã QR; đơn hết hạn sẽ tự chuyển `EXPIRED` và nhả ghế (server quét mỗi 60 giây).

### 5. Thống Kê Báo Cáo Doanh Thu (Admin)
- `GET /api/admin/stats` (hoặc `/api/stats`):
  - Tổng doanh thu rạp.
  - Doanh thu từ vé xem phim vs Doanh thu combo bắp nước.
  - Tổng số vé đã bán ra và tổng số đơn hàng.
  - Top 10 phim có doanh thu và lượng vé cao nhất.
  - Danh sách các đơn hàng thanh toán gần nhất.
  - Doanh thu theo ngày (`revenueByDay`, mặc định 30 ngày, đổi bằng `?days=` hoặc `?from=YYYY-MM-DD&to=YYYY-MM-DD`) và theo rạp (`revenueByCinema`) — dùng MongoDB Aggregation Pipeline.
- `GET /api/admin/stats/movies`: Doanh thu & số vé của từng phim.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY

### 1. Cài đặt thư viện
Tại thư mục `backend`:
```bash
cd backend
npm install
```

### 2. Cấu hình biến môi trường (`.env`)
Sao chép `.env.example` thành `.env` (file `.env` đã nằm trong `.gitignore`, **không commit lên GitHub**) rồi chỉnh sửa nếu cần:
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/ptit_cinema
JWT_SECRET=ptit_cinema_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173

# PayOS (Tùy chọn - nếu để trống sẽ tự động dùng chế độ VietQR & Giả lập)
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=

# Nodemailer (Tùy chọn - dùng tài khoản Gmail App Password để gửi email thật)
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="PTIT Cinema" <your@gmail.com>

# VietQR (tài khoản nhận tiền khi dùng chế độ VietQR)
VIETQR_BANK_ID=MB
VIETQR_ACCOUNT_NO=0987654321
VIETQR_ACCOUNT_NAME=PTIT CINEMA
```

### 3. Nạp dữ liệu mẫu ban đầu (Seed Data)
Chạy lệnh sau để nạp phim, combo, tài khoản Admin/User và **tự sinh suất chiếu 5 ngày tới** vào MongoDB (⚠️ lệnh này xóa dữ liệu cũ):
```bash
npm run seed
```
> **Nạp 66+ phim từ frontend:** copy file `moviesData.js` của frontend vào `backend/src/data/moviesData.js` (file cần `export default [...]` hoặc `export const moviesData = [...]`) rồi chạy lại `npm run seed`. Nếu không có file này, seed dùng 7 phim mẫu.

*Tài khoản Admin mẫu:*  
- Email: `admin@ptitcinema.vn`  
- Mật khẩu: `admin123`

*Tài khoản User mẫu:*  
- Email: `user@ptitcinema.vn`  
- Mật khẩu: `user123456`

### 4. Khởi chạy Server
```bash
npm run dev
# Server lắng nghe tại: http://localhost:8080
```

---

## 🔗 KẾT NỐI VỚI FRONTEND (REACT VITE)
Trong file `src/api/axiosClient.js` của Frontend, baseURL đã được đặt sẵn:
```javascript
baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
```
Khi chạy Backend, Frontend có thể tắt `VITE_USE_MOCK=true` để sử dụng Backend thật 100%!

---

## 🧭 LUỒNG ĐẶT VÉ (cho Frontend)
1. `GET /api/movies/:id` → lấy `showtimes[]` (mỗi suất có `_id` = `showtimeId`).
2. `GET /api/showtimes/:id/seats` → vẽ sơ đồ ghế (`available` / `holding` / `sold`).
3. `POST /api/bookings/hold` → nhận `orderId`, `holdExpiresAt` (đếm ngược 5 phút).
4. `POST /api/bookings/:id/checkout` → nhận `qrImage` (ảnh QR), `checkoutUrl` (PayOS), `total`.
5. Frontend gọi `GET /api/bookings/:id` mỗi 3–5 giây cho đến khi `status === "PAID"` (hoặc gọi `simulate-success` khi demo). Khi `PAID`, response có kèm `ticket` (mã `PTIT-XXXXXX` + QR base64) và email vé được gửi tự động.

Mọi response thành công có dạng `{ "success": true, "data": ..., "pagination": {...} }`; lỗi có dạng `{ "success": false, "message": "..." }`.

## 💳 CẤU HÌNH WEBHOOK PAYOS (khi chạy thật)
Webhook cần URL public (dùng `ngrok http 8080` khi chạy local). Đặt URL `https://<domain>/api/payments/payos-webhook` trong dashboard PayOS (hoặc gọi `payOS.confirmWebhook(url)` một lần). Server xác thực chữ ký bằng `PAYOS_CHECKSUM_KEY` và xử lý idempotent nên PayOS gửi lặp cũng chỉ sinh 1 vé.

## 🗂️ CẤU TRÚC THƯ MỤC
```
src/
├─ server.js            # khởi động, kết nối DB, dọn đơn hết hạn
├─ app.js               # express, CORS, mount routes
├─ seed.js              # nạp dữ liệu mẫu
├─ config/              # db.js, cinemas.js (rạp + thời gian giữ ghế)
├─ models/              # User, Movie, Combo, Review, Order, Ticket, SeatLock
├─ controllers/         # auth, movie, combo, review, showtime, booking, payment, stats
├─ routes/index.js      # toàn bộ route
├─ middleware/          # auth (JWT), error handler
└─ utils/               # fulfill (phát hành vé), payment (PayOS/VietQR), email, seats, helpers
```
