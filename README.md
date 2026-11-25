# PTIT Cine - Hệ Thống Đặt Vé Xem Phim Trực Tuyến (NHÓM 5 LTW_03)

## 1. Cấu trúc thư mục dự án

```text
testweb2/
├── README.md                           # Hướng dẫn cài đặt, chạy dự án, tài khoản demo & lệnh chạy seed
├── client/                             # FRONTEND (React 18 + Vite 6 + React Router 7)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/                        # Cấu hình Axios client & Mock fallback
│       │   ├── axiosClient.js
│       │   └── mockAdapter.js
│       ├── assets/                     # Hình ảnh, logo PTIT, RIPT, icon bản đồ
│       │   ├── map-icon.png
│       │   ├── ptit-logo.png
│       │   └── ript-logo.png
│       ├── components/                 # Các component giao diện tái sử dụng
│       │   ├── BodySlider/             # Slider banner trang chủ (BodySlider.jsx, BodySlider.css)
│       │   ├── Footer/                 # Chân trang (Footer.jsx, Footer.css)
│       │   ├── Header/                 # Thanh điều hướng & tìm kiếm (Header.jsx, SearchBar.jsx...)
│       │   ├── MovieCard/              # Thẻ hiển thị phim (MovieCard.jsx, MovieCard.css)
│       │   ├── PromotionSlide/         # Slider khuyến mãi (PromotionSlide.jsx, PromotionSlide.css)
│       │   ├── ScheduleSlide/          # Lịch chiếu & chọn rạp (ScheduleSlide.jsx, SearchableSelect.jsx...)
│       │   ├── Countdown.jsx           # Đồng hồ đếm ngược thời gian giữ ghế
│       │   ├── ProtectedRoute.jsx      # Bảo vệ route yêu cầu đăng nhập
│       │   ├── QRTicket.jsx            # Hiển thị mã QR vé điện tử
│       │   └── SeatMap.jsx             # Sơ đồ chọn ghế phòng chiếu
│       ├── context/                    # Quản lý trạng thái toàn cục (React Context)
│       │   ├── AuthContext.jsx         # Trạng thái đăng nhập & thông tin người dùng
│       │   └── BookingContext.jsx      # Trạng thái luồng đặt vé, chọn ghế & combo
│       ├── data/                       # Dữ liệu & bộ lọc phim/cụm rạp phía Client
│       │   ├── cinemasData.js
│       │   ├── moviesData.js
│       │   └── movieSelectors.js
│       ├── pages/                      # Các trang màn hình chính của ứng dụng
│       │   ├── AllMoviesPage.jsx       # Danh sách phim đang chiếu / sắp chiếu (+ .css)
│       │   ├── BookingHistory.jsx      # Lịch sử đặt vé của người dùng
│       │   ├── ComboSelection.jsx      # Trang chọn combo bắp nước
│       │   ├── CommunityPage.jsx       # Cộng đồng & bình luận phim (+ .css)
│       │   ├── DemoBooking.jsx         # Trang demo luồng đặt vé
│       │   ├── Login.jsx               # Trang đăng nhập
│       │   ├── MovieDetailPage.jsx     # Chi tiết phim, trailer, lịch chiếu & đánh giá (+ .css)
│       │   ├── NotFoundPage.jsx        # Trang lỗi 404 (+ .css)
│       │   ├── Payment.jsx             # Trang thanh toán QR (PayOS / VietQR)
│       │   ├── Profile.jsx             # Thông tin tài khoản cá nhân
│       │   ├── Register.jsx            # Trang đăng ký tài khoản
│       │   ├── SearchResultsPage.jsx   # Kết quả tìm kiếm phim (+ .css)
│       │   ├── SeatSelection.jsx       # Trang chọn ghế theo suất chiếu
│       │   ├── TicketPricePage.jsx     # Bảng giá vé rạp (+ .css)
│       │   └── TicketResult.jsx        # Kết quả đặt vé & hiển thị vé điện tử
│       ├── App.jsx                     # Cấu hình định tuyến (Routes) chính
│       ├── App.css
│       ├── main.jsx                    # Điểm khởi chạy React DOM
│       └── index.css
└── server/                             # BACKEND (Node.js + Express + MongoDB)
    ├── .env
    ├── .env.example
    ├── package.json
    ├── playground-1.mongodb.js         # Script truy vấn/kiểm thử nhanh MongoDB
    ├── README.md                       # Tài liệu chi tiết API & luồng nghiệp vụ Backend
    └── src/
        ├── app.js                      # Khởi tạo Express, CORS, gắn Routes & Error Middleware
        ├── server.js                   # Điểm khởi chạy server, kết nối DB & dọn đơn hết hạn
        ├── seed.js                     # Script khởi tạo dữ liệu mẫu (Phim, Combo, Suất chiếu, Admin/User)
        ├── config/                     # Cấu hình hệ thống
        │   ├── cinemas.js              # Cấu hình cụm rạp & thời gian giữ ghế
        │   └── db.js                   # Kết nối MongoDB
        ├── controllers/                # Xử lý logic nghiệp vụ cho từng phân hệ
        │   ├── authController.js       # Đăng ký, đăng nhập, lấy thông tin tài khoản
        │   ├── bookingController.js    # Giữ ghế, nhả ghế, checkout, lịch sử đặt vé
        │   ├── comboController.js      # CRUD gói combo bắp nước
        │   ├── movieController.js      # CRUD phim, tìm kiếm, lọc & phân trang
        │   ├── paymentController.js    # Xử lý webhook PayOS/VietQR & giả lập thanh toán
        │   ├── reviewController.js     # Đánh giá phim, chấm điểm & lượt thích
        │   ├── showtimeController.js   # Lấy trạng thái sơ đồ ghế theo suất chiếu
        │   └── statsController.js      # Thống kê doanh thu theo phim, ngày, cụm rạp (Admin)
        ├── data/                       # Dữ liệu gốc phục vụ seed database
        │   ├── cinemasData.js
        │   └── moviesData.js
        ├── middleware/                 # Middleware trung gian
        │   ├── auth.js                 # Xác thực JWT & phân quyền Admin/User
        │   └── error.js                # Xử lý lỗi tập trung
        ├── models/                     # Mongoose Schemas / Models
        │   ├── Combo.js                # Model gói bắp nước
        │   ├── Movie.js                # Model phim & suất chiếu
        │   ├── Order.js                # Model đơn hàng đặt vé
        │   ├── Review.js               # Model bình luận & đánh giá sao
        │   ├── SeatLock.js             # Model khóa ghế tạm thời chống tranh chấp (Race Condition)
        │   ├── Ticket.js               # Model vé điện tử & mã QR
        │   └── User.js                 # Model người dùng & quản trị viên
        ├── routes/                     # Định tuyến API
        │   └── index.js                # Tập hợp toàn bộ endpoints (/api/...)
        └── utils/                      # Các hàm tiện ích hỗ trợ
            ├── email.js                # Gửi email vé điện tử qua Nodemailer
            ├── fulfill.js              # Phát hành vé điện tử & sinh mã QR khi thanh toán thành công
            ├── helpers.js              # Các hàm xử lý chuỗi, mã đơn hàng, phân trang
            ├── payment.js              # Tích hợp cổng thanh toán PayOS & VietQR
            └── seats.js                # Khởi tạo sơ đồ ghế & tính giá vé theo hạng ghế
```

---

## 2. Hướng dẫn cài đặt và chạy dự án

### Bước 1: Cài đặt và khởi chạy Backend (`server`)

```bash
cd server
npm install
```

- Cấu hình biến môi trường trong file `server/.env` (đã được tạo sẵn từ `.env.example`).
- Khởi tạo dữ liệu mẫu và tài khoản Admin (khi đã kết nối MongoDB):

```bash
npm run seed
```

- Chạy server Backend (mặc định tại `http://localhost:5000`):

```bash
npm run dev
```

### Bước 2: Cài đặt và khởi chạy Frontend (`client`)

Mở một terminal mới:

```bash
cd client
npm install
npm run dev
```

- Ứng dụng Frontend sẽ chạy tại `http://localhost:3000`.

---

## 3. Tài khoản Demo

- **Quản trị viên (Admin):**
  - Email: `admin@ptitcine.vn`
  - Mật khẩu: `Admin12345`
- **Thành viên (Member / User):**
  - Có thể đăng ký mới trực tiếp tại trang `/register` hoặc đăng nhập thử nghiệm ở chế độ Mock với bất kỳ email nào.
