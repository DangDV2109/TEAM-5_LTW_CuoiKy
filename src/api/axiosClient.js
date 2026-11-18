import axios from "axios";
import mockAdapter from "./mockAdapter";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// VITE_USE_MOCK=true => dùng backend giả (xem mockAdapter.js)
if (import.meta.env.VITE_USE_MOCK === "true") axiosClient.defaults.adapter = mockAdapter;

// Tự gắn JWT vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token hết hạn -> về trang đăng nhập
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.startsWith("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
