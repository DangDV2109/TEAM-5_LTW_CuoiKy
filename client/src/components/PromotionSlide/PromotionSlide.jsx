import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import './PromotionSlide.css';

/**
 * Dữ liệu chương trình khuyến mãi tham khảo Trung tâm Chiếu phim Quốc gia (chieuphimquocgia.com.vn/promotions)
 * Chia thành nhiều trang (8 khuyến mãi / trang, lưới 4 cột x 2 hàng) chuyển bằng nút PREV và NEXT
 */
const PROMOTIONS_STORAGE_KEY = 'ptit_cine_promotions_data_v1';

const DEFAULT_PROMOTIONS_DATA = [
  // ==================== TRANG 1 ====================
  {
    id: 'promo-1',
    date: '15/11/2026',
    badge: 'U22 • 55K/VÉ 2D',
    badgeColor: '#ED1C24',
    title: 'ƯU ĐÃI ĐỒNG GIÁ VÉ 55.000Đ/VÉ 2D DÀNH CHO HỌC SINH - SINH VIÊN (U22)',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    summary:
      'Đồng giá 55.000 VNĐ/vé 2D cho tất cả các suất chiếu từ Thứ Hai đến Thứ Sáu dành cho học sinh, sinh viên từ 22 tuổi trở xuống sở hữu thẻ U22 hoặc đã xác thực CCCD online.',
    conditions: [
      'Áp dụng cho các suất chiếu 2D từ Thứ Hai đến Thứ Sáu hàng tuần.',
      'Khách hàng xuất trình thẻ HSSV/CCCD dưới 22 tuổi tại quầy hoặc đặt vé qua tài khoản đã xác thực CCCD Online.',
      'Mỗi tài khoản/thẻ U22 được mua tối đa 01 vé ưu đãi/ngày (không áp dụng cho ghế đôi và ngày Lễ, Tết).'
    ]
  },
  {
    id: 'promo-2',
    date: '12/11/2026',
    badge: 'THỨ 2 CUỐI THÁNG • 50K',
    badgeColor: '#d97706',
    title: 'THỨ HAI CUỐI THÁNG - XEM PHIM XẢ LÁNG ĐỒNG GIÁ 50.000Đ/VÉ 2D',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    summary:
      'Vào ngày Thứ Hai cuối cùng của mỗi tháng, PTIT Cine áp dụng mức giá đặc biệt đồng giá 50.000 VNĐ/vé 2D cho mọi loại ghế đơn và mọi suất chiếu trong ngày.',
    conditions: [
      'Áp dụng cho toàn bộ khách hàng đặt vé trực tuyến và mua trực tiếp tại quầy vào Thứ Hai cuối tháng.',
      'Áp dụng cho cả ghế Thường và ghế VIP ở tất cả các phòng chiếu 2D.',
      'Không áp dụng vào các dịp Lễ, Tết hoặc suất chiếu sớm (Sneak Show).'
    ]
  },
  {
    id: 'promo-3',
    date: '10/11/2026',
    badge: 'THỨ 3 ĐẦU THÁNG • BẮP 25K',
    badgeColor: '#eab308',
    title: 'THỨ BA TUẦN ĐẦU TIÊN CỦA THÁNG - ĂN BẮP SIÊU RẺ ĐỒNG GIÁ 25.000Đ',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=800&q=80',
    summary:
      'Thưởng thức bỏng ngô nóng giòn tại rạp với giá siêu ưu đãi chỉ 25.000 VNĐ/hộp vào ngày Thứ Ba tuần đầu tiên của mỗi tháng.',
    conditions: [
      'Áp dụng cho tất cả các vị bỏng: Bỏng ngọt, Caramel, Phô mai hoặc Mix 2 vị.',
      'Không giới hạn số lượng hộp bỏng mua kèm vé xem phim trong ngày khuyến mãi.',
      'Áp dụng tại toàn bộ quầy Bắp Nước thuộc hệ thống rạp PTIT Cine.'
    ]
  },
  {
    id: 'promo-4',
    date: '08/11/2026',
    badge: 'THỨ 4 TUẦN 2 • NƯỚC 15K',
    badgeColor: '#0284c7',
    title: 'THỨ TƯ TUẦN THỨ HAI CỦA THÁNG - UỐNG NƯỚC THẢ GA ĐỒNG GIÁ 15.000Đ',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    summary:
      'Giải nhiệt cực đã khi xem phim với chương trình đồng giá 15.000 VNĐ cho toàn bộ các loại nước ngọt có ga và trà chanh cỡ lớn.',
    conditions: [
      'Áp dụng cho Pepsi, 7Up, Mirinda, Lipton Ice Tea vào Thứ Tư tuần thứ hai của tháng.',
      'Áp dụng khi mua trực tiếp tại quầy F&B hoặc đặt kèm vé trên website PTIT Cine.',
      'Không áp dụng đồng thời với các chương trình tặng voucher nước miễn phí khác.'
    ]
  },
  {
    id: 'promo-5',
    date: '05/11/2026',
    badge: 'GIẢM 20% - 50%',
    badgeColor: '#16a34a',
    title: 'CHÍNH SÁCH GIẢM GIÁ VÉ CHO TRẺ EM, NGƯỜI CAO TUỔI & ĐỐI TƯỢNG CHÍNH SÁCH',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    summary:
      'Tri ân và hỗ trợ giá vé từ 20% đến 100% dành cho người có công với cách mạng, người cao tuổi (từ 60 tuổi), trẻ em và người khuyết tật.',
    conditions: [
      'Giảm 20% giá vé cho: Trẻ em dưới 16 tuổi, người cao tuổi từ đủ 60 tuổi trở lên, người có công với cách mạng.',
      'Giảm 50% giá vé cho người khuyết tật nặng; Miễn phí 100% vé cho người khuyết tật đặc biệt nặng và trẻ em dưới 0.7m đi kèm người lớn.',
      'Vui lòng xuất trình giấy tờ tùy thân / giấy xác nhận ưu đãi khi nhận vé.'
    ]
  },
  {
    id: 'promo-6',
    date: '02/11/2026',
    badge: 'HAPPY TUESDAY • 50K',
    badgeColor: '#9333ea',
    title: 'THỨ BA VUI VẺ (HAPPY TUESDAY) - ĐỒNG GIÁ VÉ 2D CHỈ 50.000Đ MỖI TUẦN',
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    summary:
      'Mỗi Thứ Ba hàng tuần, tận hưởng các siêu phẩm điện ảnh mới nhất với mức giá đồng hạng 50.000 VNĐ/vé 2D cho mọi khung giờ chiếu.',
    conditions: [
      'Áp dụng vào tất cả các ngày Thứ Ba hàng tuần (trừ ngày Lễ, Tết).',
      'Áp dụng cho ghế Thường và ghế VIP tại các phòng chiếu 2D tiêu chuẩn.',
      'Có thể đặt vé trực tuyến trước trên hệ thống PTIT Cine.'
    ]
  },
  {
    id: 'promo-7',
    date: '28/10/2026',
    badge: 'COMBO ĐÔI • TIẾT KIỆM 35%',
    badgeColor: '#e11d48',
    title: 'ƯU ĐÃI SWEETBOX & COMBO BẮP NƯỚC CẶP ĐÔI GIẢM NGAY 35% KHI ĐẶT ONLINE',
    image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=80',
    summary:
      'Đặt ghế đôi Sweetbox kèm Combo Couple (01 Bắp lớn Mix 2 vị + 02 Nước ngọt cỡ lớn) trên website để được giảm ngay 35% giá trị combo.',
    conditions: [
      'Áp dụng cho mọi suất chiếu trong tuần khi đặt ghế đôi Sweetbox trực tuyến.',
      'Nhận bắp nước nhanh tại quầy ưu tiên bằng mã QR vé điện tử.',
      'Áp dụng tại tất cả các cụm rạp PTIT Cine trên toàn quốc.'
    ]
  },
  {
    id: 'promo-8',
    date: '25/10/2026',
    badge: 'SUẤT SÁNG • TỪ 50K',
    badgeColor: '#0891b2',
    title: 'ƯU ĐÃI SUẤT CHIẾU SÁNG SỚM (TRƯỚC 12:00) & SUẤT KHUYA (SAU 22:00)',
    image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
    summary:
      'Tiết kiệm chi phí tối đa với khung giờ chiếu sáng sớm trước 12:00 trưa và suất chiếu đêm sau 22:00 tất cả các ngày trong tuần.',
    conditions: [
      'Giá vé chỉ từ 50.000đ - 65.000đ/vé đối với cả phim 2D và 3D.',
      'Tặng kèm 01 lần đổi vị bỏng miễn phí khi mua kèm Combo Bắp Nước.',
      'Áp dụng cho cả khách hàng mua tại quầy và đặt vé online.'
    ]
  },

  // ==================== TRANG 2 ====================
  {
    id: 'promo-9',
    date: '20/10/2026',
    badge: 'SINH VIÊN PTIT • TẶNG BẮP',
    badgeColor: '#ED1C24',
    title: 'ĐẶC QUYỀN SINH VIÊN PTIT: TẶNG 01 BẮP NGỌT KHI MUA TỪ 02 VÉ XEM PHIM',
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=800&q=80',
    summary:
      'Chương trình ưu đãi độc quyền dành riêng cho sinh viên và giảng viên Học viện Công nghệ Bưu chính Viễn thông (PTIT).',
    conditions: [
      'Xuất trình thẻ Sinh viên / Cán bộ PTIT hoặc đăng nhập bằng email @stu.ptit.edu.vn.',
      'Tặng ngay 01 hộp bắp ngọt tiêu chuẩn khi đặt từ 02 vé bất kỳ trở lên.',
      'Áp dụng tất cả các ngày trong tuần tại hệ thống PTIT Cine.'
    ]
  },
  {
    id: 'promo-10',
    date: '16/10/2026',
    badge: 'PHIM VIỆT • GIẢM 20%',
    badgeColor: '#dc2626',
    title: 'TUẦN LỄ TÔN VINH ĐIỆN ẢNH VIỆT NAM - GIẢM 20% COMBO KHI XEM PHIM VIỆT',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    summary:
      'Đồng hành cùng điện ảnh nước nhà: giảm ngay 20% mọi hóa đơn Bắp Nước khi khán giả đặt vé các bộ phim Việt Nam đang khởi chiếu.',
    conditions: [
      'Áp dụng cho toàn bộ danh sách phim thuộc chuyên mục Phim Việt Nam.',
      'Giảm trực tiếp 20% khi chọn mua kèm bắp nước trong bước thanh toán.',
      'Áp dụng đồng thời với giá vé ưu đãi U22.'
    ]
  },
  {
    id: 'promo-11',
    date: '11/10/2026',
    badge: 'NHÓM 4 NGƯỜI • MIỄN PHÍ 1 VÉ',
    badgeColor: '#2563eb',
    title: 'ĐI XEM PHIM NHÓM: MUA 04 VÉ TÍNH TIỀN 03 VÉ VÀO THỨ NĂM HÀNG TUẦN',
    image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=800&q=80',
    summary:
      'Rủ hội bạn thân ra rạp mỗi Thứ Năm hàng tuần: đặt 04 vé cùng suất chiếu chỉ phải thanh toán tiền 03 vé (tặng 01 vé miễn phí).',
    conditions: [
      'Áp dụng cho các suất chiếu 2D vào ngày Thứ Năm hàng tuần.',
      '4 vé phải thuộc cùng một giao dịch và cùng một suất chiếu.',
      'Không áp dụng vào ngày Lễ, Tết hoặc các suất chiếu đặc biệt.'
    ]
  },
  {
    id: 'promo-12',
    date: '06/10/2026',
    badge: 'XÁC THỰC CCCD • VOUCHER 30K',
    badgeColor: '#059669',
    title: 'TẶNG VOUCHER GIẢM 30.000Đ CHO TÀI KHOẢN LẦN ĐẦU XÁC THỰC CCCD ONLINE',
    image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=800&q=80',
    summary:
      'Hoàn tất xác thực CCCD gắn chip / VNeID trực tuyến trên PTIT Cine để mở khóa vé U22 online và nhận ngay mã giảm 30.000đ cho lần đặt vé đầu tiên.',
    conditions: [
      'Áp dụng cho tài khoản mới hoàn thành eKYC CCCD Online trong vòng 15 giây.',
      'Voucher 30.000đ tự động lưu vào kho ưu đãi của tài khoản và có hạn sử dụng 30 ngày.',
      'Áp dụng cho mọi giao dịch đặt vé trực tuyến từ 55.000đ trở lên.'
    ]
  },
  {
    id: 'promo-13',
    date: '01/10/2026',
    badge: 'IMAX & 3D • TẶNG NƯỚC',
    badgeColor: '#7c3aed',
    title: 'TRẢI NGHIỆM ĐỊNH DẠNG IMAX & 3D - TẶNG KÈM 01 LY PEPSI CỠ LỚN MIỄN PHÍ',
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80',
    summary:
      'Đắm chìm trong không gian hình ảnh 3D và âm thanh vòm IMAX sống động, nhận ngay 01 phần nước ngọt cỡ lớn hoàn toàn miễn phí cho mỗi vé.',
    conditions: [
      'Áp dụng cho mọi vé định dạng 3D và IMAX từ Thứ Hai đến Thứ Năm.',
      'Giá vé đã bao gồm kính 3D chuyên dụng khử khuẩn tiêu chuẩn.',
      'Đổi nước trực tiếp tại quầy F&B bằng cuống vé hoặc mã đặt chỗ.'
    ]
  },
  {
    id: 'promo-14',
    date: '26/09/2026',
    badge: 'SINH NHẬT THÀNH VIÊN',
    badgeColor: '#db2777',
    title: 'QUÀ TẶNG THÁNG SINH NHẬT: MIỄN PHÍ 01 COMBO BẮP NƯỚC + TẶNG VÉ 2D',
    image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80',
    summary:
      'Chúc mừng sinh nhật thành viên PTIT Cine với gói quà tặng 01 Combo Bắp Nước miễn phí (hạng Member) và thêm 01 vé 2D miễn phí (hạng VIP).',
    conditions: [
      'Áp dụng trong suốt tháng sinh nhật ghi trên CCCD của chủ tài khoản.',
      'Tài khoản cần có ít nhất 01 giao dịch phát sinh trước tháng sinh nhật.',
      'Có thể sử dụng quà tặng vào bất kỳ ngày nào trong tháng sinh nhật.'
    ]
  },
  {
    id: 'promo-15',
    date: '20/09/2026',
    badge: 'VÍ ĐIỆN TỬ • GIẢM 25K',
    badgeColor: '#0d9488',
    title: 'THANH TOÁN QUA VNPAY / MOMO / ZALOPAY - NHẬP MÃ PTITCINE GIẢM NGAY 25.000Đ',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    summary:
      'Không cần tiền mặt, quét mã QR thanh toán vé xem phim siêu tốc qua ứng dụng ngân hàng hoặc ví điện tử để được trừ trực tiếp 25.000đ.',
    conditions: [
      'Áp dụng cho hóa đơn đặt vé từ 100.000đ trở lên khi nhập mã PTITCINE.',
      'Mỗi khách hàng được hưởng ưu đãi tối đa 02 lần/tháng.',
      'Áp dụng cho tất cả các phim và khung giờ chiếu.'
    ]
  },
  {
    id: 'promo-16',
    date: '15/09/2026',
    badge: 'TÍCH ĐIỂM ĐỔI VÉ • 10%',
    badgeColor: '#ea580c',
    title: 'CHƯƠNG TRÌNH THÀNH VIÊN PTIT CINE: HOÀN ĐIỂM ĐẾN 10% MỌI GIAO DỊCH VÉ & BẮP NƯỚC',
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80',
    summary:
      'Tích lũy điểm thưởng tự động sau mỗi lần đặt vé xem phim và mua bắp nước để đổi lấy vé xem phim 2D/3D hoặc phần bắp nước miễn phí.',
    conditions: [
      'Tích 5% điểm thưởng cho hạng Thành viên chuẩn và 10% cho hạng VIP.',
      '1 điểm = 1.000 VNĐ, có thể dùng để trừ trực tiếp vào hóa đơn lần đặt vé tiếp theo.',
      'Điểm tích lũy có giá trị sử dụng trong suốt cả năm.'
    ]
  }
];

