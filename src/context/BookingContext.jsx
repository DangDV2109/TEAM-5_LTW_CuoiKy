import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);
export const useBooking = () => useContext(BookingContext);

const EMPTY = { showtimeId: null, seats: [], bookingId: null, expiresAt: null, combos: [] };

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("booking")) || EMPTY; } catch { return EMPTY; }
  });

  const save = (b) => { sessionStorage.setItem("booking", JSON.stringify(b)); return b; };
  const update = (patch) => setBooking((b) => save({ ...b, ...patch }));
  const reset = () => setBooking(save(EMPTY));

  return <BookingContext.Provider value={{ booking, update, reset }}>{children}</BookingContext.Provider>;
}
