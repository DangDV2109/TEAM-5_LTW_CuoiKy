// Backend giả chạy ngay trong trình duyệt. Dùng khi VITE_USE_MOCK=true hoặc fallback khi chưa bật server.
// Dữ liệu lưu ở localStorage (khoá tv2_mock_db).
import { moviesData, loadAndPruneCommunityPosts, COMMUNITY_STORAGE_KEY } from "../data/moviesData";

const DB_KEY = "tv2_mock_db";
const USERS_KEY = "tv2_mock_users";
const TX_KEY = "tv2_mock_tx";
const FAV_KEY = "tv2_mock_favorites";
const USER_LIST_KEY = "ptit_cine_user_list_status_v1";
const PRICE = { NORMAL: 80000, VIP: 110000, COUPLE: 180000 };

export const SHOWTIMES = {
  "demo-1": { movieTitle: "Phim Demo 1", showtime: "20:00 · 20/11/2026 · Phòng 1", roomName: "Phòng 01 (2D)" },
  "demo-2": { movieTitle: "Phim Demo 2", showtime: "22:15 · 20/11/2026 · Phòng 2", roomName: "Phòng 02 (IMAX)" },
};
const COMBOS = [
  { id: "cb1", name: "Combo 1 (1 bắp + 1 nước)", price: 69000 },
  { id: "cb2", name: "Combo 2 (1 bắp + 2 nước)", price: 89000 },
  { id: "cb3", name: "Combo Couple (2 bắp + 2 nước)", price: 129000 },
];
const FIXED_SOLD = ["B3", "B4", "C7", "D5", "D6", "E2", "F8", "F9", "G4"];
const FIXED_HOLD = ["C5", "C6"]; // giả lập người khác đang giữ

// Thông tin khách hàng mẫu gắn với từng ghế đã đặt / đang bị giữ (phục vụ Admin kiểm tra VIP / Danh sách đen)
const SEAT_CUSTOMERS = {
  B3: {
    name: "Nguyễn Minh Quân",
    email: "minhquan@ptit.edu.vn",
    phone: "0987 654 321",
    listType: "vip",
    note: "Thành viên hạng Kim Cương (Đã mua trên 50 vé trong năm)",
    bookedAt: "18:20 · 23/11/2026",
    bookingCode: "PTIT-VIP-8821"
  },
  B4: {
    name: "Nguyễn Minh Quân",
    email: "minhquan@ptit.edu.vn",
    phone: "0987 654 321",
    listType: "vip",
    note: "Thành viên hạng Kim Cương (Đã mua trên 50 vé trong năm)",
    bookedAt: "18:20 · 23/11/2026",
    bookingCode: "PTIT-VIP-8821"
  },
  C5: {
    name: "Trần Hoàng Long",
    email: "hoanglong99@gmail.com",
    phone: "0933 112 233",
    listType: "blacklist",
    note: "Cảnh báo Danh sách đen: Giữ ghế ảo không thanh toán 6 lần liên tiếp",
    bookedAt: "Đang giữ ghế (còn 03:45)",
    bookingCode: "HOLD-9904"
  },
  C6: {
    name: "Trần Hoàng Long",
    email: "hoanglong99@gmail.com",
    phone: "0933 112 233",
    listType: "blacklist",
    note: "Cảnh báo Danh sách đen: Giữ ghế ảo không thanh toán 6 lần liên tiếp",
    bookedAt: "Đang giữ ghế (còn 03:45)",
    bookingCode: "HOLD-9904"
  },
  C7: {
    name: "Phạm Văn Hùng",
    email: "hungsport@gmail.com",
    phone: "0905 123 123",
    listType: "blacklist",
    note: "Cảnh báo Danh sách đen: Vi phạm nội quy rạp (gây mất trật tự & bom vé)",
    bookedAt: "17:05 · 23/11/2026",
    bookingCode: "PTIT-BLK-3012"
  },
  D5: {
    name: "Lê Thu Hà",
    email: "thuha.le@gmail.com",
    phone: "0912 345 678",
    listType: "vip",
    note: "Khách hàng VIP Vàng - Ưu tiên hỗ trợ tại quầy",
    bookedAt: "19:10 · 23/11/2026",
    bookingCode: "PTIT-VIP-4509"
  },
  D6: {
    name: "Lê Thu Hà",
    email: "thuha.le@gmail.com",
    phone: "0912 345 678",
    listType: "vip",
    note: "Khách hàng VIP Vàng - Ưu tiên hỗ trợ tại quầy",
    bookedAt: "19:10 · 23/11/2026",
    bookingCode: "PTIT-VIP-4509"
  },
  E2: {
    name: "Đỗ Quang Huy",
    email: "quanghuy@stu.ptit.edu.vn",
    phone: "0978 111 222",
    listType: "normal",
    note: "Khách hàng thành viên PTIT Cine (Đã xác thực CCCD U22)",
    bookedAt: "19:30 · 23/11/2026",
    bookingCode: "PTIT-STD-6102"
  },
  F8: {
    name: "Vũ Ngọc Ánh",
    email: "ngocanh.vu@gmail.com",
    phone: "0966 888 999",
    listType: "vip",
    note: "Khách hàng VIP Bạch Kim - Đối tác truyền thông PTIT Cine",
    bookedAt: "16:40 · 23/11/2026",
    bookingCode: "PTIT-VIP-7710"
  },
  F9: {
    name: "Vũ Ngọc Ánh",
    email: "ngocanh.vu@gmail.com",
    phone: "0966 888 999",
    listType: "vip",
    note: "Khách hàng VIP Bạch Kim - Đối tác truyền thông PTIT Cine",
    bookedAt: "16:40 · 23/11/2026",
    bookingCode: "PTIT-VIP-7710"
  },
  G4: {
    name: "Bùi Tiến Đạt",
    email: "tiendat.bui@gmail.com",
    phone: "0944 555 666",
    listType: "normal",
    note: "Khách hàng phổ thông",
    bookedAt: "20:00 · 23/11/2026",
    bookingCode: "PTIT-STD-5218"
  }
};

