import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import BackButton from "../../components/BackButton";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import {
  moviesData,
  addMovieToDb,
  deleteMovieById,
  updateMovieById,
  subscribeMoviesChange
} from "../../../../server/src/data/moviesData";
import {
  citiesData,
  addCinemaToCity,
  removeCinemaById,
  addRoomToCinema,
  removeRoomFromCinema,
  subscribeCinemasChange,
  loadRoomShowtimes,
  addRoomShowtimeChecked,
  removeRoomShowtimeById,
  parseDurationMinutes
} from "../../../../server/src/data/cinemasData";
import { getMovieLikesCountMap } from "../../api/mockAdapter";
import { SUPPORT_CATEGORIES } from "../SupportPage";
import { apiError, fmtDate, vnd } from "../../utils";

const TABS = [
  { id: "users", label: "Tài khoản" },
  { id: "transactions", label: "Nạp tiền" },
  { id: "orders", label: "Lịch sử mua vé" },
  { id: "reviews", label: "Lịch sử đánh giá" },
  { id: "favorites", label: "Yêu thích" },
  { id: "movies", label: "CSDL phim" },
  { id: "cinemas", label: "Rạp/phòng" },
  { id: "revenue", label: "Doanh thu" },
  { id: "support", label: "Chăm sóc khách hàng" },
];

