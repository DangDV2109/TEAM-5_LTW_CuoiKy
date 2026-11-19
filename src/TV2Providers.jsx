import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import "./tv2.css";

// Bọc quanh <App /> trong main.jsx (bên trong <BrowserRouter>)
export default function TV2Providers({ children }) {
  return (
    <AuthProvider>
      <BookingProvider>{children}</BookingProvider>
    </AuthProvider>
  );
}
