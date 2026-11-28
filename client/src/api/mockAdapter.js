// Backend giả chạy ngay trong trình duyệt. Dùng khi VITE_USE_MOCK=true hoặc fallback khi chưa bật server.
// Dữ liệu lưu ở localStorage (khoá tv2_mock_db).
const DB_KEY = "tv2_mock_db";
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
    const role = email.toLowerCase().startsWith("admin") ? "admin" : "user"; // email bắt đầu bằng "admin" => Admin
    return ok(config, { token: "mock-token", user: { id: "u1", name, email, role } });
  }
  if (method === "post" && path === "/auth/register") return ok(config, { message: "ok" });
  if (method === "get" && (path === "/users/me" || path === "/auth/me")) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return fail(config, 401, "Chưa đăng nhập");
      return ok(config, { ...user, user });
    } catch {
      return fail(config, 401, "Chưa đăng nhập");
    }
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
