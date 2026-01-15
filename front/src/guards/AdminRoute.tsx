import { Navigate } from "react-router-dom"
import { getUserRole } from "../services/authService"
import type { ReactNode } from "react"

export default function AdminRoute({ children }: { children: ReactNode }) {
  const role = getUserRole()

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
