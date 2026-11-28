import crypto from "crypto";

export const ok = (res, data, extra = {}, status = 200) =>
  res.status(status).json({ success: true, data, ...extra });

export class ApiError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function randomTicketCode() {
  const bytes = crypto.randomBytes(6);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `PTIT-${s}`;
}

export function generateOrderCode() {
  return Number(`${Date.now()}${Math.floor(Math.random() * 90 + 10)}`);
}

export const formatVND = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export function showtimeStart(showtime) {
  if (!showtime?.date || !showtime?.time) return null;
  let isoDate = String(showtime.date).trim();
  const dmy = isoDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) isoDate = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(`${isoDate}T${showtime.time}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
