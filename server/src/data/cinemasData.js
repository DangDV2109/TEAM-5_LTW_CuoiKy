/**
 * Dữ liệu thành phố, cụm rạp, phòng chiếu (số hàng, số ghế mỗi hàng, hàng VIP)
 * và lịch suất chiếu theo phòng (kiểm tra chống chồng giờ) dùng chung cho Backend và Frontend
 */
export const removeVietnameseTones = (str = '') => {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

export const DEFAULT_ROOMS = [
  { id: 'r1', name: 'Phòng 01', format: '2D', rowCount: 8, seatsPerRow: 10, vipRows: ['D', 'E'], hasCoupleRow: true },
  { id: 'r2', name: 'Phòng 02', format: '2D', rowCount: 8, seatsPerRow: 10, vipRows: ['D', 'E'], hasCoupleRow: true },
  { id: 'r3', name: 'Phòng 03', format: '3D', rowCount: 7, seatsPerRow: 10, vipRows: ['D', 'E'], hasCoupleRow: false },
  { id: 'r4', name: 'Phòng 04', format: 'IMAX', rowCount: 9, seatsPerRow: 12, vipRows: ['E', 'F', 'G'], hasCoupleRow: true }
];

const cloneDefaultRooms = () => DEFAULT_ROOMS.map((r) => ({ ...r, vipRows: [...r.vipRows] }));

export const normalizeRoom = (r = {}, idx = 0) => {
  const rowCount = Math.min(14, Math.max(3, Number(r.rowCount) || 8));
  const seatsPerRow = Math.min(16, Math.max(4, Number(r.seatsPerRow) || 10));
  const rawVip = Array.isArray(r.vipRows)
    ? r.vipRows
    : typeof r.vipRows === 'string'
      ? r.vipRows.split(/[\s,;]+/)
      : ['D', 'E'];
  const validRows = Array.from({ length: rowCount }, (_, i) => String.fromCharCode(65 + i));
  const vipRows = [...new Set(rawVip.map((x) => String(x || '').trim().toUpperCase()).filter((x) => validRows.includes(x)))];
  return {
    id: r.id || `rm_${Date.now()}_${idx}`,
    name: String(r.name || `Phòng 0${idx + 1}`).trim(),
    format: String(r.format || '2D').toUpperCase(),
    rowCount,
    seatsPerRow,
    vipRows,
    hasCoupleRow: r.hasCoupleRow !== undefined ? Boolean(r.hasCoupleRow) : rowCount >= 8,
  };
};

const INITIAL_CITIES_DATA = [
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    cinemas: [
      {
        id: 'hn-hadong',
        name: 'PTIT Cinema Hà Đông',
        address: 'Km10 Nguyễn Trãi, P. Mộ Lao, Q. Hà Đông, Hà Nội',
        rooms: cloneDefaultRooms()
      },
      {
        id: 'hn-caugiay',
        name: 'PTIT Cinema Cầu Giấy',
        address: '122 Hoàng Quốc Việt, Q. Cầu Giấy, Hà Nội',
        rooms: cloneDefaultRooms()
      },
      {
        id: 'hn-dongda',
        name: 'PTIT Cinema Ngọc Khánh',
        address: '87 Láng Hạ, Q. Ba Đình / Đống Đa, Hà Nội',
        rooms: cloneDefaultRooms()
      },
      {
        id: 'hn-hoankiem',
        name: 'PTIT Cinema Hoàn Kiếm',
        address: '45 Hàng Bài, Q. Hoàn Kiếm, Hà Nội',
        rooms: cloneDefaultRooms()
      }
    ]
  },
  {
    id: 'tp-hcm',
    name: 'TP. Hồ Chí Minh',
    cinemas: [
      {
        id: 'hcm-quan9',
        name: 'PTIT Cinema Quận 9 (Thủ Đức)',
        address: '97 Man Thiện, P. Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
        rooms: cloneDefaultRooms()
      },
      {
        id: 'hcm-quan1',
        name: 'PTIT Cinema Quận 1',
        address: '11 Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP. Hồ Chí Minh',
        rooms: cloneDefaultRooms()
      },
      {
        id: 'hcm-tanbinh',
        name: 'PTIT Cinema Tân Bình',
        address: '240 Cộng Hòa, Phường 12, Q. Tân Bình, TP. Hồ Chí Minh',
        rooms: cloneDefaultRooms()
      }
    ]
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    cinemas: [
      {
        id: 'dn-haichau',
        name: 'PTIT Cinema Hải Châu',
        address: '255 Lê Duẩn, Q. Hải Châu, Đà Nẵng',
        rooms: cloneDefaultRooms()
      },
      {
        id: 'dn-sontra',
        name: 'PTIT Cinema Sơn Trà',
        address: '910 Ngô Quyền, Q. Sơn Trà, Đà Nẵng',
        rooms: cloneDefaultRooms()
      }
    ]
  },
  {
    id: 'hai-phong',
    name: 'Hải Phòng',
    cinemas: [
      {
        id: 'hp-ngoquyen',
        name: 'PTIT Cinema Lê Hồng Phong',
        address: '20 Lê Hồng Phong, Q. Ngô Quyền, Hải Phòng',
        rooms: cloneDefaultRooms()
      }
    ]
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    cinemas: [
      {
        id: 'ct-ninhkieu',
        name: 'PTIT Cinema Ninh Kiều',
        address: '209 Đường 30/4, Q. Ninh Kiều, Cần Thơ',
        rooms: cloneDefaultRooms()
      }
    ]
  }
];

