// Backend giả chạy ngay trong trình duyệt. Chỉ dùng khi VITE_USE_MOCK=true.
// Dữ liệu lưu ở localStorage (khoá tv2_mock_db). Xoá bằng trang /demo-booking.
const DB_KEY = "tv2_mock_db";
const PRICE = { NORMAL: 80000, VIP: 110000, COUPLE: 180000 };

export const SHOWTIMES = {
  "demo-1": { movieTitle: "Phim Demo 1", showtime: "20:00 · 20/11/2026 · Phòng 1" },
  "demo-2": { movieTitle: "Phim Demo 2", showtime: "22:15 · 20/11/2026 · Phòng 2" },
};
const COMBOS = [
  { id: "cb1", name: "Combo 1 (1 bắp + 1 nước)", price: 69000 },
  { id: "cb2", name: "Combo 2 (1 bắp + 2 nước)", price: 89000 },
  { id: "cb3", name: "Combo Couple (2 bắp + 2 nước)", price: 129000 },
];
const FIXED_SOLD = ["B3", "B4", "C7", "D5", "D6", "E2", "F8", "F9", "G4"];
const FIXED_HOLD = ["C5", "C6"]; // giả lập người khác đang giữ

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const load = () => { try { return JSON.parse(localStorage.getItem(DB_KEY)) || { bookings: {} }; } catch { return { bookings: {} }; } };
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
export const resetMock = () => localStorage.removeItem(DB_KEY);

function buildSeats(showtimeId, db) {
  const paid = new Set();
  Object.values(db.bookings).forEach((b) => {
    if (b.showtimeId === showtimeId && b.status === "PAID") b.seatLabels.forEach((l) => paid.add(l));
  });
  const seats = [];
  "ABCDEFG".split("").forEach((row) => {
    for (let n = 1; n <= 10; n++) {
      const label = `${row}${n}`;
      const type = row === "D" || row === "E" ? "VIP" : "NORMAL";
      const status = paid.has(label) || FIXED_SOLD.includes(label) ? "sold" : FIXED_HOLD.includes(label) ? "holding" : "available";
      seats.push({ id: label, row, number: n, type, status, price: PRICE[type] });
    }
  });
  for (let n = 1; n <= 5; n++) {
    const label = `H${n}`;
    seats.push({ id: label, row: "H", number: n, type: "COUPLE", status: paid.has(label) ? "sold" : "available", price: PRICE.COUPLE });
  }
  return seats;
}

const toTicket = (b) => ({
  id: b.id, status: b.status, total: b.total, code: b.code,
  movieTitle: SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
  showtime: SHOWTIMES[b.showtimeId]?.showtime || "",
  seats: b.seatLabels,
});

const ok = (config, data) => Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config, request: {} });
const fail = (config, status, message) =>
  Promise.reject(Object.assign(new Error(message), { isAxiosError: true, config, response: { status, data: { message }, headers: {}, config } }));

export default async function mockAdapter(config) {
  await sleep(250);
  const path = config.url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "").split("?")[0];
  const method = (config.method || "get").toLowerCase();
  let body = {};
  try { body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {}; } catch {}
  const db = load();
  let m;

  // --- Tài khoản ---
  if (method === "post" && path === "/auth/login") {
    const email = String(body.email || "");
    const name = email.split("@")[0] || "user";
    const role = email.toLowerCase().startsWith("admin") ? "ADMIN" : "USER"; // email bắt đầu bằng "admin" => Admin
    return ok(config, { token: "mock-token", user: { id: "u1", name, email, role } });
  }
  if (method === "post" && path === "/auth/register") return ok(config, { message: "ok" });
  if (method === "get" && path === "/users/me") {
    try { return ok(config, JSON.parse(localStorage.getItem("user"))); } catch { return fail(config, 401, "Chưa đăng nhập"); }
  }

  // --- Lịch sử vé ---
  if (method === "get" && path === "/bookings/my") {
    const mine = Object.values(db.bookings).filter((b) => b.status === "PAID").sort((a, b) => b.createdAt - a.createdAt).map(toTicket);
    const sample = { id: "sample", movieTitle: "Phim Demo 0 (vé mẫu)", showtime: "19:00 · 15/11/2026 · Phòng 3", seats: ["F5", "F6"], total: 160000, code: "PTIT-SAMPLE-0001" };
    return ok(config, [...mine, sample]);
  }

  // --- Ghế, combo ---
  if (method === "get" && (m = path.match(/^\/showtimes\/([^/]+)\/seats$/))) {
    if (!SHOWTIMES[m[1]]) return fail(config, 404, "Không tìm thấy suất chiếu");
    return ok(config, buildSeats(m[1], db));
  }
  if (method === "get" && path === "/combos") return ok(config, COMBOS);

  // --- Đặt vé ---
  if (method === "post" && path === "/bookings/hold") {
    const seats = buildSeats(body.showtimeId, db);
    const picked = (body.seatIds || []).map((id) => seats.find((s) => s.id === id));
    if (!picked.length || picked.some((s) => !s || s.status !== "available")) return fail(config, 409, "Ghế vừa có người khác chọn. Hãy chọn lại.");
    const id = `bk_${Date.now()}`;
    db.bookings[id] = {
      id, showtimeId: body.showtimeId, seatLabels: picked.map((s) => s.id), seatsTotal: picked.reduce((t, s) => t + s.price, 0),
      status: "HOLD", expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), createdAt: Date.now(), code: `PTIT-${id.slice(3)}`,
    };
    save(db);
    return ok(config, { bookingId: id, expiresAt: db.bookings[id].expiresAt });
  }
  if (method === "post" && (m = path.match(/^\/bookings\/([^/]+)\/release$/))) {
    if (db.bookings[m[1]]) { db.bookings[m[1]].status = "CANCELLED"; save(db); }
    return ok(config, { message: "ok" });
  }
  if (method === "post" && (m = path.match(/^\/bookings\/([^/]+)\/checkout$/))) {
    const b = db.bookings[m[1]];
    if (!b) return fail(config, 404, "Không tìm thấy đơn");
    const comboTotal = (body.combos || []).reduce((t, c) => t + (COMBOS.find((x) => x.id === c.id)?.price || 0) * c.qty, 0);
    b.total = b.seatsTotal + comboTotal;
    b.paidAt = Date.now() + 8000; // giả lập: 8 giây sau tự "đã thanh toán"
    save(db);
    return ok(config, { qrContent: `PTIT-PAY-${b.id}`, total: b.total });
  }
  if (method === "get" && (m = path.match(/^\/bookings\/([^/]+)$/))) {
    const b = db.bookings[m[1]];
    if (!b) return fail(config, 404, "Không tìm thấy đơn");
    if (b.status === "HOLD" && b.paidAt && Date.now() >= b.paidAt) { b.status = "PAID"; save(db); }
    return ok(config, toTicket(b));
  }

  return fail(config, 404, `Mock chưa có API: ${method.toUpperCase()} ${path}`);
}
