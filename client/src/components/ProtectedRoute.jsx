import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// <ProtectedRoute role="admin"> chỉ cho Admin; không có role = chỉ cần đăng nhập
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname, info: location.state?.info }} />;
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" replace />;
  return children;
}
