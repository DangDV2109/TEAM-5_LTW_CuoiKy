import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import { apiError, isAdmin, vnd } from "../utils";

export default function Profile() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // State cho Đổi tên
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameMsg, setNameMsg] = useState({ type: "", text: "" });
  const [savingName, setSavingName] = useState(false);

  // State cho Đổi mật khẩu (hỗ trợ cả nhập mật khẩu cũ hoặc gửi mã qua email cá nhân nếu quên mật khẩu cũ)
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwMode, setPwMode] = useState("old"); // 'old' | 'code'
  const [oldPassword, setOldPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    axiosClient
      .get("/users/me")
      .then((r) => {
        const u = r.data?.user || r.data;
        setInfo(u);
        setNewName(u.name || "");
        updateUser({ name: u.name, balance: u.balance, isVerified: u.isVerified });
      })
      .catch(() => setError("Không tải được thông tin"));
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameMsg({ type: "", text: "" });
    const cleaned = newName.trim();
    if (!cleaned) {
      return setNameMsg({ type: "err", text: "Họ tên không được để trống" });
    }
    setSavingName(true);
    try {
      const { data } = await axiosClient.patch("/users/me/profile", { name: cleaned });
      const updated = data?.user || { ...info, name: cleaned };
      setInfo(updated);
      updateUser({ name: updated.name });
      setIsEditingName(false);
      setNameMsg({ type: "ok", text: "✅ Đã đổi tên hiển thị thành công!" });
      setTimeout(() => setNameMsg({ type: "", text: "" }), 2500);
    } catch (err) {
      setNameMsg({ type: "err", text: apiError(err, "Đổi tên thất bại") });
    } finally {
      setSavingName(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!info?.email) return;
    setPwMsg({ type: "", text: "" });
    setPwLoading(true);
    try {
      const { data } = await axiosClient.post("/auth/forgot-password", { email: info.email });
      setPwMode("code");
      setDemoCode(data.demoCode || "");
      setPwMsg({
        type: "ok",
        text: data.demoCode
          ? `Đã gửi mã xác nhận tới email ${info.email} (Mã của bạn: ${data.demoCode})`
          : `Đã gửi mã xác nhận tới email ${info.email}`,
      });
    } catch (err) {
      setPwMsg({ type: "err", text: apiError(err, "Không thể gửi mã xác nhận qua email") });
    } finally {
      setPwLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });

    if (newPassword.length < 6) {
      return setPwMsg({ type: "err", text: "Mật khẩu mới phải có tối thiểu 6 ký tự" });
    }
    if (newPassword !== confirmPassword) {
      return setPwMsg({ type: "err", text: "Mật khẩu xác nhận không khớp" });
    }
    if (pwMode === "old" && !oldPassword) {
      return setPwMsg({ type: "err", text: "Vui lòng nhập mật khẩu cũ (hoặc chọn gửi mã qua email)" });
    }
    if (pwMode === "code" && !emailCode.trim()) {
      return setPwMsg({ type: "err", text: "Vui lòng nhập mã xác nhận đã gửi qua email cá nhân" });
    }

    setPwLoading(true);
    try {
      await axiosClient.post("/users/me/change-password", {
        mode: pwMode,
        oldPassword: oldPassword,
        code: emailCode.trim(),
        newPassword,
      });
      setPwMsg({ type: "ok", text: "✅ Đổi mật khẩu thành công!" });
      setOldPassword("");
      setEmailCode("");
      setDemoCode("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPwModal(false);
        setPwMsg({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setPwMsg({ type: "err", text: apiError(err, "Đổi mật khẩu thất bại") });
    } finally {
      setPwLoading(false);
    }
  };

  if (error)
    return (
      <div className="tv2-page">
        <BackButton to="/" label="Về trang chủ" />
        <p className="tv2-error">{error}. Phiên đăng nhập có thể đã hết hạn.</p>
        <div className="tv2-actions">
          <button className="tv2-btn" onClick={() => window.location.reload()}>
            Thử lại
          </button>
          <button className="tv2-btn ghost" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  if (!info) return <p className="tv2-page">Đang tải...</p>;

  return (
    <div className="tv2-page">
      <BackButton to="/" label="Về trang chủ" />
      <h2>Cài đặt tài khoản</h2>

      <div className="tv2-card">
        {/* Họ tên + Nút Đổi tên */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", margin: "6px 0" }}>
          {!isEditingName ? (
            <>
              <p style={{ margin: 0 }}>
                <b>Họ tên:</b> {info.name}
              </p>
              <button
                type="button"
                className="tv2-btn sm ghost"
                onClick={() => {
                  setNewName(info.name || "");
                  setIsEditingName(true);
                  setNameMsg({ type: "", text: "" });
                }}
              >
                ✎ Đổi tên
              </button>
            </>
          ) : (
            <form onSubmit={handleSaveName} style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                className="tv2-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nhập họ tên mới..."
                style={{ flex: 1, minWidth: "180px" }}
                autoFocus
                required
              />
              <button type="submit" className="tv2-btn sm" disabled={savingName}>
                {savingName ? "Đang lưu..." : "Lưu tên"}
              </button>
              <button
                type="button"
                className="tv2-btn sm ghost"
                onClick={() => setIsEditingName(false)}
              >
                Huỷ
              </button>
            </form>
          )}
        </div>

        {nameMsg.text && (
          <p className={nameMsg.type === "ok" ? "tv2-okmsg small" : "tv2-error small"}>
            {nameMsg.text}
          </p>
        )}

        <p>
          <b>Email:</b> {info.email}
        </p>
        {info.phone && (
          <p>
            <b>Điện thoại:</b> {info.phone}
          </p>
        )}
        {/* Đã bỏ dòng "Vai trò: ..." theo yêu cầu */}
        <p>
          <b>Xác thực:</b>{" "}
          <span className={`tv2-badge ${info.isVerified ? "ok" : "warn"}`}>
            {info.isVerified ? "Đã xác thực" : "Chưa xác thực"}
          </span>
        </p>
        <p>
          <b>Số dư ví:</b> <span className="tv2-money">{vnd(info.balance)}</span>
        </p>

        {/* Nút Đổi mật khẩu */}
        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #343949", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="tv2-btn sm"
            onClick={() => {
              setShowPwModal((v) => !v);
              setPwMode("old");
              setPwMsg({ type: "", text: "" });
            }}
          >
            🔒 {showPwModal ? "Đóng đổi mật khẩu" : "Đổi mật khẩu"}
          </button>
        </div>

        {/* Form Đổi mật khẩu */}
        {showPwModal && (
          <form
            onSubmit={handleChangePassword}
            style={{
              marginTop: "14px",
              padding: "14px",
              borderRadius: "10px",
              background: "#141720",
              border: "1px solid #343949",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Đổi mật khẩu</h3>
              {pwMode === "old" ? (
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  disabled={pwLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--tv2-accent)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Không nhớ mật khẩu cũ? Gửi mã qua Email cá nhân
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPwMode("old");
                    setPwMsg({ type: "", text: "" });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--tv2-accent)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Nhập bằng mật khẩu cũ
                </button>
              )}
            </div>

            {pwMode === "old" ? (
              <label className="tv2-field">
                <span>Mật khẩu cũ</span>
                <input
                  type="password"
                  className="tv2-input"
                  placeholder="Nhập mật khẩu hiện tại..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </label>
            ) : (
              <div className="tv2-field">
                <span>Mã xác nhận đã gửi tới Email ({info.email})</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    className="tv2-input"
                    placeholder="Nhập mã 6 số..."
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  {demoCode && (
                    <button
                      type="button"
                      className="tv2-btn sm ghost"
                      onClick={() => setEmailCode(demoCode)}
                    >
                      Điền mã ({demoCode})
                    </button>
                  )}
                  <button
                    type="button"
                    className="tv2-btn sm ghost"
                    onClick={handleSendEmailCode}
                    disabled={pwLoading}
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>
            )}

            <label className="tv2-field">
              <span>Mật khẩu mới (tối thiểu 6 ký tự)</span>
              <input
                type="password"
                className="tv2-input"
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>

            <label className="tv2-field">
              <span>Xác nhận mật khẩu mới</span>
              <input
                type="password"
                className="tv2-input"
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            {pwMsg.text && (
              <p className={pwMsg.type === "ok" ? "tv2-okmsg small" : "tv2-error small"} style={{ margin: 0 }}>
                {pwMsg.text}
              </p>
            )}

            <div className="tv2-actions">
              <button type="submit" className="tv2-btn sm" disabled={pwLoading}>
                {pwLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
              <button
                type="button"
                className="tv2-btn sm ghost"
                onClick={() => setShowPwModal(false)}
              >
                Huỷ
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tv2-menu">
        <Link to="/wallet" className="tv2-menu-item">
          💰 Nạp tiền & giao dịch
        </Link>
        <Link to="/history" className="tv2-menu-item">
          🎟️ Lịch sử mua vé
        </Link>
        <Link to="/my-reviews" className="tv2-menu-item">
          ⭐ Lịch sử đánh giá
        </Link>
        <Link to="/favorites" className="tv2-menu-item">
          ♥ Phim yêu thích
        </Link>
        {isAdmin(info) && (
          <Link to="/admin" className="tv2-menu-item admin">
            🛠️ Trang quản trị
          </Link>
        )}
      </div>

      <button className="tv2-btn ghost" onClick={onLogout}>
        Đăng xuất
      </button>
    </div>
  );
}
