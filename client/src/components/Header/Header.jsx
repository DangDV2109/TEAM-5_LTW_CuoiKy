import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import './Header.css';
import ptitLogo from '../../assets/ptit-logo.png';
import mapIcon from '../../assets/map-icon.png';

/**
 * Header Component - PTIT Cine
 * - Màn hình máy tính: Giữ nguyên như ban đầu (5 nút ĐẶT VÉ, LỊCH CHIẾU... cạnh logo với hover Arena Breakout).
 * - Màn hình điện thoại (khi thu nhỏ): Tự động ẩn 5 nút và hiện nút 3 gạch (Hamburger Menu).
 *   Khi click nút 3 gạch sẽ trượt mở menu chứa toàn bộ các nút bị ẩn.
 * - Nút Tài khoản: chưa đăng nhập -> /login, đã đăng nhập -> /profile (TV2).
 */
const Header = ({
  onNavigateHome = () => { },
  onSearch = () => { },
  onSelectMovie,
  currentSearchQuery = '',
  activeTab = 'booking',
  activeSlide = 0,
  onTabChange = () => { }
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const accountWrapRef = useRef(null);
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Danh sách các mục điều hướng kèm URL riêng cho từng trang và từng slide
  const navItems = [
    { id: 'booking', label: 'ĐẶT VÉ', path: '/', slideIndex: 0 },
    {
      id: 'schedule',
      label: 'LỊCH CHIẾU',
      path: '/lich-chieu/dang-chieu',
      slideIndex: 2,
      subItems: [
        { id: 'schedule-now', label: ' -     ĐANG CHIẾU', slideIndex: 2, path: '/lich-chieu/dang-chieu' },
        { id: 'schedule-coming', label: '-     SẮP CHIẾU', slideIndex: 3, path: '/lich-chieu/sap-chieu' },
        { id: 'schedule-vietnam', label: '-     PHIM VIỆT', slideIndex: 4, path: '/lich-chieu/phim-viet' },
      ]
    },
    { id: 'pricing', label: 'GIÁ VÉ', path: '/gia-ve', slideIndex: 5 },
    { id: 'promotion', label: 'KHUYẾN MÃI', path: '/khuyen-mai', slideIndex: 6 },
    { id: 'community', label: 'CỘNG ĐỒNG', path: '/cong-dong' },
  ];

  // Đóng/Mở menu 3 gạch
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Click logo về trang chủ
  const handleLogoClick = (e) => {
    e.preventDefault();
    setCurrentTab('');
    setIsMobileMenuOpen(false);
    onNavigateHome();
    navigate('/'); // nếu đang ở trang /login, /profile... thì quay về trang chủ
  };

  // Click các nút điều hướng -> chuyển thẳng tới URL riêng của từng trang / slide
  const handleNavClick = (e, item, targetSlideIndex, targetPath) => {
    e.preventDefault();
    setCurrentTab(item.id);
    setIsMobileMenuOpen(false); // Tự động đóng menu trên điện thoại sau khi chọn
    const resolvedPath =
      targetPath ||
      item.path ||
      (item.id === 'community' ? '/cong-dong' : '/');
    onTabChange(item.id, item.label, targetSlideIndex);
    navigate(resolvedPath);
  };

  // Click nút Bản đồ: mở tab mới qua Google Maps tìm rạp chiếu phim gần nhất
  const handleMapClick = () => {
    setIsMobileMenuOpen(false);
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent('rạp chiếu phim gần nhất')}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Click nút Tài khoản: chưa đăng nhập -> /login; đã đăng nhập -> bật/tắt menu tài khoản
  const handleAccountClick = () => {
    setIsMobileMenuOpen(false);
    if (user) setAccountMenuOpen((v) => !v);
    else navigate('/login');
  };

  // Rê chuột giữ ~0.4s mới mở menu; rời chuột ~0.25s thì đóng
  const hoverAccount = () => {
    if (!user) return;
    clearTimeout(closeTimer.current);
    if (!accountMenuOpen) openTimer.current = setTimeout(() => setAccountMenuOpen(true), 400);
  };
  const leaveAccount = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setAccountMenuOpen(false), 250);
  };
  const goTo = (path) => { setAccountMenuOpen(false); setIsMobileMenuOpen(false); navigate(path); };
  const handleLogout = () => { setAccountMenuOpen(false); setIsMobileMenuOpen(false); logout(); navigate('/login', { replace: true }); };

  // Bấm ra ngoài hoặc nhấn Esc thì đóng menu
  useEffect(() => {
    if (!accountMenuOpen) return undefined;
    const onDown = (e) => { if (accountWrapRef.current && !accountWrapRef.current.contains(e.target)) setAccountMenuOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setAccountMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [accountMenuOpen]);
  useEffect(() => { if (!user) setAccountMenuOpen(false); }, [user]);
  useEffect(() => () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); }, []);

  // Thực thi tìm kiếm từ SearchBar engine
  const handleExecuteSearch = (searchTerm) => {
    if (!searchTerm) return;
    onSearch(searchTerm);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="ptit-header">
      {/* ================= PHẦN TRÊN THANH HEADER ================= */}
      <div className="header-main-bar">
        {/* NHÓM 1: Logo và các nút điều hướng trên máy tính */}
        <div className="header-left">
          {/* Logo PTIT Cine */}
          <div
            className="brand-logo"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            title="PTIT Cine"
          >
            <img
              src={ptitLogo}
              alt="PTIT Logo"
              className="brand-logo-img"
            />
            <span className="brand-title">Cine</span>
          </div>

          {/* Dải 5 nút cho MÁY TÍNH (ẩn trên điện thoại) */}
          <nav className="header-nav-desktop" aria-label="Desktop Navigation">
            {navItems.map(({ id, label, path, slideIndex, subItems }) => {
              const effectiveTab = activeTab !== undefined ? activeTab : currentTab;
              return (
                <div key={id} className="nav-item-wrap">
                  <button
                    type="button"
                    className={`nav-item-btn ${effectiveTab === id ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, { id, label, path }, slideIndex, path)}
                  >
                    {label}
                  </button>

                  {subItems && (
                    <div className="nav-dropdown-menu" role="menu" aria-label={label}>
                      {subItems.map(sub => {
                        const isSubActive =
                          effectiveTab === 'schedule' && activeSlide === sub.slideIndex;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            role="menuitem"
                            className={`nav-dropdown-item ${isSubActive ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavClick(e, { id, label: sub.label, path: sub.path }, sub.slideIndex, sub.path);
                            }}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* NHÓM 2: Search, Map, Hỗ trợ, Tài khoản + Nút 3 gạch */}
        <div className="header-right">
          {/* Thanh tìm kiếm với engine từ searchbar/src */}
          <SearchBar
            initialQuery={currentSearchQuery}
            onSearch={handleExecuteSearch}
            onSelectMovie={onSelectMovie}
          />

          {/* Icon Bản đồ (Map) - Mở tab mới Google Maps tìm rạp chiếu phim gần nhất */}
          <button
            type="button"
            className="map-btn"
            title="Tìm rạp chiếu phim gần nhất trên Google Maps"
            aria-label="Tìm rạp chiếu phim gần nhất trên Google Maps"
            onClick={handleMapClick}
          >
            <img
              src={mapIcon}
              alt="Bản đồ rạp"
              className="map-icon-img"
            />
          </button>

          {/* Nút Hỗ trợ (ẩn trên điện thoại, hiển thị trong menu 3 gạch) */}
          <button
            type="button"
            className="header-action-btn desktop-only"
            onClick={() => goTo('/support')}
          >
            hỗ trợ
          </button>

          {/* Nút Tài khoản: chưa đăng nhập -> /login; đã đăng nhập -> rê chuột/bấm để mở menu tài khoản */}
          <div
            className="account-menu-wrap"
            ref={accountWrapRef}
            onMouseEnter={hoverAccount}
            onMouseLeave={leaveAccount}
          >
            <button
              type="button"
              className="header-action-btn"
              onClick={handleAccountClick}
              aria-haspopup={user ? 'menu' : undefined}
              aria-expanded={user ? accountMenuOpen : undefined}
            >
              <svg
                className="user-icon"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
              <span className="desktop-only">{user ? user.name : 'tài khoản'}</span>
            </button>

            {user && accountMenuOpen && (
              <div className="account-dropdown" role="menu">
                <div className="account-dropdown-head">
                  <b>{user.name}</b>
                  {user.email && <span>{user.email}</span>}
                  <span>Số dư ví: {Number(user.balance || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <button type="button" role="menuitem" onClick={() => goTo('/profile')}>⚙️ Cài đặt tài khoản</button>
                <button type="button" role="menuitem" onClick={() => goTo('/wallet')}>💰 Nạp tiền & giao dịch</button>
                <button type="button" role="menuitem" onClick={() => goTo('/history')}>🎟️ Lịch sử mua vé</button>
                <button type="button" role="menuitem" onClick={() => goTo('/my-reviews')}>⭐ Lịch sử đánh giá</button>
                <button type="button" role="menuitem" onClick={() => goTo('/favorites')}>♥ Phim yêu thích</button>
                {String(user.role || '').toLowerCase() === 'admin' && (
                  <button type="button" role="menuitem" onClick={() => goTo('/admin')}>🛠️ Trang quản trị</button>
                )}
                <button type="button" role="menuitem" className="danger" onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>

          {/* NÚT 3 GẠCH (HAMBURGER BUTTON) - Chỉ hiện khi thu nhỏ trên điện thoại */}
          <button
            type="button"
            className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Mở menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* ================= MENU XỔ XUỐNG KHI BẤM NÚT 3 GẠCH (MOBILE) ================= */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <nav className="mobile-nav-list" aria-label="Mobile Navigation">
          {navItems.map(({ id, label, path, slideIndex, subItems }) => {
            const effectiveTab = activeTab !== undefined ? activeTab : currentTab;
            return (
              <React.Fragment key={id}>
                <button
                  type="button"
                  className={`mobile-nav-item ${effectiveTab === id ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, { id, label, path }, slideIndex, path)}
                >
                  <span>{label}</span>
                  <span className="mobile-nav-arrow">›</span>
                </button>

                {subItems && (
                  <div className="mobile-subnav-list">
                    {subItems.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        className={`mobile-subnav-item ${
                          effectiveTab === 'schedule' && activeSlide === sub.slideIndex ? 'active' : ''
                        }`}
                        onClick={(e) => handleNavClick(e, { id, label: sub.label, path: sub.path }, sub.slideIndex, sub.path)}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Tiện ích thêm trong menu mobile */}
          <div className="mobile-menu-footer">
            <button
              type="button"
              className="mobile-footer-btn"
              onClick={() => goTo(user ? '/profile' : '/login')}
            >
              {user ? `Tài khoản: ${user.name}` : 'Đăng nhập / Đăng ký'}
            </button>
            {user && (
              <button type="button" className="mobile-footer-btn" onClick={handleLogout}>Đăng xuất</button>
            )}
            <button
              type="button"
              className="mobile-footer-btn"
              onClick={() => goTo('/support')}
            >
              Hỗ trợ khách hàng
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;