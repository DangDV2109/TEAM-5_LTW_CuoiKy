import { moviesData, subscribeMoviesChange } from './moviesData.js';

/**
 * Kiểm tra phim có gắn tag '#schedule' để được phép hiển thị trên UI hay không
 */
export const hasScheduleTag = (movie) =>
  Boolean(
    movie &&
      Array.isArray(movie.tags) &&
      movie.tags.some((t) => String(t).toLowerCase() === '#schedule' || String(t).toLowerCase() === 'schedule')
  );

/**
 * Bộ chọn dữ liệu phim dùng chung cho các Slide
 * - Tự động tính toán lại khi Admin chỉnh sửa tag, poster hoặc trạng thái phim
 * - Khi thẻ phim bị xóa tag #schedule bởi Admin thì phim không xuất hiện trên UI
 */
export const isHot = (movie) => Boolean(movie.tags && movie.tags.includes('#hot'));

export const showingAndUpcomingMovies = [];
export const featuredMovies = [];
export const heroMovies = [];
export const remainingMovies = [];
export const upcomingMovies = [];
export const vietnamMovies = [];
export let FEATURED_COUNT = 0;

export const recomputeMovieSelectors = () => {
  const scheduledMovies = moviesData.filter((movie) => hasScheduleTag(movie));

  const showingAndUpcoming = scheduledMovies
    .filter((movie) => (movie.status === 'now' || movie.status === 'coming') && movie.showOnSlide2 !== false)
    .map((movie, index) => ({ movie, index }))
    .sort((a, b) => Number(isHot(b.movie)) - Number(isHot(a.movie)) || a.index - b.index)
    .map(({ movie }) => movie);

  const featured = showingAndUpcoming.filter((movie) => isHot(movie));
  const hero = featured.filter((movie) => isHot(movie) && (movie.backdrop || movie.youtubeThumbnail || movie.poster));
  const shownOnSlide1 = new Set([...featured, ...hero].map((movie) => movie.id));
  const remaining = showingAndUpcoming.filter((movie) => !shownOnSlide1.has(movie.id));
  const upcoming = scheduledMovies.filter((movie) => movie.status === 'coming');
  const vietnam = scheduledMovies.filter(
    (movie) =>
      (movie.origin && movie.origin.toLowerCase().includes('việt nam')) ||
      (movie.tags && movie.tags.includes('#vietnam'))
  );

  showingAndUpcomingMovies.splice(0, showingAndUpcomingMovies.length, ...showingAndUpcoming);
  featuredMovies.splice(0, featuredMovies.length, ...featured);
  heroMovies.splice(0, heroMovies.length, ...hero);
  remainingMovies.splice(0, remainingMovies.length, ...remaining);
  upcomingMovies.splice(0, upcomingMovies.length, ...upcoming);
  vietnamMovies.splice(0, vietnamMovies.length, ...vietnam);
  FEATURED_COUNT = featuredMovies.length;
};

recomputeMovieSelectors();
subscribeMoviesChange(() => {
  recomputeMovieSelectors();
});
