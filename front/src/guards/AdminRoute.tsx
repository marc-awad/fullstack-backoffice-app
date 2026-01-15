// guards/AdminRoute.tsx
import { Navigate } from "react-router-dom"
import { isAuthenticated, getUserRole, logout } from "../services/authService"
import type { ReactNode } from "react"

interface AdminRouteProps {
  children: ReactNode
}

/**
 * Route protégée pour les administrateurs
 * Vérifie l'authentification ET le rôle ADMIN
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  // 1. Vérifier l'authentification
  if (!isAuthenticated()) {
    logout()
    return <Navigate to="/login" replace />
  }

  // 2. Vérifier le rôle ADMIN
  const role = getUserRole()
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
