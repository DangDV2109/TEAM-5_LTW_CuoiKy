// seat: { id, row, number, type: NORMAL|VIP|COUPLE, status: available|holding|sold, price, customer }
export default function SeatMap({
  seats,
  selectedIds,
  onToggle,
  isAdmin = false,
  onInspectSeat = () => {}
}) {
  const rows = seats.reduce((acc, s) => {
    (acc[s.row] = acc[s.row] || []).push(s);
    return acc;
  }, {});

  const handleSeatClick = (s, isSelected) => {
    const isOccupied = s.status === "sold" || s.status === "holding";
    if (isOccupied) {
      if (isAdmin) {
        onInspectSeat(s);
      }
      return;
    }
    if (isAdmin && isSelected) {
      // Với Admin: khi click vào ghế đã chọn, vừa mở thông tin người dùng vừa cho phép bỏ chọn trong hộp thoại
      onInspectSeat({ ...s, isCurrentSelection: true });
      return;
    }
    onToggle(s);
  };

  return (
    <div className="tv2-seatmap">
      <div className="tv2-screen">Màn hình chiếu</div>
      {Object.keys(rows).sort().map((row) => (
        <div className="tv2-seat-row" key={row}>
          <span className="tv2-row-label">{row}</span>
          {[...rows[row]].sort((a, b) => a.number - b.number).map((s) => {
            const selected = selectedIds.includes(s.id);
            const isOccupied = s.status === "sold" || s.status === "holding";
            const disabled = isOccupied && !isAdmin;
            const state = selected ? "selected" : s.status;
            const listFlag = isAdmin && s.customer?.listType ? `list-${s.customer.listType}` : "";

            return (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSeatClick(s, selected)}
                title={
                  isAdmin && isOccupied
                    ? `${row}${s.number} · ${s.status === "sold" ? "Đã đặt" : "Đang giữ"} bởi ${s.customer?.name || "Khách"} — Nhấn để xem chi tiết`
                    : `${row}${s.number} · ${s.type} · ${Number(s.price).toLocaleString()}đ`
                }
                className={`tv2-seat ${state} type-${s.type.toLowerCase()} ${listFlag} ${isAdmin && isOccupied ? "admin-clickable" : ""}`}
              >
                <span className="tv2-seat-num">{s.number}</span>
                {isAdmin && s.customer?.listType === "vip" && (
                  <span className="tv2-seat-flag vip-flag" title="Khách hàng thuộc Danh sách VIP">★</span>
                )}
                {isAdmin && s.customer?.listType === "blacklist" && (
                  <span className="tv2-seat-flag blk-flag" title="Khách hàng thuộc Danh sách đen">!</span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      <div className="tv2-legend">
        <span><i className="tv2-seat available type-normal" /> Ghế thường</span>
        <span><i className="tv2-seat available type-vip" /> Ghế VIP</span>
        <span><i className="tv2-seat available type-couple" /> Ghế đôi</span>
        <span><i className="tv2-seat selected" /> Đang chọn</span>
        <span><i className="tv2-seat holding" /> Đang được giữ</span>
        <span><i className="tv2-seat sold" /> Đã đặt</span>
      </div>
    </div>
  );
}
