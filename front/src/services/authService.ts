import api from "../api/axios"
import { jwtDecode } from "jwt-decode"
import type { AuthResponse } from "../models/AuthResponse"
import type { JwtPayload } from "../models/JwtPayload"

const TOKEN_KEY = "token"

export const register = async (
  username: string,
  password: string
): Promise<void> => {
  await api.post("/auth/register", { username, password })
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

export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export const getUserRole = (): "USER" | "ADMIN" | null => {
  const token = getToken()
  if (!token) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.role
  } catch {
    return null
  }
}
