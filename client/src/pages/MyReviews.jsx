import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BackButton from "../components/BackButton";
import { fmtDate } from "../utils";

export default function MyReviews() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    axiosClient.get("/users/me/reviews").then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);

  if (!items) return <p className="tv2-page">Đang tải...</p>;
  return (
    <div className="tv2-page">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Lịch sử đánh giá</h2>
      {items.length === 0 && <p>Bạn chưa đánh giá phim nào.</p>}
      {items.map((r) => (
        <div className="tv2-row-card" key={r.id}>
          <div>
            <b>{r.movieTitle}</b>
            <div className="tv2-muted small">{fmtDate(r.updatedAt || r.createdAt)}</div>
            {r.comment && <div>{r.comment}</div>}
          </div>
          <b className="tv2-money">{r.rating}/10 ⭐</b>
        </div>
      ))}
    </div>
  );
}
