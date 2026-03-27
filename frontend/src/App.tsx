import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Quote from "./components/Quote";
import Signup from "./components/Signup";
import Materials from "./components/Materials";
import Gallery from "./components/Gallery";
import HowItWorksPage from "./components/HowItWorksPage";
import FAQ from "./components/FAQ";
import Orders from "./components/Orders";
import OrderDetail from "./components/OrderDetail";
import Cart from "./components/Cart";

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Anyone can see these */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/cart" element={<Cart />} />

        {/* Private Routes - Only logged-in users can see these */}
        <Route
          path="/quote"
          element={
            <ProtectedRoute>
              <Quote />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
