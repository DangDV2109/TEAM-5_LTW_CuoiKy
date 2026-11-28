# PTIT Cine - Hệ Thống Đặt Vé Xem Phim Trực Tuyến (NHÓM 5 LTW_03)

## 1. Cấu trúc thư mục dự án

```text
testweb3/
├── README.md                           # Hướng dẫn cài đặt, chạy dự án, tài khoản demo & lệnh chạy seed
├── client/                             # FRONTEND (React 18 + Vite 6 + React Router 7 + Redux Toolkit)
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
│       │   ├── BodySlider/             # Slider 7 slide trang chủ (BodySlider.jsx, BodySlider.css)
│       │   ├── Footer/                 # Chân trang (Footer.jsx, Footer.css)
│       │   ├── Header/                 # Thanh điều hướng NavLink & tìm kiếm (Header.jsx, SearchBar.jsx...)
│       │   ├── MovieCard/              # Thẻ hiển thị phim (MovieCard.jsx, MovieCard.css)
│       │   ├── PromotionSlide/         # Slider khuyến mãi (PromotionSlide.jsx, PromotionSlide.css)
│       │   ├── ScheduleSlide/          # Lịch chiếu & chọn rạp (ScheduleSlide.jsx, SearchableSelect.jsx...)
│       │   ├── BackButton.jsx          # Nút quay lại dùng chung
│       │   ├── Countdown.jsx           # Đồng hồ đếm ngược thời gian giữ ghế (setInterval + cleanup)
│       │   ├── ProtectedRoute.jsx      # Bảo vệ route yêu cầu đăng nhập / phân quyền Admin (<Navigate />)
│       │   ├── QRTicket.jsx            # Hiển thị mã QR vé điện tử
│       │   └── SeatMap.jsx             # Sơ đồ chọn ghế sinh động theo cấu hình phòng chiếu
│       ├── context/                    # Quản lý trạng thái dùng chung (React Context API)
│       │   ├── AuthContext.jsx         # Trạng thái đăng nhập, số dư ví & thông tin người dùng
│       │   └── BookingContext.jsx      # Trạng thái luồng đặt vé, suất chiếu & combo
│       ├── hooks/                      # Custom Hooks tái sử dụng
│       │   ├── useDebounce.js          # Trì hoãn từ khóa tìm kiếm khi gõ phím
│       │   ├── useFetch.js             # Gọi API GET tập trung kèm loading, error & cleanup
│       │   └── useLocalStorage.js      # Đồng bộ state với localStorage
│       ├── store/                      # Quản lý trạng thái bằng Redux Toolkit
│       │   ├── seatSlice.js            # Slice quản lý ghế đang chọn (tối đa 8 ghế) & mã giảm giá
│       │   └── store.js                # Khởi tạo Redux store (configureStore)
│       ├── pages/                      # Các trang màn hình chính của ứng dụng
│       │   ├── admin/                  # Khu vực quản trị Admin (Nested Routes + <Outlet />)
│       │   │   └── AdminDashboard.jsx  # Quản lý Tài khoản, Nạp tiền, Vé, Đánh giá, Yêu thích, Phim, Rạp/phòng, Doanh thu, CSKH
│       │   ├── AllMoviesPage.jsx       # Danh sách phim đang chiếu, lọc rạp/thể loại/ngày/giờ (+ .css)
│       │   ├── BookingHistory.jsx      # Lịch sử đặt vé & hủy vé trước giờ chiếu 2 tiếng
│       │   ├── ComboSelection.jsx      # Trang chọn combo bắp nước
│       │   ├── CommunityPage.jsx       # Cộng đồng đánh giá & bình luận phim (+ .css)
│       │   ├── DemoBooking.jsx         # Trang demo luồng đặt vé
│       │   ├── Favorites.jsx           # Danh sách phim yêu thích & số lượt thích của phim
│       │   ├── Login.jsx               # Trang đăng nhập & quên mật khẩu (gửi mã qua email)
│       │   ├── MovieDetailPage.jsx     # Chi tiết phim, trailer nhúng YouTube, lịch chiếu & chỉnh sửa Admin (+ .css)
│       │   ├── MyReviews.jsx           # Lịch sử đánh giá cá nhân & xóa đánh giá
│       │   ├── NotFoundPage.jsx        # Trang lỗi 404 (+ .css)
│       │   ├── Payment.jsx             # Trang thanh toán QR (PayOS / VietQR), ví & mã giảm giá
│       │   ├── Profile.jsx             # Cài đặt tài khoản (đổi tên, đổi mật khẩu/gửi mã email)
│       │   ├── Register.jsx            # Trang đăng ký tài khoản
│       │   ├── SearchResultsPage.jsx   # Kết quả tìm kiếm phim, rạp & bài viết (+ .css)
│       │   ├── SeatSelection.jsx       # Trang chọn ghế (Redux, useMemo, đếm ngược 5 phút, polling 5s)
│       │   ├── SupportPage.jsx         # Trang gửi yêu cầu hỗ trợ khách hàng theo từng nhóm vấn đề
│       │   ├── TicketPricePage.jsx     # Bảng giá vé rạp 2D/3D/Phụ thu/Ưu đãi (+ .css)
│       │   ├── TicketResult.jsx        # Kết quả đặt vé & hiển thị vé điện tử QR
│       │   └── Wallet.jsx              # Ví cá nhân, nạp tiền & lịch sử giao dịch
│       ├── App.jsx                     # Cấu hình định tuyến (Routes, URL riêng cho từng trang/slide, Nested Routes)
│       ├── App.css
│       ├── main.jsx                    # Điểm khởi chạy React DOM + Redux Provider + BrowserRouter
│       ├── index.css
│       └── utils.js                    # Hàm định dạng tiền tệ, ngày giờ & xử lý lỗi API
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
        │   ├── authController.js       # Đăng ký, đăng nhập JWT, quên/đặt lại mật khẩu qua mã email
        │   ├── bookingController.js    # Giữ ghế (409 chống trùng), nhả ghế, checkout, mã giảm giá, hủy vé trước 2h
        │   ├── comboController.js      # CRUD gói combo bắp nước
        │   ├── movieController.js      # CRUD phim, lọc/phân trang & thêm suất chiếu chống chồng giờ trong phòng
        │   ├── paymentController.js    # Xử lý webhook PayOS/VietQR, thanh toán ví & giả lập thanh toán
        │   ├── reviewController.js     # Đánh giá phim, chấm điểm, lượt thích & xóa mềm
        │   ├── showtimeController.js   # Lấy trạng thái sơ đồ ghế theo suất chiếu
        │   ├── statsController.js      # Thống kê doanh thu bằng Aggregation Pipeline ($group theo phim, ngày, rạp)
        │   └── userController.js       # Ví/nạp tiền, đổi tên/mật khẩu, yêu thích, hỗ trợ CSKH & API quản trị Admin
        ├── data/                       # Dữ liệu gốc & logic đồng bộ dùng chung Frontend/Backend
        │   ├── cinemasData.js          # Dữ liệu thành phố, rạp, cấu hình phòng chiếu & lịch chống chồng giờ
        │   ├── moviesData.js           # Danh sách phim gốc, cộng đồng & lưu chỉnh sửa phim Admin
        │   └── movieSelectors.js       # Bộ lọc danh sách phim đang chiếu, sắp chiếu, nổi bật, phim Việt
        ├── middleware/                 # Middleware trung gian
        │   ├── auth.js                 # Xác thực JWT & phân quyền Admin/User
        │   └── error.js                # Xử lý lỗi tập trung & kiểm tra ObjectId
        ├── models/                     # Mongoose Schemas / Models
        │   ├── Combo.js                # Model gói bắp nước
        │   ├── Movie.js                # Model phim & suất chiếu (số hàng, số ghế/hàng, hàng VIP)
        │   ├── Order.js                # Model đơn hàng đặt vé & mã giảm giá
        │   ├── Review.js               # Model bình luận & đánh giá sao
        │   ├── SeatLock.js             # Model khóa ghế tạm thời chống đặt trùng (Unique index)
        │   ├── SupportTicket.js        # Model thư yêu cầu hỗ trợ khách hàng (CSKH)
        │   ├── Ticket.js               # Model vé điện tử & mã QR
        │   ├── Transaction.js          # Model giao dịch ví (nạp tiền, thanh toán vé, hoàn tiền)
        │   └── User.js                 # Model người dùng, số dư ví, TKNH, yêu thích & mã xác thực email
        ├── routes/                     # Định tuyến API
        │   └── index.js                # Tập hợp toàn bộ endpoints (/api/...)
        └── utils/                      # Các hàm tiện ích hỗ trợ
            ├── email.js                # Gửi email vé điện tử qua Nodemailer
            ├── fulfill.js              # Phát hành vé điện tử & sinh mã QR khi thanh toán thành công
            ├── helpers.js              # Các hàm xử lý chuỗi, mã đơn hàng, phân tích giờ chiếu
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
