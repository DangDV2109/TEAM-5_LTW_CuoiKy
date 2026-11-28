import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../api/axiosClient";
import { SHOWTIMES, getUserListOverrides, setUserListOverride } from "../api/mockAdapter";
import SeatMap from "../components/SeatMap";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import {
  MAX_SEATS_PER_BOOKING,
  initShowtime,
  toggleSeat,
  removeSeatsByIds,
  clearSelectedSeats,
} from "../store/seatSlice";

const SEAT_SELECTION_SECONDS = 5 * 60; // Đồng hồ đếm ngược 5 phút

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { booking, update } = useBooking();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Quản lý ghế đang chọn bằng Redux Toolkit (useSelector / useDispatch)
  const selected = useSelector((state) => state.seats.selectedSeats);
  const limitError = useSelector((state) => state.seats.limitError);

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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Đồng hồ đếm ngược 5 phút ngay trên trang chọn ghế (setInterval + cleanup)
  const [secondsLeft, setSecondsLeft] = useState(SEAT_SELECTION_SECONDS);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // State cho hộp thoại Admin xem thông tin người dùng của ghế đã chọn / đang bị giữ
  const [inspectedSeat, setInspectedSeat] = useState(null);

  const loadSeats = useCallback(
    (isPolling = false) =>
      axiosClient
        .get(`/showtimes/${showtimeId}/seats`, {
          params: info?.cinemaId
            ? { cinemaId: info.cinemaId, roomId: info.roomId, roomName }
            : undefined,
        })
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : r.data?.seats || [];
          setSeats(list);
          // Nếu đang polling thời gian thực mà ghế đang chọn vừa bị người khác lấy -> tự động bỏ chọn & báo rõ
          if (isPolling && selectedRef.current.length > 0) {
            const seatStatusMap = new Map(list.map((s) => [s.id, s.status]));
            const takenNow = selectedRef.current
              .filter((s) => seatStatusMap.get(s.id) && seatStatusMap.get(s.id) !== "available")
              .map((s) => s.id);
            if (takenNow.length > 0) {
              dispatch(removeSeatsByIds(takenNow));
              setError(`Ghế ${takenNow.join(", ")} vừa được người khác đặt. Hệ thống đã cập nhật lại sơ đồ.`);
            }
          }
        })
        .catch((err) => {
          if (!isPolling) setError(err.message || "Không tải được sơ đồ ghế");
        }),
    [showtimeId, info?.cinemaId, info?.roomId, roomName, dispatch]
  );

  // Khởi tạo suất chiếu trong Redux store và tải sơ đồ ghế
  useEffect(() => {
    dispatch(initShowtime(showtimeId));
    loadSeats(false);
  }, [showtimeId, dispatch, loadSeats]);

  // Lưu showtimeInfo vào BookingContext nếu đến từ trang chi tiết phim
  useEffect(() => {
    if (location.state?.info) update({ showtimeInfo: location.state.info });
  }, []);

  // Cập nhật ghế đã bán theo thời gian thực (polling mỗi 5 giây + cleanup)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      loadSeats(true);
    }, 5000);
    return () => clearInterval(pollTimer);
  }, [loadSeats]);

  // Đồng hồ đếm ngược 5 phút (setInterval + cleanup); hết giờ bỏ chọn ghế & quay về trang phim bằng useNavigate
  useEffect(() => {
    setSecondsLeft(SEAT_SELECTION_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          dispatch(clearSelectedSeats());
          const moviePath = info?.movieId ? `/phim/${info.movieId}` : "/";
          alert("Hết thời gian 5 phút chọn ghế. Các ghế đang chọn đã được bỏ chọn.");
          navigate(moviePath, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showtimeId, dispatch, navigate, info?.movieId]);

  const toggle = (seat) => {
    setError("");
    dispatch(toggleSeat(seat));
  };

  // Tổng tiền tính bằng useMemo theo đúng yêu cầu kỹ thuật Đề 1
  const total = useMemo(
    () => selected.reduce((sum, s) => sum + Number(s.price), 0),
    [selected]
  );

  const selectedIds = useMemo(() => selected.map((s) => s.id), [selected]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

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
          bookingCode: "ĐANG CHỌN",
        },
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
        note: defaultNote,
      },
    }));
    loadSeats(false);
  };

  const onContinue = async () => {
    if (selected.length === 0) return;
    if (selected.length > MAX_SEATS_PER_BOOKING) {
      setError(`Mỗi lần đặt chỉ được chọn tối đa ${MAX_SEATS_PER_BOOKING} ghế.`);
      return;
    }
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
        seats: selected.map((s) => ({
          id: s.id,
          label: `${s.row}${s.number}`,
          price: Number(s.price),
        })),
        bookingId: data.bookingId,
        expiresAt: data.expiresAt,
        combos: [],
      });
      dispatch(clearSelectedSeats());
      navigate("/booking/combo");
    } catch (err) {
      const conflictSeats = err.response?.data?.conflictSeats;
      const msg =
        err.response?.data?.message ||
        (conflictSeats?.length
          ? `Ghế ${conflictSeats.join(", ")} vừa có người khác đặt. Hãy chọn ghế khác.`
          : "Có ghế vừa được người khác chọn. Hãy chọn lại.");
      setError(msg);
      if (conflictSeats?.length) dispatch(removeSeatsByIds(conflictSeats));
      else dispatch(clearSelectedSeats());
      loadSeats(false);
    } finally {
      setBusy(false);
    }
  };

  const handleBack = () => {
    dispatch(clearSelectedSeats());
    if (info?.movieId) {
      navigate(`/phim/${info.movieId}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="tv2-page wide">
      {/* Thanh trên cùng: Nút quay lại + Đồng hồ đếm ngược 5 phút */}
      <div className="tv2-seat-topbar">
        <button type="button" className="tv2-back-btn" onClick={handleBack}>
          ← Quay lại
        </button>

        <span
          className={`tv2-countdown ${secondsLeft < 60 ? "danger" : ""}`}
          title="Hết 5 phút hệ thống sẽ tự bỏ chọn ghế và quay về trang phim"
        >
          ⏱️ Thời gian chọn ghế còn {mm}:{ss}
        </span>

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
        <span className="tv2-muted small">
          (Tối đa {MAX_SEATS_PER_BOOKING} ghế/lần · Cập nhật ghế tự động)
        </span>
      </div>

      {infoText && <p className="tv2-showtime-sub">{infoText}</p>}

      <SeatMap
        seats={seats}
        selectedIds={selectedIds}
        onToggle={toggle}
        isAdmin={isAdmin}
        onInspectSeat={handleInspectSeat}
      />

      {(limitError || error) && (
        <p className="tv2-error" role="alert">
          {limitError || error}
        </p>
      )}

      <div className="tv2-booking-summary-bar">
        <div>
          <p style={{ margin: "0 0 4px" }}>
            Ghế đã chọn ({selected.length}/{MAX_SEATS_PER_BOOKING}):{" "}
            <b>{selected.map((s) => `${s.row}${s.number}`).join(", ") || "chưa chọn"}</b>
          </p>
          <p style={{ margin: 0 }}>
            Tạm tính:{" "}
            <b style={{ color: "var(--tv2-accent)", fontSize: "1.1rem" }}>
              {total.toLocaleString("vi-VN")}đ
            </b>
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
                  Ghế {inspectedSeat.row}
                  {inspectedSeat.number} ({inspectedSeat.type})
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
                  className={`tv2-mark-btn normal ${!inspectedSeat.customer?.listType || inspectedSeat.customer?.listType === "normal" ? "active" : ""}`}
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
                  Bỏ chọn ghế {inspectedSeat.row}
                  {inspectedSeat.number}
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
