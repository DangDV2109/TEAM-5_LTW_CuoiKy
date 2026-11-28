import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './TicketPricePage.css';

/**
 * Slide 6: Giá Vé (TicketPricePage) - PTIT Cine
 * - Đã chuyển thành Slide 6 trên trang chủ (bỏ nút Quay về trang chủ & Breadcrumb)
 * - Nền màu xám hoàn toàn, không có circle at
 * - Góc phải trên có nút chuyển đổi ngôn ngữ [vie/eng] cỡ 0.7em + nút Chỉnh sửa (dành cho Admin) đặt ngay cạnh
 * - Khi Admin bật chế độ Chỉnh sửa:
 *   + Cho phép sửa Ngày áp dụng (effectiveDate)
 *   + Mục 2D và 3D: cho phép sửa bất kỳ nội dung nào trên bảng nhưng không được sửa số dòng hay số cột của bảng
 *   + Mục Phụ thu và Ưu đãi: chỉ cho phép chỉnh sửa các dòng chữ có màu trắng (không sửa tiêu đề màu đỏ hay số thứ tự)
 */

const TICKET_PRICE_STORAGE_KEY = 'ptit_cine_ticket_price_i18n_v1';

const DEFAULT_I18N = {
  vie: {
    title: 'GIÁ VÉ',
    effectiveDate: 'Áp dụng từ ngày 01/01/2026',
    tabs: [
      { id: '2d', label: '2D' },
      { id: '3d', label: '3D' },
      { id: 'surcharge', label: 'Phụ thu' },
      { id: 'promo', label: 'Ưu đãi' }
    ],
    table2d: {
      subjectHeader: 'Đối tượng áp dụng',
      monThu: 'Từ Thứ 2 đến Thứ 5',
      friSun: 'Thứ 6, Thứ 7, Chủ Nhật & Ngày Lễ',
      standardSeat: 'Ghế Thường',
      vipSeat: 'Ghế VIP',
      standardSeatWeekend: 'Ghế Thường',
      vipSeatWeekend: 'Ghế VIP',
      rows: [
        {
          title: 'Người lớn',
          sub: 'Khách hàng tiêu chuẩn',
          prices: ['70.000đ', '75.000đ', '85.000đ', '95.000đ'],
          type: 'normal'
        },
        {
          title: 'Học sinh, Sinh viên (U22)',
          sub: 'Xuất trình thẻ HSSV hoặc CCCD dưới 22 tuổi (hoặc đã xác thực CCCD online)',
          prices: ['55.000đ', '60.000đ', '70.000đ', '75.000đ'],
          type: 'discount'
        },
        {
          title: 'Trẻ em / Người cao tuổi',
          sub: 'Trẻ em dưới 1m3 & công dân từ 60 tuổi trở lên',
          prices: ['50.000đ', '55.000đ', '60.000đ', '65.000đ'],
          type: 'discount'
        }
      ],
      sweetbox: {
        title: 'Ghế Đôi (Sweetbox - 2 người)',
        sub: 'Bao gồm 02 vé cho cặp đôi ở hàng ghế cuối',
        monThuPrice: '160.000đ / đôi',
        friSunPrice: '200.000đ / đôi'
      }
    },
    table3d: {
      timeHeader: 'Khung giờ chiếu',
      monThu: 'Từ Thứ 2 đến Thứ 5',
      friSun: 'Thứ 6, Thứ 7, Chủ Nhật & Ngày Lễ',
      standardSeat: 'Ghế Thường',
      vipSeat: 'Ghế VIP',
      coupleSeat: 'Ghế Đôi',
      standardSeatWeekend: 'Ghế Thường',
      vipSeatWeekend: 'Ghế VIP',
      coupleSeatWeekend: 'Ghế Đôi',
      rows: [
        {
          title: 'Trước 12:00 trưa',
          sub: 'Suất chiếu sáng sớm ưu đãi',
          prices: ['65.000đ', '75.000đ', '150.000đ', '85.000đ', '95.000đ', '200.000đ']
        },
        {
          title: 'Từ 12:00 đến trước 17:00',
          sub: 'Khung giờ buổi chiều',
          prices: ['80.000đ', '90.000đ', '180.000đ', '100.000đ', '110.000đ', '230.000đ']
        },
        {
          title: 'Từ 17:00 đến 23:59',
          sub: 'Khung giờ vàng buổi tối',
          prices: ['90.000đ', '100.000đ', '200.000đ', '120.000đ', '130.000đ', '270.000đ']
        }
      ]
    },
    surcharge: {
      heading: 'Quy định chung & Phụ thu',
      items: [
        {
          label: 'Thuế GTGT (VAT)',
          desc: 'Toàn bộ giá vé niêm yết trong bảng đã bao gồm thuế giá trị gia tăng (VAT).'
        },
        {
          label: 'Phụ thu phim Bom tấn (Blockbuster) / thời lượng trên 150 phút',
          desc: '+10.000đ / vé đối với mọi loại ghế và khung giờ chiếu.'
        },
        {
          label: 'Phụ thu định dạng IMAX & Kính 3D',
          desc: 'Định dạng IMAX phụ thu +30.000đ / vé so với giá vé 3D cùng khung giờ (đã bao gồm kính 3D chuyên dụng).'
        },
        {
          label: 'Phụ thu Suất chiếu sớm (Sneak Show) & Ngày Lễ / Tết',
          desc: 'Áp dụng mức giá cuối tuần (Thứ 6, Thứ 7, Chủ Nhật) cho các ngày Lễ, Tết theo quy định của Nhà nước (1/1, Tết Âm lịch, 10/3 ÂL, 30/4 - 1/5, 2/9).'
        },
        {
          label: 'Thứ Ba Vui Vẻ (Happy Tuesday)',
          desc: 'Đồng giá vé 2D chỉ 50.000đ / vé cho mọi loại ghế đơn (không áp dụng vào Ngày Lễ/Tết và suất chiếu sớm).'
        }
      ]
    },
    promo: {
      policyHeading: 'Chính sách ưu đãi đối tượng đặc biệt',
      policies: [
        'Sinh viên PTIT & HSSV dưới 22 tuổi (U22): Áp dụng giá vé ưu đãi khi xuất trình thẻ HSSV/CCCD tại quầy hoặc tài khoản đã xác thực CCCD online (tối đa 01 vé ưu đãi / suất).',
        'Người cao tuổi (từ 60 tuổi) & Người có công với cách mạng, Người khuyết tật: Giảm từ 20% đến 50% giá vé.',
        'Trẻ em dưới 0.7m: Miễn phí vé hoàn toàn khi đi kèm người lớn và ngồi chung ghế.'
      ],
      cccdHeading: 'Hướng dẫn xác thực CCCD Online (Mua vé ưu đãi trực tuyến)',
      cccdSteps: [
        {
          step: 'Bước 1',
          title: 'Đăng nhập & Mở mục Xác thực',
          desc: 'Đăng nhập tài khoản PTIT Cine, nhấn vào mục "Tài khoản" trên thanh Header và chọn "Xác thực CCCD / U22 Online".'
        },
        {
          step: 'Bước 2',
          title: 'Chụp ảnh CCCD gắn chip hoặc liên kết VNeID',
          desc: 'Tải lên ảnh mặt trước CCCD gắn chip rõ nét (hoặc quét mã QR trên ứng dụng VNeID) để hệ thống trích xuất ngày sinh tự động.'
        },
        {
          step: 'Bước 3',
          title: 'Xác thực khuôn mặt (eKYC) trong 15 giây',
          desc: 'Thực hiện đối chiếu khuôn mặt nhanh qua camera điện thoại/máy tính để đảm bảo chính chủ.'
        },
        {
          step: 'Bước 4',
          title: 'Đặt vé U22 / Ưu đãi trực tuyến ngay lập tức',
          desc: 'Sau khi duyệt thành công, tài khoản được gắn huy hiệu "Đã xác thực CCCD" và tự động mở khóa giá vé ưu đãi khi đặt vé trên web mà không cần xếp hàng tại quầy.'
        }
      ]
    }
  },
  eng: {
    title: 'TICKET PRICES',
    effectiveDate: 'Effective from 01/01/2026',
    tabs: [
      { id: '2d', label: '2D' },
      { id: '3d', label: '3D' },
      { id: 'surcharge', label: 'Surcharge' },
      { id: 'promo', label: 'Promotions' }
    ],
    table2d: {
      subjectHeader: 'Customer Category',
      monThu: 'Monday to Thursday',
      friSun: 'Friday, Saturday, Sunday & Holidays',
      standardSeat: 'Standard Seat',
      vipSeat: 'VIP Seat',
      standardSeatWeekend: 'Standard Seat',
      vipSeatWeekend: 'VIP Seat',
      rows: [
        {
          title: 'Adults',
          sub: 'Standard ticket',
          prices: ['70.000đ', '75.000đ', '85.000đ', '95.000đ'],
          type: 'normal'
        },
        {
          title: 'Students & U22 Youth',
          sub: 'Present Student ID / National ID under 22 (or verified online)',
          prices: ['55.000đ', '60.000đ', '70.000đ', '75.000đ'],
          type: 'discount'
        },
        {
          title: 'Children / Seniors',
          sub: 'Children under 1.3m & senior citizens aged 60+',
          prices: ['50.000đ', '55.000đ', '60.000đ', '65.000đ'],
          type: 'discount'
        }
      ],
      sweetbox: {
        title: 'Sweetbox (Couple Seat - 2 Guests)',
        sub: 'Includes 02 tickets for back-row couple seats',
        monThuPrice: '160.000đ / pair',
        friSunPrice: '200.000đ / pair'
      }
    },
    table3d: {
      timeHeader: 'Showtime Slot',
      monThu: 'Monday to Thursday',
      friSun: 'Friday, Saturday, Sunday & Holidays',
      standardSeat: 'Standard',
      vipSeat: 'VIP',
      coupleSeat: 'Sweetbox',
      standardSeatWeekend: 'Standard',
      vipSeatWeekend: 'VIP',
      coupleSeatWeekend: 'Sweetbox',
      rows: [
        {
          title: 'Before 12:00 PM',
          sub: 'Early bird morning screenings',
          prices: ['65.000đ', '75.000đ', '150.000đ', '85.000đ', '95.000đ', '200.000đ']
        },
        {
          title: '12:00 PM to before 5:00 PM',
          sub: 'Afternoon screenings',
          prices: ['80.000đ', '90.000đ', '180.000đ', '100.000đ', '110.000đ', '230.000đ']
        },
        {
          title: '5:00 PM to 11:59 PM',
          sub: 'Prime-time evening screenings',
          prices: ['90.000đ', '100.000đ', '200.000đ', '120.000đ', '130.000đ', '270.000đ']
        }
      ]
    },
    surcharge: {
      heading: 'General Regulations & Surcharges',
      items: [
        {
          label: 'Value Added Tax (VAT)',
          desc: 'All listed ticket prices include Value Added Tax (VAT).'
        },
        {
          label: 'Blockbuster / Runtime over 150 mins Surcharge',
          desc: '+10.000đ / ticket across all seat types and time slots.'
        },
        {
          label: 'IMAX Format & 3D Glasses Surcharge',
          desc: 'IMAX format adds +30.000đ / ticket compared to 3D prices in the same time slot (3D glasses included).'
        },
        {
          label: 'Sneak Shows & Public Holidays',
          desc: 'Weekend pricing (Fri - Sun) applies on National Public Holidays (New Year, Lunar New Year, Hung Kings Festival, Apr 30 - May 1, Sep 2).'
        },
        {
          label: 'Happy Tuesday',
          desc: 'Flat 2D ticket price of 50.000đ / ticket for all single seats (excluding Public Holidays and Sneak Shows).'
        }
      ]
    },
    promo: {
      policyHeading: 'Special Discount Policies',
      policies: [
        'PTIT Students & U22 Youth: Discounted pricing applies when presenting Student ID/CCCD at the counter or booking with an Online CCCD-Verified account (max 01 ticket/screening).',
        'Senior Citizens (60+), War Veterans & People with Disabilities: 20% to 50% ticket discount.',
        'Toddlers under 0.7m: Free admission when accompanied by an adult and sharing a seat.'
      ],
      cccdHeading: 'Online CCCD (National ID) Verification Guide',
      cccdSteps: [
        {
          step: 'Step 1',
          title: 'Sign In & Open Verification',
          desc: 'Log in to your PTIT Cine account, click "Account" on the top Header and select "Online CCCD / U22 Verification".'
        },
        {
          step: 'Step 2',
          title: 'Scan Chip-based CCCD or VNeID QR',
          desc: 'Upload a clear photo of the front of your chip-based CCCD (or scan via the VNeID app) for automatic date-of-birth verification.'
        },
        {
          step: 'Step 3',
          title: '15-Second Liveness Check (eKYC)',
          desc: 'Complete a quick camera face match on your phone or computer to confirm identity ownership.'
        },
        {
          step: 'Step 4',
          title: 'Book Discounted U22 / Senior Tickets Online',
          desc: 'Once approved, your account receives the "CCCD Verified" badge and automatically unlocks discounted ticket prices online without queuing at the counter.'
        }
      ]
    }
  }
};