const Table = ({ cols, rows, empty = "Chưa có dữ liệu" }) => (
  <div className="tv2-table-wrap">
    <table className="tv2-table">
      <thead>
        <tr>
          {cols.map((c) => (
            <th key={c.h}>{c.h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={cols.length} className="tv2-muted">
              {empty}
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={r.id || r._id || r.movieId || r.date || r.movieTitle || i}>
            {cols.map((c) => (
              <td key={c.h}>{c.r(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---- Tài khoản & xác thực + Nút Lịch sử từng tài khoản ---- */
export function UsersTab() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { data: rows, error, setData: setRows } = useFetch("/admin/users", {
    search: debouncedSearch || undefined,
  });
  const [err, setErr] = useState("");
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const patch = async (u, body) => {
    setErr("");
    try {
      await axiosClient.patch(`/admin/users/${u.id || u._id}`, body);
      setRows((list) =>
        list.map((x) => ((x.id || x._id) === (u.id || u._id) ? { ...x, ...body } : x))
      );
    } catch (e) {
      setErr(apiError(e, "Cập nhật thất bại"));
    }
  };

  const openUserHistory = async (u) => {
    setErr("");
    setHistoryLoading(true);
    try {
      const uid = u.id || u._id || u.email;
      const { data } = await axiosClient.get(`/admin/users/${encodeURIComponent(uid)}/history`);
      setHistoryModal(data);
    } catch (e) {
      setErr(apiError(e, "Không tải được lịch sử tài khoản"));
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      <form
        className="tv2-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          className="tv2-input"
          placeholder="Tìm theo tên, email, SĐT"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="tv2-btn">Tìm</button>
      </form>
      {(error || err) && <p className="tv2-error">{error || err}</p>}
      <Table
        rows={rows}
        cols={[
          { h: "Họ tên", r: (u) => u.name },
          { h: "Email", r: (u) => u.email },
          {
            h: "Ngân hàng / TKNH",
            r: (u) => (
              <div className="small">
                <b>{u.bankName || "MB Bank (Quân Đội)"}</b>
                <div className="tv2-muted">STK: {u.bankAccount || "0987654321"}</div>
              </div>
            ),
          },
          { h: "Số dư", r: (u) => vnd(u.balance) },
          {
            h: "Xác thực",
            r: (u) => (
              <span className={`tv2-badge ${u.isVerified ? "ok" : "warn"}`}>
                {u.isVerified ? "Đã xác thực" : "Chưa"}
              </span>
            ),
          },
          {
            h: "Trạng thái",
            r: (u) => (
              <span className={`tv2-badge ${u.isLocked ? "bad" : "ok"}`}>
                {u.isLocked ? "Đã khoá" : "Hoạt động"}
              </span>
            ),
          },
          {
            h: "Thao tác",
            r: (u) => (
              <div className="tv2-actions">
                <button
                  type="button"
                  className="tv2-btn sm"
                  onClick={() => openUserHistory(u)}
                  disabled={historyLoading}
                >
                  📜 Lịch sử
                </button>
                <button
                  type="button"
                  className="tv2-btn sm ghost"
                  onClick={() => patch(u, { isVerified: !u.isVerified })}
                >
                  {u.isVerified ? "Bỏ xác thực" : "Xác thực"}
                </button>
                <button
                  type="button"
                  className="tv2-btn sm ghost"
                  onClick={() => patch(u, { isLocked: !u.isLocked })}
                >
                  {u.isLocked ? "Mở khoá" : "Khoá"}
                </button>
              </div>
            ),
          },
        ]}
      />

      {historyModal && (
        <div className="tv2-modal" onClick={() => setHistoryModal(null)}>
          <div
            className="tv2-card tv2-modal-card"
            style={{ maxWidth: "780px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  📜 Lịch sử tài khoản: {historyModal.user?.name} ({historyModal.user?.email})
                </h3>
                <p className="small tv2-muted" style={{ marginTop: "4px" }}>
                  Tên ngân hàng: <b style={{ color: "#fff" }}>{historyModal.user?.bankName || "MB Bank (Quân Đội)"}</b>
                  {" · "}
                  Số TKNH: <b style={{ color: "var(--tv2-accent)" }}>{historyModal.user?.bankAccount || "0987654321"}</b>
                  {" · "}
                  Số dư ví: <b className="tv2-money">{vnd(historyModal.user?.balance)}</b>
                </p>
              </div>
              <button
                type="button"
                className="tv2-btn sm ghost"
                onClick={() => setHistoryModal(null)}
              >
                ✕
              </button>
            </div>

            <h4 style={{ margin: "10px 0 6px", color: "var(--tv2-accent)" }}>
              🎟️ Lịch sử mua vé ({historyModal.orders?.length || 0})
            </h4>
            <Table
              empty="Tài khoản này chưa có giao dịch mua vé nào."
              rows={historyModal.orders || []}
              cols={[
                { h: "Mã vé", r: (o) => o.code },
                { h: "Phim & Suất chiếu", r: (o) => <div><b>{o.movieTitle}</b><div className="small tv2-muted">{o.showtime}</div></div> },
                { h: "Ghế", r: (o) => (o.seats || []).join(", ") },
                { h: "Tổng tiền", r: (o) => vnd(o.total) },
                {
                  h: "Tên ngân hàng & TKNH",
                  r: (o) => (
                    <div className="small">
                      <b>{o.bankName || historyModal.user?.bankName || "MB Bank"}</b>
                      <div className="tv2-muted">
                        TKNH: {o.bankAccount || historyModal.user?.bankAccount || "0987654321"} ({o.paymentMethod || "VIETQR"})
                      </div>
                    </div>
                  ),
                },
                { h: "Trạng thái", r: (o) => o.status },
              ]}
            />

            <h4 style={{ margin: "14px 0 6px", color: "var(--tv2-accent)" }}>
              ⭐ Lịch sử đánh giá của tài khoản ({historyModal.reviews?.length || 0})
            </h4>
            <Table
              empty="Tài khoản này chưa đăng đánh giá nào."
              rows={historyModal.reviews || []}
              cols={[
                { h: "Thời gian", r: (r) => fmtDate(r.createdAt) },
                { h: "Phim", r: (r) => r.movieTitle },
                { h: "Điểm", r: (r) => <b className="tv2-money">{r.rating}/10 ⭐</b> },
                { h: "Nội dung đánh giá", r: (r) => r.comment || "(Chỉ chấm sao)" },
              ]}
            />

            <div className="tv2-actions" style={{ justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="tv2-btn" onClick={() => setHistoryModal(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---- Nạp tiền ---- */
export function TransactionsTab() {
  const { data: rows, meta, error } = useFetch("/admin/transactions", { type: "TOPUP", limit: 50 });
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <p>
        Tổng tiền đã nạp:{" "}
        <b className="tv2-money">
          {vnd(meta.totalAmount ?? rows.reduce((t, r) => t + r.amount, 0))}
        </b>
      </p>
      <Table
        rows={rows}
        cols={[
          { h: "Thời gian", r: (t) => fmtDate(t.createdAt) },
          { h: "Người dùng", r: (t) => t.user?.name || t.user?.email || "" },
          { h: "Phương thức", r: (t) => t.method },
          {
            h: "Ngân hàng / TKNH",
            r: (t) => (
              <span className="small">
                {t.bankName || "MB Bank"} · {t.bankAccount || "0987654321"}
              </span>
            ),
          },
          { h: "Số tiền", r: (t) => vnd(t.amount) },
          { h: "Số dư sau", r: (t) => vnd(t.balanceAfter) },
        ]}
      />
    </>
  );
}

/* ---- Lịch sử mua vé ---- */
export function OrdersTab() {
  const { data: rows, error } = useFetch("/admin/orders", { limit: 50 });
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <Table
        rows={rows}
        cols={[
          { h: "Mã", r: (o) => o.code },
          { h: "Khách", r: (o) => o.customer },
          { h: "Phim", r: (o) => o.movieTitle },
          { h: "Suất chiếu", r: (o) => o.showtime },
          { h: "Ghế", r: (o) => (o.seats || []).join(", ") },
          {
            h: "Tên ngân hàng & TKNH",
            r: (o) => (
              <div className="small">
                <b>{o.bankName || "MB Bank (Quân Đội)"}</b>
                <div className="tv2-muted">
                  TKNH: {o.bankAccount || "0987654321"} ({o.paymentMethod || "VIETQR"})
                </div>
              </div>
            ),
          },
          { h: "Tổng", r: (o) => vnd(o.total) },
          { h: "Trạng thái", r: (o) => o.status },
        ]}
      />
    </>
  );
}

/* ---- Lịch sử đánh giá (có nút x để xóa đánh giá) ---- */
export function ReviewsTab() {
  const { data: rows, error, reload } = useFetch("/admin/reviews", { limit: 50 });
  const remove = async (r) => {
    await axiosClient.delete(`/reviews/${r.id}`).catch(() => {});
    reload();
  };
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <Table
        rows={rows}
        cols={[
          { h: "Thời gian", r: (r) => fmtDate(r.createdAt) },
          { h: "Phim", r: (r) => r.movieTitle },
          { h: "Người đánh giá", r: (r) => r.userName },
          { h: "Điểm", r: (r) => `${r.rating}/10` },
          { h: "Nội dung", r: (r) => r.comment },
          {
            h: "Xoá",
            r: (r) => (
              <button
                type="button"
                className="tv2-btn sm ghost"
                onClick={() => remove(r)}
                title="Xoá đánh giá này"
                style={{ color: "#fca5a5", borderColor: "rgba(239,68,68,0.45)", fontWeight: 800 }}
              >
                ✕
              </button>
            ),
          },
        ]}
      />
    </>
  );
}

/* ---- Danh sách yêu thích (hiện có bao nhiêu người thích phim đó) ---- */
export function FavoritesTab() {
  const { data: rows, error } = useFetch("/admin/favorites");
  const likesMap = useMemo(() => getMovieLikesCountMap(), [rows]);

  const allMoviesLikes = useMemo(() => {
    const apiMap = new Map((rows || []).map((r) => [String(r.movieId), r]));
    const list = [];
    (rows || []).forEach((r) => {
      list.push({
        movieId: r.movieId,
        title: r.title || moviesData.find((m) => String(m.id) === String(r.movieId))?.title || `Phim #${r.movieId}`,
        count: Number(r.count || likesMap[String(r.movieId)] || 0),
        users: r.users || [],
      });
    });
    moviesData.forEach((m) => {
      if (!apiMap.has(String(m.id))) {
        const cnt = Number(likesMap[String(m.id)] || 0);
        list.push({
          movieId: m.id,
          title: m.title,
          count: cnt,
          users: [],
        });
      }
    });
    return list.sort((a, b) => b.count - a.count);
  }, [rows, likesMap]);

  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <Table
        rows={allMoviesLikes}
        cols={[
          { h: "Phim", r: (f) => <b>{f.title}</b> },
          {
            h: "Số người thích",
            r: (f) => (
              <span className="tv2-badge ok" style={{ fontSize: "13px" }}>
                ♥ {f.count} người thích
              </span>
            ),
          },
          {
            h: "Danh sách tài khoản yêu thích",
            r: (f) => (f.users && f.users.length > 0 ? f.users.join(", ") : <span className="tv2-muted">Chưa có</span>),
          },
        ]}
      />
    </>
  );
}

/* ---- CSDL phim (Bấm Sửa -> đưa qua trang chi tiết phim; nút x để xóa và nút + để thêm phim) ---- */
export function MoviesTab() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 200);
  const [adding, setAdding] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: "",
    director: "",
    duration: "120 phút",
    genre: "Hành động, Phiêu lưu",
    origin: "Việt Nam",
    format: "2D",
    status: "now",
    rating: 8.5,
    releaseDate: "01/12/2026",
    poster: "",
    hot: false,
  });

  useEffect(() => {
    return subscribeMoviesChange(() => setVersion((v) => v + 1));
  }, []);

  const list = useMemo(
    () =>
      moviesData.filter(
        (m) => !debouncedQ || String(m.title).toLowerCase().includes(debouncedQ.toLowerCase())
      ),
    [debouncedQ, version]
  );

  const handleEditGoToDetail = (movie) => {
    navigate(`/phim/${movie.id}`, { state: { autoEdit: true } });
  };

  const handleDeleteMovie = (movie) => {
    deleteMovieById(movie.id);
    setVersion((v) => v + 1);
  };

  const handleCreateMovie = (e) => {
    e.preventDefault();
    if (!newMovie.title.trim()) return;
    const tags = ["#schedule"];
    if (newMovie.hot) tags.push("#hot");
    addMovieToDb({ ...newMovie, tags });
    setAdding(false);
    setNewMovie({
      title: "",
      director: "",
      duration: "120 phút",
      genre: "Hành động, Phiêu lưu",
      origin: "Việt Nam",
      format: "2D",
      status: "now",
      rating: 8.5,
      releaseDate: "01/12/2026",
      poster: "",
      hot: false,
    });
    setVersion((v) => v + 1);
  };

  return (
    <>
      <div className="tv2-toolbar" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}>
          <input
            className="tv2-input"
            placeholder="Tìm phim theo tên"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="tv2-muted">{list.length} phim</span>
        </div>

        <button
          type="button"
          className="tv2-btn"
          onClick={() => setAdding(true)}
          title="Thêm phim mới vào CSDL"
        >
          + Thêm phim mới
        </button>
      </div>

      <Table
        rows={list}
        cols={[
          { h: "ID", r: (m) => m.id },
          { h: "Tên phim", r: (m) => <b>{m.title}</b> },
          { h: "Trạng thái", r: (m) => (m.status === "coming" ? "Sắp chiếu" : "Đang chiếu") },
          { h: "Đánh giá", r: (m) => m.rating },
          { h: "Thời lượng", r: (m) => m.duration },
          { h: "Tags", r: (m) => (m.tags || []).join(" ") },
          {
            h: "Thao tác",
            r: (m) => (
              <div className="tv2-actions">
                <button
                  type="button"
                  className="tv2-btn sm"
                  onClick={() => handleEditGoToDetail(m)}
                  title="Chuyển sang trang chi tiết phim để sửa"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="tv2-btn sm ghost"
                  onClick={() => handleDeleteMovie(m)}
                  title="Xoá phim này"
                  style={{ color: "#fca5a5", borderColor: "rgba(239,68,68,0.45)", fontWeight: 800 }}
                >
                  ✕
                </button>
              </div>
            ),
          },
        ]}
      />

      {adding && (
        <div className="tv2-modal" onClick={() => setAdding(false)}>
          <form
            className="tv2-card tv2-modal-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateMovie}
          >
            <h3>+ Thêm phim mới vào CSDL</h3>
            <label className="tv2-field">
              <span>Tên phim *</span>
              <input
                className="tv2-input"
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                placeholder="Nhập tên bộ phim..."
                required
                autoFocus
              />
            </label>
            <label className="tv2-field">
              <span>Thể loại</span>
              <input
                className="tv2-input"
                value={newMovie.genre}
                onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
              />
            </label>
            <label className="tv2-field">
              <span>Đạo diễn</span>
              <input
                className="tv2-input"
                value={newMovie.director}
                onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="tv2-field">
                <span>Thời lượng</span>
                <input
                  className="tv2-input"
                  value={newMovie.duration}
                  onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                />
              </label>
              <label className="tv2-field">
                <span>Định dạng</span>
                <select
                  className="tv2-input"
                  value={newMovie.format}
                  onChange={(e) => setNewMovie({ ...newMovie, format: e.target.value })}
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="tv2-field">
                <span>Điểm đánh giá (0-10)</span>
                <input
                  className="tv2-input"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={newMovie.rating}
                  onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                />
              </label>
              <label className="tv2-field">
                <span>Trạng thái</span>
                <select
                  className="tv2-input"
                  value={newMovie.status}
                  onChange={(e) => setNewMovie({ ...newMovie, status: e.target.value })}
                >
                  <option value="now">Đang chiếu</option>
                  <option value="coming">Sắp chiếu</option>
                </select>
              </label>
            </div>
            <label className="tv2-field">
              <span>Link ảnh Poster (tuỳ chọn)</span>
              <input
                className="tv2-input"
                value={newMovie.poster}
                onChange={(e) => setNewMovie({ ...newMovie, poster: e.target.value })}
                placeholder="https://..."
              />
            </label>
            <label className="tv2-check">
              <input
                type="checkbox"
                checked={newMovie.hot}
                onChange={(e) => setNewMovie({ ...newMovie, hot: e.target.checked })}
              />
              <span>Phim HOT (hiện ở slide nổi bật)</span>
            </label>
            <div className="tv2-actions">
              <button type="submit" className="tv2-btn">
                + Lưu phim mới
              </button>
              <button
                type="button"
                className="tv2-btn ghost"
                onClick={() => setAdding(false)}
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* ---- Cạnh CSDL phim: Nút Rạp/phòng (cấu hình phòng chiếu số hàng/ghế/hàng VIP + tạo suất chiếu chống chồng giờ) ---- */
export function CinemasRoomsTab() {
  const [, setVersion] = useState(0);
  const [cityId, setCityId] = useState(citiesData[0]?.id || "ha-noi");
  const [customCityName, setCustomCityName] = useState("");
  const [cinemaName, setCinemaName] = useState("");
  const [cinemaAddress, setCinemaAddress] = useState("");
  const [roomInputs, setRoomInputs] = useState({});
  const [notice, setNotice] = useState("");

  // State Quản lý suất chiếu theo phòng (không cho tạo 2 suất chồng giờ trong cùng phòng)
  const allCinemasFlat = useMemo(
    () => citiesData.flatMap((c) => (c.cinemas || []).map((cin) => ({ ...cin, cityName: c.name }))),
    [citiesData.length, notice]
  );
  const [stCinemaId, setStCinemaId] = useState(() => allCinemasFlat[0]?.id || "hn-hadong");
  const currentStCinema = allCinemasFlat.find((c) => c.id === stCinemaId) || allCinemasFlat[0];
  const [stRoomId, setStRoomId] = useState(() => currentStCinema?.rooms?.[0]?.id || "r1");
  const [stMovieId, setStMovieId] = useState(() => moviesData[0]?.id || 1);
  const todayDMY = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }, []);
  const [stDate, setStDate] = useState(todayDMY);
  const [stTime, setStTime] = useState("19:30");
  const [roomShowtimes, setRoomShowtimes] = useState(() => loadRoomShowtimes());
  const [stError, setStError] = useState("");
  const [stOk, setStOk] = useState("");

  useEffect(() => {
    return subscribeCinemasChange(() => setVersion((v) => v + 1));
  }, []);

  const handleAddCinema = (e) => {
    e.preventDefault();
    if (!cinemaName.trim()) return;
    const created = addCinemaToCity({
      cityId: cityId === "__new__" ? null : cityId,
      cityName: cityId === "__new__" ? customCityName : null,
      name: cinemaName.trim(),
      address: cinemaAddress.trim() || "Đang cập nhật địa chỉ",
    });
    if (created) {
      setCinemaName("");
      setCinemaAddress("");
      setCustomCityName("");
      setNotice(`✅ Đã thêm rạp "${created.name}" thành công! Khi đặt vé sẽ thấy ngay rạp này.`);
      setTimeout(() => setNotice(""), 3500);
      setVersion((v) => v + 1);
    }
  };

  const defaultRoomInput = { name: "", format: "2D", rowCount: 8, seatsPerRow: 10, vipRows: "D, E", hasCoupleRow: true };

  const handleAddRoom = (cinemaId) => {
    const inp = roomInputs[cinemaId] || defaultRoomInput;
    if (!inp.name || !inp.name.trim()) return;
    const added = addRoomToCinema(cinemaId, {
      name: inp.name.trim(),
      format: inp.format || "2D",
      rowCount: Number(inp.rowCount) || 8,
      seatsPerRow: Number(inp.seatsPerRow) || 10,
      vipRows: String(inp.vipRows || "D, E"),
      hasCoupleRow: Boolean(inp.hasCoupleRow),
    });
    if (added) {
      setRoomInputs((prev) => ({ ...prev, [cinemaId]: { ...defaultRoomInput } }));
      setNotice(
        `✅ Đã thêm phòng "${added.name} (${added.format})" — ${added.rowCount} hàng × ${added.seatsPerRow} ghế, hàng VIP: ${(added.vipRows || []).join(", ") || "Không"}!`
      );
      setTimeout(() => setNotice(""), 3500);
      setVersion((v) => v + 1);
    }
  };

  const handleRemoveRoom = (cinemaId, roomId) => {
    removeRoomFromCinema(cinemaId, roomId);
    setVersion((v) => v + 1);
  };

  const handleRemoveCinema = (cinemaId) => {
    removeCinemaById(cinemaId);
    setVersion((v) => v + 1);
  };

  const handleAddRoomShowtime = (e) => {
    e.preventDefault();
    setStError("");
    setStOk("");
    const cinema = allCinemasFlat.find((c) => c.id === stCinemaId);
    const room = (cinema?.rooms || []).find((r) => r.id === stRoomId) || cinema?.rooms?.[0];
    const movie = moviesData.find((m) => Number(m.id) === Number(stMovieId));
    if (!cinema || !room || !movie) {
      setStError("Vui lòng chọn đầy đủ rạp, phòng chiếu và phim");
      return;
    }

    const res = addRoomShowtimeChecked({
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      roomId: room.id,
      roomName: room.name,
      format: room.format || "2D",
      movieId: movie.id,
      movieTitle: movie.title,
      duration: movie.duration,
      date: stDate.trim(),
      time: stTime.trim(),
    });

    if (!res.ok) {
      setStError(res.error);
      return;
    }

    // Đồng bộ khung giờ vào movie.cinemaScreenings để người dùng thấy ngay khi đặt vé
    const curTimes = movie.cinemaScreenings?.[cinema.id] || movie.screenings || [];
    if (!curTimes.includes(res.showtime.time)) {
      const nextTimes = [...curTimes, res.showtime.time].sort();
      updateMovieById(movie.id, {
        cinemaScreenings: { ...(movie.cinemaScreenings || {}), [cinema.id]: nextTimes },
      });
    }

    setRoomShowtimes(res.list);
    setStOk(
      `✅ Đã tạo suất chiếu "${movie.title}" tại ${room.name} (${cinema.name}) lúc ${res.showtime.time}–${res.showtime.endTime} ngày ${res.showtime.date}.`
    );
  };

  return (
    <>
      {notice && <p className="tv2-notice">{notice}</p>}

      {/* 1. QUẢN LÝ SUẤT CHIẾU THEO PHÒNG (CHẶN CHỒNG GIỜ) */}
      <form className="tv2-card" onSubmit={handleAddRoomShowtime} style={{ display: "flex", flexDirection: "column", gap: "12px", borderColor: "var(--tv2-accent)" }}>
        <div>
          <h3 style={{ margin: 0 }}>🗓️ Quản lý Suất chiếu theo phòng (Chặn trùng/chồng giờ)</h3>
          <p className="small tv2-muted" style={{ margin: "4px 0 0" }}>
            Hệ thống tự động kiểm tra thời lượng phim để không cho tạo 2 suất chiếu chồng giờ trong cùng phòng chiếu &amp; cùng ngày.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
          <label className="tv2-field">
            <span>Chọn rạp</span>
            <select
              className="tv2-input"
              value={stCinemaId}
              onChange={(e) => {
                const nextCid = e.target.value;
                setStCinemaId(nextCid);
                const cin = allCinemasFlat.find((c) => c.id === nextCid);
                setStRoomId(cin?.rooms?.[0]?.id || "");
              }}
            >
              {allCinemasFlat.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="tv2-field">
            <span>Chọn phòng chiếu</span>
            <select
              className="tv2-input"
              value={stRoomId}
              onChange={(e) => setStRoomId(e.target.value)}
            >
              {(currentStCinema?.rooms || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.format} · {r.rowCount}×{r.seatsPerRow})
                </option>
              ))}
            </select>
          </label>

          <label className="tv2-field">
            <span>Chọn phim</span>
            <select
              className="tv2-input"
              value={stMovieId}
              onChange={(e) => setStMovieId(Number(e.target.value))}
            >
              {moviesData.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({parseDurationMinutes(m.duration)} phút)
                </option>
              ))}
            </select>
          </label>

          <label className="tv2-field">
            <span>Ngày chiếu (DD-MM-YYYY)</span>
            <input
              type="text"
              className="tv2-input"
              value={stDate}
              onChange={(e) => setStDate(e.target.value)}
              placeholder="28-11-2026"
              required
            />
          </label>

          <label className="tv2-field">
            <span>Giờ bắt đầu (HH:mm)</span>
            <input
              type="time"
              className="tv2-input"
              value={stTime}
              onChange={(e) => setStTime(e.target.value)}
              required
            />
          </label>
        </div>

        {stError && <p className="tv2-error" role="alert" style={{ margin: 0 }}>⚠️ {stError}</p>}
        {stOk && <p className="tv2-notice" style={{ margin: 0 }}>{stOk}</p>}

        <div>
          <button type="submit" className="tv2-btn sm">+ Thêm suất chiếu</button>
        </div>

        <Table
          empty="Chưa có suất chiếu nào được lên lịch cho phòng."
          rows={roomShowtimes}
          cols={[
            { h: "Rạp & Phòng", r: (s) => <div><b>{s.cinemaName}</b><div className="small tv2-muted">{s.roomName} ({s.format})</div></div> },
            { h: "Phim", r: (s) => <div><b>{s.movieTitle}</b><div className="small tv2-muted">{s.durationMinutes} phút</div></div> },
            { h: "Ngày", r: (s) => s.date },
            { h: "Khung giờ (Bắt đầu - Kết thúc)", r: (s) => <span className="tv2-badge ok">{s.time} – {s.endTime}</span> },
            {
              h: "Xoá",
              r: (s) => (
                <button
                  type="button"
                  className="tv2-btn sm ghost"
                  style={{ color: "#fca5a5" }}
                  onClick={() => setRoomShowtimes(removeRoomShowtimeById(s.id))}
                >
                  ✕
                </button>
              ),
            },
          ]}
        />
      </form>

      {/* 2. FORM THÊM RẠP MỚI */}
      <form className="tv2-card" onSubmit={handleAddCinema} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ margin: 0 }}>+ Thêm Rạp chiếu mới</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          <label className="tv2-field">
            <span>Khu vực / Thành phố</span>
            <select
              className="tv2-input"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
            >
              {citiesData.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ Thêm thành phố mới...</option>
            </select>
          </label>

          {cityId === "__new__" && (
            <label className="tv2-field">
              <span>Tên thành phố mới *</span>
              <input
                type="text"
                className="tv2-input"
                placeholder="VD: Quảng Ninh"
                value={customCityName}
                onChange={(e) => setCustomCityName(e.target.value)}
                required
              />
            </label>
          )}

          <label className="tv2-field">
            <span>Tên rạp mới *</span>
            <input
              type="text"
              className="tv2-input"
              placeholder="VD: PTIT Cinema Long Biên"
              value={cinemaName}
              onChange={(e) => setCinemaName(e.target.value)}
              required
            />
          </label>

          <label className="tv2-field">
            <span>Địa chỉ rạp</span>
            <input
              type="text"
              className="tv2-input"
              placeholder="VD: Số 10 Nguyễn Văn Cừ, Hà Nội"
              value={cinemaAddress}
              onChange={(e) => setCinemaAddress(e.target.value)}
            />
          </label>
        </div>

        <div>
          <button type="submit" className="tv2-btn">
            + Thêm rạp
          </button>
        </div>
      </form>

      {/* 3. DANH SÁCH CỤM RẠP & CẤU HÌNH PHÒNG CHIẾU (SỐ HÀNG, SỐ GHẾ/HÀNG, HÀNG VIP) */}
      {citiesData.map((city) => (
        <div key={city.id} className="tv2-card">
          <h3 style={{ marginBottom: "10px", color: "var(--tv2-accent)" }}>
            📍 {city.name} ({city.cinemas?.length || 0} rạp)
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(city.cinemas || []).map((cin) => {
              const rInp = roomInputs[cin.id] || defaultRoomInput;
              return (
                <div
                  key={cin.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#141720",
                    border: "1px solid #343949",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                    <div>
                      <b style={{ fontSize: "15.5px" }}>{cin.name}</b>
                      <div className="tv2-muted small">{cin.address}</div>
                    </div>
                    <button
                      type="button"
                      className="tv2-btn sm ghost"
                      onClick={() => handleRemoveCinema(cin.id)}
                      title="Xoá rạp này"
                      style={{ color: "#fca5a5", borderColor: "rgba(239,68,68,0.45)" }}
                    >
                      ✕ Xoá rạp
                    </button>
                  </div>

                  {/* Danh sách phòng trong rạp (hiển thị số hàng, số ghế mỗi hàng, hàng VIP) */}
                  <div style={{ marginTop: "10px" }}>
                    <span className="small tv2-muted" style={{ display: "block", marginBottom: "6px" }}>
                      Danh sách phòng chiếu ({cin.rooms?.length || 0} phòng):
                    </span>
                    <div className="tv2-chips" style={{ marginBottom: "10px" }}>
                      {(cin.rooms || []).map((room) => (
                        <span
                          key={room.id}
                          className="tv2-badge"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            fontSize: "12.5px",
                            background: "#252936",
                            border: "1px solid #3b4254",
                          }}
                        >
                          <b>{room.name}</b> ({room.format || "2D"}) · {room.rowCount || 8} hàng × {room.seatsPerRow || 10} ghế · VIP: {(room.vipRows || ["D", "E"]).join(",") || "Không"}
                          <button
                            type="button"
                            onClick={() => handleRemoveRoom(cin.id, room.id)}
                            title="Xoá phòng chiếu này"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#fca5a5",
                              cursor: "pointer",
                              fontWeight: 800,
                              padding: "0 2px",
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Thêm phòng chiếu mới kèm số hàng, số ghế mỗi hàng, hàng VIP */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      <input
                        type="text"
                        className="tv2-input"
                        placeholder="Tên phòng (VD: Phòng 05)"
                        value={rInp.name}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [cin.id]: { ...rInp, name: e.target.value },
                          }))
                        }
                        style={{ padding: "6px 10px", fontSize: "13px", width: "155px" }}
                      />
                      <select
                        className="tv2-input"
                        value={rInp.format}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [cin.id]: { ...rInp, format: e.target.value },
                          }))
                        }
                        style={{ padding: "6px 8px", fontSize: "13px" }}
                        title="Định dạng"
                      >
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="IMAX">IMAX</option>
                      </select>
                      <input
                        type="number"
                        min="3"
                        max="14"
                        className="tv2-input"
                        value={rInp.rowCount}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [cin.id]: { ...rInp, rowCount: e.target.value },
                          }))
                        }
                        title="Số hàng ghế (3-14)"
                        placeholder="Số hàng"
                        style={{ padding: "6px 8px", fontSize: "13px", width: "78px" }}
                      />
                      <input
                        type="number"
                        min="4"
                        max="16"
                        className="tv2-input"
                        value={rInp.seatsPerRow}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [cin.id]: { ...rInp, seatsPerRow: e.target.value },
                          }))
                        }
                        title="Số ghế mỗi hàng (4-16)"
                        placeholder="Ghế/hàng"
                        style={{ padding: "6px 8px", fontSize: "13px", width: "86px" }}
                      />
                      <input
                        type="text"
                        className="tv2-input"
                        value={rInp.vipRows}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [cin.id]: { ...rInp, vipRows: e.target.value },
                          }))
                        }
                        title="Hàng VIP (VD: D, E)"
                        placeholder="Hàng VIP (D, E)"
                        style={{ padding: "6px 8px", fontSize: "13px", width: "110px" }}
                      />
                      <label className="tv2-check" style={{ fontSize: "12.5px" }}>
                        <input
                          type="checkbox"
                          checked={Boolean(rInp.hasCoupleRow)}
                          onChange={(e) =>
                            setRoomInputs((prev) => ({
                              ...prev,
                              [cin.id]: { ...rInp, hasCoupleRow: e.target.checked },
                            }))
                          }
                        />
                        <span>Ghế đôi</span>
                      </label>
                      <button
                        type="button"
                        className="tv2-btn sm"
                        onClick={() => handleAddRoom(cin.id)}
                      >
                        + Thêm phòng
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

