// services/authService.ts
import api from "../api/axios"
import { jwtDecode } from "jwt-decode"
import type { AuthResponse } from "../models/AuthResponse"
import type { JwtPayload } from "../models/JwtPayload"

const TOKEN_KEY = "token"

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export const register = (data: RegisterRequest) => {
  return api.post("/auth/register", data)
}

export const login = async (
  username: string,
  password: string
): Promise<void> => {
  const res = await api.post<AuthResponse>("/auth/login", {
    username,
    password,
  })

  localStorage.setItem(TOKEN_KEY, res.data.token)
}

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Vérifie si l'utilisateur est authentifié
 * Valide la présence ET l'expiration du token JWT
 */
export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const isExpired = decoded.exp * 1000 <= Date.now()

    if (isExpired) {
      // Token expiré, on le supprime
      logout()
      return false
    }

    return true
  } catch (error) {
    // Token invalide/corrompu
    logout()
    return false
  }
}

export const getUserRole = (): "USER" | "ADMIN" | null => {
  const token = getToken()
  if (!token) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)

    // Vérifier que le token n'est pas expiré
    if (decoded.exp * 1000 <= Date.now()) {
      logout()
      return null
    }

    return decoded.role
  } catch {
    logout()
    return null
  }
}

/**
 * Récupère les informations de l'utilisateur depuis le token
 */
export const getCurrentUser = (): JwtPayload | null => {
  const token = getToken()
  if (!token) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)

    if (decoded.exp * 1000 <= Date.now()) {
      logout()
      return null
    }

    return decoded
  } catch {
    logout()
    return null
  }
}
