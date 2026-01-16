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
import ProtectedRoute from "../guards/ProtectedRoute"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Page d'accueil PUBLIQUE */}
          <Route path="/" element={<Home />} />

          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Route PUBLIQUE - Détail produit */}
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Routes protégées - nécessitent authentification */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <h1>Dashboard Utilisateur</h1>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AuthGuard>
                <AdminDashboard />
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

          {/* Route Mes commandes - PROTÉGÉE */}
          <Route
            path="/orders"
            element={
              <AuthGuard>
                <MyOrders />
              </AuthGuard>
            }
          />

          {/* Route Nouvelle commande - PROTÉGÉE */}
          <Route
            path="/orders/new"
            element={
              <AuthGuard>
                <NewOrder />
              </AuthGuard>
            }
          />

          {/* Routes ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <h1>🛡️ Backoffice Admin</h1>
              </AdminGuard>
            }
          />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
