import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import BackButton from "../../components/BackButton";
import { moviesData, updateMovieById } from "../../../../server/src/data/moviesData";
import { apiError, fmtDate, vnd } from "../../utils";

const TABS = [
  { id: "users", label: "Tài khoản" },
  { id: "transactions", label: "Nạp tiền" },
  { id: "orders", label: "Lịch sử mua vé" },
  { id: "reviews", label: "Lịch sử đánh giá" },
  { id: "favorites", label: "Yêu thích" },
  { id: "movies", label: "CSDL phim" },
];

function useList(url, params) {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({});
  const [error, setError] = useState("");
  const key = url + JSON.stringify(params || {});
  const reload = () => {
    setRows(null);
    axiosClient.get(url, { params }).then((r) => { setRows(r.data); setMeta(r.meta || {}); setError(""); })
      .catch((e) => { setRows([]); setError(apiError(e, "Không tải được dữ liệu")); });
  };
  useEffect(reload, [key]);
  return { rows, meta, error, reload, setRows };
}

const Table = ({ cols, rows, empty = "Chưa có dữ liệu" }) => (
  <div className="tv2-table-wrap">
    <table className="tv2-table">
      <thead><tr>{cols.map((c) => <th key={c.h}>{c.h}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={cols.length} className="tv2-muted">{empty}</td></tr>}
        {rows.map((r, i) => <tr key={r.id || r._id || r.movieId || i}>{cols.map((c) => <td key={c.h}>{c.r(r)}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);

/* ---- Tài khoản & xác thực ---- */
function UsersTab() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const { rows, error, setRows } = useList("/admin/users", { search: q || undefined });
  const [err, setErr] = useState("");

  const patch = async (u, body) => {
    setErr("");
    try {
      await axiosClient.patch(`/admin/users/${u.id || u._id}`, body);
      setRows((list) => list.map((x) => ((x.id || x._id) === (u.id || u._id) ? { ...x, ...body } : x)));
    } catch (e) { setErr(apiError(e, "Cập nhật thất bại")); }
  };

  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      <form className="tv2-toolbar" onSubmit={(e) => { e.preventDefault(); setQ(search.trim()); }}>
        <input className="tv2-input" placeholder="Tìm theo tên, email, SĐT" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="tv2-btn">Tìm</button>
      </form>
      {(error || err) && <p className="tv2-error">{error || err}</p>}
      <Table rows={rows} cols={[
        { h: "Họ tên", r: (u) => u.name },
        { h: "Email", r: (u) => u.email },
        { h: "Vai trò", r: (u) => u.role },
        { h: "Số dư", r: (u) => vnd(u.balance) },
        { h: "Xác thực", r: (u) => <span className={`tv2-badge ${u.isVerified ? "ok" : "warn"}`}>{u.isVerified ? "Đã xác thực" : "Chưa"}</span> },
        { h: "Trạng thái", r: (u) => <span className={`tv2-badge ${u.isLocked ? "bad" : "ok"}`}>{u.isLocked ? "Đã khoá" : "Hoạt động"}</span> },
        { h: "Thao tác", r: (u) => (
          <div className="tv2-actions">
            <button className="tv2-btn sm" onClick={() => patch(u, { isVerified: !u.isVerified })}>{u.isVerified ? "Bỏ xác thực" : "Xác thực"}</button>
            <button className="tv2-btn sm ghost" onClick={() => patch(u, { isLocked: !u.isLocked })}>{u.isLocked ? "Mở khoá" : "Khoá"}</button>
          </div>
        ) },
      ]} />
    </>
  );
}

/* ---- Nạp tiền ---- */
function TransactionsTab() {
  const { rows, meta, error } = useList("/admin/transactions", { type: "TOPUP", limit: 50 });
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <p>Tổng tiền đã nạp: <b className="tv2-money">{vnd(meta.totalAmount ?? rows.reduce((t, r) => t + r.amount, 0))}</b></p>
      <Table rows={rows} cols={[
        { h: "Thời gian", r: (t) => fmtDate(t.createdAt) },
        { h: "Người dùng", r: (t) => t.user?.name || t.user?.email || "" },
        { h: "Phương thức", r: (t) => t.method },
        { h: "Số tiền", r: (t) => vnd(t.amount) },
        { h: "Số dư sau", r: (t) => vnd(t.balanceAfter) },
      ]} />
    </>
  );
}

/* ---- Lịch sử mua vé ---- */
function OrdersTab() {
  const { rows, error } = useList("/admin/orders", { limit: 50 });
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <Table rows={rows} cols={[
        { h: "Mã", r: (o) => o.code },
        { h: "Khách", r: (o) => o.customer },
        { h: "Phim", r: (o) => o.movieTitle },
        { h: "Suất chiếu", r: (o) => o.showtime },
        { h: "Ghế", r: (o) => (o.seats || []).join(", ") },
        { h: "Tổng", r: (o) => vnd(o.total) },
        { h: "Trạng thái", r: (o) => o.status },
      ]} />
    </>
  );
}

/* ---- Đánh giá ---- */
function ReviewsTab() {
  const { rows, error, reload } = useList("/admin/reviews", { limit: 50 });
  const remove = async (r) => {
    if (!window.confirm("Xoá đánh giá này?")) return;
    await axiosClient.delete(`/reviews/${r.id}`).catch(() => {});
    reload();
  };
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <Table rows={rows} cols={[
        { h: "Thời gian", r: (r) => fmtDate(r.createdAt) },
        { h: "Phim", r: (r) => r.movieTitle },
        { h: "Người đánh giá", r: (r) => r.userName },
        { h: "Điểm", r: (r) => `${r.rating}/10` },
        { h: "Nội dung", r: (r) => r.comment },
        { h: "", r: (r) => <button className="tv2-btn sm ghost" onClick={() => remove(r)}>Xoá</button> },
      ]} />
    </>
  );
}

