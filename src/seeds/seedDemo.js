import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Room from '../models/Room.js';
import Showtime from '../models/Showtime.js';

const movies = [
  { title: 'Oppenheimer', duration: 180, genre: ['Lịch sử', 'Chính kịch'], status: 'now' },
  { title: 'Come And See', duration: 142, genre: ['Chiến tranh', 'Chính kịch'], status: 'now' },
  { title: 'Napoleon', duration: 158, genre: ['Lịch sử', 'Chiến tranh'], status: 'now' },
  { title: 'Gladiator', duration: 155, genre: ['Hành động', 'Phiêu lưu'], status: 'now' },
  { title: 'Braveheart', duration: 178, genre: ['Chiến tranh', 'Lịch sử'], status: 'now' },
  { title: "Schindler's List", duration: 195, genre: ['Lịch sử', 'Chính kịch'], status: 'now' }
];

const theaters = [
  { code: 'hn-hadong', name: 'PTIT Cine Hà Đông', cityId: 'hanoi', cityName: 'Hà Nội', address: 'Km10 Nguyễn Trãi, Hà Đông, Hà Nội' },
  { code: 'hn-caugiay', name: 'PTIT Cine Cầu Giấy', cityId: 'hanoi', cityName: 'Hà Nội', address: '122 Xuân Thủy, Cầu Giấy, Hà Nội' },
  { code: 'hcm-q1', name: 'PTIT Cine Quận 1', cityId: 'hcm', cityName: 'TP. Hồ Chí Minh', address: '116 Nguyễn Du, Phường Bến Thành, Quận 1' },
  { code: 'dn-haichau', name: 'PTIT Cine Hải Châu', cityId: 'danang', cityName: 'Đà Nẵng', address: 'Nguyễn Văn Linh, Hải Châu, Đà Nẵng' }
];

const roomTemplates = [
  { name: 'Phòng 1', rows: 8, seatsPerRow: 10, vipRows: ['D', 'E'], hours: [9, 13, 17, 21] },
  { name: 'Phòng 2', rows: 6, seatsPerRow: 8, vipRows: ['E', 'F'], hours: [10, 14, 18] }
];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Thiếu MONGODB_URI trong .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const movieDocs = [];
  for (const m of movies) {
    movieDocs.push((await Movie.findOne({ title: m.title })) || (await Movie.create(m)));
  }

  const rooms = [];
  for (const t of theaters) {
    const theater = (await Theater.findOne({ code: t.code })) || (await Theater.create(t));
    for (const tpl of roomTemplates) {
      const { hours, ...layout } = tpl;
      const room = (await Room.findOne({ theater: theater._id, name: tpl.name })) || (await Room.create({ theater: theater._id, ...layout }));
      rooms.push({ room, hours });
    }
  }

  if ((await Showtime.countDocuments()) === 0) {
    const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    const midnight = new Date(`${today}T00:00:00+07:00`).getTime();
    let count = 0;
    for (const [roomIndex, { room, hours }] of rooms.entries()) {
      for (let day = 1; day <= 3; day += 1) {
        for (const [slot, hour] of hours.entries()) {
          const movie = movieDocs[(roomIndex + day + slot) % movieDocs.length];
          const startTime = new Date(midnight + day * 86400000 + hour * 3600000);
          const endTime = new Date(startTime.getTime() + (movie.duration + 15) * 60000);
          await Showtime.create({
            movie: movie._id,
            theater: room.theater,
            room: room._id,
            startTime,
            endTime,
            price: { standard: 90000, vip: 130000 },
            seats: room.generateSeats()
          });
          count += 1;
        }
      }
    }
    console.log(`✅ Đã tạo ${count} suất chiếu mẫu`);
  } else {
    console.log('ℹ️ Đã có suất chiếu, bỏ qua bước tạo suất chiếu mẫu');
  }

  console.log(`✅ Seed xong: ${movieDocs.length} phim, ${theaters.length} rạp, ${rooms.length} phòng`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
