import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import { isAdmin, vnd } from "../utils";

export default function Profile() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/users/me")
      .then((r) => {
        const u = r.data?.user || r.data;
        setInfo(u);
        updateUser({ balance: u.balance, isVerified: u.isVerified });
      })
      .catch(() => setError("Không tải được thông tin"));
  }, []);

  const onLogout = () => { logout(); navigate("/login"); };

  if (error) return <p className="tv2-page tv2-error">{error}</p>;
  if (!info) return <p className="tv2-page">Đang tải...</p>;

  return (
    <div className="tv2-page">
      <BackButton to="/" label="Về trang chủ" />
      <h2>Tài khoản của tôi</h2>

      <div className="tv2-card">
        <p><b>Họ tên:</b> {info.name}</p>
        <p><b>Email:</b> {info.email}</p>
        {info.phone && <p><b>Điện thoại:</b> {info.phone}</p>}
        <p><b>Vai trò:</b> {info.role}</p>
        <p>
          <b>Xác thực:</b>{" "}
          <span className={`tv2-badge ${info.isVerified ? "ok" : "warn"}`}>
            {info.isVerified ? "Đã xác thực" : "Chưa xác thực"}
          </span>
        </p>
        <p><b>Số dư ví:</b> <span className="tv2-money">{vnd(info.balance)}</span></p>
      </div>

      <div className="tv2-menu">
        <Link to="/wallet" className="tv2-menu-item">💰 Nạp tiền & giao dịch</Link>
        <Link to="/history" className="tv2-menu-item">🎟️ Lịch sử mua vé</Link>
        <Link to="/my-reviews" className="tv2-menu-item">⭐ Lịch sử đánh giá</Link>
        <Link to="/favorites" className="tv2-menu-item">♥ Phim yêu thích</Link>
        {isAdmin(info) && <Link to="/admin" className="tv2-menu-item admin">🛠️ Trang quản trị</Link>}
      </div>

      <button className="tv2-btn ghost" onClick={onLogout}>Đăng xuất</button>
    </div>
  );
}
