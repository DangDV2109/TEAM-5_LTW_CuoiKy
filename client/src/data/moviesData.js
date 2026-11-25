import { moviesData as backendMoviesData } from '../../../server/src/data/moviesData.js';

const MOVIES_OVERRIDE_KEY = 'ptit_cine_movies_overrides_v1';
export const COMMUNITY_STORAGE_KEY = 'ptit_cine_community_posts_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Đọc dữ liệu chỉnh sửa phim của Admin từ localStorage (nếu có) và áp dụng vào moviesData
 */
const loadMovieOverrides = () => {
  try {
    const raw = localStorage.getItem(MOVIES_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const applyOverridesToMovies = () => {
  const overrides = loadMovieOverrides();
  backendMoviesData.forEach((movie, idx) => {
    const patch = overrides[movie.id];
    if (patch) {
      backendMoviesData[idx] = { ...movie, ...patch };
    }
  });
  return backendMoviesData;
};

export const moviesData = applyOverridesToMovies();

/**
 * Danh sách callback để thông báo khi Admin chỉnh sửa thông tin phim
 */
const listeners = new Set();
export const subscribeMoviesChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

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

  try {
    const overrides = loadMovieOverrides();
    overrides[numericId] = updatedMovie;
    localStorage.setItem(MOVIES_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore storage errors
  }

  listeners.forEach((fn) => fn(updatedMovie));
  window.dispatchEvent(new CustomEvent('ptit-movies-updated', { detail: updatedMovie }));
  return updatedMovie;
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
      replies: [
        {
          id: 'rep-101',
          author: 'Trần Thu Hà',
          avatarColor: '#2563eb',
          content: 'Đồng ý luôn bạn ơi, nhạc nền của Ludwig Göransson nổi da gà thật sự!',
          createdAt: now - 20 * 60 * 60 * 1000,
          likes: 11,
          dislikes: 0,
          userReaction: null
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
      replies: []
    }
  ];
};

/**
 * Đọc danh sách bài đánh giá cộng đồng và lọc bỏ bài quá 7 ngày
 */
export const loadAndPruneCommunityPosts = () => {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    const now = Date.now();
    if (!raw) {
      const seeds = createSeedCommunityPosts();
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createSeedCommunityPosts();

    const validPosts = parsed
      .filter((post) => post && typeof post.createdAt === 'number' && now - post.createdAt < SEVEN_DAYS_MS)
      .map((post) => ({
        ...post,
        replies: Array.isArray(post.replies)
          ? post.replies.filter(
              (rep) => rep && typeof rep.createdAt === 'number' && now - rep.createdAt < SEVEN_DAYS_MS
            )
          : []
      }));

    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(validPosts));
    return validPosts;
  } catch {
    return createSeedCommunityPosts();
  }
};

/**
 * Lưu đánh giá phim từ trang Chi tiết phim sang trang Cộng đồng
 */
export const publishRatingToCommunity = ({ movieId, rating, content = '', authorName = '' }) => {
  const posts = loadAndPruneCommunityPosts();
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
    replies: []
  };

  const nextPosts = [newPost, ...posts];
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(nextPosts));
  } catch {
    // ignore storage errors
  }

  window.dispatchEvent(new CustomEvent('ptit-community-updated', { detail: newPost }));
  return newPost;
};
