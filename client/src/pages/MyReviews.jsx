import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BackButton from "../components/BackButton";
import { fmtDate } from "../utils";

export default function MyReviews() {
  const [items, setItems] = useState(null);

  const load = () => {
    axiosClient
      .get("/users/me/reviews")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (r) => {
    await axiosClient.delete(`/reviews/${r.id}`).catch(() => {});
    setItems((prev) => (prev || []).filter((x) => x.id !== r.id));
  };

  if (!items) return <p className="tv2-page">Đang tải...</p>;
  return (
    <div className="tv2-page">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Lịch sử đánh giá</h2>
      {items.length === 0 && <p>Bạn chưa đánh giá phim nào.</p>}
      {items.map((r) => (
        <div className="tv2-row-card" key={r.id}>
          <div style={{ flex: 1 }}>
            <b>{r.movieTitle}</b>
            <div className="tv2-muted small">{fmtDate(r.updatedAt || r.createdAt)}</div>
            {r.comment && <div style={{ marginTop: "4px" }}>{r.comment}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <b className="tv2-money">{r.rating}/10 ⭐</b>
            <button
              type="button"
              className="tv2-btn sm ghost"
              onClick={() => handleDelete(r)}
              title="Xoá đánh giá này"
              aria-label={`Xoá đánh giá phim ${r.movieTitle}`}
              style={{
                padding: "4px 10px",
                color: "#fca5a5",
                borderColor: "rgba(239, 68, 68, 0.45)",
                fontWeight: 800,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
