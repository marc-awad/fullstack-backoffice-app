// services/adminService.ts
import api from "../api/axios"

export interface AdminStats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  recentOrders?: number
  lowStockProducts?: number
}

/**
 * Récupère les statistiques pour le dashboard admin
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get("/admin/stats")
  return response.data
}

/**
 * Récupère tous les utilisateurs (pour l'admin)
 */
export const getAllUsers = async () => {
  const response = await api.get("/admin/users")
  return response.data
}

/**
 * Met à jour un utilisateur
 */
export const updateUser = async (id: number, userData: any) => {
  const response = await api.put(`/admin/users/${id}`, userData)
  return response.data
}

/**
 * Crée un nouveau produit
 */
export const createProduct = async (productData: any) => {
  const response = await api.post("/admin/products", productData)
  return response.data
}

/**
 * Met à jour un produit
 */
export const updateProduct = async (id: number, productData: any) => {
  const response = await api.put(`/admin/products/${id}`, productData)
  return response.data
}

/**
 * Supprime un produit
 */
export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/admin/products/${id}`)
  return response.data
}
