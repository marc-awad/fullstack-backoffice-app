import api from "../api/axios"
import type { AuthResponse } from "../models/AuthResponse"

export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    username,
    password,
  })

  localStorage.setItem("token", response.data.token)
  localStorage.setItem("username", response.data.username)

  return response.data
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
}

export const isAuthenticated = () => {
  return !!localStorage.getItem("token")
}
