import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieDetailPage.css';
import { citiesData } from '../data/cinemasData';
import {
  updateMovieById,
  publishRatingToCommunity,
  loadAndPruneCommunityPosts
} from '../data/moviesData';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import SearchableSelect from '../components/ScheduleSlide/SearchableSelect';
import Footer from '../components/Footer/Footer';

const QUICK_TAGS = ['#hot', '#schedule', '#vietnam', '#blockbuster', '#action', '#history', '#war', '#classic'];

/**
 * Trang Chi Tiết Phim (MovieDetailPage) - PTIT Cine
 */
const MovieDetailPage = ({
  movie,
  initialSelection = {},
  onBack = () => { },
  onMovieUpdate = () => { }
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Cuộn lên đầu trang khi mở trang chi tiết phim
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movie?.id]);

  // Danh sách 6 ngày chiếu tính từ hôm nay
  const dateList = useMemo(() => {
    const days = [];
    const today = new Date();
    const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      days.push({
        value: `${dd}-${mm}-${yyyy}`,
        shortDate: `${dd}/${mm}`,
        dayLabel: i === 0 ? 'Hôm nay' : dayNames[d.getDay()]
      });
    }
    return days;
  }, []);

  // Danh sách các định dạng chiếu có sẵn cho phim
  const availableFormats = useMemo(() => {
    const baseFormat = movie?.format || '2D';
    const set = new Set([baseFormat, '2D', '3D']);
    if (baseFormat === 'IMAX') set.add('IMAX');
    return ['ALL', ...Array.from(set)];
  }, [movie]);

  // Khởi tạo state từ lựa chọn ở Slide 3, 4, 5 (nếu có)
  const [selectedCityId, setSelectedCityId] = useState(() => {
    if (initialSelection?.cityId) return initialSelection.cityId;
    if (initialSelection?.cinemaId) {
      const foundCity = citiesData.find((c) =>
        c.cinemas.some((cin) => cin.id === initialSelection.cinemaId)
      );
      if (foundCity) return foundCity.id;
    }
    return null;
  });

  const [selectedCinemaId, setSelectedCinemaId] = useState(
    () => initialSelection?.cinemaId || null
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialSelection?.date && dateList.some((d) => d.value === initialSelection.date)) {
      return initialSelection.date;
    }
    return dateList[0]?.value || '';
  });

  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedTime, setSelectedTime] = useState(() => initialSelection?.time || null);

  // State cho nút Yêu thích & Đánh giá (đồng bộ với trang Cộng đồng)
  const [isFavorite, setIsFavorite] = useState(false);
  // Đồng bộ yêu thích với tài khoản (cần đăng nhập)
  useEffect(() => {
    if (!user || !movie?.id) { setIsFavorite(false); return; }
    axiosClient.get('/users/me/favorites')
      .then((r) => setIsFavorite((r.data || []).some((f) => String(f.movieId) === String(movie.id))))
      .catch(() => {});
  }, [user, movie?.id]);

  const toggleFavorite = async () => {
    if (!user) { navigate('/login', { state: { from: '/', info: 'Hãy đăng nhập để lưu phim yêu thích' } }); return; }
    setIsFavorite((prev) => !prev);
    try {
      await axiosClient.post(`/users/me/favorites/${movie.id}`, { title: movie.title, poster: movie.poster });
    } catch {
      setIsFavorite((prev) => !prev);
    }
  };

  const [userRating, setUserRating] = useState(() => {
    if (!movie?.id) return null;
    const existing = loadAndPruneCommunityPosts().find(
      (p) => p.movieId === Number(movie.id) && p.isOwn
    );
    return existing ? existing.rating : null;
  });
  const [pendingRatingScore, setPendingRatingScore] = useState(9);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState('');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [bookingNotice, setBookingNotice] = useState(null);

  // ===================== STATE CHỈNH SỬA DÀNH CHO ADMIN =====================
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [newTimeInput, setNewTimeInput] = useState('');
  const [adminSaveMsg, setAdminSaveMsg] = useState('');

  const initEditForm = (m) => {
    if (!m) return null;
    return {
      title: m.title || '',
      originalTitle: m.originalTitle || '',
      year: m.year || 2024,
      status: m.status || 'now',
      rating: Number(m.rating || 8.0),
      releaseDate: m.releaseDate || '',
      duration: m.duration || '',
      genre: m.genre || '',
      origin: m.origin || '',
      format: m.format || '2D',
      ageRating: m.ageRating || 'P - Phim được phổ biến đến người xem mọi độ tuổi',
      director: m.director || '',
      cast: m.cast || '',
      trailerUrl: m.trailerUrl || '',
      description: m.description || '',
      poster: m.poster || '',
      backdrop: m.backdrop || '',
      tags: Array.isArray(m.tags) ? [...m.tags] : [],
      cinemas: Array.isArray(m.cinemas) ? [...m.cinemas] : [],
      screenings: Array.isArray(m.screenings) ? [...m.screenings] : [],
      cinemaScreenings: m.cinemaScreenings ? { ...m.cinemaScreenings } : {}
    };
  };

  // Đồng bộ khi initialSelection hoặc movie thay đổi
  useEffect(() => {
    if (initialSelection?.cityId !== undefined) {
      setSelectedCityId(initialSelection.cityId);
    } else if (initialSelection?.cinemaId) {
      const foundCity = citiesData.find((c) =>
        c.cinemas.some((cin) => cin.id === initialSelection.cinemaId)
      );
      if (foundCity) setSelectedCityId(foundCity.id);
    }
    if (initialSelection?.cinemaId !== undefined) {
      setSelectedCinemaId(initialSelection.cinemaId);
    }
    if (initialSelection?.date) {
      setSelectedDate(initialSelection.date);
    }
    if (initialSelection?.time !== undefined) {
      setSelectedTime(initialSelection.time);
    }
    if (movie?.id) {
      const existing = loadAndPruneCommunityPosts().find(
        (p) => p.movieId === Number(movie.id) && p.isOwn
      );
      setUserRating(existing ? existing.rating : null);
      setEditForm(initEditForm(movie));
    }
  }, [initialSelection, movie?.id]);

  // Options cho combobox Thành phố
  const citiesOptions = useMemo(() => {
    return citiesData.map((c) => ({ id: c.id, name: c.name }));
  }, []);

  // Options cho combobox Rạp
  const cinemasOptions = useMemo(() => {
    if (selectedCityId) {
      const city = citiesData.find((c) => c.id === selectedCityId);
      return city ? city.cinemas : [];
    }
    return citiesData.flatMap((c) => c.cinemas);
  }, [selectedCityId]);

  const handleCitySelect = (city) => {
    setSelectedCityId(city.id);
    setSelectedCinemaId(null);
  };

  const handleCityClear = () => {
    setSelectedCityId(null);
    setSelectedCinemaId(null);
  };

  const handleCinemaSelect = (cinema) => {
    setSelectedCinemaId(cinema.id);
    if (!selectedCityId) {
      const parentCity = citiesData.find((c) => c.cinemas.some((cin) => cin.id === cinema.id));
      if (parentCity) setSelectedCityId(parentCity.id);
    }
  };

  const handleCinemaClear = () => {
    setSelectedCinemaId(null);
  };

  // Danh sách các rạp đang chiếu phim này
  const matchingCinemas = useMemo(() => {
    if (!movie) return [];
    const movieCinemaIds = movie.cinemas || [];

    const result = [];
    for (const city of citiesData) {
      if (selectedCityId && city.id !== selectedCityId) continue;

      for (const cinema of city.cinemas) {
        if (selectedCinemaId && cinema.id !== selectedCinemaId) continue;
        if (movieCinemaIds.includes(cinema.id)) {
          result.push({
            ...cinema,
            cityName: city.name
          });
        }
      }
    }
    return result;
  }, [movie, selectedCityId, selectedCinemaId]);

  // Danh sách định dạng hiển thị trong phần lịch chiếu của từng rạp
  const formatsToDisplay = useMemo(() => {
    const primary = movie?.format || '2D';
    const allFormats = primary === 'IMAX' ? ['2D', '3D', 'IMAX'] : ['2D', '3D'];
    if (selectedFormat === 'ALL') return allFormats;
    return allFormats.filter((f) => f === selectedFormat);
  }, [movie, selectedFormat]);

  // Khung giờ chiếu theo từng định dạng & từng rạp
  const getScreeningsForFormat = (fmt, cinemaId = null) => {
    const customForCinema =
      cinemaId && movie?.cinemaScreenings && Array.isArray(movie.cinemaScreenings[cinemaId])
        ? movie.cinemaScreenings[cinemaId]
        : null;

    const baseTimes =
      customForCinema !== null
        ? customForCinema
        : movie?.screenings && movie.screenings.length > 0
          ? movie.screenings
          : ['09:30', '12:15', '15:00', '18:30', '21:15'];

    if (fmt === '3D') {
      const subset = baseTimes.filter((_, idx) => idx % 2 === 1);
      const list = subset.length > 0 ? subset : baseTimes;
      if (selectedTime && !list.includes(selectedTime) && selectedFormat === '3D') {
        return [selectedTime, ...list];
      }
      return list;
    }
    return baseTimes;
  };

  const handlePosterError = (e) => {
    const fallback = movie?.fallbackPoster || movie?.youtubeThumbnail || movie?.backdrop;
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  // Mở link YouTube Trailer
  const getYoutubeTrailerUrl = () => {
    if (movie?.trailerUrl) return movie.trailerUrl;
    const query = encodeURIComponent(`${movie?.title || ''} official trailer`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  // Xử lý gửi đánh giá phim -> cập nhật sang trang Cộng đồng
  const handleSubmitRating = (scoreToSubmit) => {
    const finalScore = Number(scoreToSubmit || pendingRatingScore || 9);
    setUserRating(finalScore);
    publishRatingToCommunity({
      movieId: movie.id,
      rating: finalScore,
      content: ratingComment,
      authorName: user?.name || 'Thành viên PTIT Cine'
    });
    setRatingComment('');
    setRatingSuccessMsg(`✅ Đã đăng đánh giá ${finalScore}/10★ lên Cộng Đồng Điện Ảnh!`);
    setTimeout(() => {
      setRatingSuccessMsg('');
      setIsRatingOpen(false);
    }, 1800);
  };

  // ===================== XỬ LÝ CHỈNH SỬA PHIM (ADMIN) =====================
  const handleToggleEditMode = () => {
    setAdminSaveMsg('');
    if (!isEditing) {
      setEditForm(initEditForm(movie));
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePosterFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditForm((prev) => ({ ...prev, poster: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleTag = (tag) => {
    setEditForm((prev) => {
      const exists = prev.tags.includes(tag);
      const nextTags = exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag];
      return { ...prev, tags: nextTags };
    });
  };

  const handleAddCustomTag = () => {
    const raw = newTagInput.trim();
    if (!raw) return;
    const formatted = raw.startsWith('#') ? raw : `#${raw}`;
    setEditForm((prev) => {
      if (prev.tags.includes(formatted)) return prev;
      return { ...prev, tags: [...prev.tags, formatted] };
    });
    setNewTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }));
  };

  const handleToggleCinemaInForm = (cinemaId) => {
    setEditForm((prev) => {
      const exists = prev.cinemas.includes(cinemaId);
      const nextCinemas = exists
        ? prev.cinemas.filter((id) => id !== cinemaId)
        : [...prev.cinemas, cinemaId];
      return { ...prev, cinemas: nextCinemas };
    });
  };

  const handleAddScreeningTime = () => {
    const t = newTimeInput.trim();
    if (!t) return;
    setEditForm((prev) => {
      if (prev.screenings.includes(t)) return prev;
      const next = [...prev.screenings, t].sort();
      return { ...prev, screenings: next };
    });
    setNewTimeInput('');
  };

  const handleUpdateScreeningTime = (idx, newVal) => {
    setEditForm((prev) => {
      const next = [...prev.screenings];
      next[idx] = newVal;
      return { ...prev, screenings: next };
    });
  };

  const handleRemoveScreeningTime = (timeToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      screenings: prev.screenings.filter((t) => t !== timeToRemove)
    }));
  };

  // Xóa trực tiếp 1 rạp chiếu ở danh sách bên dưới (khi Admin đang bật chế độ chỉnh sửa)
  const handleQuickRemoveCinema = (cinemaId) => {
    const nextCinemas = (movie.cinemas || []).filter((id) => id !== cinemaId);
    const updated = updateMovieById(movie.id, { cinemas: nextCinemas });
    if (updated) {
      onMovieUpdate(updated);
      setEditForm(initEditForm(updated));
    }
  };

  // Xóa trực tiếp 1 giờ chiếu ở danh sách bên dưới (khi Admin đang bật chế độ chỉnh sửa)
  const handleQuickRemoveShowtime = (cinemaId, timeToRemove) => {
    const currentTimes =
      movie.cinemaScreenings?.[cinemaId] || movie.screenings || [];
    const nextTimes = currentTimes.filter((t) => t !== timeToRemove);
    const nextCinemaScreenings = {
      ...(movie.cinemaScreenings || {}),
      [cinemaId]: nextTimes
    };
    const updated = updateMovieById(movie.id, {
      cinemaScreenings: nextCinemaScreenings
    });
    if (updated) {
      onMovieUpdate(updated);
      setEditForm(initEditForm(updated));
    }
  };

  // Thêm giờ chiếu cho 1 rạp cụ thể
  const handleQuickAddShowtimeForCinema = (cinemaId) => {
    const input = window.prompt('Nhập giờ chiếu mới cho rạp này (VD: 21:45):', '21:30');
    if (!input || !input.trim()) return;
    const t = input.trim();
    const currentTimes =
      movie.cinemaScreenings?.[cinemaId] || movie.screenings || [];
    if (currentTimes.includes(t)) return;
    const nextTimes = [...currentTimes, t].sort();
    const nextCinemaScreenings = {
      ...(movie.cinemaScreenings || {}),
      [cinemaId]: nextTimes
    };
    const updated = updateMovieById(movie.id, {
      cinemaScreenings: nextCinemaScreenings
    });
    if (updated) {
      onMovieUpdate(updated);
      setEditForm(initEditForm(updated));
    }
  };

  const handleSaveAdminEdit = (e) => {
    e.preventDefault();
    if (!editForm) return;
    const cleanedScreenings = editForm.screenings
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = updateMovieById(movie.id, {
      ...editForm,
      year: Number(editForm.year) || 2024,
      rating: Math.min(10, Math.max(1, Number(editForm.rating) || 8.0)),
      screenings: cleanedScreenings
    });
    if (updated) {
      onMovieUpdate(updated);
      setAdminSaveMsg('✅ Đã lưu thay đổi thông tin phim thành công!');
      setTimeout(() => setAdminSaveMsg(''), 2500);
    }
  };

  // Xử lý khi chọn 1 suất chiếu cụ thể
  const handleSelectShowtime = (cinema, fmt, time, roomIdx = 1) => {
    setSelectedTime(time);
    setBookingNotice({
      movieTitle: movie.title,
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      cinemaAddress: cinema.address,
      date: selectedDate,
      format: fmt,
      time,
      roomName: `Phòng 0${roomIdx} (${fmt})`
    });
  };

  // Bấm "Tiếp tục chọn ghế": sang trang chọn ghế
  const handleContinueToSeats = () => {
    if (!bookingNotice) return;
    const showtimeId = [
      'st',
      movie.id,
      bookingNotice.cinemaId,
      bookingNotice.date,
      bookingNotice.format,
      bookingNotice.time
    ]
      .join('_')
      .replace(/[^a-zA-Z0-9]+/g, '-');
    navigate(`/showtimes/${showtimeId}/seats`, { state: { info: bookingNotice } });
  };

  if (!movie) return null;

  const ageCode = movie.ageRating ? movie.ageRating.split(' - ')[0] : 'P';

  return (
    <div className="movie-detail-page">
      {/* ========================================================
          PHẦN 1: BANNER THÔNG TIN PHIM TRÊN NỀN MÀU XÁM
          ======================================================== */}
      <section className="movie-detail-grey-banner">
        <div
          className="movie-detail-backdrop-blur"
          style={{
            backgroundImage: `url(${movie.backdrop || movie.youtubeThumbnail || movie.poster})`
          }}
        />
        <div className="movie-detail-grey-overlay" />

        <div className="movie-detail-container">
          {/* Thanh điều hướng quay lại & Breadcrumb + Nút Chỉnh sửa cho Admin */}
          <div className="movie-detail-topbar">
            <button type="button" className="detail-back-btn" onClick={onBack}>
              <span>←</span> Quay lại sảnh chiếu
            </button>

            <div className="detail-breadcrumb-wrap">
              <div className="detail-breadcrumb">
                <span onClick={onBack} className="breadcrumb-link">Trang chủ</span>
                <span className="breadcrumb-sep">/</span>
                <span>Phim</span>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{movie.title}</span>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  className={`detail-admin-edit-btn ${isEditing ? 'active' : ''}`}
                  onClick={handleToggleEditMode}
                  title="Chỉnh sửa nội dung phim, poster, tag, rạp và giờ chiếu"
                >
                  {isEditing ? '✕ Đóng chỉnh sửa' : '✎ Chỉnh sửa'}
                </button>
              )}
            </div>
          </div>

          {/* ================= BẢNG CHỈNH SỬA CHI TIẾT PHIM DÀNH CHO ADMIN ================= */}
          {isAdmin && isEditing && editForm && (
            <form className="admin-movie-edit-panel" onSubmit={handleSaveAdminEdit}>
              <div className="admin-edit-header">
                <h3>🛠️ Chỉnh sửa thông tin phim (Quyền Admin)</h3>
                {adminSaveMsg && <span className="admin-save-toast">{adminSaveMsg}</span>}
              </div>

              <div className="admin-edit-grid">
                <div className="admin-field">
                  <label>Tên phim</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleEditFieldChange('title', e.target.value)}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label>Tên gốc</label>
                  <input
                    type="text"
                    value={editForm.originalTitle}
                    onChange={(e) => handleEditFieldChange('originalTitle', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Năm phát hành</label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => handleEditFieldChange('year', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Trạng thái chiếu</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleEditFieldChange('status', e.target.value)}
                  >
                    <option value="now">Đang chiếu (now)</option>
                    <option value="coming">Sắp chiếu (coming)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Điểm đánh giá (1 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={editForm.rating}
                    onChange={(e) => handleEditFieldChange('rating', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Ngày khởi chiếu</label>
                  <input
                    type="text"
                    value={editForm.releaseDate}
                    onChange={(e) => handleEditFieldChange('releaseDate', e.target.value)}
                    placeholder="VD: 21/07/2023"
                  />
                </div>
                <div className="admin-field">
                  <label>Thời lượng</label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => handleEditFieldChange('duration', e.target.value)}
                    placeholder="VD: 180 phút"
                  />
                </div>
                <div className="admin-field">
                  <label>Định dạng chính</label>
                  <select
                    value={editForm.format}
                    onChange={(e) => handleEditFieldChange('format', e.target.value)}
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Thể loại</label>
                  <input
                    type="text"
                    value={editForm.genre}
                    onChange={(e) => handleEditFieldChange('genre', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Xuất xứ</label>
                  <input
                    type="text"
                    value={editForm.origin}
                    onChange={(e) => handleEditFieldChange('origin', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Đạo diễn</label>
                  <input
                    type="text"
                    value={editForm.director}
                    onChange={(e) => handleEditFieldChange('director', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Diễn viên chính</label>
                  <input
                    type="text"
                    value={editForm.cast}
                    onChange={(e) => handleEditFieldChange('cast', e.target.value)}
                  />
                </div>
                <div className="admin-field admin-field-span2">
                  <label>Giới hạn độ tuổi</label>
                  <input
                    type="text"
                    value={editForm.ageRating}
                    onChange={(e) => handleEditFieldChange('ageRating', e.target.value)}
                  />
                </div>
                <div className="admin-field admin-field-span2">
                  <label>Link YouTube Trailer</label>
                  <input
                    type="text"
                    value={editForm.trailerUrl}
                    onChange={(e) => handleEditFieldChange('trailerUrl', e.target.value)}
                  />
                </div>

                {/* ĐỔI POSTER & BACKDROP */}
                <div className="admin-field admin-field-span2">
                  <label>Đổi Poster (Nhập URL hoặc tải ảnh từ máy)</label>
                  <div className="admin-poster-input-row">
                    <input
                      type="text"
                      value={editForm.poster}
                      onChange={(e) => handleEditFieldChange('poster', e.target.value)}
                      placeholder="https://..."
                    />
                    <label className="admin-upload-btn">
                      📁 Chọn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterFileUpload}
                        hidden
                      />
                    </label>
                  </div>
                </div>
                <div className="admin-field admin-field-span2">
                  <label>Ảnh nền ngang (Backdrop 16:9 URL)</label>
                  <input
                    type="text"
                    value={editForm.backdrop}
                    onChange={(e) => handleEditFieldChange('backdrop', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                {/* MÔ TẢ NỘI DUNG PHIM */}
                <div className="admin-field admin-field-full">
                  <label>Mô tả nội dung chi tiết phim</label>
                  <textarea
                    rows="3"
                    value={editForm.description}
                    onChange={(e) => handleEditFieldChange('description', e.target.value)}
                  />
                </div>

                {/* ĐỔI TAG PHIM */}
                <div className="admin-field admin-field-full">
                  <label>Quản lý Tag phim (Bấm để bật/tắt hoặc thêm/xóa tag)</label>
                  <div className="admin-tags-manager">
                    <div className="admin-quick-tags">
                      {QUICK_TAGS.map((tag) => {
                        const active = editForm.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`admin-tag-chip ${active ? 'active' : ''}`}
                            onClick={() => handleToggleTag(tag)}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                    <div className="admin-current-tags">
                      {editForm.tags.map((tag) => (
                        <span key={tag} className="admin-active-tag">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="admin-add-inline">
                      <input
                        type="text"
                        placeholder="Nhập tag mới (VD: #scifi)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                      />
                      <button type="button" onClick={handleAddCustomTag}>+ Thêm Tag</button>
                    </div>
                  </div>
                </div>

                {/* THAY ĐỔI / XÓA GIỜ CHIẾU */}
                <div className="admin-field admin-field-full">
                  <label>Quản lý Khung Giờ Chiếu (Sửa trực tiếp, xóa hoặc thêm giờ chiếu mới)</label>
                  <div className="admin-screenings-manager">
                    <div className="admin-times-list">
                      {editForm.screenings.map((time, idx) => (
                        <div key={idx} className="admin-time-edit-chip">
                          <input
                            type="text"
                            value={time}
                            onChange={(e) => handleUpdateScreeningTime(idx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreeningTime(time)}
                            title="Xóa khung giờ này"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="admin-add-inline">
                      <input
                        type="text"
                        placeholder="VD: 21:30"
                        value={newTimeInput}
                        onChange={(e) => setNewTimeInput(e.target.value)}
                      />
                      <button type="button" onClick={handleAddScreeningTime}>+ Thêm giờ chiếu</button>
                    </div>
                  </div>
                </div>

                {/* THAY ĐỔI / XÓA RẠP CHIẾU */}
                <div className="admin-field admin-field-full">
                  <div className="admin-cinemas-header">
                    <label>Danh sách Rạp chiếu bộ phim này ({editForm.cinemas.length} rạp đang chọn)</label>
                    <div className="admin-cinemas-bulk">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditFieldChange(
                            'cinemas',
                            citiesData.flatMap((c) => c.cinemas.map((cin) => cin.id))
                          )
                        }
                      >
                        Chọn tất cả rạp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditFieldChange('cinemas', [])}
                      >
                        Bỏ chọn tất cả
                      </button>
                    </div>
                  </div>
                  <div className="admin-cinemas-selector">
                    {citiesData.map((city) => (
                      <div key={city.id} className="admin-city-group">
                        <strong>{city.name}:</strong>
                        <div className="admin-city-cinemas">
                          {city.cinemas.map((cin) => {
                            const checked = editForm.cinemas.includes(cin.id);
                            return (
                              <button
                                key={cin.id}
                                type="button"
                                className={`admin-cinema-chip ${checked ? 'active' : ''}`}
                                onClick={() => handleToggleCinemaInForm(cin.id)}
                              >
                                {checked ? '✓ ' : '+ '}{cin.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-edit-actions">
                <button type="button" className="admin-cancel-btn" onClick={() => setIsEditing(false)}>
                  Đóng
                </button>
                <button type="submit" className="admin-save-btn">
                  💾 Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {/* Khối chính: Thẻ phim bên trái + Thông tin bên phải */}
          <div className="movie-detail-hero-grid">
            {/* THẺ PHIM (POSTER) */}
            <div className="movie-detail-poster-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="movie-detail-poster-img"
                onError={handlePosterError}
              />
              <span className={`detail-age-badge age-${ageCode.toLowerCase()}`}>
                {ageCode}
              </span>
            </div>

            {/* THÔNG TIN CHI TIẾT PHIM BÊN CẠNH */}
            <div className="movie-detail-info-col">
              <div className="detail-title-block">
                <h1 className="detail-movie-title">{movie.title}</h1>
                <p className="detail-original-title">
                  {movie.originalTitle || movie.title} ({movie.year}) &nbsp;•&nbsp; {movie.genre}
                </p>
                {/*{movie.tags && movie.tags.length > 0 && (
                  <div className="detail-tags-row">
                    {movie.tags.map((tag) => (
                      <span key={tag} className="detail-tag-badge">{tag}</span>
                    ))}
                  </div>
                )}*/}
              </div>

              {/* Cụm nút hành động: Trailer (YouTube), Đánh giá, Yêu thích */}
              <div className="detail-action-buttons">
                <a
                  href={getYoutubeTrailerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-btn detail-btn-trailer"
                  title="Xem trailer trên YouTube"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Trailer</span>
                </a>

                <button
                  type="button"
                  className={`detail-btn detail-btn-rate ${userRating ? 'is-rated' : ''}`}
                  onClick={() => setIsRatingOpen((prev) => !prev)}
                >
                  <span>★</span>
                  <span>
                    {userRating
                      ? `Đã đánh giá (${userRating}/10)`
                      : `Đánh giá (${Number(movie.rating || 8).toFixed(1)})`}
                  </span>
                </button>

                <button
                  type="button"
                  className={`detail-btn detail-btn-fav ${isFavorite ? 'is-active' : ''}`}
                  onClick={toggleFavorite}
                >
                  <span>{isFavorite ? '♥' : '♡'}</span>
                  <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
                </button>
              </div>

              {/* Khung chọn số sao & gửi đánh giá đồng bộ với trang Cộng đồng */}
              {isRatingOpen && (
                <div className="detail-rating-popover">
                  <div className="rating-popover-top">
                    <span className="rating-popover-label">Chọn điểm đánh giá (tự động cập nhật lên trang Cộng đồng):</span>
                    <div className="rating-stars-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <button
                          key={score}
                          type="button"
                          className={`rating-score-pill ${(userRating || pendingRatingScore) === score ? 'active' : ''}`}
                          onClick={() => {
                            setPendingRatingScore(score);
                            handleSubmitRating(score);
                          }}
                        >
                          ★ {score}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rating-comment-row">
                    <input
                      type="text"
                      className="rating-comment-input"
                      placeholder="Nhập nhận xét ngắn về phim (tùy chọn) rồi bấm điểm ★ hoặc Gửi..."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rating-submit-btn"
                      onClick={() => handleSubmitRating(pendingRatingScore)}
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                  {ratingSuccessMsg && (
                    <div className="rating-success-notice">{ratingSuccessMsg}</div>
                  )}
                </div>
              )}

              {/* Đoạn giới thiệu nội dung phim */}
              <p className="detail-synopsis">
                {movie.description ||
                  `Bộ phim "${movie.title}" (${movie.year}) thuộc thể loại ${String(movie.genre || '').toLowerCase()}, sản xuất tại ${movie.origin}. Một tác phẩm điện ảnh đặc sắc hiện đang được công chiếu tại hệ thống rạp PTIT Cine trên toàn quốc.`}
              </p>

              {/* Hàng thông số kỹ thuật: Khởi chiếu, Thời lượng, Giới hạn tuổi */}
              <div className="detail-meta-strip">
                <div className="detail-meta-box">
                  <span className="meta-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Khởi chiếu
                  </span>
                  <strong className="meta-value">{movie.releaseDate}</strong>
                </div>

                <div className="detail-meta-box">
                  <span className="meta-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thời lượng
                  </span>
                  <strong className="meta-value">{movie.duration}</strong>
                </div>

                <div className="detail-meta-box">
                  <span className="meta-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Giới hạn tuổi
                  </span>
                  <strong className="meta-value">{movie.ageRating}</strong>
                </div>
              </div>

              {/* Thông tin Đạo diễn & Diễn viên chính */}
              <div className="detail-credits">
                <div className="credit-row">
                  <span className="credit-label">Đạo diễn:</span>
                  <span className="credit-value">{movie.director || 'Đang cập nhật'}</span>
                </div>
                <div className="credit-row">
                  <span className="credit-label">Diễn viên chính:</span>
                  <span className="credit-value">{movie.cast || 'Đang cập nhật'}</span>
                </div>
                <div className="credit-row">
                  <span className="credit-label">Xuất xứ:</span>
                  <span className="credit-value">{movie.origin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          PHẦN 2: LỀ DƯỚI MÀU ĐEN - THANH CHỌN THÀNH PHỐ, RẠP, ĐỊNH DẠNG & NGÀY CHIẾU
          ======================================================== */}
      <section className="movie-detail-black-filter-bar">
        <div className="movie-detail-container">
          <div className="filter-bar-top">
            <div className="filter-bar-heading">
              <span className="filter-bar-dot">●</span>
              <h2>Lịch chiếu & Đặt vé</h2>
            </div>

            <div className="filter-controls-group">
              {/* Chọn Thành phố */}
              <div className="filter-control-item">
                <span className="filter-control-label">Thành phố</span>
                <SearchableSelect
                  placeholder="Tất cả thành phố..."
                  options={citiesOptions}
                  selectedId={selectedCityId}
                  onSelect={handleCitySelect}
                  onClear={handleCityClear}
                />
              </div>

              {/* Chọn Rạp */}
              <div className="filter-control-item">
                <span className="filter-control-label">Rạp chiếu</span>
                <SearchableSelect
                  placeholder="Tất cả rạp..."
                  options={cinemasOptions}
                  selectedId={selectedCinemaId}
                  onSelect={handleCinemaSelect}
                  onClear={handleCinemaClear}
                />
              </div>

              {/* Chọn Định dạng (2D / 3D / IMAX...) - Kiểu nút ngoặc vuông giống Giá Vé, giữ nguyên kích thước cũ */}
              <div className="filter-control-item">
                <span className="filter-control-label">Định dạng</span>
                <div className="format-pills-group">
                  {availableFormats.map((fmt) => {
                    const isActive = selectedFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        className={`format-pill-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedFormat(fmt)}
                      >
                        <span className="format-pill-text">{fmt === 'ALL' ? 'Tất cả' : fmt}</span>
                        {isActive && (
                          <span className="format-active-dot" aria-hidden="true">
                            ●
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Thanh chọn Ngày chiếu */}
          <div className="detail-date-strip">
            {dateList.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`detail-date-card ${selectedDate === d.value ? 'active' : ''}`}
                onClick={() => setSelectedDate(d.value)}
              >
                <span className="detail-date-day">{d.dayLabel}</span>
                <strong className="detail-date-num">{d.shortDate}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          PHẦN 3: DANH SÁCH RẠP & GIỜ CHIẾU BÊN DƯỚI
          ======================================================== */}
      <section className="movie-detail-showtimes-section">
        <div className="movie-detail-container">
          {/* Hộp thông báo xác nhận khi người dùng chọn giờ chiếu */}
          {bookingNotice && (
            <div className="selected-showtime-banner">
              <div className="selected-showtime-info">
                <span className="selected-badge">Suất chiếu đang chọn</span>
                <h3>
                  {bookingNotice.movieTitle} — <span>{bookingNotice.format}</span> ({bookingNotice.roomName})
                </h3>
                <p>
                  Rạp: <strong>{bookingNotice.cinemaName}</strong> ({bookingNotice.cinemaAddress})
                  &nbsp;•&nbsp; Ngày: <strong>{bookingNotice.date}</strong>
                  &nbsp;•&nbsp; Giờ chiếu: <strong className="highlight-time">{bookingNotice.time}</strong>
                </p>
              </div>
              <div className="selected-showtime-actions">
                <button
                  type="button"
                  className="confirm-seat-btn"
                  onClick={handleContinueToSeats}
                >
                  Tiếp tục chọn ghế →
                </button>
              </div>
            </div>
          )}

          {movie.status === 'coming' && (!movie.screenings || movie.screenings.length === 0) ? (
            <div className="detail-empty-showtimes">
              <div className="empty-icon">🗓️</div>
              <h3>Phim sắp khởi chiếu vào ngày {movie.releaseDate}</h3>
              <p>
                Các suất chiếu sớm đang được cập nhật cho các cụm rạp bên dưới. Bạn có thể chọn
                trước giờ chiếu dự kiến để xem thông tin rạp.
              </p>
            </div>
          ) : null}

          {matchingCinemas.length > 0 ? (
            <div className="cinema-showtimes-list">
              {matchingCinemas.map((cinema, cIdx) => (
                <div key={cinema.id} className="cinema-showtime-card">
                  <div className="cinema-card-header">
                    <div className="cinema-brand-avatar">PTIT</div>
                    <div className="cinema-card-meta">
                      <div className="cinema-name-row">
                        <h3 className="cinema-card-name">{cinema.name}</h3>
                        <span className="cinema-city-tag">{cinema.cityName}</span>
                      </div>
                      <p className="cinema-card-address">{cinema.address}</p>
                    </div>
                    {isAdmin && isEditing && (
                      <div className="cinema-admin-controls">
                        <button
                          type="button"
                          className="cinema-admin-add-time-btn"
                          onClick={() => handleQuickAddShowtimeForCinema(cinema.id)}
                        >
                          + Thêm giờ chiếu
                        </button>
                        <button
                          type="button"
                          className="cinema-admin-remove-btn"
                          onClick={() => handleQuickRemoveCinema(cinema.id)}
                          title="Xóa rạp này khỏi danh sách chiếu phim"
                        >
                          ✕ Xóa rạp
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="cinema-formats-body">
                    {formatsToDisplay.map((fmt) => {
                      const times = getScreeningsForFormat(fmt, cinema.id);
                      return (
                        <div key={fmt} className="format-row">
                          <div className="format-label-col">
                            <span className="format-tag">{fmt}</span>
                            <span className="format-sub">Phụ đề / Lồng tiếng</span>
                          </div>

                          <div className="showtime-buttons-wrap">
                            {times.map((time, tIdx) => {
                              const isPreselected =
                                selectedTime === time &&
                                (!selectedCinemaId || selectedCinemaId === cinema.id);
                              const roomNumber = ((cIdx + tIdx) % 4) + 1;

                              return (
                                <div key={`${cinema.id}-${fmt}-${time}`} className="detail-time-btn-wrap">
                                  <button
                                    type="button"
                                    className={`detail-time-btn ${isPreselected ? 'active' : ''}`}
                                    onClick={() => handleSelectShowtime(cinema, fmt, time, roomNumber)}
                                  >
                                    <span className="time-main">{time}</span>
                                    <span className="time-price">75K</span>
                                  </button>
                                  {isAdmin && isEditing && (
                                    <button
                                      type="button"
                                      className="detail-time-remove-badge"
                                      onClick={() => handleQuickRemoveShowtime(cinema.id, time)}
                                      title={`Xóa giờ chiếu ${time}`}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="detail-empty-showtimes">
              <div className="empty-icon">🎬</div>
              <h3>Không tìm thấy cụm rạp phù hợp</h3>
              <p>
                Hiện chưa có lịch chiếu phim <strong>{movie.title}</strong> tại khu vực bạn đang lọc.
              </p>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedCityId(null);
                  setSelectedCinemaId(null);
                  setSelectedFormat('ALL');
                }}
              >
                Xem tất cả rạp chiếu
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          PHẦN 4: FOOTER ĐẶT CUỐI TRANG
          ======================================================== */}
      <Footer isVisible={true} isStatic={true} />
    </div>
  );
};

export default MovieDetailPage;
