// router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "../components/Layout"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Unauthorized from "../pages/Unauthorized"
import ProductDetail from "../pages/ProductDetail"
import AuthGuard from "../guards/AuthGuard"
import AdminGuard from "../guards/AdminGuard"
import Profile from "../pages/Profile"
import MyOrders from "../pages/MyOrders"
import NewOrder from "../pages/NewOrder"
import AdminDashboard from "../pages/AdminDashboard"
import AdminProducts from "../pages/AdminProducts"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ========== ROUTES PUBLIQUES ========== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* ========== ROUTES UTILISATEUR AUTHENTIFIÉ ========== */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <h1>Dashboard Utilisateur</h1>
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/orders"
            element={
              <AuthGuard>
                <MyOrders />
              </AuthGuard>
            }
          />
          <Route
            path="/orders/new"
            element={
              <AuthGuard>
                <NewOrder />
              </AuthGuard>
            }
          />

          {/* ========== ROUTES ADMIN ========== */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminGuard>
                <AdminProducts />
              </AdminGuard>
            }
          />

          {/* ========== ROUTE PAR DÉFAUT ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
