import React, { useState, useEffect, useMemo } from 'react';
import {
  moviesData,
  subscribeMoviesChange,
  loadAndPruneCommunityPosts
} from '../data/moviesData';
import { citiesData, removeVietnameseTones } from '../data/cinemasData';
import ptitLogo from '../assets/ptit-logo.png';
import Footer from '../components/Footer/Footer';
import './SearchResultsPage.css';

/**
 * Kiểm tra một bộ phim có khớp với từ khóa tìm kiếm (tên, tên gốc, thể loại, độ tuổi, đạo diễn, diễn viên, mô tả, xuất xứ, năm, tag)
 */
export const matchMovieBySearchQuery = (movie, rawQuery = '') => {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return false;
  const cleanQ = removeVietnameseTones(q);

  const fields = [
    movie.title,
    movie.originalTitle,
    movie.genre,
    movie.ageRating,
    movie.director,
    movie.cast,
    movie.description,
    movie.origin,
    String(movie.year || ''),
    ...(Array.isArray(movie.tags) ? movie.tags : [])
  ].filter(Boolean);

  return fields.some((field) => {
    const lowerField = String(field).toLowerCase();
    const cleanField = removeVietnameseTones(String(field));
    return lowerField.includes(q) || (cleanQ && cleanField.includes(cleanQ));
  });
};

/**
 * Tạo danh sách bài viết (Tin điện ảnh, Đánh giá phim, Cộng đồng) kết hợp từ CSDL phim và bài viết cộng đồng
 * để hiển thị trong mục "Bài viết" giống cấu trúc trang /tim-kiem/?s=... của Moveek.
 */
const buildSearchableArticles = (movies = []) => {
  const articles = [];

  // 1. Lấy bài đánh giá từ Cộng đồng
  try {
    const communityPosts = loadAndPruneCommunityPosts();
    if (Array.isArray(communityPosts)) {
      communityPosts.forEach((post) => {
        const movie = movies.find((m) => Number(m.id) === Number(post.movieId));
        if (movie && post.content) {
          const d = new Date(post.createdAt || Date.now());
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();

          articles.push({
            id: `comm-${post.id}`,
            category: 'Đánh giá phim',
            title: `[Review] ${movie.title} — Đánh giá ${post.rating}/10 từ khán giả ${post.author}`,
            excerpt: post.content,
            author: post.author || 'Thành viên PTIT Cine',
            timestamp: `${hh}:${min} ${dd}/${mm}/${yyyy}`,
            thumbnail: movie.backdrop || movie.youtubeThumbnail || movie.poster,
            movie,
            searchText: `${movie.title} ${movie.originalTitle || ''} ${movie.genre || ''} ${(movie.tags || []).join(' ')} ${post.content} ${post.author}`
          });
        }
      });
    }
  } catch {
    // ignore
  }

  // 2. Tạo các bài viết Tin điện ảnh / Phân tích phim từ danh sách phim
  movies.forEach((movie) => {
    articles.push({
      id: `news-${movie.id}`,
      category: movie.status === 'coming' ? 'Tin điện ảnh' : 'Đánh giá phim',
      title:
        movie.status === 'coming'
          ? `${movie.title} (${movie.year}): Những điều cần biết trước ngày khởi chiếu ${movie.releaseDate}`
          : `[Đánh giá] ${movie.title} — Tác phẩm ${movie.genre?.toLowerCase()} ấn tượng của đạo diễn ${movie.director}`,
      excerpt:
        movie.description ||
        `Thông tin lịch chiếu, trailer và đánh giá chi tiết bộ phim ${movie.title}.`,
      author: 'Moveek & PTIT Cine',
      timestamp: `08:00 ${movie.releaseDate || '2026'}`,
      thumbnail: movie.backdrop || movie.youtubeThumbnail || movie.poster,
      movie,
      searchText: `${movie.title} ${movie.originalTitle || ''} ${movie.genre || ''} ${movie.director || ''} ${movie.cast || ''} ${movie.description || ''} ${movie.ageRating || ''} ${(movie.tags || []).join(' ')}`
    });
  });

  return articles;
};

/**
 * Thẻ phim trên trang Tìm kiếm (tham khảo mẫu Moveek ở Ảnh 1)
 */
