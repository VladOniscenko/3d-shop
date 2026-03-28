import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Quote from "./components/Quote";
import Signup from "./components/Signup";
import Materials from "./components/Materials";
import Gallery from "./components/Gallery";
import ProductDetail from "./components/ProductDetail";
import HowItWorksPage from "./components/HowItWorksPage";
import FAQ from "./components/FAQ";
import Orders from "./components/Orders";
import OrderDetail from "./components/OrderDetail";
import Cart from "./components/Cart";
import AdminDashboard from "./components/AdminDashboard";
import AdminOrders from "./components/AdminOrders";
import AdminOrderDetail from "./components/AdminOrderDetail";
import AdminUsers from "./components/AdminUsers";
import AdminProducts from "./components/AdminProducts";
import AdminProductEdit from "./components/AdminProductEdit";
import AdminFilaments from "./components/AdminFilaments";
import SeoManager from "./components/SeoManager";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import RefundPolicy from "./components/RefundPolicy";
import ShippingPolicy from "./components/ShippingPolicy";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) return <Navigate to="/login" replace />;

  try {
    const parsed = JSON.parse(user);
    if (parsed.role === "admin") return <>{children}</>;
  } catch {
    /* fall through */
  }
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SeoManager />
      <Routes>
        {/* Public Routes - Anyone can see these */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/gallery" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<Gallery />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refunds" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />

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
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminOrderDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <AdminRoute>
              <AdminProductEdit />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/filaments"
          element={
            <AdminRoute>
              <AdminFilaments />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
