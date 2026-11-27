export const vnd = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
export const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");
export const isAdmin = (user) => String(user?.role || "").toLowerCase() === "admin";
export const apiError = (err, fallback) =>
  err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || fallback;
