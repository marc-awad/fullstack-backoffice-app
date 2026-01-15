// router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Unauthorized from "../pages/Unauthorized"
import AuthGuard from "../guards/AuthGuard"
import AdminGuard from "../guards/AdminGuard"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Routes protégées - nécessitent authentification */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <h1>Dashboard Utilisateur</h1>
              <p>Bienvenue sur votre tableau de bord</p>
            </AuthGuard>
          }
        />

        <Route
          path="/products"
          element={
            <AuthGuard>
              <h1>Liste des produits</h1>
            </AuthGuard>
          }
        />

        <Route
          path="/orders"
          element={
            <AuthGuard>
              <h1>Mes commandes</h1>
            </AuthGuard>
          }
        />

        {/* Routes ADMIN - nécessitent authentification + rôle ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <h1>🛡️ Backoffice Admin</h1>
              <p>Panneau d'administration</p>
            </AdminGuard>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminGuard>
              <h1>Gestion des utilisateurs</h1>
            </AdminGuard>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminGuard>
              <h1>Gestion des produits</h1>
            </AdminGuard>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminGuard>
              <h1>Gestion des commandes</h1>
            </AdminGuard>
          }
        />

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
