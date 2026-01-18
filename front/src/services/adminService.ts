// services/adminService.ts
import api from "../api/axios"
import type { Product } from "../models/Product"
import type { Page } from "../models/Page"

export interface AdminStats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  recentOrders?: number
  lowStockProducts?: number
}

export interface ProductRequest {
  name: string
  description: string
  price: number
  stockQuantity: number
  categoryId: number
  lienImage?: string
}

export interface Category {
  id: number
  name: string
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
 * Récupère tous les produits (paginé)
 */
export const getAdminProducts = async (
  page = 0,
  size = 10
): Promise<Page<Product>> => {
  const response = await api.get("/products", {
    params: { page, size },
  })
  return response.data
}

/**
 * Crée un nouveau produit
 */
export const createProduct = async (
  productData: ProductRequest
): Promise<Product> => {
  const response = await api.post("/admin/products", productData)
  return response.data
}

/**
 * Met à jour un produit
 */
export const updateProduct = async (
  id: number,
  productData: ProductRequest
): Promise<Product> => {
  const response = await api.put(`/admin/products/${id}`, productData)
  return response.data
}

/**
 * Supprime un produit
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/admin/products/${id}`)
}

/**
 * Récupère toutes les catégories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/products/categories")
  return response.data
}