export const getUserListOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_LIST_KEY)) || {};
  } catch {
    return {};
  }
};

export const setUserListOverride = (email, listType, note) => {
  try {
    const cur = getUserListOverrides();
    cur[email.toLowerCase()] = { listType, note };
    localStorage.setItem(USER_LIST_KEY, JSON.stringify(cur));
    return cur;
  } catch {
    return {};
  }
};


// ---------- Kho người dùng / giao dịch / yêu thích giả lập (localStorage) ----------
const readJSON = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const loadUsers = () => {
  const cur = readJSON(USERS_KEY, null);
  if (cur) return cur;
  const seed = {};
  [["Nguyễn Minh Quân", "minhquan@ptit.edu.vn", 250000, true], ["Lê Thu Hà", "thuha.le@gmail.com", 120000, true], ["Trần Hoàng Long", "hoanglong99@gmail.com", 0, false]].forEach(([name, email, balance, isVerified], i) => {
    seed[email] = { id: `u_seed${i}`, name, email, role: "user", balance, isVerified, isLocked: false, createdAt: Date.now() - i * 86400000 };
  });
  writeJSON(USERS_KEY, seed);
  return seed;
};
const saveUsers = (u) => writeJSON(USERS_KEY, u);
const sessionEmail = () => { try { return JSON.parse(localStorage.getItem("user"))?.email?.toLowerCase() || null; } catch { return null; } };
const addTx = (tx) => { const list = readJSON(TX_KEY, []); list.unshift({ id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString(), status: "SUCCESS", ...tx }); writeJSON(TX_KEY, list); };
const publicUser = (u) => ({ ...u, id: u.id });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const load = () => { try { return JSON.parse(localStorage.getItem(DB_KEY)) || { bookings: {} }; } catch { return { bookings: {} }; } };
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
export const resetMock = () => localStorage.removeItem(DB_KEY);

