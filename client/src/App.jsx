import React, { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
import Wallet from './pages/Wallet';
import MyReviews from './pages/MyReviews';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

const MainSite = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlSearchQuery = searchParams.get('s') || '';

  const [activeTab, setActiveTab] = useState('booking');
  // 0: Slide 1, 1: Slide 2, 2: Slide 3 (phim đang chiếu), 3: Slide 4 (phim sắp chiếu), 4: Slide 5 (phim Việt Nam), 5: Slide 6 (Giá vé), 6: Slide 7 (Khuyến mãi + Footer)
  const [activeSlide, setActiveSlide] = useState(0);

  // Quản lý trang hiện tại: 'home' | 'detail' | 'all-movies' | 'community' | 'search'
  const [currentView, setCurrentView] = useState(() =>
    location.pathname === '/tim-kiem' || urlSearchQuery ? 'search' : 'home'
  );
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  // Đồng bộ URL (/tim-kiem?s=... hoặc /?s=...) với trang tìm kiếm
  useEffect(() => {
    if (location.pathname === '/tim-kiem') {
      setSearchQuery(urlSearchQuery);
      setCurrentView('search');
    } else if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
      setCurrentView('search');
    }
  }, [location.pathname, urlSearchQuery]);

  // State lưu phim đang mở ở Trang Chi Tiết Phim
  const [selectedMovie, setSelectedMovie] = useState(null);

  // State lưu lựa chọn Thành phố, Rạp, Ngày chiếu, Giờ chiếu từ Slide 3, 4, 5
  const [scheduleFilters, setScheduleFilters] = useState({
    cityId: null,
    cinemaId: null,
    date: null,
    time: null
  });

  // Mở trang chi tiết phim kèm các thông tin đã chọn (nếu có)
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
    if (location.pathname !== '/' || urlSearchQuery) {
      navigate('/');
    }
  };

  // Mở trang Toàn bộ phim đang chiếu từ nút "xem tất cả->" ở Slide 3
  const handleOpenAllMovies = (preselected = {}) => {
    setScheduleFilters(prev => ({
      cityId: preselected.cityId !== undefined ? preselected.cityId : prev.cityId,
      cinemaId: preselected.cinemaId !== undefined ? preselected.cinemaId : prev.cinemaId,
      date: preselected.date !== undefined && preselected.date !== null ? preselected.date : prev.date,
      time: preselected.time !== undefined ? preselected.time : prev.time
    }));
    setSelectedMovie(null);
    setCurrentView('all-movies');
    if (location.pathname !== '/' || urlSearchQuery) {
      navigate('/');
    }
  };

  // Khi click Logo về trang chủ (chuyển về slide 1 & đóng các trang phụ)
  const handleNavigateHome = () => {
    setSelectedMovie(null);
    setCurrentView('home');
    setActiveTab('booking');
    setActiveSlide(0);
    if (location.pathname !== '/' || urlSearchQuery) {
      navigate('/');
    }
  };

  // Khi click vào các mục trên Header
  const handleTabChange = (tabId, _label, targetSlideIndex) => {
    if (location.pathname !== '/' || urlSearchQuery) {
      navigate('/');
    }

    if (tabId === 'community') {
      setSelectedMovie(null);
      setCurrentView('community');
      setActiveTab('community');
      return;
    }

    setSelectedMovie(null);
    setCurrentView('home');
    setActiveTab(tabId);
    if (typeof targetSlideIndex === 'number') {
      setActiveSlide(targetSlideIndex);
    } else if (tabId === 'booking') {
      setActiveSlide(0);
    } else if (tabId === 'schedule') {
      setActiveSlide(2);
    } else if (tabId === 'pricing') {
      setActiveSlide(5);
    } else if (tabId === 'promotion') {
      setActiveSlide(6);
    }
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

  const handleSlideChange = (slideIndex) => {
    setActiveSlide(slideIndex);
    if (slideIndex === 0 || slideIndex === 1) setActiveTab('booking');
    else if (slideIndex === 2 || slideIndex === 3 || slideIndex === 4) setActiveTab('schedule');
    else if (slideIndex === 5) setActiveTab('pricing');
    else if (slideIndex === 6) setActiveTab('promotion');
    else setActiveTab('');
  };

  const isLastSlide = activeSlide === 6;

  const headerActiveTab =
    currentView === 'community'
      ? 'community'
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
          onBack={handleNavigateHome}
          onMovieUpdate={(updated) => setSelectedMovie(updated)}
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
    <Route path="/" element={<MainSite />} />
    <Route path="/tim-kiem" element={<MainSite />} />
    <Route path="/demo-booking" element={<DemoBooking />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
    <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
    <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
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
