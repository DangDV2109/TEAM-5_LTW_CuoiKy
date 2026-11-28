import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { CINEMAS } from "./config/cinemas.js";
import Movie from "./models/Movie.js";
import Combo from "./models/Combo.js";
import User from "./models/User.js";
import Review from "./models/Review.js";
import Order from "./models/Order.js";
import Ticket from "./models/Ticket.js";
import SeatLock from "./models/SeatLock.js";
import { showtimeStart } from "./utils/helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SAMPLE_MOVIES = [
  { title: "Oppenheimer", poster: "https://placehold.co/300x450?text=Oppenheimer", genres: ["Tiểu sử", "Chính kịch"], director: "Christopher Nolan", cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."], duration: 180, ageRating: "T16", tags: ["hot"], status: "now", description: "Câu chuyện về J. Robert Oppenheimer và sự ra đời của bom nguyên tử.", formats: ["2D", "IMAX"], rating: 8.6 },
  { title: "Mai", poster: "https://placehold.co/300x450?text=Mai", genres: ["Tình cảm", "Tâm lý"], director: "Trấn Thành", cast: ["Phương Anh Đào", "Tuấn Trần"], duration: 131, ageRating: "T18", tags: ["hot", "vietnam"], status: "now", description: "Chuyện đời của Mai, người phụ nữ ngoài 30 tuổi và mối tình bất ngờ.", formats: ["2D"], rating: 7.4 },
  { title: "Dune: Part Two", poster: "https://placehold.co/300x450?text=Dune+2", genres: ["Khoa học viễn tưởng", "Hành động"], director: "Denis Villeneuve", cast: ["Timothée Chalamet", "Zendaya"], duration: 166, ageRating: "T13", tags: ["hot", "schedule"], status: "now", description: "Paul Atreides hợp lực cùng người Fremen để trả thù.", formats: ["2D", "3D", "IMAX"], rating: 8.7 },
  { title: "Inside Out 2", poster: "https://placehold.co/300x450?text=Inside+Out+2", genres: ["Hoạt hình", "Gia đình"], director: "Kelsey Mann", cast: ["Amy Poehler", "Maya Hawke"], duration: 96, ageRating: "P", tags: ["schedule"], status: "now", description: "Riley bước vào tuổi teen cùng những cảm xúc mới.", formats: ["2D", "3D"], rating: 7.9 },
  { title: "Đào, Phở và Piano", poster: "https://placehold.co/300x450?text=Dao+Pho+Piano", genres: ["Chiến tranh", "Lịch sử"], director: "Phi Tiến Sơn", cast: ["Đỗ Hải Yến", "Quang Thắng"], duration: 100, ageRating: "T13", tags: ["vietnam"], status: "now", description: "Hà Nội những ngày cuối năm 1946.", formats: ["2D"], rating: 8.1 },
  { title: "Avengers: Doomsday", poster: "https://placehold.co/300x450?text=Doomsday", genres: ["Hành động", "Khoa học viễn tưởng"], director: "Anthony Russo", cast: ["Robert Downey Jr.", "Chris Hemsworth"], duration: 150, ageRating: "T13", tags: ["hot"], status: "coming", releaseDate: "2026-12-18", description: "Cuộc đối đầu mới của các siêu anh hùng.", formats: ["2D", "3D", "IMAX"] },
  { title: "Tết Ở Làng Địa Ngục 2", poster: "https://placehold.co/300x450?text=Lang+Dia+Nguc", genres: ["Kinh dị", "Hài"], director: "Việt Max", cast: ["Đoàn Thế Vinh"], duration: 110, ageRating: "T16", tags: ["vietnam"], status: "coming", releaseDate: "2027-01-29", description: "Phần tiếp theo của series kinh dị – hài ngày Tết.", formats: ["2D"] },
];

const COMBOS = [
  { name: "Combo Solo", price: 69000, description: "1 bắp ngọt (M) + 1 nước ngọt (L)", image: "https://placehold.co/300x300?text=Solo" },
  { name: "Combo Couple", price: 109000, description: "1 bắp ngọt (L) + 2 nước ngọt (L)", image: "https://placehold.co/300x300?text=Couple" },
  { name: "Combo Family", price: 169000, description: "2 bắp (L) + 4 nước ngọt (L)", image: "https://placehold.co/300x300?text=Family" },
  { name: "Bắp phô mai", price: 59000, description: "1 bắp phô mai (L)", image: "https://placehold.co/300x300?text=Cheese" },
  { name: "Nước ngọt (L)", price: 35000, description: "1 ly nước ngọt cỡ lớn", image: "https://placehold.co/300x300?text=Drink" },
];