function resolveCustomerForSeat(label, bookingBySeat) {
  const overrides = getUserListOverrides();
  let base = null;

  if (bookingBySeat[label]) {
    const bk = bookingBySeat[label];
    base = {
      name: bk.user?.name || "Thành viên PTIT Cine",
      email: bk.user?.email || "member@ptitcine.vn",
      phone: bk.user?.phone || "0988 777 666",
      listType: "normal",
      note: "Đặt vé trực tuyến trên hệ thống",
      bookedAt: new Date(bk.createdAt).toLocaleString("vi-VN"),
      bookingCode: bk.code
    };
  } else if (SEAT_CUSTOMERS[label]) {
    base = { ...SEAT_CUSTOMERS[label] };
  }

  if (base && base.email) {
    const ov = overrides[base.email.toLowerCase()];
    if (ov) {
      base.listType = ov.listType;
      if (ov.note) base.note = ov.note;
    }
  }
  return base;
}

function buildSeats(showtimeId, db) {
  const paid = new Set();
  const held = new Set();
  const bookingBySeat = {};

  Object.values(db.bookings).forEach((b) => {
    if (b.showtimeId === showtimeId) {
      if (b.status === "PAID") {
        b.seatLabels.forEach((l) => {
          paid.add(l);
          bookingBySeat[l] = b;
        });
      } else if (b.status === "HOLD" && new Date(b.expiresAt).getTime() > Date.now()) {
        b.seatLabels.forEach((l) => {
          held.add(l);
          bookingBySeat[l] = b;
        });
      }
    }
  });

  const seats = [];
  "ABCDEFG".split("").forEach((row) => {
    for (let n = 1; n <= 10; n++) {
      const label = `${row}${n}`;
      const type = row === "D" || row === "E" ? "VIP" : "NORMAL";
      const isSold = paid.has(label) || FIXED_SOLD.includes(label);
      const isHold = !isSold && (held.has(label) || FIXED_HOLD.includes(label));
      const status = isSold ? "sold" : isHold ? "holding" : "available";
      const customer = isSold || isHold ? resolveCustomerForSeat(label, bookingBySeat) : null;
      seats.push({ id: label, row, number: n, type, status, price: PRICE[type], customer });
    }
  });
  for (let n = 1; n <= 5; n++) {
    const label = `H${n}`;
    const isSold = paid.has(label);
    const isHold = !isSold && held.has(label);
    const status = isSold ? "sold" : isHold ? "holding" : "available";
    const customer = isSold || isHold ? resolveCustomerForSeat(label, bookingBySeat) : null;
    seats.push({ id: label, row: "H", number: n, type: "COUPLE", status, price: PRICE.COUPLE, customer });
  }
  return seats;
}

