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

  // State cho chức năng Quên mật khẩu ở phần ngoài khi nhập tài khoản & mật khẩu
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: nhập email gửi mã, 2: nhập mã + mật khẩu mới
  const [forgotEmail, setForgotEmail] = useState(remembered);
  const [resetCode, setResetCode] = useState("");
  const [demoSentCode, setDemoSentCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotErr, setForgotErr] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleSendResetCode = async (e) => {
    e?.preventDefault();
    setForgotErr("");
    setForgotMsg("");
    const cleanEmail = forgotEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return setForgotErr("Vui lòng nhập địa chỉ email cá nhân hợp lệ");
    }
    setForgotLoading(true);
    try {
      const { data } = await axiosClient.post("/auth/forgot-password", { email: cleanEmail });
      setForgotStep(2);
      setDemoSentCode(data.demoCode || "");
      setForgotMsg(
        data.demoCode
          ? `Đã gửi mã xác nhận tới email ${cleanEmail}. (Mã xác nhận của bạn: ${data.demoCode})`
          : data.message || `Đã gửi mã xác nhận tới email ${cleanEmail}`
      );
    } catch (err) {
      setForgotErr(apiError(err, "Không gửi được mã xác nhận"));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotErr("");
    if (!resetCode.trim()) return setForgotErr("Vui lòng nhập mã xác nhận đã gửi qua email");
    if (newPassword.length < 6) return setForgotErr("Mật khẩu mới tối thiểu 6 ký tự");
    if (newPassword !== confirmNewPassword) return setForgotErr("Mật khẩu xác nhận không khớp");

    setForgotLoading(true);
    try {
      await axiosClient.post("/auth/reset-password", {
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        newPassword,
      });
      setForm({ email: forgotEmail.trim(), password: "" });
      setForgotMode(false);
      setForgotStep(1);
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setDemoSentCode("");
      setError("");
      navigate("/login", {
        replace: true,
        state: { info: "✅ Đổi mật khẩu mới thành công! Vui lòng đăng nhập lại." },
      });
    } catch (err) {
      setForgotErr(apiError(err, "Đặt lại mật khẩu thất bại"));
    } finally {
      setForgotLoading(false);
    }
  };

  // Đã đăng nhập rồi thì không hiện form nữa mà cho chọn: vào tài khoản / đăng xuất
  if (user) {
    return (
      <div className="tv2-page tv2-auth">
        <BackButton to="/" label="Về trang chủ" />
        <div className="tv2-card tv2-auth-card">
          <h2>Bạn đã đăng nhập</h2>
          <p>
            Đang đăng nhập với tài khoản <b>{user.name || user.email}</b>
            {user.email ? ` (${user.email})` : ""}.
          </p>
          <div className="tv2-actions">
            <button
              className="tv2-btn"
              onClick={() => navigate(isAdmin(user) ? "/admin" : "/profile")}
            >
              {isAdmin(user) ? "Vào trang quản trị" : "Tài khoản của tôi"}
            </button>
            <button
              className="tv2-btn ghost"
              onClick={() => {
                logout();
                setForm({ email: "", password: "" });
              }}
            >
              Đăng xuất để đổi tài khoản
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tv2-page tv2-auth">
      <BackButton to="/" label="Về trang chủ" />

      {!forgotMode ? (
        <form className="tv2-form tv2-auth-card" onSubmit={onSubmit} noValidate>
          <div className="tv2-auth-head">
            <h2>Đăng nhập</h2>
            <p>Chào mừng trở lại PTIT Cine 🎬</p>
          </div>

          {info && <p className="tv2-notice">{info}</p>}

          <label className="tv2-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ten@email.com"
              value={form.email}
              onChange={onChange}
              autoFocus={!remembered}
              required
            />
          </label>

          <label className="tv2-field">
            <span>Mật khẩu</span>
            <div className="tv2-pw">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={onChange}
                autoFocus={Boolean(remembered)}
                required
              />
              <button
                type="button"
                className="tv2-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPw ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </label>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <label className="tv2-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ email</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(form.email || remembered || "");
                setForgotErr("");
                setForgotMsg("");
                setForgotStep(1);
                setForgotMode(true);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--tv2-accent)",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Quên mật khẩu?
            </button>
          </div>

          {error && (
            <p className="tv2-error" role="alert">
              {error}
            </p>
          )}

          <button className="tv2-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <p className="tv2-auth-foot">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      ) : (
        <div className="tv2-form tv2-auth-card">
          <div className="tv2-auth-head">
            <h2>Quên mật khẩu</h2>
            <p>Nhận mã xác thực qua email cá nhân để đặt lại mật khẩu mới</p>
          </div>

          {forgotMsg && <p className="tv2-notice">{forgotMsg}</p>}
          {forgotErr && (
            <p className="tv2-error" role="alert">
              {forgotErr}
            </p>
          )}

          {forgotStep === 1 ? (
            <form onSubmit={handleSendResetCode} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="tv2-field">
                <span>Email cá nhân đã đăng ký</span>
                <input
                  type="email"
                  placeholder="ten@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <button type="submit" className="tv2-btn" disabled={forgotLoading}>
                {forgotLoading ? "Đang gửi mã..." : "Gửi mã xác nhận qua Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="tv2-field">
                <span>Email cá nhân</span>
                <input type="email" value={forgotEmail} disabled />
              </label>

              <label className="tv2-field">
                <span>Mã xác nhận (6 chữ số từ Email)</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Nhập mã 6 số..."
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  {demoSentCode && (
                    <button
                      type="button"
                      className="tv2-btn sm ghost"
                      onClick={() => setResetCode(demoSentCode)}
                      title="Điền nhanh mã demo"
                    >
                      Điền mã ({demoSentCode})
                    </button>
                  )}
                </div>
              </label>

              <label className="tv2-field">
                <span>Mật khẩu mới (tối thiểu 6 ký tự)</span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="tv2-field">
                <span>Nhập lại mật khẩu mới</span>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </label>

              <div className="tv2-actions">
                <button type="submit" className="tv2-btn" disabled={forgotLoading} style={{ flex: 1 }}>
                  {forgotLoading ? "Đang lưu..." : "Xác nhận đổi mật khẩu"}
                </button>
                <button
                  type="button"
                  className="tv2-btn ghost"
                  onClick={handleSendResetCode}
                  disabled={forgotLoading}
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}

          <button
            type="button"
            className="tv2-btn ghost"
            onClick={() => {
              setForgotMode(false);
              setForgotErr("");
              setForgotMsg("");
            }}
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}
