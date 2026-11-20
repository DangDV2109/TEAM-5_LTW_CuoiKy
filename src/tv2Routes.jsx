import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import BookingHistory from "./pages/BookingHistory";
import SeatSelection from "./pages/SeatSelection";
import ComboSelection from "./pages/ComboSelection";
import Payment from "./pages/Payment";
import TicketResult from "./pages/TicketResult";
import DemoBooking from "./pages/DemoBooking";
import { Route } from "react-router-dom";

const P = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

// Dùng trong <Routes>:  {tv2Routes}
export const tv2Routes = (
  <>
    <Route path="/demo-booking" element={<DemoBooking />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={P(<Profile />)} />
    <Route path="/history" element={P(<BookingHistory />)} />
    <Route path="/showtimes/:showtimeId/seats" element={P(<SeatSelection />)} />
    <Route path="/booking/combo" element={P(<ComboSelection />)} />
    <Route path="/booking/payment" element={P(<Payment />)} />
    <Route path="/ticket/:bookingId" element={P(<TicketResult />)} />
  </>
);
