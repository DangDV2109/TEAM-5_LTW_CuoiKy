import { useEffect, useRef, useState } from "react";

// Đếm ngược dùng setInterval + cleanup theo thời điểm hết hạn (F5 không bị reset)
export default function Countdown({ expiresAt, onExpire, label = "Giữ ghế còn" }) {
  const calc = () => Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  const [left, setLeft] = useState(calc);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    setLeft(calc());
    const timer = setInterval(() => {
      const next = calc();
      setLeft(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span className={`tv2-countdown ${left < 60 ? "danger" : ""}`}>
      {label} {mm}:{ss}
    </span>
  );
}
