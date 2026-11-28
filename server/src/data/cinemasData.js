/**
 * Dữ liệu thành phố, cụm rạp & phòng chiếu dùng chung cho cả Backend và Frontend
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
  { id: 'r1', name: 'Phòng 01', format: '2D' },
  { id: 'r2', name: 'Phòng 02', format: '2D' },
  { id: 'r3', name: 'Phòng 03', format: '3D' },
  { id: 'r4', name: 'Phòng 04', format: 'IMAX' }
];

const INITIAL_CITIES_DATA = [
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    cinemas: [
      {
        id: 'hn-hadong',
        name: 'PTIT Cinema Hà Đông',
        address: 'Km10 Nguyễn Trãi, P. Mộ Lao, Q. Hà Đông, Hà Nội',
        rooms: [...DEFAULT_ROOMS]
      },
      {
        id: 'hn-caugiay',
        name: 'PTIT Cinema Cầu Giấy',
        address: '122 Hoàng Quốc Việt, Q. Cầu Giấy, Hà Nội',
        rooms: [...DEFAULT_ROOMS]
      },
      {
        id: 'hn-dongda',
        name: 'PTIT Cinema Ngọc Khánh',
        address: '87 Láng Hạ, Q. Ba Đình / Đống Đa, Hà Nội',
        rooms: [...DEFAULT_ROOMS]
      },
      {
        id: 'hn-hoankiem',
        name: 'PTIT Cinema Hoàn Kiếm',
        address: '45 Hàng Bài, Q. Hoàn Kiếm, Hà Nội',
        rooms: [...DEFAULT_ROOMS]
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
        rooms: [...DEFAULT_ROOMS]
      },
      {
        id: 'hcm-quan1',
        name: 'PTIT Cinema Quận 1',
        address: '11 Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP. Hồ Chí Minh',
        rooms: [...DEFAULT_ROOMS]
      },
      {
        id: 'hcm-tanbinh',
        name: 'PTIT Cinema Tân Bình',
        address: '240 Cộng Hòa, Phường 12, Q. Tân Bình, TP. Hồ Chí Minh',
        rooms: [...DEFAULT_ROOMS]
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
        rooms: [...DEFAULT_ROOMS]
      },
      {
        id: 'dn-sontra',
        name: 'PTIT Cinema Sơn Trà',
        address: '910 Ngô Quyền, Q. Sơn Trà, Đà Nẵng',
        rooms: [...DEFAULT_ROOMS]
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
        rooms: [...DEFAULT_ROOMS]
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
        rooms: [...DEFAULT_ROOMS]
      }
    ]
  }
];

export const CINEMAS_STORAGE_KEY = 'ptit_cine_cities_cinemas_v1';

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
      rooms: Array.isArray(cinema.rooms) && cinema.rooms.length > 0 ? cinema.rooms : [...DEFAULT_ROOMS]
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
            rooms: Array.isArray(cin.rooms) && cin.rooms.length > 0 ? cin.rooms : [...DEFAULT_ROOMS]
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
      ? rooms
      : [
          { id: `rm_${Date.now()}_1`, name: 'Phòng 01', format: '2D' },
          { id: `rm_${Date.now()}_2`, name: 'Phòng 02', format: '3D' }
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
 * Thêm phòng chiếu mới vào một rạp
 */
export const addRoomToCinema = (cinemaId, { name, format = '2D' }) => {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  for (const city of citiesData) {
    const cinema = city.cinemas.find((c) => c.id === cinemaId);
    if (cinema) {
      if (!Array.isArray(cinema.rooms)) cinema.rooms = [...DEFAULT_ROOMS];
      const newRoom = {
        id: `rm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        name: cleanName,
        format: String(format || '2D').toUpperCase()
      };
      cinema.rooms.push(newRoom);
      persistAndNotifyCinemas();
      return newRoom;
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