/* ---- Danh sách yêu thích ---- */
function FavoritesTab() {
  const { rows, error } = useList("/admin/favorites");
  if (!rows) return <p>Đang tải...</p>;
  return (
    <>
      {error && <p className="tv2-error">{error}</p>}
      <Table rows={rows} cols={[
        { h: "Phim", r: (f) => f.title || `Phim #${f.movieId}` },
        { h: "Lượt yêu thích", r: (f) => f.count },
        { h: "Người yêu thích", r: (f) => (f.users || []).join(", ") },
      ]} />
    </>
  );
}

/* ---- CSDL phim (dữ liệu phim dùng chung của website) ---- */
function MoviesTab() {
  const [, force] = useState(0);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const list = useMemo(
    () => moviesData.filter((m) => !q || String(m.title).toLowerCase().includes(q.toLowerCase())),
    [q, editing]
  );

  const save = (e) => {
    e.preventDefault();
    const tags = new Set((editing.tags || []).map(String));
    editing.hot ? tags.add("#hot") : tags.delete("#hot");
    updateMovieById(editing.id, {
      title: editing.title, status: editing.status, rating: Number(editing.rating),
      director: editing.director, duration: editing.duration, tags: [...tags],
    });
    setEditing(null);
    force((n) => n + 1);
  };

  return (
    <>
      <div className="tv2-toolbar">
        <input className="tv2-input" placeholder="Tìm phim theo tên" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="tv2-muted">{list.length} phim</span>
      </div>
      <Table rows={list} cols={[
        { h: "ID", r: (m) => m.id },
        { h: "Tên phim", r: (m) => m.title },
        { h: "Trạng thái", r: (m) => (m.status === "coming" ? "Sắp chiếu" : "Đang chiếu") },
        { h: "Đánh giá", r: (m) => m.rating },
        { h: "Thời lượng", r: (m) => m.duration },
        { h: "Tags", r: (m) => (m.tags || []).join(" ") },
        { h: "", r: (m) => <button className="tv2-btn sm" onClick={() => setEditing({ ...m, hot: (m.tags || []).includes("#hot") })}>Sửa</button> },
      ]} />

      {editing && (
        <div className="tv2-modal" onClick={() => setEditing(null)}>
          <form className="tv2-card tv2-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>Sửa phim #{editing.id}</h3>
            <label className="tv2-field"><span>Tên phim</span><input className="tv2-input" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></label>
            <label className="tv2-field"><span>Đạo diễn</span><input className="tv2-input" value={editing.director || ""} onChange={(e) => setEditing({ ...editing, director: e.target.value })} /></label>
            <label className="tv2-field"><span>Thời lượng</span><input className="tv2-input" value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></label>
            <label className="tv2-field"><span>Điểm đánh giá (0-10)</span><input className="tv2-input" type="number" min="0" max="10" step="0.1" value={editing.rating ?? 0} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} /></label>
            <label className="tv2-field"><span>Trạng thái</span>
              <select className="tv2-input" value={editing.status || "now"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="now">Đang chiếu</option><option value="coming">Sắp chiếu</option>
              </select>
            </label>
            <label className="tv2-check"><input type="checkbox" checked={editing.hot} onChange={(e) => setEditing({ ...editing, hot: e.target.checked })} /><span>Phim HOT (hiện ở slide nổi bật)</span></label>
            <div className="tv2-actions"><button className="tv2-btn">Lưu</button><button type="button" className="tv2-btn ghost" onClick={() => setEditing(null)}>Huỷ</button></div>
          </form>
        </div>
      )}
    </>
  );
}

const PANELS = { users: UsersTab, transactions: TransactionsTab, orders: OrdersTab, reviews: ReviewsTab, favorites: FavoritesTab, movies: MoviesTab };

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const Panel = PANELS[tab];
  return (
    <div className="tv2-page wide">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Trang quản trị</h2>
      <div className="tv2-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tv2-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <Panel key={tab} />
    </div>
  );
}
