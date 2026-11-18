// seat: { id, row, number, type: NORMAL|VIP|COUPLE, status: available|holding|sold, price }
export default function SeatMap({ seats, selectedIds, onToggle }) {
  const rows = seats.reduce((acc, s) => {
    (acc[s.row] = acc[s.row] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="tv2-seatmap">
      <div className="tv2-screen">Màn hình</div>
      {Object.keys(rows).sort().map((row) => (
        <div className="tv2-seat-row" key={row}>
          <span className="tv2-row-label">{row}</span>
          {[...rows[row]].sort((a, b) => a.number - b.number).map((s) => {
            const selected = selectedIds.includes(s.id);
            const disabled = s.status === "sold" || s.status === "holding";
            const state = selected ? "selected" : s.status;
            return (
              <button
                key={s.id}
                disabled={disabled}
                onClick={() => onToggle(s)}
                title={`${row}${s.number} · ${s.type} · ${Number(s.price).toLocaleString()}đ`}
                className={`tv2-seat ${state} ${s.type.toLowerCase()}`}
              >
                {s.number}
              </button>
            );
          })}
        </div>
      ))}
      <div className="tv2-legend">
        <span><i className="tv2-seat available" /> Trống</span>
        <span><i className="tv2-seat selected" /> Đang chọn</span>
        <span><i className="tv2-seat holding" /> Đang được giữ</span>
        <span><i className="tv2-seat sold" /> Đã bán</span>
        <span><i className="tv2-seat available vip" /> VIP</span>
        <span><i className="tv2-seat available couple" /> Ghế đôi</span>
      </div>
    </div>
  );
}
