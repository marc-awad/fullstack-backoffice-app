// services/authService.ts
import api from "../api/axios"
import type { AuthResponse } from "../models/AuthResponse"
import type { JwtPayload } from "../models/JwtPayload"

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  })
  return response.data
}

/**
 * Connexion utilisateur
 */
export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    username,
    password,
  })

  // Stocker le token
  if (response.data.token) {
    localStorage.setItem("token", response.data.token)
  }

  return response.data
}

/**
 * Déconnexion
 */
export const logout = (): void => {
  localStorage.removeItem("token")
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token")
  if (!token) {
    return false
  }

  try {
    const payload = decodeToken(token)
    const isExpired = payload.exp * 1000 < Date.now()
    
    if (isExpired) {
      logout() // Nettoyer le token expiré
      return false
    }
    
    return true
  } catch (error) {
    console.error("❌ isAuthenticated: Erreur décodage token", error)
    return false
  }
}

/**
 * Récupère le rôle de l'utilisateur depuis le token
 * Priorise ADMIN si présent, sinon retourne USER
 */
export const getUserRole = (): string | null => {
  const token = localStorage.getItem("token")
  if (!token) {
    console.warn("⚠️ getUserRole: Pas de token")
    return null
  }

  try {
    const payload = decodeToken(token)

    let roles: string[] = []

    // Extraire les rôles dans un tableau
    if (payload.roles) {
      if (typeof payload.roles === "string") {
        // Si c'est une string "ROLE_USER,ROLE_ADMIN", la splitter
        roles = payload.roles.split(",").map(r => r.trim())
      } else if (Array.isArray(payload.roles)) {
        roles = payload.roles
      }
    } else if (payload.role) {
      // Fallback sur 'role' au singulier
      roles = typeof payload.role === "string" 
        ? [payload.role] 
        : Array.isArray(payload.role) 
        ? payload.role 
        : []
    } else if (payload.authorities) {
      // Fallback sur 'authorities'
      roles = typeof payload.authorities === "string"
        ? [payload.authorities]
        : Array.isArray(payload.authorities)
        ? payload.authorities
        : []
    }

    // IMPORTANT: Prioriser ADMIN si présent
    // Enlever les préfixes "ROLE_"
    const cleanRoles = roles.map(r => r.replace("ROLE_", ""))

    // Si ADMIN est présent, retourner ADMIN, sinon USER
    if (cleanRoles.includes("ADMIN")) {
      return "ADMIN"
    } else if (cleanRoles.includes("USER")) {
      return "USER"
    }

    console.warn("⚠️ Aucun rôle valide trouvé, défaut: USER")
    return "USER"
  } catch (error) {
    console.error("❌ getUserRole: Erreur décodage token", error)
    return null
  }
}

/**
 * Récupère les informations de l'utilisateur actuel
 */
export const getCurrentUser = (): JwtPayload | null => {
  const token = localStorage.getItem("token")
  if (!token) {
    console.warn("⚠️ getCurrentUser: Pas de token")
    return null
  }

  try {
    return decodeToken(token)
  } catch (error) {
    console.error("❌ getCurrentUser: Erreur décodage token", error)
    return null
  }
}

/**
 * Récupère le token JWT
 */
export const getToken = (): string | null => {
  return localStorage.getItem("token")
}

/**
 * Décode un token JWT manuellement
 */
const decodeToken = (token: string): JwtPayload => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    throw new Error("Invalid token format")
  }
}