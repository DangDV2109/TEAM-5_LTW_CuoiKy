import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const readUser = () => {
    try {
      if (!localStorage.getItem("token")) return null; // thiếu token => coi như chưa đăng nhập
      return JSON.parse(localStorage.getItem("user"));
    } catch { return null; }
  };
  const [user, setUser] = useState(readUser);

  // Tab khác đăng xuất/đăng nhập thì tab này cập nhật theo
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "token" || e.key === "user" || e.key === null) setUser(readUser()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Cập nhật một phần thông tin user (vd: số dư ví sau khi nạp tiền)
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}
