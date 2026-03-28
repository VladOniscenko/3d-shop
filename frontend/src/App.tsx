import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SeoManager from "./components/SeoManager";

const Home = lazy(() => import("./components/Home.tsx"));
const Login = lazy(() => import("./components/Login.tsx"));
const Quote = lazy(() => import("./components/Quote.tsx"));
const Signup = lazy(() => import("./components/Signup.tsx"));
const Materials = lazy(() => import("./components/Materials.tsx"));
const Gallery = lazy(() => import("./components/Gallery.tsx"));
const ProductDetail = lazy(() => import("./components/ProductDetail.tsx"));
const HowItWorksPage = lazy(() => import("./components/HowItWorksPage.tsx"));
const FAQ = lazy(() => import("./components/FAQ.tsx"));
const Orders = lazy(() => import("./components/Orders.tsx"));
const OrderDetail = lazy(() => import("./components/OrderDetail.tsx"));
const Cart = lazy(() => import("./components/Cart.tsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.tsx"));
const AdminOrders = lazy(() => import("./components/AdminOrders.tsx"));
const AdminOrderDetail = lazy(() => import("./components/AdminOrderDetail.tsx"));
const AdminUsers = lazy(() => import("./components/AdminUsers.tsx"));
const AdminProducts = lazy(() => import("./components/AdminProducts.tsx"));
const AdminProductEdit = lazy(() => import("./components/AdminProductEdit.tsx"));
const AdminFilaments = lazy(() => import("./components/AdminFilaments.tsx"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./components/TermsOfService.tsx"));
const RefundPolicy = lazy(() => import("./components/RefundPolicy.tsx"));
const ShippingPolicy = lazy(() => import("./components/ShippingPolicy.tsx"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./components/ResetPassword.tsx"));

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
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center text-[#2e423d]">
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Public Routes - Anyone can see these */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/materials" element={<Materials />} />
          <Route
            path="/gallery"
            element={<Navigate to="/products" replace />}
          />
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
      </Suspense>
    </BrowserRouter>
  );
}
