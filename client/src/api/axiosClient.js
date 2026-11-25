import axios from "axios";
import mockAdapter from "./mockAdapter";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// VITE_USE_MOCK=true => dùng trực tiếp mockAdapter
if (import.meta.env.VITE_USE_MOCK === "true") {
  axiosClient.defaults.adapter = mockAdapter;
}

// Tự gắn JWT vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động chuẩn hoá dữ liệu trả về từ Backend ({ success: true, data: ... })
// và fallback sang mockAdapter khi chưa bật server backend hoặc endpoint/ID chỉ có trên mock,
// đồng thời xử lý khi token hết hạn (401)
axiosClient.interceptors.response.use(
  (res) => {
    if (res && res.data && typeof res.data === "object" && "success" in res.data && "data" in res.data) {
      return { ...res, data: res.data.data, meta: res.data };
    }
    return res;
  },
  async (err) => {
    const config = err.config;
    const isNetworkError = !err.response || err.code === "ERR_NETWORK";
    const status = err.response?.status;
    const msg = String(err.response?.data?.message || "");
    const isMockShowtimeOrId =
      (status === 400 || status === 404) &&
      (msg.includes("ID không hợp lệ") || msg.includes("showtimeId không hợp lệ") || /^\/(showtimes|bookings)\//.test(config?.url || ""));
    const isUnimplementedEndpoint = status === 404 && config && !config._mockRetried;

    if (config && !config._mockRetried && (isNetworkError || isUnimplementedEndpoint || isMockShowtimeOrId)) {
      config._mockRetried = true;
      return mockAdapter(config);
    }

    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