export const CINEMAS_STORAGE_KEY = 'ptit_cine_cities_cinemas_v1';
export const ROOM_SHOWTIMES_KEY = 'ptit_cine_room_showtimes_v1';

const hasBrowserStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const citiesData = JSON.parse(JSON.stringify(INITIAL_CITIES_DATA));

export const theatersSeedData = [];

const syncTheatersSeedData = () => {
  const flat = citiesData.flatMap((city) =>
    (city.cinemas || []).map((cinema) => ({
      id: cinema.id,
      name: cinema.name,
      city: city.name,
      cityId: city.id,
      address: cinema.address,
      rooms:
        Array.isArray(cinema.rooms) && cinema.rooms.length > 0
          ? cinema.rooms.map((r, i) => normalizeRoom(r, i))
          : cloneDefaultRooms()
    }))
  );
  theatersSeedData.splice(0, theatersSeedData.length, ...flat);
};

const loadStoredCitiesData = () => {
  if (!hasBrowserStorage()) {
    syncTheatersSeedData();
    return;
  }
  try {
    const raw = localStorage.getItem(CINEMAS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map((city) => ({
          ...city,
          cinemas: (city.cinemas || []).map((cin) => ({
            ...cin,
            rooms:
              Array.isArray(cin.rooms) && cin.rooms.length > 0
                ? cin.rooms.map((r, i) => normalizeRoom(r, i))
                : cloneDefaultRooms()
          }))
        }));
        citiesData.splice(0, citiesData.length, ...normalized);
      }
    }
  } catch {
    // ignore storage errors
  }
  syncTheatersSeedData();
};

loadStoredCitiesData();

const cinemaListeners = new Set();
export const subscribeCinemasChange = (fn) => {
  cinemaListeners.add(fn);
  return () => cinemaListeners.delete(fn);
};

const persistAndNotifyCinemas = () => {
  syncTheatersSeedData();
  if (hasBrowserStorage()) {
    try {
      localStorage.setItem(CINEMAS_STORAGE_KEY, JSON.stringify(citiesData));
    } catch {
      // ignore
    }
  }
  cinemaListeners.forEach((fn) => fn(citiesData));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ptit-cinemas-updated', { detail: citiesData }));
  }
};

export const getAllCinemaIds = () =>
  citiesData.flatMap((city) => (city.cinemas || []).map((c) => c.id));

export const getCinemaById = (cinemaId) => {
  for (const city of citiesData) {
    const found = (city.cinemas || []).find((c) => c.id === cinemaId);
    if (found) return { ...found, cityId: city.id, cityName: city.name };
  }
  return null;
};

export const getRoomConfig = (cinemaId, roomIdOrName) => {
  const cin = getCinemaById(cinemaId);
  if (!cin || !Array.isArray(cin.rooms)) return null;
  const target = String(roomIdOrName || '').toLowerCase();
  const found =
    cin.rooms.find((r) => String(r.id).toLowerCase() === target) ||
    cin.rooms.find((r) => target.includes(String(r.name).toLowerCase()));
  return found ? normalizeRoom(found) : null;
};

