# PTIT Cine - Hệ Thống Đặt Vé Xem Phim Trực Tuyến (NHÓM 5 LTW_03)

## 1. Cấu trúc thư mục dự án

```text
testweb2/
├── README.md                           # Hướng dẫn cài đặt, chạy dự án, tài khoản demo & lệnh chạy seed
├── client/                             # FRONTEND (React + Vite + React Router)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/                        # Cấu hình Axios client & Mock fallback
│       ├── assets/                     # Logo PTIT, RIPT, icon bản đồ
│       ├── components/                 # Các component giao diện (Header, Footer, BodySlider, MovieCard, ScheduleSlide, PromotionSlide, SeatMap...)
│       ├── context/                    # AuthContext, BookingContext
│       ├── data/                       # Kết nối dữ liệu phim & cụm rạp từ Backend
│       ├── pages/                      # Các trang màn hình (MovieDetailPage, AllMoviesPage, CommunityPage, TicketPricePage, Login, Register, SeatSelection...)
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       └── index.css
└── server/                             # BACKEND (Node.js + Express + MongoDB)
    ├── .env
    ├── .env.example
    ├── package.json
    ├── server.js                       # Điểm khởi chạy ứng dụng Backend
    └── src/
        ├── app.js                      # Khởi tạo Express, CORS, Routes & Error Middleware
        ├── config/                     # Kết nối MongoDB (db.js)
        ├── controllers/                # Xử lý nghiệp vụ (authController, userController)
        ├── data/                       # Dữ liệu phim & cụm rạp gốc (moviesData.js, cinemasData.js)
        ├── middlewares/                # Xác thực JWT, kiểm tra quyền & xử lý lỗi tập trung
        ├── models/                     # Mongoose Models (User, Movie, Room, Showtime, Theater)
        ├── routes/                     # Định tuyến API (authRoutes, userRoutes)
        ├── seeds/                      # Script khởi tạo dữ liệu mẫu & Admin (createAdmin.js)
        ├── utils/                      # AppError, asyncHandler, generateToken
        └── validators/                 # Kiểm tra dữ liệu đầu vào (userValidator.js)
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
