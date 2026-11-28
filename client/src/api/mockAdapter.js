// Backend giả chạy ngay trong trình duyệt. Dùng khi VITE_USE_MOCK=true hoặc fallback khi chưa bật server.
// Dữ liệu lưu ở localStorage (khoá tv2_mock_db).
import {
  moviesData,
  loadAndPruneCommunityPosts,
  softDeleteCommunityPost
} from "../../../server/src/data/moviesData";
import { getRoomConfig } from "../../../server/src/data/cinemasData";

const DB_KEY = "tv2_mock_db";
const USERS_KEY = "tv2_mock_users";
const TX_KEY = "tv2_mock_tx";
const FAV_KEY = "tv2_mock_favorites";
const SUPPORT_KEY = "tv2_mock_support_tickets_v1";
const RESET_CODES_KEY = "tv2_mock_reset_codes_v1";
const USER_LIST_KEY = "ptit_cine_user_list_status_v1";
const PRICE = { NORMAL: 80000, VIP: 110000, COUPLE: 180000 };
const MAX_SEATS = 8;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export const COUPONS = {
  PTIT10: { code: "PTIT10", label: "Giảm 10% (tối đa 50.000đ)", type: "PERCENT", value: 10, maxDiscount: 50000, minOrder: 0 },
  PTIT20K: { code: "PTIT20K", label: "Giảm trực tiếp 20.000đ", type: "FIXED", value: 20000, minOrder: 80000 },
  SINHVIEN: { code: "SINHVIEN", label: "Ưu đãi SV giảm 15% (tối đa 50.000đ)", type: "PERCENT", value: 15, maxDiscount: 50000, minOrder: 0 },
  GIAM50K: { code: "GIAM50K", label: "Giảm 50.000đ đơn từ 200.000đ", type: "FIXED", value: 50000, minOrder: 200000 },
};

const formatDateDMY = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const tomorrowDMY = () => {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return formatDateDMY(d);
};

const parseShowtimeDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  let isoDate = String(dateStr).trim();
  const dmy = isoDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmy) isoDate = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(`${isoDate}T${String(timeStr).trim()}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const SHOWTIMES = {
  "demo-1": { movieTitle: "Phim Demo 1", showtime: `20:00 · ${tomorrowDMY()} · Phòng 01`, roomName: "Phòng 01 (2D)", date: tomorrowDMY(), time: "20:00" },
  "demo-2": { movieTitle: "Phim Demo 2", showtime: `22:15 · ${tomorrowDMY()} · Phòng 02`, roomName: "Phòng 02 (IMAX)", date: tomorrowDMY(), time: "22:15" },
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

// ---------- Kho người dùng / giao dịch / yêu thích / hỗ trợ giả lập (localStorage) ----------
const readJSON = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const BANK_SAMPLES = [
  { bankName: "MB Bank (Quân Đội)", bankAccount: "0987654321" },
  { bankName: "Vietcombank", bankAccount: "1029384756" },
  { bankName: "Techcombank", bankAccount: "190388992211" },
  { bankName: "BIDV", bankAccount: "45010008899123" },
  { bankName: "VPBank", bankAccount: "686899991234" },
];

const getBankForEmail = (email = "", idx = 0) => {
  const hash = String(email).split("").reduce((s, c) => s + c.charCodeAt(0), idx);
  return BANK_SAMPLES[hash % BANK_SAMPLES.length];
};

const loadUsers = () => {
  const cur = readJSON(USERS_KEY, null);
  if (cur) return cur;
  const seed = {};
  [
    ["Nguyễn Minh Quân", "minhquan@ptit.edu.vn", "0987654321", 250000, true, "MB Bank (Quân Đội)", "0987654321"],
    ["Lê Thu Hà", "thuha.le@gmail.com", "0912345678", 120000, true, "Vietcombank", "1029384756"],
    ["Trần Hoàng Long", "hoanglong99@gmail.com", "0933112233", 0, false, "Techcombank", "190388992211"],
  ].forEach(([name, email, phone, balance, isVerified, bankName, bankAccount], i) => {
    seed[email] = {
      id: `u_seed${i}`,
      name,
      email,
      phone,
      role: "user",
      balance,
      isVerified,
      isLocked: false,
      bankName,
      bankAccount,
      createdAt: Date.now() - i * 86400000
    };
  });
  writeJSON(USERS_KEY, seed);
  return seed;
};
const saveUsers = (u) => writeJSON(USERS_KEY, u);
const sessionEmail = () => { try { return JSON.parse(localStorage.getItem("user"))?.email?.toLowerCase() || null; } catch { return null; } };
const addTx = (tx) => {
  const list = readJSON(TX_KEY, []);
  list.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: "SUCCESS",
    ...tx
  });
  writeJSON(TX_KEY, list);
};
const publicUser = (u) => {
  if (!u) return null;
  const copy = { ...u, id: u.id };
  delete copy.password;
  return copy;
};

const loadSupportTickets = () => {
  const cur = readJSON(SUPPORT_KEY, null);
  if (Array.isArray(cur)) return cur;
  const seed = [
    {
      id: "sup_seed_1",
      category: "dat-ve-nhom",
      categoryLabel: "Đặt vé nhóm",
      customIssue: "",
      detail: "Mình muốn đặt 35 vé xem phim Đào, Phở và Piano cho lớp ĐH CNTT PTIT vào sáng Chủ nhật tuần này, xin báo giá ưu đãi đoàn.",
      email: "minhquan@ptit.edu.vn",
      phone: "0987654321",
      status: "unread",
      isMarked: true,
      adminNote: "Ưu tiên liên hệ báo giá sinh viên PTIT",
      createdAt: Date.now() - 3600 * 1000 * 5
    },
    {
      id: "sup_seed_2",
      category: "nap-tien",
      categoryLabel: "Nạp tiền",
      customIssue: "",
      detail: "Tôi đã chuyển khoản nạp 200.000đ qua MB Bank lúc 19:30 nhưng ví chưa cập nhật số dư.",
      email: "thuha.le@gmail.com",
      phone: "0912345678",
      status: "processing",
      isMarked: false,
      adminNote: "",
      createdAt: Date.now() - 3600 * 1000 * 2
    }
  ];
  writeJSON(SUPPORT_KEY, seed);
  return seed;
};
const saveSupportTickets = (list) => writeJSON(SUPPORT_KEY, list);

const loadFavoritesMap = () => {
  const cur = readJSON(FAV_KEY, null);
  if (cur && typeof cur === "object" && Object.keys(cur).length > 0) return cur;
  const seed = {
    "minhquan@ptit.edu.vn": [
      { movieId: "1", title: "Oppenheimer", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", addedAt: Date.now() - 86400000 * 3 },
      { movieId: "2", title: "Dune: Hành Tinh Cát - Phần Hai", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", addedAt: Date.now() - 86400000 * 2 }
    ],
    "thuha.le@gmail.com": [
      { movieId: "1", title: "Oppenheimer", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", addedAt: Date.now() - 86400000 * 1 },
      { movieId: "22", title: "Đào, Phở và Piano", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80", addedAt: Date.now() - 86400000 * 1 }
    ]
  };
  writeJSON(FAV_KEY, seed);
  return seed;
};

// Tính số người thích cho mỗi movieId trên toàn hệ thống
export const getMovieLikesCountMap = () => {
  const all = loadFavoritesMap();
  const counts = {};
  Object.values(all).forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((f) => {
      const k = String(f.movieId);
      counts[k] = (counts[k] || 0) + 1;
    });
  });
  return counts;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY));
    if (parsed && parsed.bookings && Object.keys(parsed.bookings).length > 0) return parsed;
  } catch {}
  const dTomorrow = tomorrowDMY();
  const dNext2 = formatDateDMY(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  const seedBookings = {
    bk_seed_1: {
      id: "bk_seed_1",
      showtimeId: "demo-1",
      seatLabels: ["B3", "B4"],
      seatsTotal: 160000,
      comboTotal: 69000,
      combos: [{ id: "cb1", name: "Combo 1 (1 bắp + 1 nước)", price: 69000, qty: 1 }],
      total: 229000,
      info: {
        movieTitle: "Oppenheimer",
        cinemaName: "PTIT Cinema Hà Đông",
        roomName: "Phòng 01 (IMAX)",
        date: dTomorrow,
        time: "19:30"
      },
      user: {
        name: "Nguyễn Minh Quân",
        email: "minhquan@ptit.edu.vn",
        phone: "0987654321",
        bankName: "MB Bank (Quân Đội)",
        bankAccount: "0987654321"
      },
      bankName: "MB Bank (Quân Đội)",
      bankAccount: "0987654321",
      paidMethod: "VIETQR",
      status: "PAID",
      createdAt: Date.now() - 86400000 * 2,
      code: "PTIT-VIP-8821"
    },
    bk_seed_2: {
      id: "bk_seed_2",
      showtimeId: "demo-2",
      seatLabels: ["D5", "D6"],
      seatsTotal: 220000,
      comboTotal: 89000,
      combos: [{ id: "cb2", name: "Combo 2 (1 bắp + 2 nước)", price: 89000, qty: 1 }],
      total: 309000,
      info: {
        movieTitle: "Dune: Hành Tinh Cát - Phần Hai",
        cinemaName: "PTIT Cinema Cầu Giấy",
        roomName: "Phòng 02 (2D)",
        date: dNext2,
        time: "20:15"
      },
      user: {
        name: "Lê Thu Hà",
        email: "thuha.le@gmail.com",
        phone: "0912345678",
        bankName: "Vietcombank",
        bankAccount: "1029384756"
      },
      bankName: "Vietcombank",
      bankAccount: "1029384756",
      paidMethod: "WALLET",
      status: "PAID",
      createdAt: Date.now() - 86400000 * 1,
      code: "PTIT-VIP-4509"
    }
  };
  const initDb = { bookings: seedBookings };
  localStorage.setItem(DB_KEY, JSON.stringify(initDb));
  return initDb;
};
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
export const resetMock = () => localStorage.removeItem(DB_KEY);

// Khởi tạo giao dịch nạp tiền mẫu nếu chưa có
const ensureSeedTransactions = () => {
  const cur = readJSON(TX_KEY, null);
  if (Array.isArray(cur) && cur.length > 0) return cur;
  const seed = [
    {
      id: "tx_seed_1",
      userEmail: "minhquan@ptit.edu.vn",
      userName: "Nguyễn Minh Quân",
      type: "TOPUP",
      amount: 250000,
      method: "BANK",
      bankName: "MB Bank (Quân Đội)",
      bankAccount: "0987654321",
      balanceAfter: 250000,
      status: "SUCCESS",
      note: "Nạp tiền vào ví",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: "tx_seed_2",
      userEmail: "thuha.le@gmail.com",
      userName: "Lê Thu Hà",
      type: "TOPUP",
      amount: 429000,
      method: "BANK",
      bankName: "Vietcombank",
      bankAccount: "1029384756",
      balanceAfter: 429000,
      status: "SUCCESS",
      note: "Nạp tiền vào ví",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "tx_seed_3",
      userEmail: "thuha.le@gmail.com",
      userName: "Lê Thu Hà",
      type: "PAYMENT",
      amount: 309000,
      method: "WALLET",
      bankName: "Ví PTIT Cine",
      bankAccount: "WALLET",
      balanceAfter: 120000,
      status: "SUCCESS",
      note: "Thanh toán vé Dune: Hành Tinh Cát - Phần Hai",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ];
  writeJSON(TX_KEY, seed);
  return seed;
};

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

/**
 * Sinh sơ đồ ghế động từ dữ liệu cấu hình phòng (rowCount, seatsPerRow, vipRows, hasCoupleRow)
 */
function buildSeats(showtimeId, db, roomConfig = null) {
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

  const rowCount = Math.min(14, Math.max(3, Number(roomConfig?.rowCount) || 8));
  const seatsPerRow = Math.min(16, Math.max(4, Number(roomConfig?.seatsPerRow) || 10));
  const vipSet = new Set(
    Array.isArray(roomConfig?.vipRows)
      ? roomConfig.vipRows.map((x) => String(x).toUpperCase())
      : ["D", "E"]
  );
  const hasCoupleRow = roomConfig?.hasCoupleRow !== undefined ? Boolean(roomConfig.hasCoupleRow) : true;

  const seats = [];
  for (let rIdx = 0; rIdx < rowCount; rIdx++) {
    const row = String.fromCharCode(65 + rIdx);
    const isLastCouple = hasCoupleRow && rIdx === rowCount - 1;
    if (isLastCouple) {
      const coupleCount = Math.max(1, Math.floor(seatsPerRow / 2));
      for (let n = 1; n <= coupleCount; n++) {
        const label = `${row}${n}`;
        const isSold = paid.has(label);
        const isHold = !isSold && held.has(label);
        const status = isSold ? "sold" : isHold ? "holding" : "available";
        const customer = isSold || isHold ? resolveCustomerForSeat(label, bookingBySeat) : null;
        seats.push({ id: label, row, number: n, type: "COUPLE", status, price: PRICE.COUPLE, customer });
      }
    } else {
      const type = vipSet.has(row) ? "VIP" : "NORMAL";
      for (let n = 1; n <= seatsPerRow; n++) {
        const label = `${row}${n}`;
        const isSold = paid.has(label) || FIXED_SOLD.includes(label);
        const isHold = !isSold && (held.has(label) || FIXED_HOLD.includes(label));
        const status = isSold ? "sold" : isHold ? "holding" : "available";
        const customer = isSold || isHold ? resolveCustomerForSeat(label, bookingBySeat) : null;
        seats.push({ id: label, row, number: n, type, status, price: PRICE[type], customer });
      }
    }
  }
  return seats;
}

const computeCouponLocal = (rawCode, subtotal) => {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { ok: true, couponCode: "", label: "", discountAmount: 0 };
  const c = COUPONS[code];
  if (!c) return { ok: false, error: `Mã giảm giá "${code}" không tồn tại hoặc đã hết hạn` };
  if (subtotal < (c.minOrder || 0)) {
    return { ok: false, error: `Mã ${code} áp dụng cho đơn từ ${c.minOrder.toLocaleString("vi-VN")}đ` };
  }
  const discountAmount =
    c.type === "PERCENT"
      ? Math.min(Math.round((subtotal * c.value) / 100), c.maxDiscount || subtotal)
      : Math.min(c.value, subtotal);
  return { ok: true, couponCode: code, label: c.label, discountAmount };
};

// Thông tin phim/rạp/ngày/giờ lấy từ trang chi tiết phim (b.info), không có thì dùng suất demo
const toTicket = (b) => ({
  id: b.id,
  status: b.status,
  total: b.total,
  seatsTotal: b.seatsTotal || 0,
  comboTotal: b.comboTotal || 0,
  couponCode: b.couponCode || "",
  discountAmount: b.discountAmount || 0,
  combos: b.combos || [],
  code: b.code,
  movieTitle: b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
  date: b.info?.date || SHOWTIMES[b.showtimeId]?.date || "",
  time: b.info?.time || SHOWTIMES[b.showtimeId]?.time || "",
  showtime: b.info
    ? [b.info.time, b.info.date, b.info.cinemaName, b.info.roomName].filter(Boolean).join(" · ")
    : SHOWTIMES[b.showtimeId]?.showtime || "",
  seats: b.seatLabels,
  paymentMethod: b.paidMethod || "VIETQR",
  bankName: b.bankName || b.user?.bankName || getBankForEmail(b.user?.email).bankName,
  bankAccount: b.bankAccount || b.user?.bankAccount || getBankForEmail(b.user?.email).bankAccount,
  createdAt: b.createdAt
});

const ok = (config, data) => Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config, request: {} });
const fail = (config, status, message, extra = {}) =>
  Promise.reject(Object.assign(new Error(message), { isAxiosError: true, config, response: { status, data: { message, ...extra }, headers: {}, config } }));

export default async function mockAdapter(config) {
  await sleep(160);
  const path = config.url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "").split("?")[0];
  const method = (config.method || "get").toLowerCase();
  let body = {};
  try { body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {}; } catch {}
  const db = load();
  ensureSeedTransactions();
  let m;

  // --- Tài khoản & Xác thực ---
  if (method === "post" && path === "/auth/login") {
    const email = String(body.email || "").toLowerCase().trim();
    const users = loadUsers();
    if (users[email]?.isLocked) return fail(config, 403, "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên");
    if (users[email]?.password && body.password && users[email].password !== body.password) {
      return fail(config, 401, "Email hoặc mật khẩu không đúng");
    }
    if (!users[email]) {
      const role = email.startsWith("admin") ? "admin" : "user";
      const sampleBank = getBankForEmail(email);
      users[email] = {
        id: `u_${Date.now()}`,
        name: email.split("@")[0] || "user",
        email,
        role,
        balance: 0,
        isVerified: role === "admin",
        isLocked: false,
        password: body.password || "123456",
        bankName: sampleBank.bankName,
        bankAccount: sampleBank.bankAccount,
        createdAt: Date.now()
      };
      saveUsers(users);
    }
    return ok(config, { token: "mock-token", user: publicUser(users[email]) });
  }

  if (method === "post" && path === "/auth/register") {
    const email = String(body.email || "").toLowerCase().trim();
    const users = loadUsers();
    if (users[email]) return fail(config, 409, "Email đã được sử dụng");
    const sampleBank = getBankForEmail(email);
    users[email] = {
      id: `u_${Date.now()}`,
      name: body.name || email.split("@")[0],
      email,
      phone: body.phone,
      password: body.password || "123456",
      role: "user",
      balance: 0,
      isVerified: false,
      isLocked: false,
      bankName: body.bankName || sampleBank.bankName,
      bankAccount: body.bankAccount || sampleBank.bankAccount,
      createdAt: Date.now()
    };
    saveUsers(users);
    return ok(config, { message: "ok" });
  }

  if (method === "post" && path === "/auth/forgot-password") {
    const email = String(body.email || "").toLowerCase().trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return fail(config, 400, "Vui lòng nhập địa chỉ email hợp lệ");
    }
    const users = loadUsers();
    if (!users[email]) {
      const role = email.startsWith("admin") ? "admin" : "user";
      const sampleBank = getBankForEmail(email);
      users[email] = {
        id: `u_${Date.now()}`,
        name: email.split("@")[0] || "user",
        email,
        role,
        balance: 0,
        isVerified: role === "admin",
        isLocked: false,
        bankName: sampleBank.bankName,
        bankAccount: sampleBank.bankAccount,
        createdAt: Date.now()
      };
      saveUsers(users);
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codes = readJSON(RESET_CODES_KEY, {});
    codes[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };
    writeJSON(RESET_CODES_KEY, codes);
    return ok(config, {
      message: `Mã xác nhận 6 số đã được gửi tới email ${email}`,
      demoCode: code,
      email
    });
  }

  if (method === "post" && path === "/auth/reset-password") {
    const email = String(body.email || "").toLowerCase().trim();
    const code = String(body.code || "").trim();
    const newPassword = String(body.newPassword || "");
    if (!email || !code) return fail(config, 400, "Vui lòng nhập đầy đủ email và mã xác nhận");
    if (newPassword.length < 6) return fail(config, 400, "Mật khẩu mới tối thiểu 6 ký tự");

    const codes = readJSON(RESET_CODES_KEY, {});
    const record = codes[email];
    if (!record || record.code !== code) return fail(config, 400, "Mã xác nhận không chính xác");
    if (Date.now() > record.expiresAt) return fail(config, 400, "Mã xác nhận đã hết hạn, vui lòng yêu cầu mã mới");
    const users = loadUsers();
    if (!users[email]) return fail(config, 404, "Không tìm thấy tài khoản với email này");
    users[email].password = newPassword;
    saveUsers(users);
    delete codes[email];
    writeJSON(RESET_CODES_KEY, codes);
    return ok(config, { message: "Đặt lại mật khẩu thành công!" });
  }

  if (method === "get" && (path === "/users/me" || path === "/auth/me")) {
    const em = sessionEmail();
    const u = em && loadUsers()[em];
    if (!u) return fail(config, 401, "Chưa đăng nhập");
    return ok(config, { ...publicUser(u), user: publicUser(u) });
  }

  if ((method === "patch" || method === "put") && path === "/users/me/profile") {
    const em = sessionEmail();
    const users = loadUsers();
    const u = em && users[em];
    if (!u) return fail(config, 401, "Chưa đăng nhập");
    const newName = String(body.name || "").trim();
    if (!newName) return fail(config, 400, "Họ tên không được để trống");
    u.name = newName;
    if (body.phone !== undefined) u.phone = String(body.phone || "").trim();
    if (body.bankName !== undefined) u.bankName = String(body.bankName || "").trim();
    if (body.bankAccount !== undefined) u.bankAccount = String(body.bankAccount || "").trim();
    saveUsers(users);
    return ok(config, { user: publicUser(u), message: "Đã cập nhật thông tin tài khoản" });
  }

  if (method === "post" && path === "/users/me/change-password") {
    const em = sessionEmail();
    const users = loadUsers();
    const u = em && users[em];
    if (!u) return fail(config, 401, "Chưa đăng nhập");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 6) return fail(config, 400, "Mật khẩu mới tối thiểu 6 ký tự");

    if (body.mode === "code") {
      const code = String(body.code || "").trim();
      const codes = readJSON(RESET_CODES_KEY, {});
      const record = codes[em];
      if (!record || record.code !== code) return fail(config, 400, "Mã xác nhận email không chính xác");
      if (Date.now() > record.expiresAt) return fail(config, 400, "Mã xác nhận đã hết hạn");
      delete codes[em];
      writeJSON(RESET_CODES_KEY, codes);
    } else {
      const oldPassword = String(body.oldPassword || "");
      if (!oldPassword) return fail(config, 400, "Vui lòng nhập mật khẩu cũ");
      if (u.password && u.password !== oldPassword) return fail(config, 400, "Mật khẩu cũ không chính xác");
    }

    u.password = newPassword;
    saveUsers(users);
    return ok(config, { message: "Đổi mật khẩu thành công!" });
  }

  // --- Gửi yêu cầu Hỗ trợ khách hàng ---
  if (method === "post" && path === "/support") {
    const category = String(body.category || "khac").trim();
    const categoryLabel = String(body.categoryLabel || "Khác").trim();
    const customIssue = String(body.customIssue || "").trim();
    const detail = String(body.detail || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();

    if (!detail) return fail(config, 400, "Vui lòng nhập thông tin chi tiết vấn đề cần hỗ trợ");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return fail(config, 400, "Vui lòng nhập email hợp lệ");
    if (!phone) return fail(config, 400, "Vui lòng nhập số điện thoại liên hệ");
    if (category === "khac" && !customIssue) return fail(config, 400, "Vui lòng nhập tên vấn đề cần hỗ trợ");

    const list = loadSupportTickets();
    const ticket = {
      id: `sup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      categoryLabel: category === "khac" ? `Khác: ${customIssue}` : categoryLabel,
      customIssue,
      detail,
      email,
      phone,
      status: "unread",
      isMarked: false,
      adminNote: "",
      createdAt: Date.now()
    };
    list.unshift(ticket);
    saveSupportTickets(list);
    return ok(config, ticket);
  }

  // --- Ví / nạp tiền ---
  if (method === "post" && path === "/users/me/topup") {
    const em = sessionEmail(); const users = loadUsers(); const u = em && users[em];
    if (!u) return fail(config, 401, "Chưa đăng nhập");
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 10000 || amount > 10000000) return fail(config, 400, "Số tiền nạp phải từ 10.000đ đến 10.000.000đ");
    u.balance = (u.balance || 0) + amount;
    if (body.bankName) u.bankName = body.bankName;
    if (body.bankAccount) u.bankAccount = body.bankAccount;
    saveUsers(users);
    const sampleBank = getBankForEmail(em);
    addTx({
      userEmail: em,
      userName: u.name,
      type: "TOPUP",
      amount,
      method: body.method || "BANK",
      bankName: body.bankName || u.bankName || sampleBank.bankName,
      bankAccount: body.bankAccount || u.bankAccount || sampleBank.bankAccount,
      balanceAfter: u.balance,
      note: "Nạp tiền vào ví"
    });
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
    const sampleBank = getBankForEmail(em);
    b.status = "PAID";
    b.paidMethod = "WALLET";
    b.bankName = u.bankName || sampleBank.bankName;
    b.bankAccount = u.bankAccount || sampleBank.bankAccount;
    b.user = b.user || { name: u.name, email: u.email, phone: u.phone, bankName: b.bankName, bankAccount: b.bankAccount };
    save(db);
    addTx({
      userEmail: em,
      userName: u.name,
      type: "PAYMENT",
      amount: b.total,
      method: "WALLET",
      bankName: "Ví PTIT Cine",
      bankAccount: "WALLET",
      balanceAfter: u.balance,
      note: `Thanh toán vé ${b.info?.movieTitle || ""}`.trim()
    });
    return ok(config, { balance: u.balance });
  }

  // --- Đánh giá của tôi ---
  const movieTitle = (id) => moviesData.find((x) => Number(x.id) === Number(id))?.title || `Phim #${id}`;
  if (method === "get" && path === "/users/me/reviews") {
    const em = sessionEmail();
    const u = em && loadUsers()[em];
    return ok(
      config,
      loadAndPruneCommunityPosts()
        .filter((p) => p.isOwn || (u && p.author && p.author.toLowerCase() === u.name?.toLowerCase()))
        .map((p) => ({
          id: p.id,
          movieId: p.movieId,
          movieTitle: movieTitle(p.movieId),
          rating: p.rating,
          comment: p.content,
          createdAt: p.createdAt
        }))
    );
  }

  // --- Yêu thích ---
  if (method === "get" && path === "/users/me/favorites") {
    const all = loadFavoritesMap();
    const counts = getMovieLikesCountMap();
    const myList = (all[sessionEmail()] || []).map((f) => ({
      ...f,
      likesCount: counts[String(f.movieId)] || 1
    }));
    return ok(config, myList);
  }
  if (method === "post" && (m = path.match(/^\/users\/me\/favorites\/([^/]+)$/))) {
    const em = sessionEmail(); if (!em) return fail(config, 401, "Chưa đăng nhập");
    const all = loadFavoritesMap(); const list = all[em] || [];
    const has = list.some((f) => String(f.movieId) === m[1]);
    all[em] = has
      ? list.filter((f) => String(f.movieId) !== m[1])
      : [...list, { movieId: m[1], title: body.title, poster: body.poster, addedAt: Date.now() }];
    writeJSON(FAV_KEY, all);
    const counts = getMovieLikesCountMap();
    return ok(config, { favorite: !has, total: all[em].length, likesCount: counts[String(m[1])] || 0 });
  }

  // --- Admin ---
  if (path.startsWith("/admin/") && !/^\/admin\/(movies|combos)/.test(path)) {
    let cur = null; try { cur = JSON.parse(localStorage.getItem("user")); } catch {}
    if (String(cur?.role).toLowerCase() !== "admin") return fail(config, 403, "Chỉ quản trị viên mới có quyền thực hiện");
    const params = config.params || {};

    if (method === "get" && path === "/admin/users") {
      const q = String(params.search || "").toLowerCase();
      const users = Object.values(loadUsers()).map((u, i) => {
        const sb = getBankForEmail(u.email, i);
        return {
          ...publicUser(u),
          bankName: u.bankName || sb.bankName,
          bankAccount: u.bankAccount || sb.bankAccount
        };
      });
      return ok(
        config,
        users
          .filter((u) => !q || [u.name, u.email, u.phone].some((x) => String(x || "").toLowerCase().includes(q)))
          .sort((a, b) => b.createdAt - a.createdAt)
      );
    }

    if (method === "get" && (m = path.match(/^\/admin\/users\/([^/]+)\/history$/))) {
      const users = loadUsers();
      const targetKey = decodeURIComponent(m[1]);
      const u = Object.values(users).find((x) => String(x.id) === targetKey || String(x.email).toLowerCase() === targetKey.toLowerCase());
      if (!u) return fail(config, 404, "Không tìm thấy tài khoản");
      const sb = getBankForEmail(u.email);
      const userBankName = u.bankName || sb.bankName;
      const userBankAccount = u.bankAccount || sb.bankAccount;

      const userOrders = Object.values(db.bookings)
        .filter((b) => {
          const bEmail = b.user?.email?.toLowerCase();
          const bName = b.user?.name?.toLowerCase();
          return (bEmail && bEmail === u.email.toLowerCase()) || (bName && bName === u.name?.toLowerCase());
        })
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((b) => ({
          id: b.id,
          code: b.code,
          movieTitle: b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
          showtime: b.info
            ? [b.info.time, b.info.date, b.info.cinemaName, b.info.roomName].filter(Boolean).join(" · ")
            : SHOWTIMES[b.showtimeId]?.showtime || "",
          seats: b.seatLabels || [],
          seatsTotal: b.seatsTotal || 0,
          comboTotal: b.comboTotal || 0,
          total: b.total || b.seatsTotal || 0,
          status: b.status === "HOLD" ? "PENDING_PAYMENT" : b.status,
          paymentMethod: b.paidMethod || "VIETQR",
          bankName: b.bankName || b.user?.bankName || userBankName,
          bankAccount: b.bankAccount || b.user?.bankAccount || userBankAccount,
          createdAt: b.createdAt
        }));

      const userTopups = readJSON(TX_KEY, [])
        .filter((t) => t.userEmail?.toLowerCase() === u.email.toLowerCase())
        .map((t) => ({
          ...t,
          bankName: t.bankName || userBankName,
          bankAccount: t.bankAccount || userBankAccount
        }));

      const userReviews = loadAndPruneCommunityPosts()
        .filter(
          (p) =>
            (p.author && u.name && p.author.toLowerCase() === u.name.toLowerCase()) ||
            (p.userEmail && p.userEmail.toLowerCase() === u.email.toLowerCase())
        )
        .map((p) => ({
          id: p.id,
          movieId: p.movieId,
          movieTitle: movieTitle(p.movieId),
          rating: p.rating,
          comment: p.content,
          createdAt: p.createdAt
        }));

      return ok(config, {
        user: { ...publicUser(u), bankName: userBankName, bankAccount: userBankAccount },
        orders: userOrders,
        transactions: userTopups,
        reviews: userReviews
      });
    }

    if (method === "patch" && (m = path.match(/^\/admin\/users\/([^/]+)$/))) {
      const users = loadUsers(); const u = Object.values(users).find((x) => x.id === m[1]);
      if (!u) return fail(config, 404, "Không tìm thấy tài khoản");
      if (u.email === cur.email && body.isLocked) return fail(config, 400, "Không thể tự khoá chính mình");
      Object.assign(u, ["isVerified", "isLocked"].reduce((o, k) => (typeof body[k] === "boolean" ? { ...o, [k]: body[k] } : o), {}));
      saveUsers(users);
      return ok(config, publicUser(u));
    }

    if (method === "get" && path === "/admin/transactions") {
      const rows = readJSON(TX_KEY, [])
        .filter((t) => !params.type || t.type === params.type)
        .map((t) => {
          const sb = getBankForEmail(t.userEmail);
          return {
            ...t,
            bankName: t.bankName || sb.bankName,
            bankAccount: t.bankAccount || sb.bankAccount,
            user: { name: t.userName, email: t.userEmail }
          };
        });
      return ok(config, rows);
    }

    if (method === "get" && path === "/admin/orders") {
      return ok(
        config,
        Object.values(db.bookings)
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((b) => {
            const sb = getBankForEmail(b.user?.email || b.user?.name || "");
            return {
              id: b.id,
              code: b.code,
              customer: b.user?.name || "Khách vãng lai",
              email: b.user?.email || "",
              movieTitle: b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
              showtime: b.info
                ? [b.info.time, b.info.date, b.info.cinemaName, b.info.roomName].filter(Boolean).join(" · ")
                : SHOWTIMES[b.showtimeId]?.showtime || "",
              seats: b.seatLabels,
              seatsTotal: b.seatsTotal || 0,
              comboTotal: b.comboTotal || 0,
              total: b.total || b.seatsTotal,
              paymentMethod: b.paidMethod || "VIETQR",
              bankName: b.bankName || b.user?.bankName || sb.bankName,
              bankAccount: b.bankAccount || b.user?.bankAccount || sb.bankAccount,
              status: b.status === "HOLD" ? "PENDING_PAYMENT" : b.status,
              createdAt: b.createdAt
            };
          })
      );
    }

    if (method === "get" && path === "/admin/reviews") {
      return ok(
        config,
        loadAndPruneCommunityPosts().map((p) => ({
          id: p.id,
          movieTitle: movieTitle(p.movieId),
          userName: p.author,
          rating: p.rating,
          comment: p.content,
          createdAt: p.createdAt
        }))
      );
    }

    if (method === "get" && path === "/admin/favorites") {
      const map = {};
      const allFavs = loadFavoritesMap();
      Object.entries(allFavs).forEach(([email, list]) =>
        (list || []).forEach((f) => {
          const x = (map[f.movieId] ||= { movieId: f.movieId, title: f.title, poster: f.poster, count: 0, users: [] });
          x.count += 1;
          x.users.push(loadUsers()[email]?.name || email);
        })
      );
      return ok(config, Object.values(map).sort((a, b) => b.count - a.count));
    }

    // --- Doanh thu (kèm thống kê theo phim & theo ngày) ---
    if (method === "get" && path === "/admin/revenue") {
      const paidBookings = Object.values(db.bookings).filter((b) => b.status === "PAID");
      const allTxs = readJSON(TX_KEY, []);

      let directTicketRevenue = 0;
      let directComboRevenue = 0;
      let walletSpentTotal = 0;
      let walletTicketSpent = 0;
      let walletComboSpent = 0;
      let totalTicketSalesAll = 0;
      let totalComboSalesAll = 0;

      const byMovieMap = {};
      const byDayMap = {};

      paidBookings.forEach((b) => {
        const seatAmt = Number(b.seatsTotal || b.total || 0);
        const comboAmt = Number(b.comboTotal || 0);
        const orderTotal = Number(b.total || seatAmt + comboAmt);
        const mTitle = b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo";
        const dayKey = new Date(b.createdAt || Date.now()).toISOString().slice(0, 10);
        const seatCount = (b.seatLabels || []).length;

        totalTicketSalesAll += seatAmt;
        totalComboSalesAll += comboAmt;

        if (b.paidMethod === "WALLET") {
          walletSpentTotal += orderTotal;
          walletTicketSpent += seatAmt;
          walletComboSpent += comboAmt;
        } else {
          directTicketRevenue += seatAmt;
          directComboRevenue += comboAmt;
        }

        const mv = (byMovieMap[mTitle] ||= { movieTitle: mTitle, orders: 0, tickets: 0, ticketRevenue: 0, comboRevenue: 0, totalRevenue: 0 });
        mv.orders += 1;
        mv.tickets += seatCount;
        mv.ticketRevenue += seatAmt;
        mv.comboRevenue += comboAmt;
        mv.totalRevenue += orderTotal;

        const dy = (byDayMap[dayKey] ||= { date: dayKey, orders: 0, tickets: 0, ticketRevenue: 0, comboRevenue: 0, totalRevenue: 0 });
        dy.orders += 1;
        dy.tickets += seatCount;
        dy.ticketRevenue += seatAmt;
        dy.comboRevenue += comboAmt;
        dy.totalRevenue += orderTotal;
      });

      const topupTxs = allTxs.filter((t) => t.type === "TOPUP" && t.status !== "FAILED");
      const totalTopupRevenue = topupTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalRevenue = directTicketRevenue + directComboRevenue + totalTopupRevenue;

      const revenueByMovie = Object.values(byMovieMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
      const revenueByDay = Object.values(byDayMap).sort((a, b) => b.date.localeCompare(a.date));

      return ok(config, {
        totalRevenue,
        directTicketRevenue,
        directComboRevenue,
        totalTopupRevenue,
        walletSpentTotal,
        walletTicketSpent,
        walletComboSpent,
        totalTicketSalesAll,
        totalComboSalesAll,
        paidOrdersCount: paidBookings.length,
        topupCount: topupTxs.length,
        revenueByMovie,
        revenueByDay,
        orders: paidBookings
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((b) => ({
            id: b.id,
            code: b.code,
            customer: b.user?.name || "Khách vãng lai",
            movieTitle: b.info?.movieTitle || SHOWTIMES[b.showtimeId]?.movieTitle || "Phim Demo",
            seatsTotal: Number(b.seatsTotal || b.total || 0),
            comboTotal: Number(b.comboTotal || 0),
            total: Number(b.total || 0),
            paidMethod: b.paidMethod || "VIETQR",
            createdAt: b.createdAt
          }))
      });
    }

    // --- Chăm sóc khách hàng ---
    if (method === "get" && path === "/admin/support") {
      const list = loadSupportTickets().sort((a, b) => b.createdAt - a.createdAt);
      return ok(config, list);
    }
    if (method === "patch" && (m = path.match(/^\/admin\/support\/([^/]+)$/))) {
      const list = loadSupportTickets();
      const item = list.find((x) => x.id === m[1]);
      if (!item) return fail(config, 404, "Không tìm thấy thư hỗ trợ");
      if (typeof body.isMarked === "boolean") item.isMarked = body.isMarked;
      if (body.status) item.status = body.status;
      if (body.category) item.category = body.category;
      if (body.categoryLabel) item.categoryLabel = body.categoryLabel;
      if (body.adminNote !== undefined) item.adminNote = body.adminNote;
      saveSupportTickets(list);
      return ok(config, item);
    }
    if (method === "delete" && (m = path.match(/^\/admin\/support\/([^/]+)$/))) {
      const list = loadSupportTickets().filter((x) => x.id !== m[1]);
      saveSupportTickets(list);
      return ok(config, { deleted: true });
    }
  }

  if (method === "delete" && (m = path.match(/^\/reviews\/([^/]+)$/))) {
    softDeleteCommunityPost(m[1]);
    return ok(config, { deleted: true });
  }

  // --- Kiểm tra mã giảm giá ---
  if (method === "post" && path === "/bookings/validate-coupon") {
    const subtotal = Number(body.subtotal || 0);
    const res = computeCouponLocal(body.code, subtotal);
    if (!res.ok) return fail(config, 400, res.error);
    return ok(config, {
      couponCode: res.couponCode,
      label: res.label,
      discountAmount: res.discountAmount,
      finalTotal: Math.max(0, subtotal - res.discountAmount),
    });
  }

  // --- Lịch sử vé ---
  if (method === "get" && path === "/bookings/my") {
    const mine = Object.values(db.bookings)
      .filter((b) => ["PAID", "PENDING_PAYMENT", "CANCELLED"].includes(b.status))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(toTicket);
    return ok(config, mine);
  }

  // --- Huỷ vé (chỉ cho phép trước giờ chiếu ít nhất 2 tiếng) ---
  if (method === "post" && (m = path.match(/^\/bookings\/([^/]+)\/cancel$/))) {
    const b = db.bookings[m[1]];
    if (!b) return fail(config, 404, "Không tìm thấy vé cần huỷ");
    if (b.status === "CANCELLED") return fail(config, 400, "Vé này đã được huỷ trước đó");
    if (!["PAID", "PENDING_PAYMENT", "HOLD"].includes(b.status)) {
      return fail(config, 400, "Không thể huỷ vé ở trạng thái hiện tại");
    }

    const startDate = parseShowtimeDateTime(
      b.info?.date || SHOWTIMES[b.showtimeId]?.date,
      b.info?.time || SHOWTIMES[b.showtimeId]?.time
    );
    if (startDate && startDate.getTime() - Date.now() < TWO_HOURS_MS) {
      return fail(config, 400, "Chỉ được huỷ vé trước giờ chiếu ít nhất 2 tiếng");
    }

    const wasWalletPaid = b.status === "PAID" && b.paidMethod === "WALLET";
    b.status = "CANCELLED";
    save(db);

    let newBalance;
    if (wasWalletPaid) {
      const em = sessionEmail() || b.user?.email?.toLowerCase();
      const users = loadUsers();
      if (em && users[em]) {
        users[em].balance = (users[em].balance || 0) + Number(b.total || 0);
        newBalance = users[em].balance;
        saveUsers(users);
        addTx({
          userEmail: em,
          userName: users[em].name,
          type: "REFUND",
          amount: Number(b.total || 0),
          method: "WALLET",
          bankName: "Ví PTIT Cine",
          bankAccount: "WALLET",
          balanceAfter: users[em].balance,
          note: `Hoàn tiền huỷ vé ${b.info?.movieTitle || ""}`.trim(),
        });
      }
    }

    return ok(config, { id: b.id, status: "CANCELLED", refunded: wasWalletPaid, balance: newBalance });
  }

  // --- Ghế (sinh động theo cấu hình phòng), combo ---
  if (method === "get" && (m = path.match(/^\/showtimes\/([^/]+)\/seats$/))) {
    const p = config.params || {};
    const roomConfig = p.cinemaId ? getRoomConfig(p.cinemaId, p.roomId || p.roomName) : null;
    return ok(config, buildSeats(m[1], db, roomConfig));
  }
  if (method === "get" && path === "/combos") return ok(config, COMBOS);

  // --- Đặt vé (tối đa 8 ghế, trả 409 kèm danh sách ghế trùng) ---
  if (method === "post" && path === "/bookings/hold") {
    const seatIds = [...new Set(body.seatIds || [])];
    if (!seatIds.length) return fail(config, 400, "Vui lòng chọn ít nhất 1 ghế");
    if (seatIds.length > MAX_SEATS) return fail(config, 400, `Chỉ được đặt tối đa ${MAX_SEATS} ghế cho mỗi lần đặt`);

    const info = body.showtimeInfo || {};
    const roomConfig = info.cinemaId ? getRoomConfig(info.cinemaId, info.roomId || info.roomName) : null;
    const seats = buildSeats(body.showtimeId, db, roomConfig);
    const picked = seatIds.map((id) => seats.find((s) => s.id === id));
    const conflictSeats = picked.filter((s) => !s || s.status !== "available").map((s, idx) => s?.id || seatIds[idx]);
    if (conflictSeats.length > 0) {
      return fail(
        config,
        409,
        `Ghế ${conflictSeats.join(", ")} vừa có người khác chọn. Vui lòng chọn ghế khác.`,
        { conflictSeats }
      );
    }

    const id = `bk_${Date.now()}`;
    let curUser = null;
    try { curUser = JSON.parse(localStorage.getItem("user")); } catch {}
    const sb = getBankForEmail(curUser?.email || "");
    db.bookings[id] = {
      id,
      showtimeId: body.showtimeId,
      seatLabels: picked.map((s) => s.id),
      seatsTotal: picked.reduce((t, s) => t + s.price, 0),
      comboTotal: 0,
      couponCode: "",
      discountAmount: 0,
      combos: [],
      info: body.showtimeInfo || null,
      user: curUser ? { ...curUser, bankName: curUser.bankName || sb.bankName, bankAccount: curUser.bankAccount || sb.bankAccount } : null,
      bankName: curUser?.bankName || sb.bankName,
      bankAccount: curUser?.bankAccount || sb.bankAccount,
      status: "HOLD",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      createdAt: Date.now(),
      code: `PTIT-${id.slice(3)}`,
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
    const chosenCombos = (body.combos || []).map((c) => {
      const found = COMBOS.find((x) => x.id === c.id);
      return { id: c.id, name: found?.name || c.id, price: found?.price || 0, qty: Number(c.qty || 0) };
    }).filter((c) => c.qty > 0);
    const comboTotal = chosenCombos.reduce((t, c) => t + c.price * c.qty, 0);
    const subtotal = b.seatsTotal + comboTotal;
    const cRes = computeCouponLocal(body.couponCode, subtotal);
    if (!cRes.ok) return fail(config, 400, cRes.error);

    b.combos = chosenCombos;
    b.comboTotal = comboTotal;
    b.couponCode = cRes.couponCode;
    b.discountAmount = cRes.discountAmount;
    b.total = Math.max(0, subtotal - cRes.discountAmount);
    b.paidAt = Date.now() + 8000;
    save(db);
    return ok(config, {
      qrContent: `PTIT-PAY-${b.id}`,
      subtotal,
      couponCode: b.couponCode,
      discountAmount: b.discountAmount,
      total: b.total,
      seatsTotal: b.seatsTotal,
      comboTotal: b.comboTotal,
    });
  }
  if (method === "get" && (m = path.match(/^\/bookings\/([^/]+)$/))) {
    const b = db.bookings[m[1]];
    if (!b) return fail(config, 404, "Không tìm thấy đơn");
    if (b.status === "HOLD" && b.paidAt && Date.now() >= b.paidAt) {
      b.status = "PAID";
      b.paidMethod = b.paidMethod || "VIETQR";
      save(db);
    }
    return ok(config, toTicket(b));
  }

  return fail(config, 404, `Mock chưa có API: ${method.toUpperCase()} ${path}`);
}
