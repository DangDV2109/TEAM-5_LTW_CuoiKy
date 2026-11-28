import { theatersSeedData } from "../data/cinemasData.js";

export const CINEMAS = theatersSeedData.map((c) => ({
  id: c.id,
  name: c.name,
  city: c.city,
  address: c.address,
}));

export const HOLD_MINUTES = 5;
export const PAYMENT_WINDOW_MINUTES = 10;
