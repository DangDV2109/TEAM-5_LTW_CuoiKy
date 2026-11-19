import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// <ProtectedRoute role="ADMIN"> chỉ cho Admin; không có role = chỉ cần đăng nhập
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
