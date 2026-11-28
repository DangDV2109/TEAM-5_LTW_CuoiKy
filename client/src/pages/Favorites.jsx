import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BackButton from "../components/BackButton";

export default function Favorites() {
  const [items, setItems] = useState(null);
  const load = () =>
    axiosClient
      .get("/users/me/favorites")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const remove = async (f) => {
    await axiosClient
      .post(`/users/me/favorites/${f.movieId}`, { title: f.title, poster: f.poster })
      .catch(() => {});
    load();
  };

  if (!items) return <p className="tv2-page">Đang tải...</p>;
  return (
    <div className="tv2-page">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Phim yêu thích</h2>
      {items.length === 0 && (
        <p>Chưa có phim yêu thích. Bấm ♡ ở trang chi tiết phim để thêm.</p>
      )}
      {items.map((f) => (
        <div className="tv2-row-card" key={f.movieId}>
          <div className="tv2-fav">
            {f.poster && <img src={f.poster} alt="" />}
            <div>
              <b>{f.title || `Phim #${f.movieId}`}</b>
              <div className="tv2-muted small" style={{ marginTop: "4px", color: "#f87171", fontWeight: 600 }}>
                ♥ {Number(f.likesCount || f.count || 1).toLocaleString("vi-VN")} người thích phim này
              </div>
            </div>
          </div>
          <button className="tv2-btn ghost" onClick={() => remove(f)}>
            Bỏ thích
          </button>
        </div>
      ))}
    </div>
  );
}