const loadPricingData = () => {
  try {
    const raw = localStorage.getItem(TICKET_PRICE_STORAGE_KEY);
    if (!raw) return DEFAULT_I18N;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.vie && parsed.eng) {
      return {
        vie: {
          ...DEFAULT_I18N.vie,
          ...parsed.vie,
          table2d: { ...DEFAULT_I18N.vie.table2d, ...(parsed.vie.table2d || {}) },
          table3d: { ...DEFAULT_I18N.vie.table3d, ...(parsed.vie.table3d || {}) },
          surcharge: { ...DEFAULT_I18N.vie.surcharge, ...(parsed.vie.surcharge || {}) },
          promo: { ...DEFAULT_I18N.vie.promo, ...(parsed.vie.promo || {}) }
        },
        eng: {
          ...DEFAULT_I18N.eng,
          ...parsed.eng,
          table2d: { ...DEFAULT_I18N.eng.table2d, ...(parsed.eng.table2d || {}) },
          table3d: { ...DEFAULT_I18N.eng.table3d, ...(parsed.eng.table3d || {}) },
          surcharge: { ...DEFAULT_I18N.eng.surcharge, ...(parsed.eng.surcharge || {}) },
          promo: { ...DEFAULT_I18N.eng.promo, ...(parsed.eng.promo || {}) }
        }
      };
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_I18N;
};

const TicketPricePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // '2d' (Vùng 1) | '3d' (Vùng 2) | 'surcharge' (Vùng 3) | 'promo' (Vùng 4)
  const [activeZone, setActiveZone] = useState('2d');
  // 'vie' | 'eng'
  const [lang, setLang] = useState('vie');
  const [pricingData, setPricingData] = useState(() => loadPricingData());
  const [isEditing, setIsEditing] = useState(false);

  const t = pricingData[lang];

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'vie' ? 'eng' : 'vie'));
  };

  // Cập nhật dữ liệu theo ngôn ngữ hiện tại và lưu vào localStorage
  const updateCurrentLangData = (updater) => {
    setPricingData((prev) => {
      const updatedLangObj = updater(prev[lang]);
      const next = {
        ...prev,
        [lang]: updatedLangObj
      };
      try {
        localStorage.setItem(TICKET_PRICE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  // Cập nhật Ngày áp dụng
  const handleEffectiveDateChange = (val) => {
    updateCurrentLangData((cur) => ({
      ...cur,
      effectiveDate: val
    }));
  };

  // Cập nhật các tiêu đề cột của bảng 2D / 3D
  const handleTableHeaderChange = (tableKey, field, val) => {
    updateCurrentLangData((cur) => ({
      ...cur,
      [tableKey]: {
        ...cur[tableKey],
        [field]: val
      }
    }));
  };

  // Cập nhật dòng trong bảng 2D / 3D (không thay đổi số dòng hay số cột)
  const handleTableRowFieldChange = (tableKey, rowIdx, field, val) => {
    updateCurrentLangData((cur) => {
      const nextRows = cur[tableKey].rows.map((r, idx) =>
        idx === rowIdx ? { ...r, [field]: val } : r
      );
      return {
        ...cur,
        [tableKey]: {
          ...cur[tableKey],
          rows: nextRows
        }
      };
    });
  };

  // Cập nhật ô giá vé trong bảng 2D / 3D
  const handleTableRowPriceChange = (tableKey, rowIdx, priceIdx, val) => {
    updateCurrentLangData((cur) => {
      const nextRows = cur[tableKey].rows.map((r, idx) => {
        if (idx !== rowIdx) return r;
        const nextPrices = [...r.prices];
        nextPrices[priceIdx] = val;
        return { ...r, prices: nextPrices };
      });
      return {
        ...cur,
        [tableKey]: {
          ...cur[tableKey],
          rows: nextRows
        }
      };
    });
  };

  // Cập nhật dòng ghế đôi Sweetbox ở bảng 2D
  const handleSweetboxChange = (field, val) => {
    updateCurrentLangData((cur) => ({
      ...cur,
      table2d: {
        ...cur.table2d,
        sweetbox: {
          ...cur.table2d.sweetbox,
          [field]: val
        }
      }
    }));
  };

  // Cập nhật các dòng chữ màu trắng ở mục Phụ thu (không cho sửa tiêu đề màu đỏ hoặc số thứ tự màu đỏ)
  const handleSurchargeItemChange = (itemIdx, field, val) => {
    updateCurrentLangData((cur) => {
      const nextItems = cur.surcharge.items.map((item, idx) =>
        idx === itemIdx ? { ...item, [field]: val } : item
      );
      return {
        ...cur,
        surcharge: {
          ...cur.surcharge,
          items: nextItems
        }
      };
    });
  };

  // Cập nhật các dòng chữ màu trắng ở mục Ưu đãi (policies)
  const handlePromoPolicyChange = (polIdx, val) => {
    updateCurrentLangData((cur) => {
      const nextPolicies = cur.promo.policies.map((p, idx) => (idx === polIdx ? val : p));
      return {
        ...cur,
        promo: {
          ...cur.promo,
          policies: nextPolicies
        }
      };
    });
  };

  // Cập nhật các dòng chữ màu trắng ở các bước CCCD trong mục Ưu đãi (step, title, desc)
  const handleCccdStepChange = (stepIdx, field, val) => {
    updateCurrentLangData((cur) => {
      const nextSteps = cur.promo.cccdSteps.map((st, idx) =>
        idx === stepIdx ? { ...st, [field]: val } : st
      );
      return {
        ...cur,
        promo: {
          ...cur.promo,
          cccdSteps: nextSteps
        }
      };
    });
  };

  return (
    <div className="ticket-price-slide">
      {/* Cụm nút góc phải trên: Nút Chỉnh sửa (Admin) đặt cạnh nút chuyển đổi ngôn ngữ [vie/eng] */}
      <div className="tp-top-right-controls">
        {isAdmin && (
          <button
            type="button"
            className={`tp-admin-edit-btn ${isEditing ? 'is-editing' : ''}`}
            onClick={() => setIsEditing((prev) => !prev)}
            title={
              isEditing
                ? 'Lưu và thoát chế độ chỉnh sửa giá vé'
                : 'Chỉnh sửa bảng giá vé, ngày áp dụng, phụ thu & ưu đãi (Quyền Admin)'
            }
          >
            {isEditing ? '✓ Xong' : '✎ Chỉnh sửa'}
          </button>
        )}

        <button
          type="button"
          className="tp-lang-switch-btn"
          onClick={handleToggleLang}
          title="Chuyển đổi ngôn ngữ Tiếng Việt / English"
        >
          [<span className={lang === 'vie' ? 'lang-active' : ''}>vie</span>/
          <span className={lang === 'eng' ? 'lang-active' : ''}>eng</span>]
        </button>
      </div>

      {/* Khung trung tâm có độ rộng bằng chiều dài bảng giá vé */}
      <div className="tp-main-box">
        {/* Hàng tiêu đề: Bên trái là "GIÁ VÉ" + "Áp dụng từ ngày...", cùng dòng bên phải là 4 nút chuyển vùng */}
        <div className="tp-header-bar">
          <div className="tp-title-left">
            <h1 className="tp-main-title">{t.title}</h1>
            {isAdmin && isEditing ? (
              <input
                type="text"
                className="tp-edit-input tp-edit-effective-date"
                value={t.effectiveDate}
                onChange={(e) => handleEffectiveDateChange(e.target.value)}
                aria-label="Chỉnh sửa ngày áp dụng"
              />
            ) : (
              <p className="tp-effective-date">{t.effectiveDate}</p>
            )}
          </div>

          {/* Ngay trên dòng kẻ xám, cùng dòng với tiêu đề: các nút "2d" "3d" "phụ thu" "ưu đãi" cỡ 0.7em */}
          <nav className="tp-zone-nav" aria-label="Chọn danh mục giá vé">
            {t.tabs.map((tab) => {
              const isActive = activeZone === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`tp-zone-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveZone(tab.id)}
                >
                  <span className="tp-zone-btn-text">{tab.label}</span>
                  {isActive && (
                    <span className="tp-zone-active-dot" aria-hidden="true">
                      ●
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dòng kẻ xám cắt ngay dưới tiêu đề, độ dài bằng chiều dài bảng giá vé */}
        <div className="tp-gray-divider" aria-hidden="true"></div>

        {/* Nội dung 4 vùng */}
        <div className="tp-zone-content" key={`${activeZone}-${lang}`}>
          {/* ================= VÙNG 1: GIÁ VÉ PHIM 2D ================= */}
          {activeZone === '2d' && (
            <div className="tp-table-wrapper">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="col-subject">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th"
                          value={t.table2d.subjectHeader}
                          onChange={(e) =>
                            handleTableHeaderChange('table2d', 'subjectHeader', e.target.value)
                          }
                        />
                      ) : (
                        t.table2d.subjectHeader
                      )}
                    </th>
                    <th colSpan="2">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table2d.monThu}
                          onChange={(e) =>
                            handleTableHeaderChange('table2d', 'monThu', e.target.value)
                          }
                        />
                      ) : (
                        t.table2d.monThu
                      )}
                    </th>
                    <th colSpan="2">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table2d.friSun}
                          onChange={(e) =>
                            handleTableHeaderChange('table2d', 'friSun', e.target.value)
                          }
                        />
                      ) : (
                        t.table2d.friSun
                      )}
                    </th>
                  </tr>
                  <tr>
                    <th>
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table2d.standardSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table2d', 'standardSeat', e.target.value)
                          }
                        />
                      ) : (
                        t.table2d.standardSeat
                      )}
                    </th>
                    <th className="vip-col-header">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center vip-col-header"
                          value={t.table2d.vipSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table2d', 'vipSeat', e.target.value)
                          }
                        />
                      ) : (
                        t.table2d.vipSeat
                      )}
                    </th>
                    <th>
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table2d.standardSeatWeekend ?? t.table2d.standardSeat}
                          onChange={(e) =>
                            handleTableHeaderChange(
                              'table2d',
                              'standardSeatWeekend',
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        t.table2d.standardSeatWeekend ?? t.table2d.standardSeat
                      )}
                    </th>
                    <th className="vip-col-header">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center vip-col-header"
                          value={t.table2d.vipSeatWeekend ?? t.table2d.vipSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table2d', 'vipSeatWeekend', e.target.value)
                          }
                        />
                      ) : (
                        t.table2d.vipSeatWeekend ?? t.table2d.vipSeat
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.table2d.rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="subject-cell">
                        {isAdmin && isEditing ? (
                          <div className="tp-edit-subject-stack">
                            <input
                              type="text"
                              className="tp-edit-input tp-edit-strong"
                              value={row.title}
                              onChange={(e) =>
                                handleTableRowFieldChange('table2d', idx, 'title', e.target.value)
                              }
                            />
                            <input
                              type="text"
                              className="tp-edit-input tp-edit-sub"
                              value={row.sub}
                              onChange={(e) =>
                                handleTableRowFieldChange('table2d', idx, 'sub', e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <>
                            <strong>{row.title}</strong>
                            <span>{row.sub}</span>
                          </>
                        )}
                      </td>
                      <td
                        className={`price-cell ${
                          row.type === 'discount' ? 'highlight-discount' : ''
                        }`}
                      >
                        {isAdmin && isEditing ? (
                          <input
                            type="text"
                            className={`tp-edit-input tp-edit-price ${
                              row.type === 'discount' ? 'highlight-discount' : ''
                            }`}
                            value={row.prices[0]}
                            onChange={(e) =>
                              handleTableRowPriceChange('table2d', idx, 0, e.target.value)
                            }
                          />
                        ) : (
                          row.prices[0]
                        )}
                      </td>
                      <td
                        className={`price-cell ${
                          row.type === 'discount' ? 'highlight-discount' : 'vip-price'
                        }`}
                      >
                        {isAdmin && isEditing ? (
                          <input
                            type="text"
                            className={`tp-edit-input tp-edit-price ${
                              row.type === 'discount' ? 'highlight-discount' : 'vip-price'
                            }`}
                            value={row.prices[1]}
                            onChange={(e) =>
                              handleTableRowPriceChange('table2d', idx, 1, e.target.value)
                            }
                          />
                        ) : (
                          row.prices[1]
                        )}
                      </td>
                      <td
                        className={`price-cell ${
                          row.type === 'discount' ? 'highlight-discount' : ''
                        }`}
                      >
                        {isAdmin && isEditing ? (
                          <input
                            type="text"
                            className={`tp-edit-input tp-edit-price ${
                              row.type === 'discount' ? 'highlight-discount' : ''
                            }`}
                            value={row.prices[2]}
                            onChange={(e) =>
                              handleTableRowPriceChange('table2d', idx, 2, e.target.value)
                            }
                          />
                        ) : (
                          row.prices[2]
                        )}
                      </td>
                      <td
                        className={`price-cell ${
                          row.type === 'discount' ? 'highlight-discount' : 'vip-price'
                        }`}
                      >
                        {isAdmin && isEditing ? (
                          <input
                            type="text"
                            className={`tp-edit-input tp-edit-price ${
                              row.type === 'discount' ? 'highlight-discount' : 'vip-price'
                            }`}
                            value={row.prices[3]}
                            onChange={(e) =>
                              handleTableRowPriceChange('table2d', idx, 3, e.target.value)
                            }
                          />
                        ) : (
                          row.prices[3]
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="sweetbox-row">
                    <td className="subject-cell">
                      {isAdmin && isEditing ? (
                        <div className="tp-edit-subject-stack">
                          <input
                            type="text"
                            className="tp-edit-input tp-edit-strong"
                            value={t.table2d.sweetbox.title}
                            onChange={(e) => handleSweetboxChange('title', e.target.value)}
                          />
                          <input
                            type="text"
                            className="tp-edit-input tp-edit-sub"
                            value={t.table2d.sweetbox.sub}
                            onChange={(e) => handleSweetboxChange('sub', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <strong>{t.table2d.sweetbox.title}</strong>
                          <span>{t.table2d.sweetbox.sub}</span>
                        </>
                      )}
                    </td>
                    <td colSpan="2" className="price-cell sweetbox-price">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-price sweetbox-price"
                          value={t.table2d.sweetbox.monThuPrice}
                          onChange={(e) => handleSweetboxChange('monThuPrice', e.target.value)}
                        />
                      ) : (
                        t.table2d.sweetbox.monThuPrice
                      )}
                    </td>
                    <td colSpan="2" className="price-cell sweetbox-price">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-price sweetbox-price"
                          value={t.table2d.sweetbox.friSunPrice}
                          onChange={(e) => handleSweetboxChange('friSunPrice', e.target.value)}
                        />
                      ) : (
                        t.table2d.sweetbox.friSunPrice
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ================= VÙNG 2: GIÁ VÉ PHIM 3D ================= */}
          {activeZone === '3d' && (
            <div className="tp-table-wrapper">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="col-subject">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th"
                          value={t.table3d.timeHeader}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'timeHeader', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.timeHeader
                      )}
                    </th>
                    <th colSpan="3">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table3d.monThu}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'monThu', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.monThu
                      )}
                    </th>
                    <th colSpan="3">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table3d.friSun}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'friSun', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.friSun
                      )}
                    </th>
                  </tr>
                  <tr>
                    <th>
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table3d.standardSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'standardSeat', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.standardSeat
                      )}
                    </th>
                    <th className="vip-col-header">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center vip-col-header"
                          value={t.table3d.vipSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'vipSeat', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.vipSeat
                      )}
                    </th>
                    <th>
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table3d.coupleSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'coupleSeat', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.coupleSeat
                      )}
                    </th>
                    <th>
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table3d.standardSeatWeekend ?? t.table3d.standardSeat}
                          onChange={(e) =>
                            handleTableHeaderChange(
                              'table3d',
                              'standardSeatWeekend',
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        t.table3d.standardSeatWeekend ?? t.table3d.standardSeat
                      )}
                    </th>
                    <th className="vip-col-header">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center vip-col-header"
                          value={t.table3d.vipSeatWeekend ?? t.table3d.vipSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'vipSeatWeekend', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.vipSeatWeekend ?? t.table3d.vipSeat
                      )}
                    </th>
                    <th>
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          className="tp-edit-input tp-edit-th tp-text-center"
                          value={t.table3d.coupleSeatWeekend ?? t.table3d.coupleSeat}
                          onChange={(e) =>
                            handleTableHeaderChange('table3d', 'coupleSeatWeekend', e.target.value)
                          }
                        />
                      ) : (
                        t.table3d.coupleSeatWeekend ?? t.table3d.coupleSeat
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.table3d.rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="subject-cell">
                        {isAdmin && isEditing ? (
                          <div className="tp-edit-subject-stack">
                            <input
                              type="text"
                              className="tp-edit-input tp-edit-strong"
                              value={row.title}
                              onChange={(e) =>
                                handleTableRowFieldChange('table3d', idx, 'title', e.target.value)
                              }
                            />
                            <input
                              type="text"
                              className="tp-edit-input tp-edit-sub"
                              value={row.sub}
                              onChange={(e) =>
                                handleTableRowFieldChange('table3d', idx, 'sub', e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <>
                            <strong>{row.title}</strong>
                            <span>{row.sub}</span>
                          </>
                        )}
                      </td>
                      {[0, 1, 2, 3, 4, 5].map((pIdx) => {
                        const isVipCol = pIdx === 1 || pIdx === 4;
                        return (
                          <td
                            key={pIdx}
                            className={`price-cell ${isVipCol ? 'vip-price' : ''}`}
                          >
                            {isAdmin && isEditing ? (
                              <input
                                type="text"
                                className={`tp-edit-input tp-edit-price ${
                                  isVipCol ? 'vip-price' : ''
                                }`}
                                value={row.prices[pIdx]}
                                onChange={(e) =>
                                  handleTableRowPriceChange('table3d', idx, pIdx, e.target.value)
                                }
                              />
                            ) : (
                              row.prices[pIdx]
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= VÙNG 3: QUY ĐỊNH CHUNG VÀ PHỤ THU ================= */}
          {activeZone === 'surcharge' && (
            <div className="tp-surcharge-panel">
              {/* Tiêu đề màu đỏ giữ nguyên không sửa */}
              <h2 className="tp-panel-title">{t.surcharge.heading}</h2>
              <div className="tp-surcharge-grid">
                {t.surcharge.items.map((item, idx) => (
                  <div key={idx} className="tp-surcharge-item">
                    {/* Số thứ tự màu đỏ giữ nguyên không sửa */}
                    <div className="tp-surcharge-num">0{idx + 1}</div>
                    <div className="tp-surcharge-body">
                      {isAdmin && isEditing ? (
                        <div className="tp-edit-white-stack">
                          <input
                            type="text"
                            className="tp-edit-input tp-edit-white-title"
                            value={item.label}
                            onChange={(e) =>
                              handleSurchargeItemChange(idx, 'label', e.target.value)
                            }
                          />
                          <textarea
                            rows="2"
                            className="tp-edit-textarea tp-edit-white-desc"
                            value={item.desc}
                            onChange={(e) =>
                              handleSurchargeItemChange(idx, 'desc', e.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <h3>{item.label}</h3>
                          <p>{item.desc}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VÙNG 4: ƯU ĐÃI + HƯỚNG DẪN XÁC THỰC CCCD ONLINE ================= */}
          {activeZone === 'promo' && (
            <div className="tp-promo-panel">
              <div className="tp-promo-block">
                {/* Tiêu đề màu đỏ giữ nguyên không sửa */}
                <h2 className="tp-panel-title">{t.promo.policyHeading}</h2>
                <ul className="tp-promo-list">
                  {t.promo.policies.map((pol, idx) => (
                    <li key={idx}>
                      {isAdmin && isEditing ? (
                        <textarea
                          rows="2"
                          className="tp-edit-textarea tp-edit-white-desc"
                          value={pol}
                          onChange={(e) => handlePromoPolicyChange(idx, e.target.value)}
                        />
                      ) : (
                        pol
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tp-cccd-guide-block">
                {/* Tiêu đề màu đỏ giữ nguyên không sửa */}
                <h2 className="tp-panel-title">{t.promo.cccdHeading}</h2>
                <div className="tp-cccd-steps-grid">
                  {t.promo.cccdSteps.map((st, idx) => (
                    <div key={idx} className="tp-cccd-step-card">
                      {isAdmin && isEditing ? (
                        <>
                          <input
                            type="text"
                            className="tp-edit-input tp-edit-step-badge"
                            value={st.step}
                            onChange={(e) =>
                              handleCccdStepChange(idx, 'step', e.target.value)
                            }
                          />
                          <input
                            type="text"
                            className="tp-edit-input tp-edit-white-title"
                            value={st.title}
                            onChange={(e) =>
                              handleCccdStepChange(idx, 'title', e.target.value)
                            }
                          />
                          <textarea
                            rows="3"
                            className="tp-edit-textarea tp-edit-white-desc"
                            value={st.desc}
                            onChange={(e) =>
                              handleCccdStepChange(idx, 'desc', e.target.value)
                            }
                          />
                        </>
                      ) : (
                        <>
                          <span className="tp-step-badge">{st.step}</span>
                          <h3>{st.title}</h3>
                          <p>{st.desc}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPricePage;
