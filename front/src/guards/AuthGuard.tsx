// guards/AuthGuard.tsx
import { Navigate } from "react-router-dom"
import { isAuthenticated, logout } from "../services/authService"
import type { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Guard d'authentification
 * Vérifie la présence et la validité du token JWT
 * Redirige vers /login si non authentifié ou token expiré
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  // Vérification de l'authentification avec validation du token
  if (!isAuthenticated()) {
    // Nettoyage du token invalide/expiré
    logout()
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
