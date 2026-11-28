import React, { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Header/Header';
import BodySlider from './components/BodySlider/BodySlider';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import MovieDetailPage from './pages/MovieDetailPage';
import AllMoviesPage from './pages/AllMoviesPage';
import CommunityPage from './pages/CommunityPage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BookingHistory from './pages/BookingHistory';
import SeatSelection from './pages/SeatSelection';
import ComboSelection from './pages/ComboSelection';
import Payment from './pages/Payment';
import TicketResult from './pages/TicketResult';
import DemoBooking from './pages/DemoBooking';
import { hasScheduleTag } from '../../server/src/data/movieSelectors';
import Wallet from './pages/Wallet';
import MyReviews from './pages/MyReviews';
import Favorites from './pages/Favorites';
import SupportPage from './pages/SupportPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { moviesData } from '../../server/src/data/moviesData';
import './App.css';

// URL riêng cho từng Slide từ Slide 1 (index 0) đến Slide 7 (index 6)
export const SLIDE_INDEX_TO_PATH = {
  0: '/',
  1: '/dat-ve-them',
  2: '/lich-chieu/dang-chieu',
  3: '/lich-chieu/sap-chieu',
  4: '/lich-chieu/phim-viet',
  5: '/gia-ve',
  6: '/khuyen-mai'
};

export const PATH_TO_SLIDE_INDEX = {
  '/': 0,
  '/slide-1': 0,
  '/dat-ve': 0,
  '/slide-2': 1,
  '/dat-ve-them': 1,
  '/slide-3': 2,
  '/lich-chieu': 2,
  '/lich-chieu/dang-chieu': 2,
  '/slide-4': 3,
  '/lich-chieu/sap-chieu': 3,
  '/slide-5': 4,
  '/lich-chieu/phim-viet': 4,
  '/slide-6': 5,
  '/gia-ve': 5,
  '/slide-7': 6,
  '/khuyen-mai': 6
};

export const getTabFromSlideIndex = (slideIndex) => {
  if (slideIndex === 0 || slideIndex === 1) return 'booking';
  if (slideIndex === 2 || slideIndex === 3 || slideIndex === 4) return 'schedule';
  if (slideIndex === 5) return 'pricing';
  if (slideIndex === 6) return 'promotion';
  return '';
};

const MainSite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const urlSearchQuery = searchParams.get('s') || '';

  const initialSlide = PATH_TO_SLIDE_INDEX[location.pathname] ?? 0;
  const [activeSlide, setActiveSlide] = useState(initialSlide);
  const [activeTab, setActiveTab] = useState(() => getTabFromSlideIndex(initialSlide));

  // Quản lý trang hiện tại: 'home' | 'detail' | 'all-movies' | 'community' | 'search'
  const [currentView, setCurrentView] = useState(() => {
    if (location.pathname === '/tim-kiem' || urlSearchQuery) return 'search';
    if (location.pathname === '/cong-dong' || location.pathname === '/community') return 'community';
    if (location.pathname === '/phim-dang-chieu' || location.pathname === '/all-movies') return 'all-movies';
    if (location.pathname.startsWith('/phim/')) return 'detail';
    return 'home';
  });

  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  // State lưu phim đang mở ở Trang Chi Tiết Phim
  const [selectedMovie, setSelectedMovie] = useState(() => {
    if (params.movieId) {
      return moviesData.find((m) => Number(m.id) === Number(params.movieId)) || null;
    }
    return null;
  });

  // State lưu lựa chọn Thành phố, Rạp, Ngày chiếu, Giờ chiếu từ Slide 3, 4, 5
  const [scheduleFilters, setScheduleFilters] = useState({
    cityId: null,
    cinemaId: null,
    date: null,
    time: null
  });

  // Đồng bộ URL với trang và từng slide
  useEffect(() => {
    const path = location.pathname;

    // Nếu Admin chuyển hướng qua state openMovieId -> chuyển sang URL riêng /phim/:id
    if (location.state?.openMovieId) {
      const targetMovie = moviesData.find((m) => Number(m.id) === Number(location.state.openMovieId));
      if (targetMovie) {
        setSelectedMovie(targetMovie);
        setCurrentView('detail');
        if (path !== `/phim/${targetMovie.id}`) {
          navigate(`/phim/${targetMovie.id}`, {
            replace: true,
            state: { autoEdit: Boolean(location.state?.autoEdit) }
          });
        }
        return;
      }
    }

    // 1. Trang Chi tiết phim: /phim/:movieId
    if (path.startsWith('/phim/')) {
      const idFromUrl = params.movieId || path.split('/phim/')[1];
      const found = moviesData.find((m) => Number(m.id) === Number(idFromUrl));
      if (found) {
        setSelectedMovie(found);
        setCurrentView('detail');
        return;
      }
    }

    // 2. Trang Tìm kiếm: /tim-kiem?s=...
    if (path === '/tim-kiem' || urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
      setCurrentView('search');
      return;
    }

    // 3. Trang Cộng đồng: /cong-dong hoặc /community
    if (path === '/cong-dong' || path === '/community') {
      setSelectedMovie(null);
      setCurrentView('community');
      setActiveTab('community');
      return;
    }

    // 4. Trang Toàn bộ phim đang chiếu: /phim-dang-chieu hoặc /all-movies
    if (path === '/phim-dang-chieu' || path === '/all-movies') {
      setSelectedMovie(null);
      setCurrentView('all-movies');
      setActiveTab('schedule');
      return;
    }

    // 5. Các Slide 1 -> 7 trên trang chủ (mỗi slide 1 URL riêng)
    if (PATH_TO_SLIDE_INDEX[path] !== undefined) {
      const idx = PATH_TO_SLIDE_INDEX[path];
      setSelectedMovie(null);
      setCurrentView('home');
      setActiveSlide(idx);
      setActiveTab(getTabFromSlideIndex(idx));
    }
  }, [location.pathname, urlSearchQuery, params.movieId, location.state]);

  // Mở trang chi tiết phim kèm URL riêng /phim/:movieId
  const handleOpenMovieDetail = (movie, preselected = {}) => {
    if (!movie) return;
    setScheduleFilters(prev => ({
      cityId: preselected.cityId !== undefined ? preselected.cityId : prev.cityId,
      cinemaId: preselected.cinemaId !== undefined ? preselected.cinemaId : prev.cinemaId,
      date: preselected.date !== undefined && preselected.date !== null ? preselected.date : prev.date,
      time: preselected.time !== undefined ? preselected.time : prev.time
    }));
    setSelectedMovie(movie);
    setCurrentView('detail');
    navigate(`/phim/${movie.id}`);
  };

  // Mở trang Toàn bộ phim đang chiếu với URL riêng /phim-dang-chieu
  const handleOpenAllMovies = (preselected = {}) => {
    setScheduleFilters(prev => ({
      cityId: preselected.cityId !== undefined ? preselected.cityId : prev.cityId,
      cinemaId: preselected.cinemaId !== undefined ? preselected.cinemaId : prev.cinemaId,
      date: preselected.date !== undefined && preselected.date !== null ? preselected.date : prev.date,
      time: preselected.time !== undefined ? preselected.time : prev.time
    }));
    setSelectedMovie(null);
    setCurrentView('all-movies');
    navigate('/phim-dang-chieu');
  };

  // Khi click Logo về trang chủ (chuyển về slide 1: /)
  const handleNavigateHome = () => {
    setSelectedMovie(null);
    setCurrentView('home');
    setActiveTab('booking');
    setActiveSlide(0);
    navigate('/');
  };

  // Khi click vào các mục trên Header -> điều hướng sang đúng URL riêng của trang/slide đó
  const handleTabChange = (tabId, _label, targetSlideIndex) => {
    if (tabId === 'community') {
      setSelectedMovie(null);
      setCurrentView('community');
      setActiveTab('community');
      navigate('/cong-dong');
      return;
    }

    let nextSlide = 0;
    if (typeof targetSlideIndex === 'number') {
      nextSlide = targetSlideIndex;
    } else if (tabId === 'booking') {
      nextSlide = 0;
    } else if (tabId === 'schedule') {
      nextSlide = 2;
    } else if (tabId === 'pricing') {
      nextSlide = 5;
    } else if (tabId === 'promotion') {
      nextSlide = 6;
    }

    setSelectedMovie(null);
    setCurrentView('home');
    setActiveTab(tabId);
    setActiveSlide(nextSlide);
    navigate(SLIDE_INDEX_TO_PATH[nextSlide] || '/');
  };

  // Khi người dùng ấn tìm kiếm -> dẫn sang page mới hiển thị nội dung liên quan (/tim-kiem?s=...)
  const handleSearch = (keyword) => {
    const cleaned = (keyword || '').trim();
    if (!cleaned) return;
    setSelectedMovie(null);
    setSearchQuery(cleaned);
    setCurrentView('search');
    navigate(`/tim-kiem?s=${encodeURIComponent(cleaned)}`);
  };

  // Khi cuộn chuột / bấm nút chuyển slide -> cập nhật URL riêng cho từng slide
  const handleSlideChange = (slideIndex) => {
    setActiveSlide(slideIndex);
    setActiveTab(getTabFromSlideIndex(slideIndex));
    setCurrentView('home');
    const targetPath = SLIDE_INDEX_TO_PATH[slideIndex] || '/';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const isLastSlide = activeSlide === 6;

  const headerActiveTab =
    currentView === 'community'
      ? 'community'
      : currentView === 'all-movies'
        ? 'schedule'
        : currentView === 'home'
          ? activeTab
          : '';

  return (
    <div className="app-container">
      {/* 1. HEADER CHÍNH */}
      <Header
        activeTab={headerActiveTab}
        activeSlide={activeSlide}
        onTabChange={handleTabChange}
        onNavigateHome={handleNavigateHome}
        onSearch={handleSearch}
        onSelectMovie={(movie) => handleOpenMovieDetail(movie, scheduleFilters)}
        currentSearchQuery={currentView === 'search' ? searchQuery : ''}
      />

      {/* 2. NỘI DUNG THEO TRANG HIỆN TẠI */}
      {currentView === 'detail' && selectedMovie ? (
        <MovieDetailPage
          movie={selectedMovie}
          initialSelection={scheduleFilters}
          autoEdit={Boolean(location.state?.autoEdit)}
          onBack={handleNavigateHome}
          onMovieUpdate={(updated) => {
            if (!hasScheduleTag(updated)) {
              handleNavigateHome();
            } else {
              setSelectedMovie(updated);
            }
          }}
        />
      ) : currentView === 'search' ? (
        <SearchResultsPage
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onOpenMovieDetail={(movie) => handleOpenMovieDetail(movie, scheduleFilters)}
          onSelectCinema={(cinema) => {
            handleOpenAllMovies({
              ...scheduleFilters,
              cityId: cinema.cityId || scheduleFilters.cityId,
              cinemaId: cinema.id
            });
          }}
        />
      ) : currentView === 'all-movies' ? (
        <AllMoviesPage
          initialSelection={scheduleFilters}
          onSelectionChange={setScheduleFilters}
          onOpenMovieDetail={handleOpenMovieDetail}
          onBack={() => {
            setCurrentView('home');
            setActiveTab('schedule');
            setActiveSlide(2);
            navigate(SLIDE_INDEX_TO_PATH[2]);
          }}
        />
      ) : currentView === 'community' ? (
        <CommunityPage
          onBackHome={handleNavigateHome}
          onOpenMovieDetail={(movie) => handleOpenMovieDetail(movie, scheduleFilters)}
        />
      ) : (
        <>
          <main className="main-content-slider">
            <BodySlider
              activeSlide={activeSlide}
              onSlideChange={handleSlideChange}
              onOpenMovieDetail={handleOpenMovieDetail}
              onOpenAllMovies={handleOpenAllMovies}
              scheduleFilters={scheduleFilters}
              onScheduleFiltersChange={setScheduleFilters}
            />
          </main>

          {/* 3. FOOTER CHÍNH */}
          <Footer isVisible={isLastSlide} />
        </>
      )}
    </div>
  );
};

const App = () => (
  <Routes>
    {/* Các URL riêng cho 7 Slide trên trang chủ */}
    <Route path="/" element={<MainSite />} />
    <Route path="/dat-ve" element={<MainSite />} />
    <Route path="/slide-1" element={<MainSite />} />
    <Route path="/dat-ve-them" element={<MainSite />} />
    <Route path="/slide-2" element={<MainSite />} />
    <Route path="/lich-chieu" element={<MainSite />} />
    <Route path="/lich-chieu/dang-chieu" element={<MainSite />} />
    <Route path="/slide-3" element={<MainSite />} />
    <Route path="/lich-chieu/sap-chieu" element={<MainSite />} />
    <Route path="/slide-4" element={<MainSite />} />
    <Route path="/lich-chieu/phim-viet" element={<MainSite />} />
    <Route path="/slide-5" element={<MainSite />} />
    <Route path="/gia-ve" element={<MainSite />} />
    <Route path="/slide-6" element={<MainSite />} />
    <Route path="/khuyen-mai" element={<MainSite />} />
    <Route path="/slide-7" element={<MainSite />} />

    {/* Các trang nội dung có URL riêng */}
    <Route path="/cong-dong" element={<MainSite />} />
    <Route path="/community" element={<MainSite />} />
    <Route path="/phim-dang-chieu" element={<MainSite />} />
    <Route path="/all-movies" element={<MainSite />} />
    <Route path="/phim/:movieId" element={<MainSite />} />
    <Route path="/tim-kiem" element={<MainSite />} />

    {/* Các trang chức năng đã có URL riêng (giữ nguyên) + URL riêng cho từng tab Admin */}
    <Route path="/demo-booking" element={<DemoBooking />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
    <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
    <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/:tab" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
    <Route path="/showtimes/:showtimeId/seats" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
    <Route path="/booking/combo" element={<ProtectedRoute><ComboSelection /></ProtectedRoute>} />
    <Route path="/booking/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
    <Route path="/ticket/:bookingId" element={<ProtectedRoute><TicketResult /></ProtectedRoute>} />
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
