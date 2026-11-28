import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import { apiError, isAdmin } from "../utils";

const REMEMBER_KEY = "ptit_cine_remember_email";

export default function Login() {
  const remembered = localStorage.getItem(REMEMBER_KEY) || "";
  const [form, setForm] = useState({ email: remembered, password: "" });
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from;
  const info = loc.state?.info;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const email = form.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Email không hợp lệ");
    if (form.password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");

    setLoading(true);
    try {
      const { data } = await axiosClient.post("/auth/login", { email, password: form.password });
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
      login(data.token, data.user);
      // Admin vào thẳng trang quản trị, người dùng thường quay lại trang đang xem dở
      const target = from || (isAdmin(data.user) ? "/admin" : "/");
      navigate(target, { replace: true });
    } catch (err) {
      setError(apiError(err, "Sai email hoặc mật khẩu"));
    } finally {
      setLoading(false);
    }
  };

  // Đã đăng nhập rồi thì không hiện form nữa mà cho chọn: vào tài khoản / đăng xuất
  if (user) {
    return (
      <div className="tv2-page tv2-auth">
        <BackButton to="/" label="Về trang chủ" />
        <div className="tv2-card tv2-auth-card">
          <h2>Bạn đã đăng nhập</h2>
          <p>Đang đăng nhập với tài khoản <b>{user.name || user.email}</b>{user.email ? ` (${user.email})` : ""}.</p>
          <div className="tv2-actions">
            <button className="tv2-btn" onClick={() => navigate(isAdmin(user) ? "/admin" : "/profile")}>{isAdmin(user) ? "Vào trang quản trị" : "Tài khoản của tôi"}</button>
            <button className="tv2-btn ghost" onClick={() => { logout(); setForm({ email: "", password: "" }); }}>Đăng xuất để đổi tài khoản</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tv2-page tv2-auth">
      <BackButton to="/" label="Về trang chủ" />
      <form className="tv2-form tv2-auth-card" onSubmit={onSubmit} noValidate>
        <div className="tv2-auth-head">
          <h2>Đăng nhập</h2>
          <p>Chào mừng trở lại PTIT Cine 🎬</p>
        </div>

        {info && <p className="tv2-notice">{info}</p>}

        <label className="tv2-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" placeholder="ten@email.com" value={form.email} onChange={onChange} autoFocus={!remembered} required />
        </label>

        <label className="tv2-field">
          <span>Mật khẩu</span>
          <div className="tv2-pw">
            <input name="password" type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="Nhập mật khẩu" value={form.password} onChange={onChange} autoFocus={Boolean(remembered)} required />
            <button type="button" className="tv2-pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
              {showPw ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </label>

        <label className="tv2-check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Ghi nhớ email</span>
        </label>

        {error && <p className="tv2-error" role="alert">{error}</p>}

        <button className="tv2-btn" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        <p className="tv2-auth-foot">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </form>
    </div>
  );
}
