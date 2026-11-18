import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Giả định BE trả: { token, user: { id, name, email, role } }
      const { data } = await axiosClient.post("/auth/login", form);
      login(data.token, data.user);
      navigate(from || (data.user.role === "ADMIN" ? "/admin" : "/"));
    } catch (err) {
      setError(err.response?.data?.message || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="tv2-page tv2-form" onSubmit={onSubmit}>
      <h2>Đăng nhập</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={onChange} required />
      {error && <p className="tv2-error">{error}</p>}
      <button className="tv2-btn" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </form>
  );
}
