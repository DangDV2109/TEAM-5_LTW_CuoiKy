import React, { useState, useEffect, useMemo } from 'react';
import './CommunityPage.css';
import {
  moviesData,
  COMMUNITY_STORAGE_KEY,
  loadAndPruneCommunityPosts
} from '../data/moviesData';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer/Footer';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Định dạng thời gian đăng
 */
const formatRelativeTime = (timestamp) => {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

/**
 * Trang Cộng Đồng (CommunityPage) - PTIT Cine
 */
const CommunityPage = ({
  onBackHome = () => {},
  onOpenMovieDetail = () => {}
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState(() => loadAndPruneCommunityPosts());

  // State cho form đăng bài đánh giá mới
  const [authorName, setAuthorName] = useState(() => user?.name || '');
  const [selectedMovieId, setSelectedMovieId] = useState(moviesData[0]?.id || 1);
  const [starRating, setStarRating] = useState(9);
  const [hoverStar, setHoverStar] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [filterMovieId, setFilterMovieId] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

  // State cho bình luận phản hồi (reply) theo từng bài viết
  const [openReplyPostId, setOpenReplyPostId] = useState(null);
  const [replyAuthor, setReplyAuthor] = useState(() => user?.name || '');
  const [replyContent, setReplyContent] = useState('');

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Đồng bộ khi có đánh giá mới từ Trang Chi Tiết Phim
  useEffect(() => {
    const syncPosts = () => {
      setPosts(loadAndPruneCommunityPosts());
    };
    window.addEventListener('ptit-community-updated', syncPosts);
    window.addEventListener('storage', syncPosts);
    return () => {
      window.removeEventListener('ptit-community-updated', syncPosts);
      window.removeEventListener('storage', syncPosts);
    };
  }, []);

  // Kiểm tra định kỳ và đồng bộ lưu trữ (xóa các bài quá 7 ngày)
  useEffect(() => {
    const now = Date.now();
    const cleaned = posts.filter((p) => now - p.createdAt < SEVEN_DAYS_MS);
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(cleaned));
    } catch {
      // ignore storage quota errors
    }
  }, [posts]);

  // Tìm thông tin phim từ movieId
  const getMovieById = (id) => {
    return moviesData.find((m) => m.id === Number(id)) || moviesData[0];
  };

  // Xử lý đăng đánh giá & bình luận mới
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!starRating || starRating < 1 || starRating > 10) return;

    const colors = ['#ED1C24', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPost = {
      id: `post-${Date.now()}`,
      author: authorName.trim() || user?.name || 'Thành viên PTIT Cine',
      avatarColor: randomColor,
      movieId: Number(selectedMovieId),
      rating: starRating,
      content: commentText.trim(),
      createdAt: Date.now(),
      likes: 0,
      dislikes: 0,
      userReaction: null,
      isOwn: true,
      replies: []
    };

    setPosts((prev) => [newPost, ...prev]);
    setCommentText('');
  };

  // Xử lý nút Like / Dislike cho bài viết chính
  const handlePostReaction = (postId, type) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        let { likes, dislikes, userReaction } = post;

        if (userReaction === type) {
          if (type === 'like') likes = Math.max(0, likes - 1);
          if (type === 'dislike') dislikes = Math.max(0, dislikes - 1);
          userReaction = null;
        } else {
          if (userReaction === 'like') likes = Math.max(0, likes - 1);
          if (userReaction === 'dislike') dislikes = Math.max(0, dislikes - 1);

          if (type === 'like') likes += 1;
          if (type === 'dislike') dislikes += 1;
          userReaction = type;
        }

        return { ...post, likes, dislikes, userReaction };
      })
    );
  };

  // Xử lý nút Like cho phản hồi (reply)
  const handleReplyReaction = (postId, replyId, type) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedReplies = (post.replies || []).map((rep) => {
          if (rep.id !== replyId) return rep;
          let { likes, dislikes, userReaction } = rep;

          if (userReaction === type) {
            if (type === 'like') likes = Math.max(0, likes - 1);
            if (type === 'dislike') dislikes = Math.max(0, dislikes - 1);
            userReaction = null;
          } else {
            if (userReaction === 'like') likes = Math.max(0, likes - 1);
            if (userReaction === 'dislike') dislikes = Math.max(0, dislikes - 1);
            if (type === 'like') likes += 1;
            if (type === 'dislike') dislikes += 1;
            userReaction = type;
          }
          return { ...rep, likes, dislikes, userReaction };
        });

        return { ...post, replies: updatedReplies };
      })
    );
  };

  // Gửi phản hồi (comment con) vào bài viết
  const handleAddReply = (e, postId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      author: replyAuthor.trim() || authorName.trim() || user?.name || 'Khán giả PTIT',
      avatarColor: '#3b82f6',
      content: replyContent.trim(),
      createdAt: Date.now(),
      likes: 0,
      dislikes: 0,
      userReaction: null,
      isOwn: true
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          replies: [...(post.replies || []), newReply]
        };
      })
    );

    setReplyContent('');
    setOpenReplyPostId(null);
  };

  // Kiểm tra quyền xóa bình luận: chỉ Admin hoặc chính chủ mới được xóa
  const canDeleteItem = (item) => {
    if (!item) return false;
    if (isAdmin) return true;
    return Boolean(item.isOwn);
  };

  // Xóa bài viết
  const handleDeletePost = (postId) => {
    setPosts((prev) =>
      prev.filter((p) => {
        if (p.id !== postId) return true;
        return !canDeleteItem(p);
      })
    );
  };

  // Xóa phản hồi con
  const handleDeleteReply = (postId, replyId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          replies: (post.replies || []).filter((rep) => {
            if (rep.id !== replyId) return true;
            return !canDeleteItem(rep);
          })
        };
      })
    );
  };

  // Danh sách bài viết sau khi lọc và sắp xếp
  const displayedPosts = useMemo(() => {
    const now = Date.now();
    let list = posts.filter((p) => now - p.createdAt < SEVEN_DAYS_MS);

    if (filterMovieId !== 'ALL') {
      list = list.filter((p) => p.movieId === Number(filterMovieId));
    }

    if (sortBy === 'popular') {
      return [...list].sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, filterMovieId, sortBy]);

  // Thống kê phim được đánh giá nhiều nhất trên Cộng đồng
  const trendingMovies = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      if (!counts[post.movieId]) {
        counts[post.movieId] = { count: 0, totalScore: 0 };
      }
      counts[post.movieId].count += 1;
      counts[post.movieId].totalScore += post.rating;
    }

    return moviesData
      .map((m) => {
        const stat = counts[m.id];
        return {
          movie: m,
          reviewCount: stat ? stat.count : 0,
          avgScore: stat ? (stat.totalScore / stat.count).toFixed(1) : Number(m.rating || 8).toFixed(1)
        };
      })
      .sort((a, b) => b.reviewCount - a.reviewCount || Number(b.avgScore) - Number(a.avgScore))
      .slice(0, 5);
  }, [posts]);

  return (
    <div className="community-page">
      {/* Banner tiêu đề Cộng đồng */}
      <section className="comm-hero-banner">
        <div className="comm-container">
          <h1 className="comm-hero-title">CỘNG ĐỒNG ĐIỆN ẢNH</h1>
          <p className="comm-hero-desc">
            Nơi chia sẻ cảm nhận, chấm điểm sao và thảo luận về các bộ phim đang &amp; sắp chiếu.
          </p>
        </div>
      </section>

      {/* Nội dung chính 2 cột */}
      <div className="comm-container comm-main-layout">
        {/* ==================== CỘT TRÁI: ĐĂNG ĐÁNH GIÁ & LUỒNG BÌNH LUẬN ==================== */}
        <div className="comm-feed-column">
          {/* KHUNG VIẾT ĐÁNH GIÁ & CHẤM SAO PHIM */}
          <form className="comm-compose-card" onSubmit={handleCreatePost}>
            <div className="compose-card-header">
              <h3>✍️ Viết đánh giá &amp; Bình luận phim</h3>
            </div>

            <div className="compose-row-grid">
              <div className="compose-field">
                <label htmlFor="comm-author-input">Tên hiển thị của bạn</label>
                <input
                  id="comm-author-input"
                  type="text"
                  className="compose-input"
                  placeholder="Nhập tên của bạn (tùy chọn)..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>

              <div className="compose-field">
                <label htmlFor="comm-movie-select">Chọn phim đánh giá</label>
                <select
                  id="comm-movie-select"
                  className="compose-select"
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(Number(e.target.value))}
                >
                  {moviesData.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chọn số sao đánh giá (1 -> 10 sao) */}
            <div className="compose-star-picker">
              <span className="star-picker-label">Đánh giá của bạn:</span>
              <div className="star-buttons-wrap">
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map((star) => {
                  const isFilled = star <= (hoverStar || starRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-icon-btn ${isFilled ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => setStarRating(star)}
                      title={`${star}/10 sao`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <span className="star-score-badge">{hoverStar || starRating} / 10 ★</span>
            </div>

            {/* Nội dung bình luận (không bắt buộc) */}
            <textarea
              className="compose-textarea"
              rows="3"
              placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này (không bắt buộc - bạn có thể chỉ đánh giá số sao)..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <div className="compose-actions">
              <button type="submit" className="compose-submit-btn">
                Đăng đánh giá
              </button>
            </div>
          </form>

          {/* THANH LỌC LUỒNG HOẠT ĐỘNG */}
          <div className="comm-feed-toolbar">
            <div className="feed-tabs">
              <button
                type="button"
                className={`feed-tab-btn ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => setSortBy('newest')}
              >
                Mới nhất
              </button>
              <button
                type="button"
                className={`feed-tab-btn ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                Nổi bật nhất (Nhiều lượt thích)
              </button>
            </div>

            <div className="feed-movie-filter">
              <select
                value={filterMovieId}
                onChange={(e) => setFilterMovieId(e.target.value)}
                className="feed-filter-select"
                aria-label="Lọc theo phim"
              >
                <option value="ALL">Tất cả phim ({posts.length})</option>
                {moviesData.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DANH SÁCH BÀI ĐÁNH GIÁ & BÌNH LUẬN */}
          <div className="comm-posts-list">
            {displayedPosts.length > 0 ? (
              displayedPosts.map((post) => {
                const movie = getMovieById(post.movieId);
                return (
                  <article key={post.id} className="comm-post-card">
                    {/* Cột trái: Avatar người đăng + Nội dung */}
                    <div className="post-main-body">
                      <div className="post-user-header">
                        <div
                          className="post-avatar"
                          style={{ backgroundColor: post.avatarColor || '#ED1C24' }}
                        >
                          {post.author.charAt(0).toUpperCase()}
                        </div>

                        <div className="post-user-meta">
                          <div className="post-author-line">
                            <strong className="post-author-name">{post.author}</strong>
                            {post.isOwn && <span className="post-own-badge">Bạn</span>}
                            <span className="post-action-text">đã đánh giá phim</span>
                            <button
                              type="button"
                              className="post-movie-link"
                              onClick={() => onOpenMovieDetail(movie)}
                            >
                              {movie.title}
                            </button>
                          </div>

                          <div className="post-time-row">
                            <span className="post-rating-pill">★ {post.rating}/10</span>
                            <span className="post-dot">•</span>
                            <span className="post-timestamp">{formatRelativeTime(post.createdAt)}</span>
                          </div>
                        </div>

                        {canDeleteItem(post) && (
                          <button
                            type="button"
                            className="post-delete-btn"
                            onClick={() => handleDeletePost(post.id)}
                            title={isAdmin && !post.isOwn ? 'Xóa bình luận (Quyền Admin)' : 'Xóa bình luận của bạn'}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Dải sao trực quan */}
                      <div className="post-visual-stars" aria-label={`Đánh giá ${post.rating} trên 10 sao`}>
                        {Array.from({ length: 10 }, (_, idx) => (
                          <span
                            key={idx}
                            className={`visual-star ${idx < post.rating ? 'on' : 'off'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      {post.content && <p className="post-content-text">{post.content}</p>}

                      {/* THANH TƯƠNG TÁC (👍 Thích, 💬 Phản hồi) */}
                      <div className="yt-action-bar">
                        <div className="yt-like-dislike-pill">
                          <button
                            type="button"
                            className={`yt-like-btn ${post.userReaction === 'like' ? 'active' : ''}`}
                            onClick={() => handlePostReaction(post.id, 'like')}
                            title="Thích bình luận này"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                            </svg>
                            <span>{post.likes}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          className="yt-reply-toggle-btn"
                          onClick={() =>
                            setOpenReplyPostId((prev) => (prev === post.id ? null : post.id))
                          }
                        >
                          Phản hồi ({post.replies?.length || 0})
                        </button>
                      </div>

                      {/* Khung nhập phản hồi (khi bấm Phản hồi) */}
                      {openReplyPostId === post.id && (
                        <form
                          className="yt-reply-form"
                          onSubmit={(e) => handleAddReply(e, post.id)}
                        >
                          <input
                            type="text"
                            className="reply-author-input"
                            placeholder="Tên của bạn..."
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                          />
                          <input
                            type="text"
                            className="reply-text-input"
                            placeholder="Viết phản hồi công khai..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            required
                          />
                          <div className="reply-form-btns">
                            <button
                              type="button"
                              className="reply-cancel-btn"
                              onClick={() => setOpenReplyPostId(null)}
                            >
                              Hủy
                            </button>
                            <button type="submit" className="reply-submit-btn">
                              Phản hồi
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Danh sách các bình luận phản hồi (Replies) */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="yt-replies-list">
                          {post.replies.map((rep) => (
                            <div key={rep.id} className="yt-reply-item">
                              <div
                                className="reply-avatar"
                                style={{ backgroundColor: rep.avatarColor || '#3b82f6' }}
                              >
                                {rep.author.charAt(0).toUpperCase()}
                              </div>
                              <div className="reply-body">
                                <div className="reply-header">
                                  <strong>{rep.author}</strong>
                                  {rep.isOwn && <span className="post-own-badge">Bạn</span>}
                                  <span>{formatRelativeTime(rep.createdAt)}</span>
                                  {canDeleteItem(rep) && (
                                    <button
                                      type="button"
                                      className="reply-delete-btn"
                                      onClick={() => handleDeleteReply(post.id, rep.id)}
                                      title={isAdmin && !rep.isOwn ? 'Xóa phản hồi (Quyền Admin)' : 'Xóa phản hồi của bạn'}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <p className="reply-text">{rep.content}</p>
                                <div className="reply-actions">
                                  <button
                                    type="button"
                                    className={`yt-mini-like ${rep.userReaction === 'like' ? 'active' : ''}`}
                                    onClick={() => handleReplyReaction(post.id, rep.id, 'like')}
                                  >
                                    👍 {rep.likes}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cột phải trên thẻ bài viết: Poster nhỏ của phim */}
                    <div
                      className="post-movie-poster-side"
                      onClick={() => onOpenMovieDetail(movie)}
                      title={`Xem chi tiết phim ${movie.title}`}
                    >
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="comm-empty-state">
                <p>Chưa có bình luận nào cho bộ phim này. Hãy là người đầu tiên đánh giá!</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== CỘT PHẢI: SIDEBAR THỐNG KÊ ==================== */}
        <aside className="comm-sidebar-column">
          <div className="comm-sidebar-box">
            <h3 className="sidebar-box-title">🔥 Phim Được Đánh Giá Sôi Nổi</h3>
            <div className="trending-movies-list">
              {trendingMovies.map(({ movie, reviewCount, avgScore }) => (
                <div
                  key={movie.id}
                  className="trending-movie-item"
                  onClick={() => onOpenMovieDetail(movie)}
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="trending-poster"
                  />
                  <div className="trending-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.genre}</p>
                    <div className="trending-stats">
                      <span className="trending-score">★ {avgScore}</span>
                      <span className="trending-count">{reviewCount} đánh giá</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="comm-sidebar-box">
            <h3 className="sidebar-box-title">🛡️ Quy Tắc Cộng Đồng</h3>
            <ul className="comm-rules-list">
              <li>Không tiết lộ nội dung quan trọng của phim (No Spoiler) khi chưa cảnh báo.</li>
              <li>Chấm điểm công tâm từ <strong>1 đến 10 sao</strong> dựa trên trải nghiệm thực tế (có thể chấm sao mà không cần viết bình luận).</li>
              <li>Sử dụng nút <strong>👍 Thích</strong> và phản hồi văn minh, lịch sự.</li>
              <li>Người dùng có thể xóa bình luận của chính mình; <strong>Admin</strong> có quyền quản trị và xóa mọi bình luận vi phạm.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Footer tĩnh ở đáy trang */}
      <Footer isVisible={true} isStatic={true} />
    </div>
  );
};

export default CommunityPage;
