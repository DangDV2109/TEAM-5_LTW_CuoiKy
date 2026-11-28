/**
 * Dữ liệu thành phố & cụm rạp dùng chung cho cả Backend và Frontend
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

export const citiesData = [
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    cinemas: [
      {
        id: 'hn-hadong',
        name: 'PTIT Cinema Hà Đông',
        address: 'Km10 Nguyễn Trãi, P. Mộ Lao, Q. Hà Đông, Hà Nội'
      },
      {
        id: 'hn-caugiay',
        name: 'PTIT Cinema Cầu Giấy',
        address: '122 Hoàng Quốc Việt, Q. Cầu Giấy, Hà Nội'
      },
      {
        id: 'hn-dongda',
        name: 'PTIT Cinema Ngọc Khánh',
        address: '87 Láng Hạ, Q. Ba Đình / Đống Đa, Hà Nội'
      },
      {
        id: 'hn-hoankiem',
        name: 'PTIT Cinema Hoàn Kiếm',
        address: '45 Hàng Bài, Q. Hoàn Kiếm, Hà Nội'
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
        address: '97 Man Thiện, P. Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh'
      },
      {
        id: 'hcm-quan1',
        name: 'PTIT Cinema Quận 1',
        address: '11 Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP. Hồ Chí Minh'
      },
      {
        id: 'hcm-tanbinh',
        name: 'PTIT Cinema Tân Bình',
        address: '240 Cộng Hòa, Phường 12, Q. Tân Bình, TP. Hồ Chí Minh'
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
        address: '255 Lê Duẩn, Q. Hải Châu, Đà Nẵng'
      },
      {
        id: 'dn-sontra',
        name: 'PTIT Cinema Sơn Trà',
        address: '910 Ngô Quyền, Q. Sơn Trà, Đà Nẵng'
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
        address: '20 Lê Hồng Phong, Q. Ngô Quyền, Hải Phòng'
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
        address: '209 Đường 30/4, Q. Ninh Kiều, Cần Thơ'
      }
    ]
  }
];

export const theatersSeedData = citiesData.flatMap((city) =>
  city.cinemas.map((cinema) => ({
    id: cinema.id,
    name: cinema.name,
    city: city.name,
    cityId: city.id,
    address: cinema.address
  }))
);
