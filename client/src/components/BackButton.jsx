import { useNavigate } from "react-router-dom";

// Nút quay lại: về trang trước đó, nếu mở thẳng trang này thì về trang chủ
export default function BackButton({ to, label = "Quay lại" }) {
  const navigate = useNavigate();
  const onClick = () => {
    if (to) return navigate(to);
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate("/");
  };
  return (
    <button type="button" className="tv2-back" onClick={onClick} aria-label={label}>
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
