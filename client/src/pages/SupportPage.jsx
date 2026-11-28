import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import { apiError } from "../utils";

export const SUPPORT_CATEGORIES = [
  { id: "dat-ve-nhom", label: "Đặt vé nhóm" },
  { id: "tai-khoan", label: "Tài khoản" },
  { id: "nap-tien", label: "Nạp tiền" },
  { id: "hoan-tien", label: "Hoàn tiền" },
  { id: "hoan-ve", label: "Hoàn vé" },
  { id: "khac", label: "Khác" },
];

export default function SupportPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("dat-ve-nhom");
  const [customIssue, setCustomIssue] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const selectedCategoryObj =
    SUPPORT_CATEGORIES.find((c) => c.id === category) || SUPPORT_CATEGORIES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanDetail = detail.trim();
    const cleanCustom = customIssue.trim();

    if (category === "khac" && !cleanCustom) {
      return setError("Vui lòng tự nhập vấn đề cần hỗ trợ khi chọn mục 'Khác'");
    }
    if (!cleanDetail) {
      return setError("Vui lòng nhập thông tin chi tiết vấn đề cần hỗ trợ");
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return setError("Vui lòng nhập địa chỉ Email hợp lệ");
    }
    if (!cleanPhone || cleanPhone.replace(/\s+/g, "").length < 8) {
      return setError("Vui lòng nhập số điện thoại liên hệ hợp lệ");
    }

    setLoading(true);
    try {
      const { data } = await axiosClient.post("/support", {
        category,
        categoryLabel: selectedCategoryObj.label,
        customIssue: category === "khac" ? cleanCustom : "",
        detail: cleanDetail,
        email: cleanEmail,
        phone: cleanPhone,
      });
      setSubmittedTicket(data);
      setDetail("");
      if (category === "khac") setCustomIssue("");
    } catch (err) {
      setError(apiError(err, "Không thể gửi yêu cầu hỗ trợ, vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tv2-page">
      <BackButton to="/" label="Về trang chủ" />
      <h2>Trung tâm Hỗ trợ Khách hàng</h2>
      <p className="tv2-muted" style={{ marginTop: "-6px", marginBottom: "18px" }}>
        Gửi yêu cầu hỗ trợ tới bộ phận Chăm sóc khách hàng PTIT Cine. Chúng tôi sẽ phản hồi qua Email và Số điện thoại của bạn.
      </p>

      {submittedTicket && (
        <div className="tv2-card" style={{ borderColor: "#22c55e", background: "rgba(34, 197, 94, 0.1)" }}>
          <h3 style={{ color: "#86efac", marginBottom: "6px" }}>✅ Đã gửi yêu cầu hỗ trợ thành công!</h3>
          <p className="small">
            <b>Mã yêu cầu:</b> <span className="tv2-code">{submittedTicket.id}</span>
          </p>
          <p className="small">
            <b>Phân loại vấn đề:</b> {submittedTicket.categoryLabel}
          </p>
          <p className="small">
            <b>Liên hệ:</b> {submittedTicket.email} · {submittedTicket.phone}
          </p>
          <p className="small tv2-muted">
            Thư yêu cầu của bạn đã được chuyển tới mục <b>Chăm sóc khách hàng</b> của Quản trị viên để xử lý.
          </p>
          <button
            type="button"
            className="tv2-btn sm"
            style={{ marginTop: "8px" }}
            onClick={() => setSubmittedTicket(null)}
          >
            Gửi yêu cầu hỗ trợ khác
          </button>
        </div>
      )}

      <form className="tv2-card" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="tv2-field">
          <span>Chọn vấn đề cần hỗ trợ</span>
          <div className="tv2-chips" style={{ marginTop: "4px" }}>
            {SUPPORT_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tv2-chip ${category === item.id ? "active" : ""}`}
                onClick={() => {
                  setCategory(item.id);
                  if (error) setError("");
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {category === "khac" && (
          <label className="tv2-field">
            <span>Nhập vấn đề cần hỗ trợ (Khác) *</span>
            <input
              type="text"
              className="tv2-input"
              placeholder="VD: Quên đồ tại rạp, lỗi mã khuyến mãi, hợp tác sự kiện..."
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              required
            />
          </label>
        )}

        <label className="tv2-field">
          <span>Thông tin chi tiết *</span>
          <textarea
            className="tv2-input"
            rows={5}
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải (mã vé, suất chiếu, thời gian giao dịch hoặc số lượng vé nhóm cần đặt)..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <label className="tv2-field">
            <span>Email liên hệ *</span>
            <input
              type="email"
              className="tv2-input"
              placeholder="ten@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="tv2-field">
            <span>Số điện thoại (SĐT) *</span>
            <input
              type="tel"
              className="tv2-input"
              placeholder="0987 654 321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
        </div>

        {error && (
          <p className="tv2-error" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        )}

        <button type="submit" className="tv2-btn" disabled={loading}>
          {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hỗ trợ"}
        </button>
      </form>
    </div>
  );
}
