import PayOS from "@payos/node";
import QRCode from "qrcode";

let payos = null;

export function isPayOSConfigured() {
  const { PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY } = process.env;
  return Boolean(PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY);
}

export function getPayOS() {
  if (!isPayOSConfigured()) return null;
  if (!payos) {
    payos = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY);
  }
  return payos;
}

export const transferContent = (orderCode) => `PTIT${orderCode}`;

export function buildVietQR({ amount, orderCode }) {
  const bank = process.env.VIETQR_BANK_ID || "MB";
  const account = process.env.VIETQR_ACCOUNT_NO || "0987654321";
  const name = process.env.VIETQR_ACCOUNT_NAME || "PTIT CINEMA";
  const content = transferContent(orderCode);
  const params = new URLSearchParams({ amount: String(amount), addInfo: content, accountName: name });
  return {
    qrImage: `https://img.vietqr.io/image/${bank}-${account}-compact2.png?${params.toString()}`,
    bankInfo: { bankId: bank, accountNo: account, accountName: name, amount, content },
  };
}

export async function qrStringToImage(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 300 });
}

export async function createPayOSLink({ order, items, expiresAt }) {
  const client = getPayOS();
  const front = process.env.FRONTEND_URL || "http://localhost:5173";
  const link = await client.createPaymentLink({
    orderCode: order.orderCode,
    amount: order.total,
    description: transferContent(order.orderCode).slice(0, 25),
    items,
    buyerName: order.customer?.name,
    buyerEmail: order.customer?.email,
    buyerPhone: order.customer?.phone,
    returnUrl: `${front}/payment/success?orderId=${order._id}`,
    cancelUrl: `${front}/payment/cancel?orderId=${order._id}`,
    expiredAt: Math.floor(expiresAt.getTime() / 1000),
  });
  return link;
}

export async function cancelPayOSLink(order) {
  const client = getPayOS();
  if (!client || order.paymentMethod !== "PAYOS" || !order.orderCode) return;
  try {
    await client.cancelPaymentLink(order.orderCode, "Khách huỷ đơn");
  } catch (e) {
    console.warn("[payos] Không huỷ được link:", e.message);
  }
}
