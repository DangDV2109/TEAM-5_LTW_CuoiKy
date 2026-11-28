import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/users/me")
      .then((r) => setInfo(r.data?.user || r.data))
      .catch(() => setError("Không tải được thông tin"));
  }, []);

  const onLogout = () => { logout(); navigate("/login"); };

  if (error) return <p className="tv2-page tv2-error">{error}</p>;
  if (!info) return <p className="tv2-page">Đang tải...</p>;

  return (
    <div className="tv2-page">
      <h2>Tài khoản của tôi</h2>
      <p><b>Họ tên:</b> {info.name}</p>
      <p><b>Email:</b> {info.email}</p>
      <p><b>Vai trò:</b> {info.role}</p>
      <p><Link to="/history">Xem lịch sử đặt vé</Link> · <Link to="/">Về trang chủ</Link></p>
      <button className="tv2-btn ghost" onClick={onLogout}>Đăng xuất</button>
    </div>
  );
}
