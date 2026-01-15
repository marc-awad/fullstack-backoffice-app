// guards/AdminGuard.tsx
import { Navigate } from "react-router-dom"
import { isAuthenticated, getUserRole, logout } from "../services/authService"
import type { ReactNode } from "react"

interface AdminGuardProps {
  children: ReactNode
}

/**
 * Guard Admin
 * Protège les routes nécessitant le rôle ADMIN
 * Vérifie d'abord l'authentification, puis le rôle
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  // 1. Vérifier l'authentification (token valide et non expiré)
  if (!isAuthenticated()) {
    logout()
    return <Navigate to="/login" replace />
  }

  // 2. Vérifier le rôle ADMIN
  const role = getUserRole()

  if (role !== "ADMIN") {
    // Redirection vers page d'accueil si non autorisé
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
