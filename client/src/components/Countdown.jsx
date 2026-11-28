import { useEffect, useState } from "react";

// Đếm ngược theo thời điểm hết hạn do server trả về (F5 không bị reset)
export default function Countdown({ expiresAt, onExpire }) {
  const calc = () => Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  const [left, setLeft] = useState(calc);

  useEffect(() => {
    if (left <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setLeft(calc()), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return <span className={`tv2-countdown ${left < 60 ? "danger" : ""}`}>Giữ ghế còn {mm}:{ss}</span>;
}
