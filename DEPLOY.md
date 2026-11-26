# Đưa backend lên Render (hoặc Railway)

Frontend và database không đổi chỗ: database vẫn là MongoDB Atlas. Chỉ có **server Node/Express** được đưa lên mạng để web ở đâu cũng gọi được.

## 0. Chuẩn bị (làm 1 lần)

1. **Atlas → Network Access**: phải có `0.0.0.0/0` (Render không có IP cố định).
2. **Đổi mật khẩu user database** nếu chuỗi kết nối cũ đã từng gửi cho người khác
   (Atlas → Database Access → Edit user → Edit Password). Dùng mật khẩu mới trong `MONGODB_URI`.
   Tốt nhất đặt quyền user là **Read and write to any database** hoặc giới hạn riêng database `ptit_cine`.
3. **Tạo JWT_SECRET mới, thật dài** (đừng dùng chuỗi đang dùng ở máy). Chạy trong terminal:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Copy dòng in ra, dùng làm `JWT_SECRET` trên Render.

## 1. Đưa code lên GitHub

Chỉ đưa thư mục `server` lên (hoặc cả dự án nếu cả nhóm dùng chung 1 repo).

```
cd server
git init
git add .
git commit -m "backend ptit cine"
```

Tạo repo trống trên github.com rồi làm theo 2 dòng GitHub hướng dẫn (`git remote add origin ...` và `git push -u origin main`).

**Kiểm tra trước khi push:** `git status` KHÔNG được thấy `.env` hay `node_modules`
(file `.gitignore` đã chặn sẵn). Nếu thấy `.env` thì dừng lại, đừng push.

## 2. Render

1. Vào render.com, đăng nhập bằng GitHub → **New → Web Service** → chọn repo vừa tạo.
2. Điền:
   | Ô | Giá trị |
   |---|---|
   | Root Directory | `server` (bỏ trống nếu repo chỉ chứa nội dung thư mục server) |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |
   | Health Check Path | `/api/health` (mục Advanced) |
3. Mục **Environment Variables**, thêm từng dòng:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | chuỗi kết nối Atlas (có `/ptit_cine`) |
   | `JWT_SECRET` | chuỗi ngẫu nhiên ở bước 0 |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | địa chỉ web frontend, ví dụ `https://ten-web.vercel.app` (nhiều địa chỉ thì cách nhau dấu phẩy; thêm `http://localhost:3000` nếu vẫn muốn thử ở máy) |
   | `HOLD_MINUTES` | `5` |
   | `SHOWTIME_BUFFER_MINUTES` | `15` |

   Không cần khai báo `PORT`, Render tự cấp và code đã đọc `process.env.PORT`.
4. Bấm **Create Web Service**, chờ build xong (vài phút).
5. Render cho bạn địa chỉ dạng `https://ptit-cine-server.onrender.com`. Mở
   `https://<địa-chỉ-của-bạn>/api/health` — thấy `{"status":"ok",...}` là xong.

**Lưu ý gói Free:** server tự "ngủ" sau ~15 phút không ai gọi; lần gọi đầu tiên sau đó chậm khoảng 30-60 giây. Trước buổi demo hãy mở `/api/health` trước để đánh thức.

## 3. Tài khoản admin và dữ liệu mẫu

Database Atlas là **dùng chung** giữa máy bạn và Render, nên admin đã tạo ở máy (`npm run seed:admin`)
vẫn dùng được trên server. Muốn thêm dữ liệu mẫu (phim, rạp, phòng, suất chiếu) thì chạy **ở máy bạn**:

```
npm run seed:demo
```

## 4. Trỏ frontend sang server mới

Trong code frontend, địa chỉ API không nên viết cứng `http://localhost:5000`. Dùng biến môi trường của Vite:

- File `.env` của frontend (thư mục `hahah`): `VITE_API_URL=http://localhost:5000`
- Khi deploy frontend (Vercel/Netlify), đặt `VITE_API_URL=https://<địa-chỉ-render-của-bạn>`
- Trong code: `const API = import.meta.env.VITE_API_URL;` rồi `fetch(`${API}/api/auth/login`, ...)`

Nhớ cập nhật `CLIENT_URL` trên Render đúng bằng địa chỉ frontend (không có dấu `/` cuối), nếu không trình duyệt sẽ báo lỗi CORS.

## Railway (cách khác)

1. railway.com → **New Project → Deploy from GitHub repo** → chọn repo.
2. **Settings → Root Directory** = `server`; Start Command để mặc định (`npm start`).
3. Tab **Variables**: thêm đúng các biến ở bảng trên.
4. **Settings → Networking → Generate Domain** để lấy địa chỉ, rồi thử `/api/health`.

Railway chỉ miễn phí trong giới hạn dùng thử, hãy xem gói hiện tại trên trang của họ.

## Danh sách bảo mật (tick trước khi nộp)

- [ ] `.env` không có trên GitHub (`git ls-files | findstr .env` chỉ thấy `.env.example`)
- [ ] `.env.example` chỉ chứa giá trị mẫu, không có mật khẩu thật
- [ ] `JWT_SECRET` trên Render dài, ngẫu nhiên, khác với ở máy
- [ ] Đã đổi mật khẩu user Atlas sau khi lỡ gửi chuỗi kết nối cho người khác
- [ ] `NODE_ENV=production` (ẩn chi tiết lỗi với người dùng)
- [ ] `CLIENT_URL` chỉ chứa địa chỉ frontend thật, không để `*`
- [ ] Đổi mật khẩu admin mặc định `Admin12345`
