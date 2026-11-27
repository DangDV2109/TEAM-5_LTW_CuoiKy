import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import BackButton from "../components/BackButton";
import { apiError } from "../utils";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    if (form.password !== form.confirm) return setError("Mật khẩu nhập lại không khớp");
    if (form.phone && !/^(0|\+84)\d{9}$/.test(form.phone.replace(/\s/g, ""))) return setError("Số điện thoại không hợp lệ");
    setLoading(true);
    try {
      await axiosClient.post("/auth/register", {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password,
      });
      navigate("/login", { replace: true, state: { info: "Đăng ký thành công. Hãy đăng nhập!" } });
    } catch (err) {
      setError(apiError(err, "Đăng ký thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tv2-page tv2-auth">
      <BackButton to="/login" label="Quay lại đăng nhập" />
      <form className="tv2-form tv2-auth-card" onSubmit={onSubmit}>
        <div className="tv2-auth-head"><h2>Đăng ký</h2><p>Tạo tài khoản để đặt vé nhanh hơn</p></div>
        <input name="name" placeholder="Họ tên" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="phone" type="tel" placeholder="Số điện thoại (không bắt buộc)" value={form.phone} onChange={onChange} />
        <input name="password" type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={form.password} onChange={onChange} required />
        <input name="confirm" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={onChange} required />
        {error && <p className="tv2-error" role="alert">{error}</p>}
        <button className="tv2-btn" disabled={loading}>{loading ? "Đang tạo..." : "Tạo tài khoản"}</button>
        <p className="tv2-auth-foot">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
