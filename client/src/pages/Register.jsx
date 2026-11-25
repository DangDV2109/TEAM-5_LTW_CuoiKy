import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    if (form.password !== form.confirm) return setError("Mật khẩu nhập lại không khớp");
    try {
      await axiosClient.post("/auth/register", {
        name: form.name, email: form.email, password: form.password,
      });
      alert("Đăng ký thành công. Hãy đăng nhập!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <form className="tv2-page tv2-form" onSubmit={onSubmit}>
      <h2>Đăng ký</h2>
      <input name="name" placeholder="Họ tên" value={form.name} onChange={onChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={onChange} required />
      <input name="confirm" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={onChange} required />
      {error && <p className="tv2-error">{error}</p>}
      <button className="tv2-btn">Tạo tài khoản</button>
      <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </form>
  );
}