const USERS = [
  { name: "Quản trị viên", email: "admin@ptitcine.vn", password: "Admin12345", role: "ADMIN" },
  { name: "Quản trị viên", email: "admin@ptitcinema.vn", password: "admin123", role: "ADMIN" },
  { name: "Khách hàng mẫu", email: "user@ptitcinema.vn", password: "user123456", role: "USER" },
];

const toArr = (v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : []);
const toDate = (v) => {
  if (!v) return undefined;
  if (typeof v === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(v.trim())) {
    const [dd, mm, yyyy] = v.trim().split("/");
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) ? d : undefined;
  }
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) ? d : undefined;
};

function normalizeMovie(m) {
  const tags = toArr(m.tags).map((t) => t.replace(/^#/, ""));
  const statusRaw = String(m.status ?? "").toLowerCase();
  const isComing = ["coming", "coming-soon", "comingsoon", "upcoming", "sap-chieu"].includes(statusRaw) || tags.includes("coming");
  return {
    title: m.title ?? m.name,
    originalTitle: m.originalTitle,
    poster: m.poster ?? m.image ?? m.posterUrl,
    backdrop: m.backdrop ?? m.banner,
    trailer: m.trailer ?? m.trailerUrl,
    description: m.description ?? m.synopsis ?? m.overview,
    genres: toArr(m.genres ?? m.genre ?? m.category),
    director: m.director,
    cast: toArr(m.cast ?? m.actors),
    duration: parseInt(m.duration) || undefined,
    releaseDate: toDate(m.releaseDate ?? m.release_date),
    country: m.country,
    language: m.language,
    ageRating: m.ageRating ?? m.age ?? m.rated ?? "P",
    formats: toArr(m.formats ?? m.format).length ? toArr(m.formats ?? m.format) : ["2D"],
    tags,
    status: isComing ? "coming" : "now",
    cinemas: toArr(m.cinemas ?? m.cinema),
    rating: Number(m.rating) > 0 ? Math.min(Number(m.rating), 10) : 0,
  };
}

async function loadMovies() {
  const file = path.join(__dirname, "data", "moviesData.js");
  if (fs.existsSync(file)) {
    try {
      const mod = await import(pathToFileURL(file).href);
      const list = mod.default ?? mod.moviesData ?? mod.movies ?? Object.values(mod).find(Array.isArray);
      if (Array.isArray(list) && list.length) {
        console.log(`📥 Đọc ${list.length} phim từ src/data/moviesData.js`);
        return list.map(normalizeMovie).filter((m) => m.title);
      }
      console.warn("⚠️ moviesData.js không export mảng phim, dùng dữ liệu mẫu.");
    } catch (e) {
      console.warn("⚠️ Không đọc được moviesData.js:", e.message, "-> dùng dữ liệu mẫu.");
    }
  }
  return SAMPLE_MOVIES.map(normalizeMovie);
}

const TIMES = [["10:00", 70000], ["14:00", 80000], ["18:30", 95000], ["21:00", 95000]];
const vnDate = (offset) => new Date(Date.now() + 7 * 3600e3 + offset * 86400e3).toISOString().slice(0, 10);

function generateShowtimes(movie) {
  if (movie.status !== "now") return [];
  const cinemaIds = movie.cinemas.length ? movie.cinemas : CINEMAS.map((c) => c.id);
  const formats = movie.formats.length ? movie.formats : ["2D"];
  const out = [];
  cinemaIds.forEach((cinemaId) => {
    for (let d = 0; d < 5; d++) {
      TIMES.forEach(([time, price], i) => {
        const st = { cinemaId, room: `Phòng ${(i % 3) + 1}`, date: vnDate(d), time, format: formats[i % formats.length], price };
        if (showtimeStart(st) > new Date()) out.push(st);
      });
    }
  });
  return out;
}

async function run() {
  await connectDB();
  console.log("🧹 Xoá dữ liệu cũ (movies, combos, users, reviews, orders, tickets, seatlocks)...");
  await Promise.all([Movie, Combo, User, Review, Order, Ticket, SeatLock].map((M) => M.deleteMany({})));
  await Promise.all([SeatLock.init(), Order.init(), Ticket.init(), Review.init()]);

  const movies = await loadMovies();
  for (const m of movies) {
    if (!m.cinemas.length) m.cinemas = CINEMAS.map((c) => c.id);
    m.showtimes = generateShowtimes(m);
  }
  await Movie.insertMany(movies);
  await Combo.insertMany(COMBOS);
  for (const u of USERS) await User.create(u);

  console.log(`✅ Đã nạp ${movies.length} phim, ${COMBOS.length} combo, ${USERS.length} tài khoản.`);
  console.log("   Admin: admin@ptitcinema.vn / admin123");
  console.log("   User : user@ptitcinema.vn / user123456");
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error("❌ Seed thất bại:", e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
