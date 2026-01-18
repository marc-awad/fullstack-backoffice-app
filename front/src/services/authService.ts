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
    console.log("✅ Token stocké avec succès")
  }

  return response.data
}

/**
 * Déconnexion
 */
export const logout = (): void => {
  localStorage.removeItem("token")
  console.log("🚪 Utilisateur déconnecté")
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token")
  if (!token) {
    console.log("❌ isAuthenticated: Pas de token")
    return false
  }

  try {
    const payload = decodeToken(token)
    const isExpired = payload.exp * 1000 < Date.now()

    if (isExpired) {
      console.log("❌ isAuthenticated: Token expiré")
      logout() // Nettoyer le token expiré
      return false
    }

    console.log("✅ isAuthenticated: OK")
    return true
  } catch (error) {
    console.error("❌ isAuthenticated: Erreur décodage token", error)
    return false
  }
}

/**
 * Récupère le rôle de l'utilisateur depuis le token
 */
export const getUserRole = (): string | null => {
  const token = localStorage.getItem("token")
  if (!token) {
    console.warn("⚠️ getUserRole: Pas de token")
    return null
  }

  try {
    const payload = decodeToken(token)
    console.log("🔑 Token décodé dans getUserRole:", payload)

    // Le backend envoie roles comme STRING: "ROLE_ADMIN,ROLE_USER"
    let role: string | null = null

    if (payload.roles) {
      // Si c'est une string, prendre le premier rôle
      if (typeof payload.roles === "string") {
        const rolesArray = payload.roles.split(",")
        role = rolesArray[0] // Prendre le premier rôle
        console.log("📋 Roles (string):", payload.roles)
        console.log("👤 Premier rôle extrait:", role)
      }
      // Si c'est un tableau
      else if (Array.isArray(payload.roles)) {
        role = payload.roles[0]
        console.log("📋 Roles (array):", payload.roles)
        console.log("👤 Premier rôle extrait:", role)
      }
    }
    // Fallback sur 'role' (au singulier)
    else if (payload.role) {
      role = typeof payload.role === "string" ? payload.role : payload.role[0]
      console.log("👤 Rôle (singulier) extrait:", role)
    }
    // Fallback sur 'authorities' (Spring Security)
    else if (payload.authorities) {
      role = Array.isArray(payload.authorities)
        ? payload.authorities[0]
        : payload.authorities
      console.log("👤 Authority extrait:", role)
    }

    // Enlever le préfixe "ROLE_" si présent
    if (role) {
      role = role.replace("ROLE_", "")
      console.log("✅ Rôle final:", role)
    } else {
      console.warn("⚠️ Aucun rôle trouvé dans le token")
    }

    return role
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