/* ---- Cạnh nút Rạp/phòng: Nút Doanh thu (Tổng doanh thu, Bắp nước, Bán vé, Nạp tiền + Thống kê theo phim & theo ngày) ---- */
export function RevenueTab() {
  const { data, error } = useFetch("/admin/revenue");

  if (error) return <p className="tv2-error">{error}</p>;
  if (!data || Array.isArray(data)) return <p>Đang tải số liệu doanh thu...</p>;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div className="tv2-card" style={{ margin: 0, borderColor: "var(--tv2-accent)" }}>
          <div className="tv2-muted small">TỔNG DOANH THU THỰC TẾ</div>
          <div className="tv2-balance" style={{ fontSize: "26px", marginTop: "4px" }}>
            {vnd(data.totalRevenue)}
          </div>
          <div className="small tv2-muted" style={{ marginTop: "4px" }}>
            = Bán vé trực tiếp + Bắp nước trực tiếp + Tiền nạp ví (không cộng trùng vé mua bằng tiền nạp)
          </div>
        </div>

        <div className="tv2-card" style={{ margin: 0 }}>
          <div className="tv2-muted small">TỔNG TIỀN TỪ BÁN VÉ</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#86efac", marginTop: "4px" }}>
            {vnd(data.directTicketRevenue)}
          </div>
          <div className="small tv2-muted" style={{ marginTop: "4px" }}>
            Tổng vé xuất (gồm cả ví): {vnd(data.totalTicketSalesAll)}
          </div>
        </div>

        <div className="tv2-card" style={{ margin: 0 }}>
          <div className="tv2-muted small">TỔNG TIỀN TỪ BẮP NƯỚC (COMBO)</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#93c5fd", marginTop: "4px" }}>
            {vnd(data.directComboRevenue)}
          </div>
          <div className="small tv2-muted" style={{ marginTop: "4px" }}>
            Tổng combo xuất (gồm cả ví): {vnd(data.totalComboSalesAll)}
          </div>
        </div>

        <div className="tv2-card" style={{ margin: 0 }}>
          <div className="tv2-muted small">TỔNG TIỀN NẠP VÀO VÍ</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#fde047", marginTop: "4px" }}>
            {vnd(data.totalTopupRevenue)}
          </div>
          <div className="small tv2-muted" style={{ marginTop: "4px" }}>
            {data.topupCount || 0} giao dịch nạp tiền thành công
          </div>
        </div>
      </div>

      {/* Thông báo riêng: Đã tiêu bao nhiêu tiền nạp để mua vé / bắp nước */}
      <div
        className="tv2-card"
        style={{
          borderColor: "#3b82f6",
          background: "rgba(59, 130, 246, 0.12)",
          marginBottom: "18px",
        }}
      >
        <h3 style={{ margin: "0 0 6px", color: "#93c5fd", fontSize: "16px" }}>
          💳 Thông báo chi tiêu từ Tiền nạp (Ví PTIT Cine)
        </h3>
        <p style={{ margin: 0, fontSize: "14.5px" }}>
          Khách hàng đã tiêu tổng cộng{" "}
          <b className="tv2-money" style={{ fontSize: "17px" }}>
            {vnd(data.walletSpentTotal)}
          </b>{" "}
          tiền nạp để mua vé &amp; bắp nước (trong đó: tiền vé{" "}
          <b>{vnd(data.walletTicketSpent)}</b>, tiền bắp nước{" "}
          <b>{vnd(data.walletComboSpent)}</b>).
        </p>
        <p className="small tv2-muted" style={{ marginTop: "4px", marginBottom: 0 }}>
          * Lưu ý: Khoản {vnd(data.walletSpentTotal)} dùng tiền nạp để mua vé này không cộng trùng vào Tổng doanh thu vì đã được ghi nhận khi khách nạp tiền.
        </p>
      </div>

      {/* Thống kê doanh thu theo phim (Aggregation $group theo phim) */}
      <h3 style={{ marginTop: "16px" }}>🎬 Thống kê doanh thu theo phim</h3>
      <Table
        empty="Chưa có dữ liệu doanh thu theo phim."
        rows={data.revenueByMovie || []}
        cols={[
          { h: "Phim", r: (m) => <b>{m.movieTitle}</b> },
          { h: "Số đơn", r: (m) => m.orders },
          { h: "Số vé bán", r: (m) => m.tickets },
          { h: "Tiền vé", r: (m) => vnd(m.ticketRevenue) },
          { h: "Tiền bắp nước", r: (m) => vnd(m.comboRevenue) },
          { h: "Tổng giá trị", r: (m) => <b className="tv2-money">{vnd(m.totalRevenue)}</b> },
        ]}
      />

      {/* Thống kê doanh thu theo ngày (Aggregation $group theo ngày) */}
      <h3 style={{ marginTop: "20px" }}>📅 Thống kê doanh thu theo ngày</h3>
      <Table
        empty="Chưa có dữ liệu doanh thu theo ngày."
        rows={data.revenueByDay || []}
        cols={[
          { h: "Ngày", r: (d) => <b>{d.date}</b> },
          { h: "Số đơn", r: (d) => d.orders },
          { h: "Số vé bán", r: (d) => d.tickets },
          { h: "Tiền vé", r: (d) => vnd(d.ticketRevenue) },
          { h: "Tiền bắp nước", r: (d) => vnd(d.comboRevenue) },
          { h: "Tổng giá trị", r: (d) => <b className="tv2-money">{vnd(d.totalRevenue)}</b> },
        ]}
      />

      <h3 style={{ marginTop: "20px" }}>Chi tiết các đơn vé đã thanh toán ({data.orders?.length || 0})</h3>
      <Table
        rows={data.orders || []}
        cols={[
          { h: "Mã đơn", r: (o) => o.code },
          { h: "Khách hàng", r: (o) => o.customer },
          { h: "Phim", r: (o) => o.movieTitle },
          { h: "Tiền vé", r: (o) => vnd(o.seatsTotal) },
          { h: "Tiền bắp nước", r: (o) => vnd(o.comboTotal) },
          { h: "Tổng đơn", r: (o) => <b>{vnd(o.total)}</b> },
          {
            h: "Nguồn thanh toán",
            r: (o) =>
              o.paidMethod === "WALLET" ? (
                <span className="tv2-badge warn">Tiền nạp ví (Không cộng trùng DT)</span>
              ) : (
                <span className="tv2-badge ok">{o.paidMethod} (Cộng vào DT)</span>
              ),
          },
        ]}
      />
    </>
  );
}

