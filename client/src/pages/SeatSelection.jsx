import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { SHOWTIMES, getUserListOverrides, setUserListOverride } from "../api/mockAdapter";
import SeatMap from "../components/SeatMap";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { booking, update } = useBooking();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const location = useLocation();

  // Thông tin suất chiếu do trang chi tiết phim truyền sang (còn lưu lại khi F5)
  const info = location.state?.info || booking.showtimeInfo;
  const infoText = info
    ? [info.movieTitle, info.cinemaName, info.date, info.time].filter(Boolean).join(" · ")
    : SHOWTIMES[showtimeId]
      ? `${SHOWTIMES[showtimeId].movieTitle} · ${SHOWTIMES[showtimeId].showtime}`
      : "";

  // Tên phòng hiển thị cạnh chữ Đặt ghế
  const roomName =
    info?.roomName ||
    SHOWTIMES[showtimeId]?.roomName ||
    (info?.format ? `Phòng 01 (${info.format})` : "Phòng 01 (2D)");

  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // State cho hộp thoại Admin xem thông tin người dùng của ghế đã chọn / đang bị giữ
  const [inspectedSeat, setInspectedSeat] = useState(null);

  const loadSeats = () =>
    axiosClient
      .get(`/showtimes/${showtimeId}/seats`)
      .then((r) => setSeats(Array.isArray(r.data) ? r.data : r.data?.seats || []))
      .catch((err) => setError(err.message || "Không tải được sơ đồ ghế"));

  useEffect(() => {
    loadSeats();
  }, [showtimeId]);

  useEffect(() => {
    if (location.state?.info) update({ showtimeInfo: location.state.info });
  }, []);

  const toggle = (seat) =>
    setSelected((cur) =>
      cur.some((s) => s.id === seat.id) ? cur.filter((s) => s.id !== seat.id) : [...cur, seat]
    );

  const total = selected.reduce((sum, s) => sum + Number(s.price), 0);

  // Xử lý khi Admin click vào ghế đã đặt, đang bị giữ hoặc ghế đang chọn
  const handleInspectSeat = (seat) => {
    if (seat.isCurrentSelection) {
      const overrides = getUserListOverrides();
      const email = user?.email || "admin@ptitcine.vn";
      const ov = overrides[email.toLowerCase()];
      setInspectedSeat({
        ...seat,
        customer: {
          name: user?.name || "Quản trị viên",
          email,
          phone: user?.phone || "0900 000 000",
          listType: ov?.listType || "vip",
          note: ov?.note || "Tài khoản đang thao tác chọn ghế trực tiếp trên phiên hiện tại",
          bookedAt: "Đang chọn trên màn hình",
          bookingCode: "ĐANG CHỌN"
        }
      });
    } else {
      setInspectedSeat(seat);
    }
  };

  // Admin đánh dấu / đổi trạng thái Danh sách VIP hoặc Danh sách đen cho người dùng
  const handleMarkCustomerList = (listType) => {
    if (!inspectedSeat?.customer?.email) return;
    const email = inspectedSeat.customer.email;
    const defaultNote =
      listType === "blacklist"
        ? "Cảnh báo Danh sách đen: Tài khoản bị đánh dấu vi phạm quy định đặt vé"
        : listType === "vip"
          ? "Khách hàng thuộc Danh sách VIP - Ưu tiên phục vụ"
          : "Khách hàng tiêu chuẩn";

    setUserListOverride(email, listType, defaultNote);
    setInspectedSeat((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        listType,
        note: defaultNote
      }
    }));
    loadSeats();
  };

  const onContinue = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await axiosClient.post("/bookings/hold", {
        showtimeId,
        seatIds: selected.map((s) => s.id),
        showtimeInfo: info ? { ...info, roomName } : { roomName },
      });
      update({
        showtimeId,
        seats: selected.map((s) => ({ id: s.id, label: `${s.row}${s.number}`, price: Number(s.price) })),
        bookingId: data.bookingId,
        expiresAt: data.expiresAt,
        combos: [],
      });
      navigate("/booking/combo");
    } catch (err) {
      setError(err.response?.data?.message || "Có ghế vừa được người khác chọn. Hãy chọn lại.");
      setSelected([]);
      loadSeats();
    } finally {
      setBusy(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="tv2-page wide">
      {/* Thanh trên cùng: Nút quay lại */}
      <div className="tv2-seat-topbar">
        <button type="button" className="tv2-back-btn" onClick={handleBack}>
          ← Quay lại
        </button>
        {isAdmin && (
          <span className="tv2-admin-hint">
            🛡️ Chế độ Admin: Nhấn vào ghế đã chọn / đã đặt / đang bị giữ để xem thông tin người dùng (VIP / Danh sách đen)
          </span>
        )}
      </div>

      {/* Tiêu đề Đặt ghế + Tên phòng bên cạnh */}
      <div className="tv2-seat-header-row">
        <h2>Đặt ghế</h2>
        <span className="tv2-room-badge">{roomName}</span>
      </div>

      {infoText && <p className="tv2-showtime-sub">{infoText}</p>}

      <SeatMap
        seats={seats}
        selectedIds={selected.map((s) => s.id)}
        onToggle={toggle}
        isAdmin={isAdmin}
        onInspectSeat={handleInspectSeat}
      />

      {error && <p className="tv2-error">{error}</p>}

      <div className="tv2-booking-summary-bar">
        <div>
          <p style={{ margin: "0 0 4px" }}>
            Ghế đã chọn: <b>{selected.map((s) => `${s.row}${s.number}`).join(", ") || "chưa chọn"}</b>
          </p>
          <p style={{ margin: 0 }}>
            Tạm tính: <b style={{ color: "var(--tv2-accent)", fontSize: "1.1rem" }}>{total.toLocaleString()}đ</b>
          </p>
        </div>
        <button className="tv2-btn" disabled={selected.length === 0 || busy} onClick={onContinue}>
          {busy ? "Đang giữ ghế..." : "Giữ ghế và tiếp tục →"}
        </button>
      </div>

      {/* HỘP THOẠI XEM THÔNG TIN NGƯỜI DÙNG ĐẶT / GIỮ GHẾ DÀNH CHO ADMIN */}
      {isAdmin && inspectedSeat && (
        <div className="tv2-modal" onClick={() => setInspectedSeat(null)}>
          <div className="tv2-admin-user-card" onClick={(e) => e.stopPropagation()}>
            <div className="tv2-admin-card-head">
              <div>
                <span className="tv2-admin-seat-tag">
                  Ghế {inspectedSeat.row}{inspectedSeat.number} ({inspectedSeat.type})
                </span>
                <h3>Thông tin người dùng</h3>
              </div>
              <button
                type="button"
                className="tv2-admin-close-btn"
                onClick={() => setInspectedSeat(null)}
              >
                ✕
              </button>
            </div>

            {/* Huy hiệu cảnh báo Danh sách đen hoặc Danh sách VIP */}
            {inspectedSeat.customer?.listType === "blacklist" && (
              <div className="tv2-user-list-alert blacklist">
                <strong>⚠️ TRONG DANH SÁCH ĐEN (BLACKLIST)</strong>
                <p>{inspectedSeat.customer.note}</p>
              </div>
            )}

            {inspectedSeat.customer?.listType === "vip" && (
              <div className="tv2-user-list-alert vip">
                <strong>👑 TRONG DANH SÁCH VIP</strong>
                <p>{inspectedSeat.customer.note}</p>
              </div>
            )}

            {(!inspectedSeat.customer?.listType || inspectedSeat.customer?.listType === "normal") && (
              <div className="tv2-user-list-alert normal">
                <strong>👤 KHÁCH HÀNG THÔNG THƯỜNG</strong>
                <p>{inspectedSeat.customer?.note || "Không nằm trong danh sách đen hay danh sách VIP"}</p>
              </div>
            )}

            <div className="tv2-admin-user-details">
              <div className="tv2-detail-row">
                <span>Họ và tên:</span>
                <strong>{inspectedSeat.customer?.name || "Khách vãng lai"}</strong>
              </div>
              <div className="tv2-detail-row">
                <span>Email:</span>
                <strong>{inspectedSeat.customer?.email || "Chưa cập nhật"}</strong>
              </div>
              <div className="tv2-detail-row">
                <span>Số điện thoại:</span>
                <strong>{inspectedSeat.customer?.phone || "Chưa cập nhật"}</strong>
              </div>
              <div className="tv2-detail-row">
                <span>Trạng thái ghế:</span>
                <strong>
                  {inspectedSeat.isCurrentSelection
                    ? "Đang chọn trên màn hình"
                    : inspectedSeat.status === "sold"
                      ? "Đã đặt & thanh toán"
                      : "Đang được giữ tạm thời"}
                </strong>
              </div>
              <div className="tv2-detail-row">
                <span>Thời gian:</span>
                <strong>{inspectedSeat.customer?.bookedAt || "Vừa xong"}</strong>
              </div>
              <div className="tv2-detail-row">
                <span>Mã giao dịch:</span>
                <strong>{inspectedSeat.customer?.bookingCode || "N/A"}</strong>
              </div>
            </div>

            {/* Cho phép Admin đánh dấu nhanh người dùng vào Danh sách VIP / Danh sách đen */}
            <div className="tv2-admin-mark-actions">
              <span className="tv2-mark-label">Đánh dấu phân loại người dùng:</span>
              <div className="tv2-mark-btns">
                <button
                  type="button"
                  className={`tv2-mark-btn vip ${inspectedSeat.customer?.listType === "vip" ? "active" : ""}`}
                  onClick={() => handleMarkCustomerList("vip")}
                >
                  👑 Đánh dấu VIP
                </button>
                <button
                  type="button"
                  className={`tv2-mark-btn blacklist ${inspectedSeat.customer?.listType === "blacklist" ? "active" : ""}`}
                  onClick={() => handleMarkCustomerList("blacklist")}
                >
                  ⚠️ Đưa vào Danh sách đen
                </button>
                <button
                  type="button"
                  className={`tv2-mark-btn normal ${(!inspectedSeat.customer?.listType || inspectedSeat.customer?.listType === "normal") ? "active" : ""}`}
                  onClick={() => handleMarkCustomerList("normal")}
                >
                  Khách thường
                </button>
              </div>
            </div>

            <div className="tv2-admin-modal-foot">
              {inspectedSeat.isCurrentSelection && (
                <button
                  type="button"
                  className="tv2-btn ghost"
                  onClick={() => {
                    toggle(inspectedSeat);
                    setInspectedSeat(null);
                  }}
                >
                  Bỏ chọn ghế {inspectedSeat.row}{inspectedSeat.number}
                </button>
              )}
              <button
                type="button"
                className="tv2-btn"
                onClick={() => setInspectedSeat(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