/**
 * Thêm rạp mới vào một thành phố (hoặc tạo thành phố mới nếu chưa có)
 */
export const addCinemaToCity = ({ cityId, cityName, name, address, rooms }) => {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  const cleanAddress = String(address || '').trim() || 'Đang cập nhật địa chỉ';

  let targetCity = citiesData.find((c) => c.id === cityId);
  if (!targetCity && cityName) {
    const slug = removeVietnameseTones(cityName).replace(/[^a-z0-9]+/g, '-') || `city-${Date.now()}`;
    targetCity = citiesData.find((c) => c.id === slug);
    if (!targetCity) {
      targetCity = { id: slug, name: String(cityName).trim(), cinemas: [] };
      citiesData.push(targetCity);
    }
  }
  if (!targetCity) targetCity = citiesData[0];

  const cinemaSlug = `${targetCity.id}-${removeVietnameseTones(cleanName).replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-4)}`;
  const initialRooms =
    Array.isArray(rooms) && rooms.length > 0
      ? rooms.map((r, i) => normalizeRoom(r, i))
      : [
          normalizeRoom({ id: `rm_${Date.now()}_1`, name: 'Phòng 01', format: '2D', rowCount: 8, seatsPerRow: 10, vipRows: ['D', 'E'] }, 0),
          normalizeRoom({ id: `rm_${Date.now()}_2`, name: 'Phòng 02', format: '3D', rowCount: 7, seatsPerRow: 10, vipRows: ['D', 'E'], hasCoupleRow: false }, 1)
        ];

  const newCinema = {
    id: cinemaSlug,
    name: cleanName,
    address: cleanAddress,
    rooms: initialRooms
  };
  targetCity.cinemas.push(newCinema);
  persistAndNotifyCinemas();
  return newCinema;
};

/**
 * Xoá một rạp khỏi danh sách
 */
export const removeCinemaById = (cinemaId) => {
  let removed = false;
  citiesData.forEach((city) => {
    const before = city.cinemas.length;
    city.cinemas = city.cinemas.filter((c) => c.id !== cinemaId);
    if (city.cinemas.length !== before) removed = true;
  });
  if (removed) persistAndNotifyCinemas();
  return removed;
};

/**
 * Thêm phòng chiếu mới vào một rạp (hỗ trợ số hàng, số ghế mỗi hàng, hàng VIP)
 */