const BADGE_COLOR_PRESETS = [
  '#ED1C24',
  '#d97706',
  '#eab308',
  '#16a34a',
  '#0284c7',
  '#2563eb',
  '#9333ea',
  '#e11d48',
  '#0d9488'
];

const ITEMS_PER_PAGE = 8;

const loadPromotions = () => {
  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROMOTIONS_DATA;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_PROMOTIONS_DATA;
};

const getTodayFormatted = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const PromotionSlide = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [promotions, setPromotions] = useState(() => loadPromotions());
  const [page, setPage] = useState(0);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // State chỉnh sửa của Admin
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPromoForm, setNewPromoForm] = useState({
    image: '',
    badge: 'ƯU ĐÃI MỚI',
    badgeColor: '#ED1C24',
    date: getTodayFormatted(),
    title: '',
    summary: ''
  });

  const totalPages = Math.max(1, Math.ceil(promotions.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const savePromotionsToStorage = (nextList) => {
    setPromotions(nextList);
    try {
      localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(nextList));
    } catch {
      // ignore storage quota errors
    }
  };

  const handlePrev = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  // Xóa 1 thẻ ưu đãi khi Admin nhấn nút "x" trên góc phải thẻ
  const handleDeletePromo = (e, promoId) => {
    e.stopPropagation();
    const nextList = promotions.filter((item) => item.id !== promoId);
    savePromotionsToStorage(nextList);
    if (selectedPromo?.id === promoId) {
      setSelectedPromo(null);
    }
  };

  // Xử lý chọn file ảnh từ máy cho ưu đãi mới
  const handlePromoImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPromoForm((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Lưu ưu đãi mới do Admin tạo
  const handleAddPromoSubmit = (e) => {
    e.preventDefault();
    if (!newPromoForm.title.trim()) return;

    const fallbackImg =
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
    const created = {
      id: `promo-${Date.now()}`,
      date: newPromoForm.date.trim() || getTodayFormatted(),
      badge: newPromoForm.badge.trim() || 'ƯU ĐÃI',
      badgeColor: newPromoForm.badgeColor || '#ED1C24',
      title: newPromoForm.title.trim(),
      image: newPromoForm.image.trim() || fallbackImg,
      summary:
        newPromoForm.summary.trim() ||
        newPromoForm.title.trim(),
      conditions: [
        'Áp dụng tại toàn bộ hệ thống rạp PTIT Cine trên toàn quốc.',
        'Áp dụng cho cả khách hàng đặt vé trực tuyến và mua trực tiếp tại quầy.'
      ]
    };

    const nextList = [created, ...promotions];
    savePromotionsToStorage(nextList);
    setPage(0);
    setIsAddModalOpen(false);
    setNewPromoForm({
      image: '',
      badge: 'ƯU ĐÃI MỚI',
      badgeColor: '#ED1C24',
      date: getTodayFormatted(),
      title: '',
      summary: ''
    });
  };

  const currentItems = promotions.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <div className="promotion-slide-container">
      {/* Nút Chỉnh sửa cho Admin đặt ở góc trên bên phải; khi click xuất hiện nút "+" ngay bên dưới */}
      {isAdmin && (
        <div className="promo-admin-top-right">
          <button
            type="button"
            className={`promo-admin-edit-btn ${isEditing ? 'is-editing' : ''}`}
            onClick={() => {
              setIsEditing((prev) => !prev);
              setIsAddModalOpen(false);
            }}
            title={
              isEditing
                ? 'Thoát chế độ chỉnh sửa ưu đãi'
                : 'Chỉnh sửa: Thêm ưu đãi mới hoặc xóa thẻ ưu đãi (Quyền Admin)'
            }
          >
            {isEditing ? '✓ Xong' : '✎ Chỉnh sửa'}
          </button>

          {isEditing && (
            <button
              type="button"
              className="promo-admin-add-btn"
              onClick={() => setIsAddModalOpen(true)}
              title="Thêm chương trình ưu đãi mới"
              aria-label="Thêm chương trình ưu đãi mới"
            >
              +
            </button>
          )}
        </div>
      )}

      {/* Khu vực chính: Nút PREV bên trái + Lưới 8 thẻ Khuyến mãi (4x2) + Nút NEXT bên phải (không có tiêu đề) */}
      <div className="promo-main-area">
        <button
          type="button"
          className="promo-nav-btn prev-btn"
          onClick={handlePrev}
          aria-label="Trang khuyến mãi trước"
          title="Trang trước (PREV)"
        >
          <span className="promo-nav-arrow">◄</span>
          <span className="promo-nav-label">PREV</span>
        </button>

        <div className="promo-cards-grid" key={page}>
          {currentItems.map((item) => (
            <article
              key={item.id}
              className="ncc-promo-card"
              onClick={() => setSelectedPromo(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPromo(item);
                }
              }}
            >
              <div className="ncc-promo-thumb">
                <img
                  src={item.image}
                  alt={item.title}
                  className="ncc-promo-img"
                  loading="lazy"
                />
                <div className="ncc-promo-overlay" />
                <span
                  className="ncc-promo-badge"
                  style={{ backgroundColor: item.badgeColor }}
                >
                  {item.badge}
                </span>

                {/* Nút "x" ở góc trên bên phải mỗi thẻ khi Admin bật Chỉnh sửa */}
                {isAdmin && isEditing && (
                  <button
                    type="button"
                    className="ncc-promo-delete-btn"
                    onClick={(e) => handleDeletePromo(e, item.id)}
                    title="Xóa thẻ ưu đãi này"
                    aria-label="Xóa thẻ ưu đãi này"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="ncc-promo-body">
                <span className="ncc-promo-date">{item.date}</span>
                <h3 className="ncc-promo-title">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="promo-nav-btn next-btn"
          onClick={handleNext}
          aria-label="Trang khuyến mãi tiếp theo"
          title="Trang tiếp theo (NEXT)"
        >
          <span className="promo-nav-label">NEXT</span>
          <span className="promo-nav-arrow">►</span>
        </button>
      </div>

      {/* Modal Thêm ưu đãi mới cho Admin (khi click nút "+" dưới nút Chỉnh sửa) */}
      {isAdmin &&
        isAddModalOpen &&
        createPortal(
          <div
            className="promo-modal-backdrop"
            onClick={() => setIsAddModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="promo-modal-card promo-add-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="promo-modal-close"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Đóng"
              >
                ✕
              </button>

              <form className="promo-add-form" onSubmit={handleAddPromoSubmit}>
                <h3 className="promo-add-heading">➕ Thêm Ưu Đãi Mới (Quyền Admin)</h3>

                {/* Xem trước thẻ ưu đãi trực quan */}
                <div className="promo-add-preview">
                  <div className="promo-add-preview-thumb">
                    {newPromoForm.image ? (
                      <img src={newPromoForm.image} alt="Preview" />
                    ) : (
                      <div className="promo-add-preview-placeholder">
                        Xem trước hình ảnh ưu đãi
                      </div>
                    )}
                    <span
                      className="ncc-promo-badge"
                      style={{ backgroundColor: newPromoForm.badgeColor || '#ED1C24' }}
                    >
                      {newPromoForm.badge || 'NHÃN GÓC TRÊN TRÁI'}
                    </span>
                  </div>
                </div>

                {/* 1. Nhập link ảnh hoặc nộp file ảnh */}
                <div className="promo-add-field">
                  <label>Hình ảnh ưu đãi (Nhập link ảnh hoặc nộp file ảnh từ máy)</label>
                  <div className="promo-add-image-row">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newPromoForm.image}
                      onChange={(e) =>
                        setNewPromoForm((prev) => ({ ...prev, image: e.target.value }))
                      }
                    />
                    <label className="promo-upload-file-btn">
                      📁 Nộp file ảnh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePromoImageUpload}
                        hidden
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Chọn màu và nội dung nhãn góc trên bên trái trên ảnh */}
                <div className="promo-add-row-2col">
                  <div className="promo-add-field">
                    <label>Nội dung góc trên bên trái trên ảnh</label>
                    <input
                      type="text"
                      placeholder="VD: U22 • 55K/VÉ 2D"
                      value={newPromoForm.badge}
                      onChange={(e) =>
                        setNewPromoForm((prev) => ({ ...prev, badge: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="promo-add-field">
                    <label>Màu nhãn góc trên bên trái</label>
                    <div className="promo-color-picker-wrap">
                      <input
                        type="color"
                        className="promo-color-input"
                        value={newPromoForm.badgeColor}
                        onChange={(e) =>
                          setNewPromoForm((prev) => ({ ...prev, badgeColor: e.target.value }))
                        }
                        title="Chọn màu tùy ý"
                      />
                      <div className="promo-color-presets">
                        {BADGE_COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`promo-color-swatch ${
                              newPromoForm.badgeColor.toLowerCase() === c.toLowerCase()
                                ? 'active'
                                : ''
                            }`}
                            style={{ backgroundColor: c }}
                            onClick={() =>
                              setNewPromoForm((prev) => ({ ...prev, badgeColor: c }))
                            }
                            aria-label={`Màu ${c}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Ngày tháng và dòng chữ ghi nội dung ưu đãi */}
                <div className="promo-add-field">
                  <label>Ngày tháng áp dụng / đăng tải</label>
                  <input
                    type="text"
                    placeholder="VD: 26/11/2026"
                    value={newPromoForm.date}
                    onChange={(e) =>
                      setNewPromoForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="promo-add-field">
                  <label>Dòng chữ nội dung ưu đãi trên thẻ</label>
                  <textarea
                    rows="2"
                    placeholder="Nhập tiêu đề / dòng chữ nội dung ưu đãi hiển thị trên thẻ..."
                    value={newPromoForm.title}
                    onChange={(e) =>
                      setNewPromoForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="promo-add-field">
                  <label>Mô tả chi tiết (tùy chọn)</label>
                  <textarea
                    rows="2"
                    placeholder="Nhập mô tả chi tiết khi khách hàng bấm vào xem thẻ..."
                    value={newPromoForm.summary}
                    onChange={(e) =>
                      setNewPromoForm((prev) => ({ ...prev, summary: e.target.value }))
                    }
                  />
                </div>

                <div className="promo-add-actions">
                  <button
                    type="button"
                    className="promo-cancel-btn"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="promo-submit-btn">
                    + Thêm ưu đãi
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal xem chi tiết thể lệ khuyến mãi khi click vào thẻ (render qua Portal ra document.body để không bị lệch bởi transform của slides-track) */}
      {selectedPromo &&
        createPortal(
          <div
            className="promo-modal-backdrop"
            onClick={() => setSelectedPromo(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="promo-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="promo-modal-close"
                onClick={() => setSelectedPromo(null)}
                aria-label="Đóng"
              >
                ✕
              </button>

              <div className="promo-modal-banner">
                <img src={selectedPromo.image} alt={selectedPromo.title} />
                <span
                  className="promo-modal-badge"
                  style={{ backgroundColor: selectedPromo.badgeColor }}
                >
                  {selectedPromo.badge}
                </span>
              </div>

              <div className="promo-modal-content">
                <span className="promo-modal-date">Ngày đăng: {selectedPromo.date}</span>
                <h3 className="promo-modal-title">{selectedPromo.title}</h3>
                <p className="promo-modal-summary">{selectedPromo.summary}</p>

                <div className="promo-modal-rules">
                  <h4>Điều kiện &amp; Thể lệ áp dụng:</h4>
                  <ul>
                    {(selectedPromo.conditions || []).map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default PromotionSlide;
