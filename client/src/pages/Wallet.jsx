import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import { apiError, fmtDate, vnd } from "../utils";

const PRESETS = [50000, 100000, 200000, 500000];
const METHODS = [
  { id: "BANK", label: "Chuyển khoản" },
  { id: "MOMO", label: "MoMo" },
  { id: "VNPAY", label: "VNPay" },
  { id: "CARD", label: "Thẻ" },
];
const TYPE_LABEL = { TOPUP: "Nạp tiền", PAYMENT: "Thanh toán vé", REFUND: "Hoàn tiền" };

export default function Wallet() {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState(100000);
  const [method, setMethod] = useState("BANK");
  const [txs, setTxs] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const load = () =>
    axiosClient.get("/users/me/transactions").then((r) => setTxs(r.data)).catch(() => setTxs([]));

  useEffect(() => {
    load();
    axiosClient.get("/users/me").then((r) => updateUser({ balance: (r.data?.user || r.data).balance })).catch(() => {});
  }, []);

  const onTopup = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!Number.isInteger(Number(amount)) || amount < 10000 || amount > 10000000)
      return setMsg({ type: "err", text: "Số tiền nạp từ 10.000đ đến 10.000.000đ" });
    setLoading(true);
    try {
      const { data } = await axiosClient.post("/users/me/topup", { amount: Number(amount), method });
      updateUser({ balance: data.balance });
      setMsg({ type: "ok", text: `Nạp thành công ${vnd(amount)}. Số dư mới: ${vnd(data.balance)}` });
      load();
    } catch (err) {
      setMsg({ type: "err", text: apiError(err, "Nạp tiền thất bại") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tv2-page">
      <BackButton to="/profile" label="Tài khoản" />
      <h2>Ví của tôi</h2>
      <div className="tv2-card">
        <div className="tv2-muted">Số dư hiện tại</div>
        <div className="tv2-balance">{vnd(user?.balance)}</div>
      </div>

      <form className="tv2-card tv2-topup" onSubmit={onTopup}>
        <h3>Nạp tiền</h3>
        <div className="tv2-chips">
          {PRESETS.map((p) => (
            <button type="button" key={p} className={`tv2-chip ${Number(amount) === p ? "active" : ""}`} onClick={() => setAmount(p)}>
              {vnd(p)}
            </button>
          ))}
        </div>
        <input className="tv2-input" type="number" min="10000" step="10000" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nhập số tiền khác" />
        <div className="tv2-chips">
          {METHODS.map((m) => (
            <button type="button" key={m.id} className={`tv2-chip ${method === m.id ? "active" : ""}`} onClick={() => setMethod(m.id)}>{m.label}</button>
          ))}
        </div>
        {msg.text && <p className={msg.type === "ok" ? "tv2-okmsg" : "tv2-error"} role="status">{msg.text}</p>}
        <button className="tv2-btn" disabled={loading}>{loading ? "Đang xử lý..." : "Nạp tiền"}</button>
        <p className="tv2-muted small">Môi trường demo: tiền được cộng ngay, chưa kết nối cổng thanh toán thật.</p>
      </form>

      <h3>Lịch sử giao dịch</h3>
      {!txs && <p>Đang tải...</p>}
      {txs && txs.length === 0 && <p className="tv2-muted">Chưa có giao dịch nào.</p>}
      {txs?.map((t) => (
        <div className="tv2-row-card" key={t._id || t.id}>
          <div>
            <b>{TYPE_LABEL[t.type] || t.type}</b>
            <div className="tv2-muted small">{fmtDate(t.createdAt)} · {t.method}{t.note ? ` · ${t.note}` : ""}</div>
          </div>
          <b className={t.type === "PAYMENT" ? "tv2-neg" : "tv2-pos"}>{t.type === "PAYMENT" ? "-" : "+"}{vnd(t.amount)}</b>
        </div>
      ))}
    </div>
  );
}
