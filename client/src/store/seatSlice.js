import { createSlice } from "@reduxjs/toolkit";

export const MAX_SEATS_PER_BOOKING = 8;

const initialState = {
  showtimeId: null,
  selectedSeats: [], // [{ id, row, number, type, price }]
  limitError: "",
  coupon: null, // { code, label, type: 'PERCENT'|'FIXED', value, maxDiscount, minOrder }
};

const seatSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {
    initShowtime(state, action) {
      const nextId = action.payload;
      if (state.showtimeId !== nextId) {
        state.showtimeId = nextId;
        state.selectedSeats = [];
        state.limitError = "";
      }
    },
    toggleSeat(state, action) {
      const seat = action.payload;
      if (!seat || !seat.id) return;
      const idx = state.selectedSeats.findIndex((s) => s.id === seat.id);
      if (idx !== -1) {
        state.selectedSeats.splice(idx, 1);
        state.limitError = "";
      } else {
        if (state.selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
          state.limitError = `Mỗi lần đặt chỉ được chọn tối đa ${MAX_SEATS_PER_BOOKING} ghế.`;
          return;
        }
        state.selectedSeats.push({
          id: seat.id,
          row: seat.row,
          number: seat.number,
          type: seat.type,
          price: Number(seat.price),
        });
        state.limitError = "";
      }
    },
    removeSeatsByIds(state, action) {
      const idsToRemove = new Set(action.payload || []);
      state.selectedSeats = state.selectedSeats.filter((s) => !idsToRemove.has(s.id));
    },
    clearSelectedSeats(state) {
      state.selectedSeats = [];
      state.limitError = "";
    },
    clearLimitError(state) {
      state.limitError = "";
    },
    setCoupon(state, action) {
      state.coupon = action.payload || null;
    },
    clearCoupon(state) {
      state.coupon = null;
    },
  },
});

export const {
  initShowtime,
  toggleSeat,
  removeSeatsByIds,
  clearSelectedSeats,
  clearLimitError,
  setCoupon,
  clearCoupon,
} = seatSlice.actions;

export default seatSlice.reducer;
