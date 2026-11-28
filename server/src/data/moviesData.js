/**
 * Danh sách dữ liệu phim gốc dùng chung cho cả Frontend và Backend (Seed MongoDB)
 */
import { getAllCinemaIds, subscribeCinemasChange } from './cinemasData.js';

const ALL_CINEMA_IDS = [
  'hn-hadong',
  'hn-caugiay',
  'hn-dongda',
  'hn-hoankiem',
  'hcm-quan9',
  'hcm-quan1',
  'hcm-tanbinh',
  'dn-haichau',
  'dn-sontra',
  'hp-ngoquyen',
  'ct-ninhkieu'
];

const DEFAULT_SCREENINGS = ['09:30', '12:15', '15:00', '18:30', '21:15'];

export const moviesData = [
  {
    id: 1,
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    year: 2023,
    status: 'now',
    rating: 9.2,
    releaseDate: '21/07/2023',
    duration: '180 phút',
    genre: 'Tiểu sử, Lịch sử, Chính kịch',
    origin: 'Mỹ, Anh',
    format: 'IMAX',
    ageRating: 'T16 - Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/uYPbbksJxIg/maxresdefault.jpg',
    description:
      'Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer cùng vai trò giám đốc Phòng thí nghiệm Los Alamos trong Dự án Manhattan, dẫn đến việc chế tạo vũ khí hạt nhân đầu tiên trong Thế chiến thứ hai.',
    tags: ['#hot', '#schedule', '#blockbuster', '#history'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['09:00', '12:30', '16:00', '19:30', '22:15']
  },
  {
    id: 2,
    title: 'Dune: Hành Tinh Cát - Phần Hai',
    originalTitle: 'Dune: Part Two',
    year: 2024,
    status: 'now',
    rating: 9.0,
    releaseDate: '01/03/2024',
    duration: '166 phút',
    genre: 'Khoa học viễn tưởng, Hành động, Phiêu lưu',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/Way9Dexny3w/maxresdefault.jpg',
    description:
      'Paul Atreides hợp nhất với Chani và người Fremen trong hành trình báo thù những kẻ đã hủy hoại gia tộc mình, đồng thời đứng trước lựa chọn giữa tình yêu của cuộc đời và số phận của vũ trụ.',
    tags: ['#hot', '#schedule', '#blockbuster', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['10:00', '13:30', '17:00', '20:15', '22:45']
  },
  {
    id: 3,
    title: 'Những Mảnh Ghép Cảm Xúc 2',
    originalTitle: 'Inside Out 2',
    year: 2024,
    status: 'now',
    rating: 8.6,
    releaseDate: '14/06/2024',
    duration: '96 phút',
    genre: 'Hoạt hình, Gia đình, Hài hước',
    origin: 'Mỹ',
    format: '3D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Kelsey Mann',
    cast: 'Amy Poehler, Maya Hawke, Kensington Tallman',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/LEjhY15eCx0/maxresdefault.jpg',
    description:
      'Bước vào tuổi dậy thì, trung tâm đầu não của cô bé Riley bất ngờ đón nhận sự xuất hiện của hàng loạt cảm xúc mới như Lo Âu, Ganh Tị, Chán Nản và Xấu Hổ.',
    tags: ['#hot', '#schedule'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['09:15', '11:30', '14:15', '17:30', '20:00']
  },
  {
    id: 4,
    title: 'Deadpool & Wolverine',
    originalTitle: 'Deadpool & Wolverine',
    year: 2024,
    status: 'now',
    rating: 8.5,
    releaseDate: '26/07/2024',
    duration: '128 phút',
    genre: 'Hành động, Hài hước, Siêu anh hùng',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Shawn Levy',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/73_1biulkYk/maxresdefault.jpg',
    description:
      'Wade Wilson buộc phải rời bỏ cuộc sống yên bình khi Tổ chức Phương sai Thời gian (TVA) kéo anh vào nhiệm vụ giải cứu đa vũ trụ cùng một Wolverine bất đắc dĩ.',
    tags: ['#hot', '#schedule', '#action', '#blockbuster'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['10:30', '13:45', '16:30', '19:45', '22:30']
  },
  {
    id: 5,
    title: 'Kẻ Trộm Mặt Trăng 4',
    originalTitle: 'Despicable Me 4',
    year: 2024,
    status: 'now',
    rating: 8.1,
    releaseDate: '05/07/2024',
    duration: '95 phút',
    genre: 'Hoạt hình, Hài hước, Gia đình',
    origin: 'Mỹ',
    format: '3D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Chris Renaud',
    cast: 'Steve Carell, Kristen Wiig, Will Ferrell',
    trailerUrl: 'https://www.youtube.com/watch?v=qQlr9-rF32A',
    poster: 'https://image.tmdb.org/t/p/w500/wWba3TaojhK7NdycRhoQpsG0FaH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/lgkPzcOSnTvjeMnuFzozRO5HHw1.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/qQlr9-rF32A/maxresdefault.jpg',
    description:
      'Gia đình Gru chào đón thành viên mới Gru Jr. nhưng nhanh chóng phải di chuyển đến nơi ẩn náu an toàn khi ác nhân Maxime Le Mal vượt ngục để tìm cách trả thù.',
    tags: ['#schedule'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 6,
    title: 'Godzilla x Kong: Đế Chế Mới',
    originalTitle: 'Godzilla x Kong: The New Empire',
    year: 2024,
    status: 'now',
    rating: 8.3,
    releaseDate: '29/03/2024',
    duration: '115 phút',
    genre: 'Hành động, Viễn tưởng, Phiêu lưu',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'Adam Wingard',
    cast: 'Rebecca Hall, Brian Tyree Henry, Dan Stevens',
    trailerUrl: 'https://www.youtube.com/watch?v=lV1OOlGwExM',
    poster: 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/veIyxxi5Gs8gvztLEW1Ysb8rrzs.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/lV1OOlGwExM/maxresdefault.jpg',
    description:
      'Hai siêu thú cổ đại Godzilla và Kong buộc phải gác lại hiềm khích để cùng chống lại một mối đe dọa khổng lồ ẩn sâu trong Trái Đất Rỗng.',
    tags: ['#schedule', '#action', '#blockbuster'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['10:15', '13:00', '16:15', '19:00', '21:45']
  },
  {
    id: 7,
    title: 'Kung Fu Panda 4',
    originalTitle: 'Kung Fu Panda 4',
    year: 2024,
    status: 'now',
    rating: 8.0,
    releaseDate: '08/03/2024',
    duration: '94 phút',
    genre: 'Hoạt hình, Hành động, Hài hước',
    origin: 'Mỹ',
    format: '2D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Mike Mitchell',
    cast: 'Jack Black, Awkwafina, Viola Davis, Dustin Hoffman',
    trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    poster: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/_inKs4eeHiI/maxresdefault.jpg',
    description:
      'Gấu trúc Po chuẩn bị trở thành Thủ lĩnh Tinh thần của Thung lũng Bình Yên và phải tìm kiếm truyền nhân Thần Long Đại Hiệp trước âm mưu của Tắc Kè Hoa.',
    tags: ['#schedule'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 8,
    title: 'Hành Tinh Khỉ: Vương Quốc Mới',
    originalTitle: 'Kingdom of the Planet of the Apes',
    year: 2024,
    status: 'now',
    rating: 8.2,
    releaseDate: '10/05/2024',
    duration: '145 phút',
    genre: 'Khoa học viễn tưởng, Hành động, Phiêu lưu',
    origin: 'Mỹ',
    format: '2D',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'Wes Ball',
    cast: 'Owen Teague, Freya Allan, Kevin Durand',
    trailerUrl: 'https://www.youtube.com/watch?v=XtFI7SNtVpY',
    poster: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/fqv8v6AycXKsivp1T5yKtLbGXce.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/XtFI7SNtVpY/maxresdefault.jpg',
    description:
      'Nhiều thế hệ sau thời đại của Caesar, chú khỉ trẻ Noa bước vào một cuộc hành trình định mệnh cùng cô gái loài người Mae để định hình tương lai cho cả hai giống loài.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 9,
    title: 'Quái Vật Không Gian: Romulus',
    originalTitle: 'Alien: Romulus',
    year: 2024,
    status: 'now',
    rating: 8.4,
    releaseDate: '16/08/2024',
    duration: '119 phút',
    genre: 'Kinh dị, Khoa học viễn tưởng',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Fede Álvarez',
    cast: 'Cailee Spaeny, David Jonsson, Archie Renaux',
    trailerUrl: 'https://www.youtube.com/watch?v=OzY2r2JXsDM',
    poster: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/OzY2r2JXsDM/maxresdefault.jpg',
    description:
      'Trong lúc lục lọi một trạm vũ trụ bỏ hoang, một nhóm người trẻ tuổi phải đối mặt với dạng sống đáng sợ và tàn bạo nhất trong vũ trụ.',
    tags: ['#schedule'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['11:00', '14:30', '18:00', '20:45', '23:00']
  },
  {
    id: 10,
    title: 'Furiosa: Câu Chuyện Từ Max Điên',
    originalTitle: 'Furiosa: A Mad Max Saga',
    year: 2024,
    status: 'now',
    rating: 8.5,
    releaseDate: '24/05/2024',
    duration: '148 phút',
    genre: 'Hành động, Phiêu lưu, Viễn tưởng',
    origin: 'Úc, Mỹ',
    format: 'IMAX',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'George Miller',
    cast: 'Anya Taylor-Joy, Chris Hemsworth, Tom Burke',
    trailerUrl: 'https://www.youtube.com/watch?v=XJMuhwVlca4',
    poster: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/wNAhuOZ3Zf84jCIlrcI6JhgmY5q.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/XJMuhwVlca4/maxresdefault.jpg',
    description:
      'Bị bắt cóc khỏi Vùng Xanh của Nhiều Bà Mẹ, Furiosa trẻ tuổi rơi vào tay băng đảng mô tô của Lãnh chúa Dementus và phải chiến đấu để tìm đường trở về nhà.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 11,
    title: 'Vùng Đất Câm Lặng: Ngày Đầu Tiên',
    originalTitle: 'A Quiet Place: Day One',
    year: 2024,
    status: 'now',
    rating: 7.9,
    releaseDate: '28/06/2024',
    duration: '99 phút',
    genre: 'Kinh dị, Khoa học viễn tưởng, Giật gân',
    origin: 'Mỹ',
    format: '2D',
    ageRating: 'T16 - Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên',
    director: 'Michael Sarnoski',
    cast: 'Lupita Nyong\'o, Joseph Quinn, Alex Wolff',
    trailerUrl: 'https://www.youtube.com/watch?v=YPY7J-flzE8',
    poster: 'https://image.tmdb.org/t/p/w500/hU42CRk14JuPEdqZG3AWmagiPAP.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/2RVcJbWFmICRDsVxRI8F5xRmRsK.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/YPY7J-flzE8/maxresdefault.jpg',
    description:
      'Trải nghiệm ngày đầu tiên thế giới chìm vào im lặng khi những sinh vật ngoài hành tinh săn mồi bằng âm thanh đổ bộ xuống thành phố New York sầm uất.',
    tags: ['#schedule'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 12,
    title: 'Kẻ Thế Thân',
    originalTitle: 'The Fall Guy',
    year: 2024,
    status: 'now',
    rating: 8.1,
    releaseDate: '03/05/2024',
    duration: '126 phút',
    genre: 'Hành động, Hài hước, Lãng mạn',
    origin: 'Mỹ',
    format: '2D',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'David Leitch',
    cast: 'Ryan Gosling, Emily Blunt, Aaron Taylor-Johnson',
    trailerUrl: 'https://www.youtube.com/watch?v=EySdVK0NK1Y',
    poster: 'https://image.tmdb.org/t/p/w500/tSz1qsmSJon0rqjHBxXZmrotuse.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/H5HjE7Xb9N09rbWn1zBfxgI8uz.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/EySdVK0NK1Y/maxresdefault.jpg',
    description:
      'Chàng diễn viên đóng thế Colt Seavers phải truy tìm ngôi sao điện ảnh đang mất tích để cứu bộ phim đầu tay của người yêu cũ và giành lại trái tim cô.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 13,
    title: 'Những Gã Trai Hư: Chơi Hay Bị Xơi',
    originalTitle: 'Bad Boys: Ride or Die',
    year: 2024,
    status: 'now',
    rating: 8.0,
    releaseDate: '07/06/2024',
    duration: '115 phút',
    genre: 'Hành động, Hài hước, Tội phạm',
    origin: 'Mỹ',
    format: '2D',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Adil El Arbi, Bilall Fallah',
    cast: 'Will Smith, Martin Lawrence, Vanessa Hudgens',
    trailerUrl: 'https://www.youtube.com/watch?v=hRFY_Fesa9Q',
    poster: 'https://image.tmdb.org/t/p/w500/oGythE98MYleE6mZlGs5oBGkux1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/ga4OLm4qLxPqKLMzjJlqHxVjst3.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/hRFY_Fesa9Q/maxresdefault.jpg',
    description:
      'Bộ đôi cảnh sát Miami Mike Lowrey và Marcus Burnett buộc phải vừa chạy trốn vừa điều tra để minh oan cho người đội trưởng quá cố.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 14,
    title: 'Lốc Xoáy Tử Thần',
    originalTitle: 'Twisters',
    year: 2024,
    status: 'now',
    rating: 7.8,
    releaseDate: '19/07/2024',
    duration: '122 phút',
    genre: 'Hành động, Phiêu lưu, Giật gân',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'Lee Isaac Chung',
    cast: 'Daisy Edgar-Jones, Glen Powell, Anthony Ramos',
    trailerUrl: 'https://www.youtube.com/watch?v=wdok0rZdmx4',
    poster: 'https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/58D6ZAvOKxlHjyX9S8qNKSBE9Y.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/wdok0rZdmx4/maxresdefault.jpg',
    description:
      'Hai nhóm săn bão với phong cách trái ngược nhau cùng đối mặt với những cơn lốc xoáy dữ dội chưa từng có tại miền trung Oklahoma.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 15,
    title: 'Robot Hoang Dã',
    originalTitle: 'The Wild Robot',
    year: 2024,
    status: 'now',
    rating: 9.1,
    releaseDate: '27/09/2024',
    duration: '102 phút',
    genre: 'Hoạt hình, Khoa học viễn tưởng, Gia đình',
    origin: 'Mỹ',
    format: '3D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Chris Sanders',
    cast: 'Lupita Nyong\'o, Pedro Pascal, Kit Connor',
    trailerUrl: 'https://www.youtube.com/watch?v=67vbA5ZJdKQ',
    poster: 'https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/417tYZ4XUyJrtyZXj7HpvWf1E8f.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/67vbA5ZJdKQ/maxresdefault.jpg',
    description:
      'Cô người máy ROZZUM 7134 (Roz) bị đắm tàu trên một hòn đảo hoang vắng và phải học cách thích nghi với thiên nhiên cũng như nuôi dưỡng một chú ngỗng con mồ côi.',
    tags: ['#hot', '#schedule'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 16,
    title: 'Transformers Một',
    originalTitle: 'Transformers One',
    year: 2024,
    status: 'now',
    rating: 8.4,
    releaseDate: '20/09/2024',
    duration: '104 phút',
    genre: 'Hoạt hình, Hành động, Viễn tưởng',
    origin: 'Mỹ',
    format: '3D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Josh Cooley',
    cast: 'Chris Hemsworth, Brian Tyree Henry, Scarlett Johansson',
    trailerUrl: 'https://www.youtube.com/watch?v=u2NuUWuwPCM',
    poster: 'https://image.tmdb.org/t/p/w500/iRCgqpdVE4wyLQvGYU3ZP7pAtUc.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/Asg2UUwipAdE87MxtJy7SQo08XI.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/u2NuUWuwPCM/maxresdefault.jpg',
    description:
      'Câu chuyện nguồn gốc chưa từng kể trên hành tinh Cybertron về Optimus Prime và Megatron: từ hai người anh em chí cốt trở thành kẻ thù truyền kiếp.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 17,
    title: 'Võ Sĩ Giác Đấu II',
    originalTitle: 'Gladiator II',
    year: 2024,
    status: 'coming',
    rating: 8.7,
    releaseDate: '22/11/2024',
    duration: '148 phút',
    genre: 'Hành động, Lịch sử, Chính kịch',
    origin: 'Mỹ, Anh',
    format: 'IMAX',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Ridley Scott',
    cast: 'Paul Mescal, Pedro Pascal, Denzel Washington',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/4rgYUipGJNo/maxresdefault.jpg',
    description:
      'Nhiều năm sau cái chết của Maximus, Lucius buộc phải bước vào Đấu trường La Mã và chiến đấu để trả lại vinh quang cho người dân Rome.',
    tags: ['#schedule', '#blockbuster', '#action', '#history'],
    cinemas: ALL_CINEMA_IDS,
    screenings: []
  },
  {
    id: 18,
    title: 'Hành Trình CỦA Moana 2',
    originalTitle: 'Moana 2',
    year: 2024,
    status: 'coming',
    rating: 8.3,
    releaseDate: '29/11/2024',
    duration: '100 phút',
    genre: 'Hoạt hình, Phiêu lưu, Gia đình',
    origin: 'Mỹ',
    format: '3D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'David Derrick Jr.',
    cast: 'Auli\'i Cravalho, Dwayne Johnson',
    trailerUrl: 'https://www.youtube.com/watch?v=hDZ7y8RP5HE',
    poster: 'https://image.tmdb.org/t/p/w500/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/hDZ7y8RP5HE/maxresdefault.jpg',
    description:
      'Sau khi nhận được tiếng gọi bất ngờ từ tổ tiên, Moana cùng á thần Maui lên đường tới những vùng biển xa xôi và nguy hiểm của châu Đại Dương.',
    tags: ['#schedule', '#blockbuster'],
    cinemas: ALL_CINEMA_IDS,
    screenings: []
  },
  {
    id: 19,
    title: 'Mufasa: Vua Sư Tử',
    originalTitle: 'Mufasa: The Lion King',
    year: 2024,
    status: 'coming',
    rating: 8.5,
    releaseDate: '20/12/2024',
    duration: '118 phút',
    genre: 'Phiêu lưu, Gia đình, Nhạc kịch',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Barry Jenkins',
    cast: 'Aaron Pierre, Kelvin Harrison Jr., Donald Glover',
    trailerUrl: 'https://www.youtube.com/watch?v=o17MF9vnabg',
    poster: 'https://image.tmdb.org/t/p/w500/lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/oHPoF0Gzu8xwK4CtdXDaWdcuZxZ.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/o17MF9vnabg/maxresdefault.jpg',
    description:
      'Rafiki kể lại truyền thuyết về sự trỗi dậy của vị vua vĩ đại Mufasa từ một chú sư tử con mồ côi lạc lối cho đến khi gặp gỡ người anh em Taka.',
    tags: ['#schedule', '#blockbuster'],
    cinemas: ALL_CINEMA_IDS,
    screenings: []
  },
  {
    id: 20,
    title: 'Nhím Sonic 3',
    originalTitle: 'Sonic the Hedgehog 3',
    year: 2024,
    status: 'coming',
    rating: 8.4,
    releaseDate: '27/12/2024',
    duration: '110 phút',
    genre: 'Hành động, Phiêu lưu, Gia đình',
    origin: 'Mỹ, Nhật Bản',
    format: '2D',
    ageRating: 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: 'Jeff Fowler',
    cast: 'Ben Schwartz, Keanu Reeves, Jim Carrey, Idris Elba',
    trailerUrl: 'https://www.youtube.com/watch?v=qSu6i2iFMO0',
    poster: 'https://image.tmdb.org/t/p/w500/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/qSu6i2iFMO0/maxresdefault.jpg',
    description:
      'Sonic, Knuckles và Tails tái hợp để đối đầu với một kẻ thù mới đầy bí ẩn mang sức mạnh vượt trội: Shadow the Hedgehog.',
    tags: ['#schedule', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: []
  },
  {
    id: 21,
    title: 'Captain America: Thế Giới Mới',
    originalTitle: 'Captain America: Brave New World',
    year: 2025,
    status: 'coming',
    rating: 8.2,
    releaseDate: '14/02/2025',
    duration: '135 phút',
    genre: 'Hành động, Khoa học viễn tưởng, Siêu anh hùng',
    origin: 'Mỹ',
    format: 'IMAX',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'Julius Onah',
    cast: 'Anthony Mackie, Harrison Ford, Giancarlo Esposito',
    trailerUrl: 'https://www.youtube.com/watch?v=1pHDWnXmK7Y',
    poster: 'https://image.tmdb.org/t/p/w500/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/8eifdha9GQeZAkexgtD45546XKx.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg',
    description:
      'Sau cuộc gặp với tân Tổng thống Hoa Kỳ Thaddeus Ross, Sam Wilson rơi vào tâm điểm của một âm mưu quốc tế nguy hiểm.',
    tags: ['#schedule', '#blockbuster', '#action'],
    cinemas: ALL_CINEMA_IDS,
    screenings: []
  },
  {
    id: 22,
    title: 'Đào, Phở và Piano',
    originalTitle: 'Đào, Phở và Piano',
    year: 2024,
    status: 'now',
    rating: 8.9,
    releaseDate: '10/02/2024',
    duration: '100 phút',
    genre: 'Lịch sử, Chiến tranh, Lãng mạn',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'T13 - Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên',
    director: 'Phi Tiến Sơn',
    cast: 'Doãn Quốc Đam, Cao Thị Thùy Linh, NSƯT Trần Lực, NSND Trung Hiếu',
    trailerUrl: 'https://www.youtube.com/watch?v=M0nKT4sZ5rY',
    poster: 'https://upload.wikimedia.org/wikipedia/vi/2/29/%C4%90%C3%A0o%2C_ph%E1%BB%9F_v%C3%A0_piano.jpg',
    backdrop: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    description:
      'Lấy bối cảnh trận chiến Đông Xuân 60 ngày đêm bảo vệ Thủ đô Hà Nội cuối năm 1946 - đầu năm 1947, phim khắc họa tình yêu nồng nàn giữa chàng chiến sĩ tự vệ và cô tiểu thư Hà thành.',
    tags: ['#hot', '#schedule', '#vietnam', '#history', '#war'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['09:00', '11:30', '14:30', '18:00', '20:30']
  },
  {
    id: 23,
    title: 'Mai',
    originalTitle: 'Mai',
    year: 2024,
    status: 'now',
    rating: 8.5,
    releaseDate: '10/02/2024',
    duration: '131 phút',
    genre: 'Tâm lý, Tình cảm, Gia đình',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Trấn Thành',
    cast: 'Phương Anh Đào, Tuấn Trần, Hồng Đào, NSND Việt Anh',
    trailerUrl: 'https://www.youtube.com/watch?v=EX6clvId19s',
    poster: 'https://image.tmdb.org/t/p/w500/bfd02kL9TCF02KM5L4HVbK3G4Ox.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/uUiIGztTrfDhPdAFJpr6m4UBMAd.jpg',
    youtubeThumbnail: 'https://img.youtube.com/vi/EX6clvId19s/maxresdefault.jpg',
    description:
      'Câu chuyện về Mai - một người phụ nữ làm nghề massage gần 40 tuổi với quá khứ nhiều tổn thương, bất ngờ gặp gỡ Dương - chàng trai đào hoa đem lòng yêu cô tha thiết.',
    tags: ['#schedule', '#vietnam'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 24,
    title: 'Lật Mặt 7: Một Điều Ước',
    originalTitle: 'Face Off 7: One Wish',
    year: 2024,
    status: 'now',
    rating: 8.8,
    releaseDate: '26/04/2024',
    duration: '138 phút',
    genre: 'Gia đình, Tâm lý, Chính kịch',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'K - Phim được phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ',
    director: 'Lý Hải',
    cast: 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung, Quách Ngọc Tuyên',
    trailerUrl: 'https://www.youtube.com/watch?v=d1ZHdosjNX8',
    poster: 'https://image.tmdb.org/t/p/w500/k9rP52LU2G6232vG2G3E6p8p0xM.jpg',
    backdrop: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail: 'https://img.youtube.com/vi/d1ZHdosjNX8/maxresdefault.jpg',
    description:
      'Bà Hai 73 tuổi sống một mình tại vùng cao Lâm Đồng không may gặp tai nạn gãy chân. Năm người con trưởng thành ở khắp mọi miền đất nước đứng trước câu hỏi ai sẽ là người chăm sóc mẹ.',
    tags: ['#hot', '#schedule', '#vietnam'],
    cinemas: ALL_CINEMA_IDS,
    screenings: ['09:45', '12:45', '15:45', '19:15', '21:45']
  },
  {
    id: 25,
    title: 'Kẻ Ăn Hồn',
    originalTitle: 'The Soul Reaper',
    year: 2023,
    status: 'now',
    rating: 7.9,
    releaseDate: '15/12/2023',
    duration: '109 phút',
    genre: 'Kinh dị, Bí ẩn, Cổ trang',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Trần Hữu Tấn',
    cast: 'Hoàng Hà, Võ Điền Gia Huy, Huỳnh Thanh Trực, NSƯT Chiều Xuân',
    trailerUrl: 'https://www.youtube.com/watch?v=xWh0g4rM8nI',
    poster: 'https://image.tmdb.org/t/p/w500/7dFZJ2ZJJdcmkp05B9NWlqTJ5tq.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail: 'https://img.youtube.com/vi/xWh0g4rM8nI/maxresdefault.jpg',
    description:
      'Hàng loạt cái chết bí ẩn diễn ra tại Làng Địa Ngục gắn liền với cổ thuật luyện rượu sọ người đòi hỏi 5 mạng sống tương ứng với 5 yếu tố ngũ hành.',
    tags: ['#schedule', '#vietnam'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 26,
    title: 'Ngày Xưa Có Một Chuyện Tình',
    originalTitle: 'Once Upon a Love Story',
    year: 2024,
    status: 'now',
    rating: 8.4,
    releaseDate: '01/11/2024',
    duration: '135 phút',
    genre: 'Lãng mạn, Tâm lý',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'T16 - Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên',
    director: 'Trịnh Đình Lê Minh',
    cast: 'Avin Lu, Ngọc Xuân, Đỗ Nhật Hoàng',
    trailerUrl: 'https://www.youtube.com/watch?v=q2Y7f2L6v7U',
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    description:
      'Chuyển thể từ truyện dài của nhà văn Nguyễn Nhật Ánh, xoay quanh tình bạn và tình yêu tuổi học trò trong trẻo nhưng đầy trắc trở giữa Vinh, Miền và Phúc tại một thị trấn miền Trung.',
    tags: ['#schedule', '#vietnam'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 27,
    title: 'Cám',
    originalTitle: 'Cám',
    year: 2024,
    status: 'now',
    rating: 7.7,
    releaseDate: '20/09/2024',
    duration: '122 phút',
    genre: 'Kinh dị, Cổ trang',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên',
    director: 'Trần Hữu Tấn',
    cast: 'Lâm Thanh Mỹ, Rima Thanh Vy, Quốc Cường, Thúy Diễm',
    trailerUrl: 'https://www.youtube.com/watch?v=8rE1_k3B2yA',
    poster: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    description:
      'Dị bản kinh dị đẫm máu lấy cảm hứng từ truyện cổ tích Tấm Cám nổi tiếng của Việt Nam, phơi bày những bí mật đen tối trong gia tộc Lý trưởng.',
    tags: ['#schedule', '#vietnam'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  },
  {
    id: 28,
    title: 'Làm Giàu Với Ma',
    originalTitle: 'Betting with Ghost',
    year: 2024,
    status: 'now',
    rating: 8.0,
    releaseDate: '30/08/2024',
    duration: '112 phút',
    genre: 'Hài hước, Tâm linh, Gia đình',
    origin: 'Việt Nam',
    format: '2D',
    ageRating: 'T16 - Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên',
    director: 'Nguyễn Nhật Trung',
    cast: 'Tuấn Trần, Diệp Bảo Ngọc, NSƯT Hoài Linh, Lê Giang',
    trailerUrl: 'https://www.youtube.com/watch?v=9xS9L9P9o3k',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
    description:
      'Lanh - cậu con trai ham chơi vô tình nhìn thấy một hồn ma nữ và lập giao kèo giúp hồn ma tìm con để đổi lấy cơ hội kiếm tiền trả nợ cho cha.',
    tags: ['#schedule', '#vietnam'],
    cinemas: ALL_CINEMA_IDS,
    screenings: DEFAULT_SCREENINGS
  }
];

const MOVIES_OVERRIDE_KEY = 'ptit_cine_movies_overrides_v1';
const MOVIES_CUSTOM_LIST_KEY = 'ptit_cine_movies_custom_v1';
const MOVIES_DELETED_IDS_KEY = 'ptit_cine_movies_deleted_v1';
export const COMMUNITY_STORAGE_KEY = 'ptit_cine_community_posts_v1';
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const hasBrowserStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Đọc dữ liệu chỉnh sửa phim, phim thêm mới và phim đã xóa của Admin từ localStorage
 */
const loadMovieOverrides = () => {
  if (!hasBrowserStorage()) return {};
  try {
    const raw = localStorage.getItem(MOVIES_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const loadCustomMovies = () => {
  if (!hasBrowserStorage()) return [];
  try {
    const raw = localStorage.getItem(MOVIES_CUSTOM_LIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadDeletedMovieIds = () => {
  if (!hasBrowserStorage()) return [];
  try {
    const raw = localStorage.getItem(MOVIES_DELETED_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
};

const applyOverridesToMovies = () => {
  const overrides = loadMovieOverrides();
  const customMovies = loadCustomMovies();
  const deletedSet = new Set(loadDeletedMovieIds());
  const allDynamicCinemaIds = getAllCinemaIds();

  // Xóa các phim đã bị Admin xóa
  for (let i = moviesData.length - 1; i >= 0; i--) {
    if (deletedSet.has(Number(moviesData[i].id))) {
      moviesData.splice(i, 1);
    }
  }

  // Thêm các phim mới do Admin tạo nếu chưa có trong moviesData
  customMovies.forEach((cm) => {
    if (!deletedSet.has(Number(cm.id)) && !moviesData.some((m) => Number(m.id) === Number(cm.id))) {
      moviesData.push(cm);
    }
  });

  moviesData.forEach((movie, idx) => {
    const patch = overrides[movie.id];
    const merged = patch ? { ...movie, ...patch } : { ...movie };
    // Nếu chưa có override danh sách rạp riêng thì tự động bao gồm cả các rạp mới thêm
    if (!patch || !Array.isArray(patch.cinemas)) {
      const curSet = new Set(Array.isArray(merged.cinemas) ? merged.cinemas : []);
      allDynamicCinemaIds.forEach((cid) => curSet.add(cid));
      merged.cinemas = Array.from(curSet);
    }
    moviesData[idx] = merged;
  });
  return moviesData;
};

applyOverridesToMovies();

/**
 * Danh sách callback để thông báo khi Admin chỉnh sửa thông tin phim
 */
const listeners = new Set();
export const subscribeMoviesChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const notifyMoviesChanged = (payload = null) => {
  listeners.forEach((fn) => fn(payload));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ptit-movies-updated', { detail: payload }));
  }
};

// Khi Admin thêm rạp mới, tự động gắn rạp đó vào các phim đang chiếu để đặt vé thấy ngay rạp đó
subscribeCinemasChange(() => {
  const allIds = getAllCinemaIds();
  moviesData.forEach((m) => {
    if (!Array.isArray(m.cinemas)) m.cinemas = [...allIds];
    else {
      allIds.forEach((id) => {
        if (!m.cinemas.includes(id)) m.cinemas.push(id);
      });
    }
  });
  notifyMoviesChanged();
});

/**
 * Cập nhật thông tin một bộ phim (dành cho Admin) và lưu vào localStorage
 */
export const updateMovieById = (movieId, patch) => {
  const numericId = Number(movieId);
  const idx = moviesData.findIndex((m) => Number(m.id) === numericId);
  if (idx === -1) return null;

  const updatedMovie = {
    ...moviesData[idx],
    ...patch,
    id: numericId
  };
  moviesData[idx] = updatedMovie;

  if (hasBrowserStorage()) {
    try {
      const overrides = loadMovieOverrides();
      overrides[numericId] = updatedMovie;
      localStorage.setItem(MOVIES_OVERRIDE_KEY, JSON.stringify(overrides));
    } catch {
      // ignore storage errors
    }
  }

  notifyMoviesChanged(updatedMovie);
  return updatedMovie;
};

/**
 * Thêm một bộ phim mới vào CSDL phim (dành cho Admin)
 */
export const addMovieToDb = (movieInput = {}) => {
  const maxId = moviesData.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0);
  const nextId = maxId + 1;
  const allCinemas = getAllCinemaIds();
  const newMovie = {
    id: nextId,
    title: String(movieInput.title || `Phim Mới #${nextId}`).trim(),
    originalTitle: String(movieInput.originalTitle || movieInput.title || `New Movie #${nextId}`).trim(),
    year: Number(movieInput.year) || new Date().getFullYear(),
    status: movieInput.status || 'now',
    rating: Number(movieInput.rating ?? 8.5),
    releaseDate: movieInput.releaseDate || '01/12/2026',
    duration: movieInput.duration || '120 phút',
    genre: movieInput.genre || 'Hành động, Phiêu lưu',
    origin: movieInput.origin || 'Việt Nam',
    format: movieInput.format || '2D',
    ageRating: movieInput.ageRating || 'P - Phim được phổ biến đến người xem mọi độ tuổi',
    director: movieInput.director || 'Đang cập nhật',
    cast: movieInput.cast || 'Đang cập nhật',
    trailerUrl: movieInput.trailerUrl || '',
    poster:
      movieInput.poster ||
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    backdrop:
      movieInput.backdrop ||
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    youtubeThumbnail:
      movieInput.youtubeThumbnail ||
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    description:
      movieInput.description ||
      'Tác phẩm điện ảnh hấp dẫn được công chiếu tại hệ thống rạp PTIT Cine trên toàn quốc.',
    tags: Array.isArray(movieInput.tags) && movieInput.tags.length > 0 ? movieInput.tags : ['#schedule'],
    cinemas: Array.isArray(movieInput.cinemas) && movieInput.cinemas.length > 0 ? movieInput.cinemas : allCinemas,
    screenings:
      Array.isArray(movieInput.screenings) && movieInput.screenings.length > 0
        ? movieInput.screenings
        : [...DEFAULT_SCREENINGS]
  };

  moviesData.unshift(newMovie);

  if (hasBrowserStorage()) {
    try {
      const custom = loadCustomMovies();
      custom.push(newMovie);
      localStorage.setItem(MOVIES_CUSTOM_LIST_KEY, JSON.stringify(custom));
    } catch {
      // ignore
    }
  }

  notifyMoviesChanged(newMovie);
  return newMovie;
};

/**
 * Xóa một bộ phim khỏi CSDL phim (dành cho Admin)
 */
export const deleteMovieById = (movieId) => {
  const numericId = Number(movieId);
  const idx = moviesData.findIndex((m) => Number(m.id) === numericId);
  if (idx === -1) return false;
  const [removed] = moviesData.splice(idx, 1);

  if (hasBrowserStorage()) {
    try {
      const deleted = new Set(loadDeletedMovieIds());
      deleted.add(numericId);
      localStorage.setItem(MOVIES_DELETED_IDS_KEY, JSON.stringify(Array.from(deleted)));

      const custom = loadCustomMovies().filter((m) => Number(m.id) !== numericId);
      localStorage.setItem(MOVIES_CUSTOM_LIST_KEY, JSON.stringify(custom));
    } catch {
      // ignore
    }
  }

  notifyMoviesChanged(removed);
  return true;
};

/**
 * Tạo dữ liệu bài đánh giá mẫu ban đầu cho trang Cộng đồng
 */
export const createSeedCommunityPosts = () => {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      author: 'Nguyễn Minh Quân',
      avatarColor: '#ED1C24',
      movieId: 1,
      rating: 10,
      content:
        'Oppenheimer thực sự là một kiệt tác điện ảnh của đạo diễn Christopher Nolan! Âm thanh trong phòng chiếu cực kỳ sống động, phân cảnh thử nghiệm Trinity khiến cả rạp nín thở.',
      createdAt: now - 1 * 24 * 60 * 60 * 1000,
      likes: 42,
      dislikes: 1,
      userReaction: null,
      deletedAt: null,
      expiredAt: null,
      replies: [
        {
          id: 'rep-101',
          author: 'Trần Thu Hà',
          avatarColor: '#2563eb',
          content: 'Đồng ý luôn bạn ơi, nhạc nền của Ludwig Göransson nổi da gà thật sự!',
          createdAt: now - 20 * 60 * 60 * 1000,
          likes: 11,
          dislikes: 0,
          userReaction: null,
          deletedAt: null,
          expiredAt: null
        }
      ]
    },
    {
      id: 'seed-2',
      author: 'Lê Hoàng Nam',
      avatarColor: '#16a34a',
      movieId: 22,
      rating: 9,
      content:
        'Đào, Phở và Piano mang lại cảm xúc rất tự hào và xúc động về tinh thần người Hà Nội mùa đông năm 1946. Bối cảnh chiến lũy và âm nhạc cổ điển kết hợp rất ấn tượng.',
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
      likes: 35,
      dislikes: 0,
      userReaction: null,
      deletedAt: null,
      expiredAt: null,
      replies: []
    },
    {
      id: 'seed-3',
      author: 'Phạm Khánh Linh',
      avatarColor: '#9333ea',
      movieId: 24,
      rating: 9,
      content:
        'Lật Mặt 7: Một Điều Ước là bộ phim gia đình ấm áp nhất năm nay. Đi xem cùng bố mẹ mà cả nhà đều rưng rưng nước mắt ở đoạn cuối.',
      createdAt: now - 3 * 24 * 60 * 60 * 1000,
      likes: 28,
      dislikes: 2,
      userReaction: null,
      deletedAt: null,
      expiredAt: null,
      replies: []
    }
  ];
};

/**
 * Chuẩn hóa trạng thái hết hạn (7 ngày kể từ khi tạo) và xóa vĩnh viễn sau 7 ngày tiếp theo
 * - Khi bình luận bị xóa (deletedAt) hoặc hết hạn 7 ngày (expiredAt = createdAt + 7 ngày):
 *   dữ liệu vẫn tồn tại ở backend/storage trong 7 ngày tiếp theo.
 * - Sau 7 ngày kể từ thời điểm bị xóa (now - deletedAt >= 7 ngày) hoặc từ thời điểm hết hạn (now - expiredAt >= 7 ngày, tức 14 ngày từ createdAt),
 *   mọi dữ liệu về bình luận đó được xóa vĩnh viễn.
 */
export const processRetentionForItems = (items = [], now = Date.now()) => {
  if (!Array.isArray(items)) return { allRecords: [], visibleRecords: [] };

  const allRecords = [];
  const visibleRecords = [];

  for (const item of items) {
    if (!item || typeof item.createdAt !== 'number') continue;

    const age = now - item.createdAt;
    const expiredAt =
      item.expiredAt || (age >= SEVEN_DAYS_MS ? item.createdAt + SEVEN_DAYS_MS : null);
    const deletedAt = item.deletedAt || null;

    // Kiểm tra đã quá 7 ngày kể từ khi bị xóa hoặc quá 7 ngày kể từ khi hết hạn chưa
    const purgeDueToDelete = deletedAt && now - deletedAt >= SEVEN_DAYS_MS;
    const purgeDueToExpire = expiredAt && now - expiredAt >= SEVEN_DAYS_MS;

    if (purgeDueToDelete || purgeDueToExpire) {
      // Tự động xóa vĩnh viễn mọi dữ liệu của bình luận này sau 7 ngày tiếp
      continue;
    }

    // Xử lý tương tự cho các phản hồi con (replies)
    let allReplies = [];
    let visibleReplies = [];
    if (Array.isArray(item.replies)) {
      const processedReplies = processRetentionForItems(item.replies, now);
      allReplies = processedReplies.allRecords;
      visibleReplies = processedReplies.visibleRecords;
    }

    const updatedRecord = {
      ...item,
      deletedAt,
      expiredAt,
      ...(Array.isArray(item.replies) ? { replies: allReplies } : {})
    };
    allRecords.push(updatedRecord);

    // Chỉ hiển thị trên UI những bình luận chưa bị xóa và chưa hết hạn 7 ngày
    if (!deletedAt && !expiredAt) {
      visibleRecords.push({
        ...updatedRecord,
        ...(Array.isArray(item.replies) ? { replies: visibleReplies } : {})
      });
    }
  }

  return { allRecords, visibleRecords };
};

/**
 * Đọc toàn bộ dữ liệu bài đánh giá (bao gồm cả bài đã xóa mềm / hết hạn đang chờ đủ 7 ngày để xóa vĩnh viễn)
 */
export const loadAllCommunityPostsWithRetention = () => {
  if (!hasBrowserStorage()) {
    const seeds = createSeedCommunityPosts();
    return { allRecords: seeds, visibleRecords: seeds };
  }
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    const now = Date.now();
    if (!raw) {
      const seeds = createSeedCommunityPosts();
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(seeds));
      return { allRecords: seeds, visibleRecords: seeds };
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeds = createSeedCommunityPosts();
      return { allRecords: seeds, visibleRecords: seeds };
    }

    const { allRecords, visibleRecords } = processRetentionForItems(parsed, now);
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(allRecords));
    return { allRecords, visibleRecords };
  } catch {
    const seeds = createSeedCommunityPosts();
    return { allRecords: seeds, visibleRecords: seeds };
  }
};

/**
 * Đọc danh sách bài đánh giá cộng đồng đang hiển thị trên UI
 * (Các bài bị xóa hoặc quá hạn 7 ngày vẫn được giữ trong storage/backend và tự động xóa vĩnh viễn sau 7 ngày tiếp)
 */
export const loadAndPruneCommunityPosts = () => {
  return loadAllCommunityPostsWithRetention().visibleRecords;
};

/**
 * Đánh dấu xóa mềm 1 bài đánh giá (giữ lại trong backend/storage, tự động xóa sạch sau 7 ngày kể từ lúc xóa)
 */
export const softDeleteCommunityPost = (postId) => {
  const { allRecords } = loadAllCommunityPostsWithRetention();
  const now = Date.now();
  const nextAll = allRecords.map((p) =>
    p.id === postId && !p.deletedAt ? { ...p, deletedAt: now } : p
  );
  if (hasBrowserStorage()) {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(nextAll));
    } catch {
      // ignore
    }
  }
  return processRetentionForItems(nextAll, now).visibleRecords;
};

/**
 * Đánh dấu xóa mềm 1 phản hồi con (giữ lại trong backend/storage, tự động xóa sạch sau 7 ngày kể từ lúc xóa)
 */
export const softDeleteCommunityReply = (postId, replyId) => {
  const { allRecords } = loadAllCommunityPostsWithRetention();
  const now = Date.now();
  const nextAll = allRecords.map((p) => {
    if (p.id !== postId) return p;
    return {
      ...p,
      replies: (p.replies || []).map((rep) =>
        rep.id === replyId && !rep.deletedAt ? { ...rep, deletedAt: now } : rep
      )
    };
  });
  if (hasBrowserStorage()) {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(nextAll));
    } catch {
      // ignore
    }
  }
  return processRetentionForItems(nextAll, now).visibleRecords;
};

/**
 * Lưu danh sách bài viết hiển thị mà không làm mất các bài đã xóa mềm / hết hạn đang trong thời gian chờ 7 ngày
 */
export const saveVisibleCommunityPosts = (visiblePosts = []) => {
  const { allRecords } = loadAllCommunityPostsWithRetention();
  const now = Date.now();
  const visibleMap = new Map(visiblePosts.map((p) => [p.id, p]));

  // Giữ lại các bài đã xóa mềm hoặc hết hạn trong allRecords
  const hiddenRecords = allRecords.filter((p) => p.deletedAt || p.expiredAt);

  // Trong các bài đang hiển thị, giữ lại cả các reply đã xóa mềm hoặc hết hạn
  const mergedVisible = visiblePosts.map((vp) => {
    const existing = allRecords.find((p) => p.id === vp.id);
    const hiddenReplies = existing && Array.isArray(existing.replies)
      ? existing.replies.filter((r) => r.deletedAt || r.expiredAt)
      : [];
    const activeReplies = Array.isArray(vp.replies) ? vp.replies : [];
    const activeReplyIds = new Set(activeReplies.map((r) => r.id));
    return {
      ...vp,
      deletedAt: vp.deletedAt || null,
      expiredAt: vp.expiredAt || null,
      replies: [
        ...activeReplies,
        ...hiddenReplies.filter((r) => !activeReplyIds.has(r.id))
      ]
    };
  });

  // Nếu có bài nào trong allRecords chưa bị đánh dấu deletedAt nhưng không còn trong visibleMap -> đánh dấu deletedAt
  const newlyDeleted = allRecords
    .filter((p) => !p.deletedAt && !p.expiredAt && !visibleMap.has(p.id))
    .map((p) => ({ ...p, deletedAt: now }));

  const combined = [...mergedVisible, ...hiddenRecords, ...newlyDeleted];
  const { allRecords: cleanedAll } = processRetentionForItems(combined, now);

  if (hasBrowserStorage()) {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(cleanedAll));
    } catch {
      // ignore
    }
  }
};

/**
 * Lưu đánh giá phim từ trang Chi tiết phim sang trang Cộng đồng
 */
export const publishRatingToCommunity = ({ movieId, rating, content = '', authorName = '' }) => {
  const { allRecords } = loadAllCommunityPostsWithRetention();
  const colors = ['#ED1C24', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newPost = {
    id: `post-${Date.now()}`,
    author: authorName.trim() || 'Thành viên PTIT Cine',
    avatarColor: randomColor,
    movieId: Number(movieId),
    rating: Number(rating),
    content: content.trim(),
    createdAt: Date.now(),
    likes: 0,
    dislikes: 0,
    userReaction: null,
    isOwn: true,
    fromDetailPage: true,
    deletedAt: null,
    expiredAt: null,
    replies: []
  };

  const nextPosts = [newPost, ...allRecords];
  if (hasBrowserStorage()) {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(nextPosts));
    } catch {
      // ignore storage errors
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ptit-community-updated', { detail: newPost }));
  }
  return newPost;
};

export default moviesData;