/* ---- Mục Chăm sóc khách hàng (nhận thư từ trang Hỗ trợ, đánh dấu và phân loại riêng các vấn đề) ---- */
export function SupportTab() {
  const { data: rows, error, setData: setRows } = useFetch("/admin/support");
  const [filterCat, setFilterCat] = useState("ALL");
  const [onlyMarked, setOnlyMarked] = useState(false);

  const patchTicket = async (t, body) => {
    try {
      const { data } = await axiosClient.patch(`/admin/support/${t.id}`, body);
      setRows((list) => (list || []).map((x) => (x.id === t.id ? { ...x, ...data, ...body } : x)));
    } catch {}
  };

  const removeTicket = async (t) => {
    await axiosClient.delete(`/admin/support/${t.id}`).catch(() => {});
    setRows((list) => (list || []).filter((x) => x.id !== t.id));
  };

  const countsByCat = useMemo(() => {
    const map = { ALL: (rows || []).length };
    SUPPORT_CATEGORIES.forEach((c) => {
      map[c.id] = 0;
    });
    (rows || []).forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    return (rows || []).filter((r) => {
      if (filterCat !== "ALL" && r.category !== filterCat) return false;
      if (onlyMarked && !r.isMarked) return false;
      return true;
    });
  }, [rows, filterCat, onlyMarked]);

  if (!rows) return <p>Đang tải danh sách yêu cầu hỗ trợ...</p>;

  return (
    <>
      {error && <p className="tv2-error">{error}</p>}

      <div className="tv2-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <b>Phân loại theo vấn đề cần hỗ trợ:</b>
          <label className="tv2-check">
            <input
              type="checkbox"
              checked={onlyMarked}
              onChange={(e) => setOnlyMarked(e.target.checked)}
            />
            <span>★ Chỉ hiện thư đã đánh dấu quan trọng</span>
          </label>
        </div>

        <div className="tv2-chips">
          <button
            type="button"
            className={`tv2-chip ${filterCat === "ALL" ? "active" : ""}`}
            onClick={() => setFilterCat("ALL")}
          >
            Tất cả ({countsByCat.ALL || 0})
          </button>
          {SUPPORT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`tv2-chip ${filterCat === cat.id ? "active" : ""}`}
              onClick={() => setFilterCat(cat.id)}
            >
              {cat.label} ({countsByCat[cat.id] || 0})
            </button>
          ))}
        </div>
      </div>

      <Table
        empty="Chưa có thư yêu cầu hỗ trợ nào trong mục phân loại này."
        rows={filtered}
        cols={[
          {
            h: "Đánh dấu",
            r: (t) => (
              <button
                type="button"
                className={`tv2-btn sm ${t.isMarked ? "" : "ghost"}`}
                onClick={() => patchTicket(t, { isMarked: !t.isMarked })}
                title={t.isMarked ? "Bỏ đánh dấu" : "Đánh dấu thư quan trọng"}
              >
                {t.isMarked ? "★ Đã đánh dấu" : "☆ Đánh dấu"}
              </button>
            ),
          },
          {
            h: "Phân loại vấn đề",
            r: (t) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span className="tv2-badge warn">{t.categoryLabel}</span>
                <select
                  className="tv2-input"
                  style={{ padding: "3px 6px", fontSize: "12px" }}
                  value={t.category}
                  onChange={(e) => {
                    const found = SUPPORT_CATEGORIES.find((c) => c.id === e.target.value);
                    patchTicket(t, {
                      category: e.target.value,
                      categoryLabel: found ? found.label : e.target.value,
                    });
                  }}
                >
                  {SUPPORT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      Chuyển sang: {c.label}
                    </option>
                  ))}
                </select>
              </div>
            ),
          },
          {
            h: "Nội dung chi tiết",
            r: (t) => (
              <div style={{ maxWidth: "340px" }}>
                <div>{t.detail}</div>
                <div className="small tv2-muted" style={{ marginTop: "4px" }}>
                  Gửi lúc: {fmtDate(t.createdAt)}
                </div>
              </div>
            ),
          },
          {
            h: "Email & SĐT khách",
            r: (t) => (
              <div className="small">
                <div>
                  <b>Email:</b> {t.email}
                </div>
                <div>
                  <b>SĐT:</b> {t.phone}
                </div>
              </div>
            ),
          },
          {
            h: "Trạng thái xử lý",
            r: (t) => (
              <select
                className="tv2-input"
                style={{ padding: "5px 8px", fontSize: "13px" }}
                value={t.status || "unread"}
                onChange={(e) => patchTicket(t, { status: e.target.value })}
              >
                <option value="unread">🔴 Chưa xử lý</option>
                <option value="processing">🟡 Đang xử lý</option>
                <option value="resolved">🟢 Đã hoàn tất</option>
              </select>
            ),
          },
          {
            h: "Xoá",
            r: (t) => (
              <button
                type="button"
                className="tv2-btn sm ghost"
                onClick={() => removeTicket(t)}
                title="Xoá thư hỗ trợ"
                style={{ color: "#fca5a5" }}
              >
                ✕
              </button>
            ),
          },
        ]}
      />
    </>
  );
}

/* ---- Layout Trang quản trị dùng Nested Routes (<Outlet />) + <NavLink> ---- */
export default function AdminDashboard() {
  return (
    <div className="tv2-page wide">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Trang quản trị</h2>
      <nav className="tv2-tabs" role="tablist" aria-label="Điều hướng quản trị">
        {TABS.map((t) => (
          <NavLink
            key={t.id}
            to={`/admin/${t.id}`}
            role="tab"
            className={({ isActive }) => `tv2-tab ${isActive ? "active" : ""}`}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