export const addRoomToCinema = (cinemaId, { name, format = '2D', rowCount = 8, seatsPerRow = 10, vipRows = ['D', 'E'], hasCoupleRow }) => {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  for (const city of citiesData) {
    const cinema = city.cinemas.find((c) => c.id === cinemaId);
    if (cinema) {
      if (!Array.isArray(cinema.rooms)) cinema.rooms = cloneDefaultRooms();
      const newRoom = normalizeRoom({
        id: `rm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        name: cleanName,
        format,
        rowCount,
        seatsPerRow,
        vipRows,
        hasCoupleRow: hasCoupleRow !== undefined ? hasCoupleRow : false,
      });
      cinema.rooms.push(newRoom);
      persistAndNotifyCinemas();
      return newRoom;
    }
  }
  return null;
};

/**
 * Cập nhật cấu hình phòng chiếu (số hàng, số ghế mỗi hàng, hàng VIP)
 */
export const updateRoomInCinema = (cinemaId, roomId, patch) => {
  for (const city of citiesData) {
    const cinema = city.cinemas.find((c) => c.id === cinemaId);
    if (cinema && Array.isArray(cinema.rooms)) {
      const idx = cinema.rooms.findIndex((r) => r.id === roomId);
      if (idx !== -1) {
        cinema.rooms[idx] = normalizeRoom({ ...cinema.rooms[idx], ...patch, id: roomId });
        persistAndNotifyCinemas();
        return cinema.rooms[idx];
      }
    }
  }
  return null;
};

/**
 * Xoá một phòng chiếu khỏi rạp
 */
export const removeRoomFromCinema = (cinemaId, roomId) => {
  for (const city of citiesData) {
    const cinema = city.cinemas.find((c) => c.id === cinemaId);
    if (cinema && Array.isArray(cinema.rooms)) {
      cinema.rooms = cinema.rooms.filter((r) => r.id !== roomId);
      persistAndNotifyCinemas();
      return true;
    }
  }
  return false;
};

/* =====================================================================
   QUẢN LÝ SUẤT CHIẾU THEO PHÒNG & KIỂM TRA CHỐNG CHỒNG GIỜ CHIẾU
   ===================================================================== */
export const parseTimeToMinutes = (timeStr = '') => {
  const m = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
};

export const formatMinutesToTime = (totalMinutes) => {
  const safe = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(safe / 60)).padStart(2, '0');
  const mm = String(safe % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

export const parseDurationMinutes = (duration) => {
  if (typeof duration === 'number' && duration > 0) return duration;
  const m = String(duration || '').match(/\d+/);
  return m ? Math.max(30, Number(m[0])) : 120;
};

export const loadRoomShowtimes = () => {
  if (!hasBrowserStorage()) return [];
  try {
    const raw = localStorage.getItem(ROOM_SHOWTIMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const todayStr = `${dd}-${mm}-${yyyy}`;
  const seed = [
    {
      id: 'rst_seed_1',
      cinemaId: 'hn-hadong',
      cinemaName: 'PTIT Cinema Hà Đông',
      roomId: 'r1',
      roomName: 'Phòng 01',
      format: '2D',
      movieId: 1,
      movieTitle: 'Oppenheimer',
      durationMinutes: 180,
      date: todayStr,
      time: '09:00',
      endTime: '12:00',
    },
    {
      id: 'rst_seed_2',
      cinemaId: 'hn-hadong',
      cinemaName: 'PTIT Cinema Hà Đông',
      roomId: 'r1',
      roomName: 'Phòng 01',
      format: '2D',
      movieId: 2,
      movieTitle: 'Dune: Hành Tinh Cát - Phần Hai',
      durationMinutes: 166,
      date: todayStr,
      time: '13:00',
      endTime: '15:46',
    },
  ];
  try {
    localStorage.setItem(ROOM_SHOWTIMES_KEY, JSON.stringify(seed));
  } catch {}
  return seed;
};

export const saveRoomShowtimes = (list) => {
  if (!hasBrowserStorage()) return;
  try {
    localStorage.setItem(ROOM_SHOWTIMES_KEY, JSON.stringify(list));
  } catch {}
};

/**
 * Tạo suất chiếu mới cho 1 phòng — chặn tuyệt đối nếu bị chồng giờ với suất khác trong cùng phòng & cùng ngày
 */
export const addRoomShowtimeChecked = ({
  cinemaId,
  cinemaName,
  roomId,
  roomName,
  format = '2D',
  movieId,
  movieTitle,
  duration,
  date,
  time,
}) => {
  const startMin = parseTimeToMinutes(time);
  if (startMin === null) {
    return { ok: false, error: 'Giờ chiếu không hợp lệ (định dạng HH:mm, VD: 19:30)' };
  }
  const durationMinutes = parseDurationMinutes(duration);
  const endMin = startMin + durationMinutes;
  const list = loadRoomShowtimes();

  const conflict = list.find((st) => {
    if (st.cinemaId !== cinemaId) return false;
    if (st.date !== date) return false;
    const sameRoom = (st.roomId && roomId && st.roomId === roomId) || st.roomName === roomName;
    if (!sameRoom) return false;
    const s1 = parseTimeToMinutes(st.time);
    const e1 = s1 !== null ? s1 + parseDurationMinutes(st.durationMinutes) : null;
    if (s1 === null || e1 === null) return false;
    return startMin < e1 && s1 < endMin;
  });

  if (conflict) {
    return {
      ok: false,
      error: `Không thể tạo suất chiếu bị chồng giờ! ${roomName} (${cinemaName}) ngày ${date} đã có phim "${conflict.movieTitle}" chiếu từ ${conflict.time} đến ${conflict.endTime}.`,
    };
  }

  const created = {
    id: `rst_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    cinemaId,
    cinemaName,
    roomId,
    roomName,
    format,
    movieId: Number(movieId),
    movieTitle,
    durationMinutes,
    date,
    time: formatMinutesToTime(startMin),
    endTime: formatMinutesToTime(endMin),
  };
  const next = [created, ...list];
  saveRoomShowtimes(next);
  return { ok: true, showtime: created, list: next };
};

export const removeRoomShowtimeById = (showtimeId) => {
  const next = loadRoomShowtimes().filter((s) => s.id !== showtimeId);
  saveRoomShowtimes(next);
  return next;
};
