import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  activeTab = 'booking',
  activeSlide = 0,
  onTabChange = () => { }
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Danh sách các mục điều hướng (đã đổi vị trí KHUYẾN MÃI và CỘNG ĐỒNG)
  const navItems = [
    { id: 'booking', label: 'ĐẶT VÉ' },
    {
      id: 'schedule',
      label: 'LỊCH CHIẾU',
      subItems: [
        { id: 'schedule-now', label: ' -     ĐANG CHIẾU', slideIndex: 2 },
        { id: 'schedule-coming', label: '-     SẮP CHIẾU', slideIndex: 3 },
        { id: 'schedule-vietnam', label: '-     PHIM VIỆT', slideIndex: 4 },
      ]
    },
    { id: 'pricing', label: 'GIÁ VÉ' },
    { id: 'promotion', label: 'KHUYẾN MÃI' },
    { id: 'community', label: 'CỘNG ĐỒNG' },
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

  // Click các nút điều hướng
  const handleNavClick = (e, item, targetSlideIndex) => {
    e.preventDefault();
    setCurrentTab(item.id);
    setIsMobileMenuOpen(false); // Tự động đóng menu trên điện thoại sau khi chọn
    onTabChange(item.id, item.label, targetSlideIndex);
    navigate('/'); // nếu đang ở trang của TV2 thì quay về trang chủ rồi mới đổi slide
  };

  // Click nút Tài khoản
  const handleAccountClick = () => {
    setIsMobileMenuOpen(false);
    navigate(user ? '/profile' : '/login');
  };

  // Submit tìm kiếm khi nhấn Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(keyword.trim());
      setIsMobileMenuOpen(false);
    }
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
            {navItems.map(({ id, label, subItems }) => {
              const effectiveTab = activeTab !== undefined ? activeTab : currentTab;
              return (
                <div key={id} className="nav-item-wrap">
                  <button
                    type="button"
                    className={`nav-item-btn ${effectiveTab === id ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, { id, label })}
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
                              handleNavClick(e, { id, label: sub.label }, sub.slideIndex);
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
          {/* Thanh tìm kiếm */}
          <div className="search-wrapper">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="nhập từ khóa tìm kiếm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearchSubmit}
              aria-label="Tìm kiếm phim"
            />
          </div>

          {/* Icon Bản đồ (Map) - Ảnh 3, cỡ 2em */}
          <button
            type="button"
            className="map-btn"
            title="Vị trí rạp chiếu"
            onClick={() => console.log('Click Map')}
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
            onClick={() => console.log('Click Hỗ trợ')}
          >
            hỗ trợ
          </button>

          {/* Nút Tài khoản: chưa đăng nhập -> /login, đã đăng nhập -> /profile */}
          <button
            type="button"
            className="header-action-btn"
            onClick={handleAccountClick}
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
          {navItems.map(({ id, label, subItems }) => {
            const effectiveTab = activeTab !== undefined ? activeTab : currentTab;
            return (
              <React.Fragment key={id}>
                <button
                  type="button"
                  className={`mobile-nav-item ${effectiveTab === id ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, { id, label })}
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
                        onClick={(e) => handleNavClick(e, { id, label: sub.label }, sub.slideIndex)}
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
              onClick={handleAccountClick}
            >
              {user ? `Tài khoản: ${user.name}` : 'Đăng nhập / Đăng ký'}
            </button>
            <button
              type="button"
              className="mobile-footer-btn"
              onClick={() => { setIsMobileMenuOpen(false); console.log('Hỗ trợ'); }}
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