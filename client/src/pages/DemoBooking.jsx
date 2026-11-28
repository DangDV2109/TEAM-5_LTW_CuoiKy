import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SHOWTIMES, resetMock } from "../api/mockAdapter";

// Trang thử luồng đặt vé khi chưa có backend và chưa có nút "Đặt vé" ở trang phim.
export default function DemoBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mock = import.meta.env.VITE_USE_MOCK === "true";

  return (
    <div className="tv2-page">
      <h2>Thử luồng đặt vé</h2>
      {!mock && <p className="tv2-error">Chưa bật dữ liệu giả. Thêm VITE_USE_MOCK=true vào .env rồi chạy lại npm run dev.</p>}
      {!user && <p>Bạn cần <Link to="/login">đăng nhập</Link> trước (nhập email và mật khẩu bất kỳ).</p>}

      {Object.entries(SHOWTIMES).map(([id, s]) => (
        <div className="tv2-row-card" key={id}>
          <div><b>{s.movieTitle}</b><div>{s.showtime}</div></div>
          <button className="tv2-btn" onClick={() => navigate(`/showtimes/${id}/seats`)}>Chọn ghế</button>
        </div>
      ))}

      <p><Link to="/history">Lịch sử đặt vé</Link> · <Link to="/profile">Trang cá nhân</Link> · <Link to="/">Trang chủ</Link></p>
      <button className="tv2-btn ghost" onClick={() => { resetMock(); alert("Đã xoá dữ liệu demo"); }}>Xoá dữ liệu demo</button>
    </div>
  );
}
