import { Route, Routes, Navigate } from "react-router"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import HomePage from "./pages/HomePage"
import OrdersPage from "./pages/OrdersPage"
import UploadPrescriptionPage from "./pages/UploadPrescriptionPage"
import RoleRoute from "./components/auth/RoleRoute"
import WhatsAppIcon from "./components/ui/WhatsAppIcon"

import AdminLayout from "./layouts/AdminLayout"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminProductsPage from "./pages/admin/AdminProductsPage"
import AdminOrdersPage from "./pages/admin/AdminOrdersPage"
import AdminPrescriptionsPage from "./pages/admin/AdminPrescriptionsPage"
import AdminInventoryPage from "./pages/admin/AdminInventoryPage"
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import AdminReportsPage from "./pages/admin/AdminReportsPage"
import AdminSettingsPage from "./pages/admin/AdminSettingsPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Protected user */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-prescription/:orderId"
          element={
            <ProtectedRoute>
              <UploadPrescriptionPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin (Nested) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["admin", "pharmacist"]} redirectTo="/">
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          {/* Default admin route */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="prescriptions" element={<AdminPrescriptionsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/254768700933"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 h-14 w-14 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition"
      >
        <WhatsAppIcon className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping" />
      </a>
    </>
  )
}

export default App
