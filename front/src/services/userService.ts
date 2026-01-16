// services/userService.ts
import api from "../api/axios"

export interface UpdateProfileRequest {
  username: string
  email: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  roles: string[]
  enabled: boolean
  createdAt: string
}

/**
 * Récupère le profil complet de l'utilisateur courant depuis l'API
 */
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/me")
  return response.data
}

/**
 * Met à jour le profil utilisateur
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await api.put<UserProfile>("/users/me", data)
  return response.data
}