const SearchMovieCard = ({ movie, onOpenMovieDetail }) => {
  const handlePosterError = (e) => {
    const fallback =
      movie.fallbackPoster || movie.youtubeThumbnail || movie.backdrop;
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  const ageBadge = useMemo(() => {
    if (!movie.ageRating) return 'P';
    return movie.ageRating.split('-')[0].trim();
  }, [movie.ageRating]);

  const formattedReleaseDate = useMemo(() => {
    if (!movie.releaseDate) return '';
    if (movie.releaseDate.startsWith('Từ ')) return movie.releaseDate;
    const parts = movie.releaseDate.split('/');
    if (parts.length >= 2) {
      return `Từ ${parts[0]}/${parts[1]}`;
    }
    return `Từ ${movie.releaseDate}`;
  }, [movie.releaseDate]);

  return (
    <div
      className="mv-search-card"
      onClick={() => onOpenMovieDetail && onOpenMovieDetail(movie)}
      title={`${movie.title} (${movie.originalTitle || movie.year})`}
    >
      <div className="mv-search-poster-wrap">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="mv-search-poster-img"
          onError={handlePosterError}
        />
        <div className="mv-search-poster-gradient" />

        {/* Nhãn giới hạn tuổi góc trên bên trái */}
        <span className={`mv-search-age-badge badge-${ageBadge.toLowerCase()}`}>
          {ageBadge}
        </span>

        {/* Điểm đánh giá góc trên bên phải */}
        {movie.rating && (
          <span className="mv-search-rating-badge">
            ★ {Number(movie.rating).toFixed(1)}
          </span>
        )}
      </div>

      <h3 className="mv-search-card-title">{movie.title}</h3>
      <p className="mv-search-card-date">{formattedReleaseDate}</p>
    </div>
  );
};

/**
 * Trang Kết Quả Tìm Kiếm (SearchResultsPage)
 * - Thiết kế chuẩn theo Ảnh 1 & https://moveek.com/tim-kiem/?s=hành+động
 * - Banner xanh đen phía trên: "Tìm kiếm / Theo từ khóa '...'"
 * - Khi có kết quả:
 *   + Mục 1: Phim (lưới 6 cột thẻ phim bo góc)
 *   + Mục 2: Rạp (lưới 3 cột các rạp chiếu liên quan)
 *   + Mục 3: Bài viết (2/3 bên trái) & Các kết quả khác (1/3 bên phải: Đạo diễn, Nghệ sĩ, Thể loại, Tag, Độ tuổi)
 * - Khi không có kết quả (VD: 'come and see' như Ảnh 1):
 *   + Thông báo in đậm căn giữa: "Không tìm thấy kết quả theo từ khóa '...'"
 * - Bên dưới luôn có mục "Đang chiếu" (trái) và "Sắp chiếu" (phải, chữ đỏ) với lưới 6 cột thẻ phim giống Ảnh 1.
 */
export default function SearchResultsPage({
  searchQuery = '',
  onSearch = () => {},
  onOpenMovieDetail = () => {},
  onSelectCinema = () => {}
}) {
  const [activeTab, setActiveTab] = useState('now'); // 'now' | 'coming'
  const [moviesVersion, setMoviesVersion] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery]);

  useEffect(() => {
    return subscribeMoviesChange(() => {
      setMoviesVersion((v) => v + 1);
    });
  }, []);

  const rawQ = (searchQuery || '').trim();
  const lowerQ = rawQ.toLowerCase();
  const cleanQ = removeVietnameseTones(rawQ);

  // 1. Kết quả PHIM khớp trực tiếp với từ khóa
  const matchedMovies = useMemo(() => {
    if (!rawQ) return [];
    return moviesData.filter((movie) => matchMovieBySearchQuery(movie, rawQ));
  }, [rawQ, moviesVersion]);

  // 2. Kết quả RẠP khớp trực tiếp hoặc chiếu các phim tìm được
  const matchedCinemas = useMemo(() => {
    if (!rawQ) return [];
    const allCinemas = [];
    citiesData.forEach((city) => {
      (city.cinemas || []).forEach((cin) => {
        allCinemas.push({
          ...cin,
          cityId: city.id,
          cityName: city.name
        });
      });
    });

    const directCinemas = allCinemas.filter((cin) => {
      const text = `${cin.name} ${cin.address} ${cin.cityName}`;
      const lower = text.toLowerCase();
      const clean = removeVietnameseTones(text);
      return lower.includes(lowerQ) || (cleanQ && clean.includes(cleanQ));
    });

    if (directCinemas.length > 0) {
      return directCinemas;
    }

    if (matchedMovies.length > 0) {
      const cinemaIds = new Set();
      matchedMovies.slice(0, 2).forEach((m) => {
        (m.cinemas || []).forEach((cid) => cinemaIds.add(cid));
      });
      return allCinemas.filter((c) => cinemaIds.has(c.id)).slice(0, 6);
    }

    return [];
  }, [rawQ, lowerQ, cleanQ, matchedMovies]);

  // 3. Kết quả BÀI VIẾT liên quan đến từ khóa hoặc phim tìm được
  const matchedArticles = useMemo(() => {
    if (!rawQ) return [];
    const allArticles = buildSearchableArticles(moviesData);
    const matchedMovieIds = new Set(matchedMovies.map((m) => m.id));

    return allArticles
      .filter((art) => {
        const lower = art.searchText.toLowerCase();
        const clean = removeVietnameseTones(art.searchText);
        const textMatch =
          lower.includes(lowerQ) || (cleanQ && clean.includes(cleanQ));
        const movieMatch = art.movie && matchedMovieIds.has(art.movie.id);
        return textMatch || movieMatch;
      })
      .slice(0, 10);
  }, [rawQ, lowerQ, cleanQ, matchedMovies, moviesVersion]);

  // 4. Kết quả CÁC KẾT QUẢ KHÁC (Đạo diễn, Nghệ sĩ, Thể loại, Tag, Độ tuổi)
  const otherResults = useMemo(() => {
    if (!rawQ) return [];
    const items = [];
    const seen = new Set();

    const addItem = (label, typeLabel, queryValue) => {
      const key = `${typeLabel}:${label.toLowerCase()}`;
      if (!label || seen.has(key)) return;
      seen.add(key);
      items.push({ label, typeLabel, queryValue: queryValue || label });
    };

    const sourceMovies = matchedMovies.length > 0 ? matchedMovies : moviesData;

    sourceMovies.forEach((movie) => {
      if (movie.director) {
        const dLower = movie.director.toLowerCase();
        const dClean = removeVietnameseTones(movie.director);
        if (
          matchedMovies.includes(movie) ||
          dLower.includes(lowerQ) ||
          (cleanQ && dClean.includes(cleanQ))
        ) {
          addItem(movie.director, 'Đạo diễn', movie.director);
        }
      }

      (movie.cast || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((actor) => {
          const aLower = actor.toLowerCase();
          const aClean = removeVietnameseTones(actor);
          if (
            matchedMovies.slice(0, 4).includes(movie) ||
            aLower.includes(lowerQ) ||
            (cleanQ && aClean.includes(cleanQ))
          ) {
            addItem(actor, 'Nghệ sĩ', actor);
          }
        });

      (movie.genre || '')
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
        .forEach((genre) => {
          if (matchedMovies.slice(0, 4).includes(movie)) {
            addItem(genre, 'Thể loại', genre);
          }
        });

      (movie.tags || [])
        .filter((t) => t !== '#schedule')
        .forEach((tag) => {
          if (matchedMovies.slice(0, 4).includes(movie)) {
            addItem(tag, 'Tag', tag);
          }
        });

      if (movie.ageRating && matchedMovies.slice(0, 3).includes(movie)) {
        const ageCode = movie.ageRating.split('-')[0].trim();
        if (ageCode) {
          addItem(`Phim phân loại ${ageCode}`, 'Độ tuổi', ageCode);
        }
      }
    });

    return items.slice(0, 18);
  }, [rawQ, lowerQ, cleanQ, matchedMovies, moviesVersion]);

  const hasAnyResults =
    matchedMovies.length > 0 ||
    matchedCinemas.length > 0 ||
    matchedArticles.length > 0 ||
    otherResults.length > 0;

  // Danh sách phim cho mục "Đang chiếu" / "Sắp chiếu" bên dưới (giống Ảnh 1)
  const showcaseMovies = useMemo(() => {
    return moviesData.filter((m) => m.status === activeTab);
  }, [activeTab, moviesVersion]);

  return (
    <div className="mv-search-page">
      {/* Banner Header màu xanh đen giống Ảnh 1 ("Tìm kiếm / Theo từ khóa ...") */}
      <section className="mv-search-banner">
        <div className="mv-search-container">
          <h1 className="mv-search-banner-title">Tìm kiếm</h1>
          <p className="mv-search-banner-subtitle">
            Theo từ khóa &lsquo;{rawQ}&rsquo;
          </p>
        </div>
      </section>

      {/* Khu vực nội dung chính nền sáng giống Ảnh 1 & Moveek */}
      <main className="mv-search-main">
        <div className="mv-search-container">
          {!hasAnyResults ? (
            /* Trạng thái không tìm thấy kết quả (Ảnh 1: 'come and see') */
            <div className="mv-search-no-result">
              <p className="mv-search-no-result-text">
                Không tìm thấy kết quả theo từ khóa &lsquo;{rawQ}&rsquo;
              </p>
            </div>
          ) : (
            <div className="mv-search-matched-wrapper">
              {/* 1. MỤC PHIM */}
              {matchedMovies.length > 0 && (
                <section className="mv-search-results-section">
                  <div className="mv-search-results-header">
                    <h2 className="mv-search-section-heading">
                      Phim ({matchedMovies.length})
                    </h2>
                  </div>

                  <div className="mv-search-grid">
                    {matchedMovies.map((movie) => (
                      <SearchMovieCard
                        key={movie.id}
                        movie={movie}
                        onOpenMovieDetail={onOpenMovieDetail}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 2. MỤC RẠP */}
              {matchedCinemas.length > 0 && (
                <section className="mv-search-results-section">
                  <h2 className="mv-search-section-heading mv-mb-4">Rạp</h2>
                  <div className="mv-cinema-grid">
                    {matchedCinemas.map((cinema) => (
                      <div
                        key={cinema.id}
                        className="mv-cinema-card"
                        onClick={() => onSelectCinema(cinema)}
                      >
                        <img
                          src={ptitLogo}
                          alt="PTIT Cine"
                          className="mv-cinema-logo"
                        />
                        <div className="mv-cinema-info">
                          <div className="mv-cinema-name">{cinema.name}</div>
                          <div className="mv-cinema-city">{cinema.cityName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. LƯỚI 2 CỘT: BÀI VIẾT (2/3) & CÁC KẾT QUẢ KHÁC (1/3) */}
              {(matchedArticles.length > 0 || otherResults.length > 0) && (
                <section className="mv-search-results-section mv-two-cols-section">
                  {/* Cột trái: Bài viết */}
                  <div className="mv-articles-col">
                    <h2 className="mv-search-section-heading mv-mb-4">
                      Bài viết
                    </h2>
                    {matchedArticles.length > 0 ? (
                      <div className="mv-articles-list">
                        {matchedArticles.map((article) => (
                          <article
                            key={article.id}
                            className="mv-article-row"
                            onClick={() =>
                              article.movie && onOpenMovieDetail(article.movie)
                            }
                          >
                            <div className="mv-article-thumb-wrap">
                              <img
                                src={article.thumbnail}
                                alt={article.title}
                                className="mv-article-thumb"
                                loading="lazy"
                              />
                            </div>
                            <div className="mv-article-body">
                              <span className="mv-article-category">
                                {article.category}
                              </span>
                              <h3 className="mv-article-title">
                                {article.title}
                              </h3>
                              <p className="mv-article-excerpt">
                                {article.excerpt}
                              </p>
                              <div className="mv-article-meta">
                                {article.author} &middot; {article.timestamp}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="mv-muted-text">
                        Chưa có bài viết nào cho từ khóa này.
                      </p>
                    )}
                  </div>

                  {/* Cột phải: Các kết quả khác */}
                  {otherResults.length > 0 && (
                    <div className="mv-others-col">
                      <h2 className="mv-search-section-heading mv-mb-4">
                        Các kết quả khác
                      </h2>
                      <div className="mv-others-card">
                        {otherResults.map((item, idx) => (
                          <button
                            key={`${item.label}-${idx}`}
                            type="button"
                            className="mv-other-link"
                            onClick={() => onSearch(item.queryValue)}
                          >
                            <span className="mv-other-name">{item.label}</span>
                            <span className="mv-other-type">
                              {item.typeLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* Mục "Đang chiếu" & "Sắp chiếu" bên dưới (bố cục chuẩn theo Ảnh 1) */}
          <section className="mv-search-showcase-section">
            <div className="mv-search-showcase-header">
              <button
                type="button"
                onClick={() => setActiveTab('now')}
                className={`mv-showcase-tab-left ${
                  activeTab === 'now' ? 'is-active' : ''
                }`}
              >
                Đang chiếu
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === 'now' ? 'coming' : 'now')
                }
                className={`mv-showcase-tab-right ${
                  activeTab === 'coming' ? 'is-active' : ''
                }`}
              >
                Sắp chiếu
              </button>
            </div>

            <div className="mv-search-grid">
              {showcaseMovies.map((movie) => (
                <SearchMovieCard
                  key={movie.id}
                  movie={movie}
                  onOpenMovieDetail={onOpenMovieDetail}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer isVisible={true} isStatic={true} />
    </div>
  );
}
