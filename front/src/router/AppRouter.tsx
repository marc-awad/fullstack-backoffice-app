// router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"
import AuthGuard from "../guards/AuthGuard"
import AdminRoute from "../guards/AdminRoute"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées - nécessitent authentification */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <h1>Dashboard</h1>
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

        {/* Routes admin - nécessitent authentification + rôle ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <h1>Admin Dashboard</h1>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <h1>Gestion des utilisateurs</h1>
            </AdminRoute>
          }
        />

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