// Thông tin phim/rạp/ngày/giờ lấy từ trang chi tiết phim (b.info), không có thì dùng suất demo
const toTicket = (b) => ({
  id: b.id, status: b.status, total: b.total, code: b.code,
  movieTitle: b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
  showtime: b.info
    ? [b.info.time, b.info.date, b.info.cinemaName, b.info.roomName].filter(Boolean).join(" · ")
    : SHOWTIMES[b.showtimeId]?.showtime || "",
  seats: b.seatLabels, paymentMethod: b.paidMethod,
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
    const email = String(body.email || "").toLowerCase();
    const users = loadUsers();
    if (users[email]?.isLocked) return fail(config, 403, "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên");
    if (!users[email]) {
      const role = email.startsWith("admin") ? "admin" : "user"; // email bắt đầu bằng "admin" => Admin
      users[email] = { id: `u_${Date.now()}`, name: email.split("@")[0] || "user", email, role, balance: 0, isVerified: role === "admin", isLocked: false, createdAt: Date.now() };
      saveUsers(users);
    }
    return ok(config, { token: "mock-token", user: publicUser(users[email]) });
  }
  if (method === "post" && path === "/auth/register") {
    const email = String(body.email || "").toLowerCase();
    const users = loadUsers();
    if (users[email]) return fail(config, 409, "Email đã được sử dụng");
    users[email] = { id: `u_${Date.now()}`, name: body.name || email.split("@")[0], email, phone: body.phone, role: "user", balance: 0, isVerified: false, isLocked: false, createdAt: Date.now() };
    saveUsers(users);
    return ok(config, { message: "ok" });
  }
  if (method === "get" && (path === "/users/me" || path === "/auth/me")) {
    const em = sessionEmail();
    const u = em && loadUsers()[em];
    if (!u) return fail(config, 401, "Chưa đăng nhập");
    return ok(config, { ...u, user: u });
  }

  // --- Ví / nạp tiền ---
  if (method === "post" && path === "/users/me/topup") {
    const em = sessionEmail(); const users = loadUsers(); const u = em && users[em];
    if (!u) return fail(config, 401, "Chưa đăng nhập");
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 10000 || amount > 10000000) return fail(config, 400, "Số tiền nạp phải từ 10.000đ đến 10.000.000đ");
    u.balance = (u.balance || 0) + amount; saveUsers(users);
    addTx({ userEmail: em, userName: u.name, type: "TOPUP", amount, method: body.method || "BANK", balanceAfter: u.balance, note: "Nạp tiền vào ví" });
    return ok(config, { balance: u.balance });
  }
  if (method === "get" && path === "/users/me/transactions") {
    const em = sessionEmail();
    return ok(config, readJSON(TX_KEY, []).filter((t) => t.userEmail === em));
  }
  if (method === "post" && (m = path.match(/^\/payments\/wallet\/([^/]+)$/))) {
    const em = sessionEmail(); const users = loadUsers(); const u = em && users[em];
    const b = db.bookings[m[1]];
    if (!u) return fail(config, 401, "Bạn cần đăng nhập để thanh toán bằng ví");
    if (!b || !b.total) return fail(config, 404, "Không tìm thấy đơn hàng");
    if (b.status === "PAID") return fail(config, 400, "Đơn hàng đã được thanh toán");
    if ((u.balance || 0) < b.total) return fail(config, 402, "Số dư ví không đủ. Vui lòng nạp thêm tiền");
    u.balance -= b.total; saveUsers(users);
    b.status = "PAID"; b.paidMethod = "WALLET"; b.user = b.user || { name: u.name, email: u.email }; save(db);
    addTx({ userEmail: em, userName: u.name, type: "PAYMENT", amount: b.total, method: "WALLET", balanceAfter: u.balance, note: `Thanh toán vé ${b.info?.movieTitle || ""}`.trim() });
    return ok(config, { balance: u.balance });
  }

  // --- Đánh giá của tôi (lấy từ bài đánh giá cộng đồng do chính người dùng viết) ---
  const movieTitle = (id) => moviesData.find((x) => Number(x.id) === Number(id))?.title || `Phim #${id}`;
  if (method === "get" && path === "/users/me/reviews") {
    return ok(config, loadAndPruneCommunityPosts().filter((p) => p.isOwn).map((p) => ({ id: p.id, movieId: p.movieId, movieTitle: movieTitle(p.movieId), rating: p.rating, comment: p.content, createdAt: p.createdAt })));
  }

  // --- Yêu thích ---
  if (method === "get" && path === "/users/me/favorites") {
    return ok(config, readJSON(FAV_KEY, {})[sessionEmail()] || []);
  }
  if (method === "post" && (m = path.match(/^\/users\/me\/favorites\/([^/]+)$/))) {
    const em = sessionEmail(); if (!em) return fail(config, 401, "Chưa đăng nhập");
    const all = readJSON(FAV_KEY, {}); const list = all[em] || [];
    const has = list.some((f) => String(f.movieId) === m[1]);
    all[em] = has ? list.filter((f) => String(f.movieId) !== m[1]) : [...list, { movieId: m[1], title: body.title, poster: body.poster, addedAt: Date.now() }];
    writeJSON(FAV_KEY, all);
    return ok(config, { favorite: !has, total: all[em].length });
  }

  // --- Admin ---
  if (path.startsWith("/admin/") && !/^\/admin\/(movies|combos|stats)/.test(path)) {
    let cur = null; try { cur = JSON.parse(localStorage.getItem("user")); } catch {}
    if (String(cur?.role).toLowerCase() !== "admin") return fail(config, 403, "Chỉ quản trị viên mới có quyền thực hiện");
    const params = config.params || {};

    if (method === "get" && path === "/admin/users") {
      const q = String(params.search || "").toLowerCase();
      return ok(config, Object.values(loadUsers()).filter((u) => !q || [u.name, u.email, u.phone].some((x) => String(x || "").toLowerCase().includes(q))).sort((a, b) => b.createdAt - a.createdAt));
    }
    if (method === "patch" && (m = path.match(/^\/admin\/users\/([^/]+)$/))) {
      const users = loadUsers(); const u = Object.values(users).find((x) => x.id === m[1]);
      if (!u) return fail(config, 404, "Không tìm thấy tài khoản");
      if (u.email === cur.email && body.isLocked) return fail(config, 400, "Không thể tự khoá chính mình");
      Object.assign(u, ["isVerified", "isLocked"].reduce((o, k) => (typeof body[k] === "boolean" ? { ...o, [k]: body[k] } : o), {}));
      saveUsers(users);
      return ok(config, u);
    }
    if (method === "get" && path === "/admin/transactions") {
      const rows = readJSON(TX_KEY, []).filter((t) => !params.type || t.type === params.type).map((t) => ({ ...t, user: { name: t.userName, email: t.userEmail } }));
      return ok(config, rows);
    }
    if (method === "get" && path === "/admin/orders") {
      return ok(config, Object.values(db.bookings).sort((a, b) => b.createdAt - a.createdAt).map((b) => ({
        id: b.id, code: b.code, customer: b.user?.name || "Khách vãng lai", movieTitle: b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
        showtime: b.info ? [b.info.time, b.info.date, b.info.cinemaName].filter(Boolean).join(" · ") : SHOWTIMES[b.showtimeId]?.showtime || "",
        seats: b.seatLabels, total: b.total || b.seatsTotal, status: b.status === "HOLD" ? "PENDING_PAYMENT" : b.status,
      })));
    }
    if (method === "get" && path === "/admin/reviews") {
      return ok(config, loadAndPruneCommunityPosts().map((p) => ({ id: p.id, movieTitle: movieTitle(p.movieId), userName: p.author, rating: p.rating, comment: p.content, createdAt: p.createdAt })));
    }
    if (method === "get" && path === "/admin/favorites") {
      const map = {};
      Object.entries(readJSON(FAV_KEY, {})).forEach(([email, list]) => list.forEach((f) => {
        const x = (map[f.movieId] ||= { movieId: f.movieId, title: f.title, poster: f.poster, count: 0, users: [] });
        x.count += 1; x.users.push(loadUsers()[email]?.name || email);
      }));
      return ok(config, Object.values(map).sort((a, b) => b.count - a.count));
    }
  }
  if (method === "delete" && (m = path.match(/^\/reviews\/([^/]+)$/))) {
    const posts = loadAndPruneCommunityPosts().filter((p) => p.id !== m[1]);
    writeJSON(COMMUNITY_STORAGE_KEY, posts);
    return ok(config, { deleted: true });
  }

  // --- Lịch sử vé ---
  if (method === "get" && path === "/bookings/my") {
    const mine = Object.values(db.bookings).filter((b) => b.status === "PAID").sort((a, b) => b.createdAt - a.createdAt).map(toTicket);
    const sample = { id: "sample", movieTitle: "Phim Demo 0 (vé mẫu)", showtime: "19:00 · 15/11/2026 · Phòng 3", seats: ["F5", "F6"], total: 160000, code: "PTIT-SAMPLE-0001" };
    return ok(config, [...mine, sample]);
  }

  // --- Ghế, combo ---
  if (method === "get" && (m = path.match(/^\/showtimes\/([^/]+)\/seats$/))) {
    return ok(config, buildSeats(m[1], db));
  }
  if (method === "get" && path === "/combos") return ok(config, COMBOS);

  // --- Đặt vé ---
  if (method === "post" && path === "/bookings/hold") {
    const seats = buildSeats(body.showtimeId, db);
    const picked = (body.seatIds || []).map((id) => seats.find((s) => s.id === id));
    if (!picked.length || picked.some((s) => !s || s.status !== "available")) return fail(config, 409, "Ghế vừa có người khác chọn. Hãy chọn lại.");
    const id = `bk_${Date.now()}`;
    let curUser = null;
    try { curUser = JSON.parse(localStorage.getItem("user")); } catch {}
    db.bookings[id] = {
      id, showtimeId: body.showtimeId, seatLabels: picked.map((s) => s.id), seatsTotal: picked.reduce((t, s) => t + s.price, 0),
      info: body.showtimeInfo || null, user: curUser, status: "HOLD", expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), createdAt: Date.now(), code: `PTIT-${id.slice(3)}`,
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
