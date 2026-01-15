import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

export default function AdminRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token")

  // JWT role decode possible later
  if (!token) return <Navigate to="/login" replace />

  return <>{children}</>
}
