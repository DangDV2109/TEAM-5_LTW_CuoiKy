export const MAX_SEATS_PER_BOOKING = 8;

const SEAT_LABEL_REGEX = /^[A-Za-z]\d{1,2}$/;

export const isSeatLabel = (value) => typeof value === 'string' && SEAT_LABEL_REGEX.test(value.trim());

export const parseSeatLabel = (label) => {
  const clean = label.trim();
  return { row: clean[0].toUpperCase(), number: parseInt(clean.slice(1), 10) };
};

export const toSeatLabel = ({ row, number }) => `${row}${number}`;

export const isHoldActive = (seat, now = new Date()) =>
  seat.status === 'held' && seat.heldUntil && seat.heldUntil > now;
