// guards/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { isAuthenticated, logout } from "../services/authService"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

/**
 * Route protégée nécessitant une authentification
 * Vérifie la validité du token JWT avant d'autoriser l'accès
 */
export default function ProtectedRoute({ children }: Props) {
  if (!isAuthenticated()) {
    logout() // Nettoie le token invalide
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
