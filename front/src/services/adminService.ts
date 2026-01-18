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

export interface UserResponse {
  id: number
  username: string
  email: string
  roles: string[]
  enabled: boolean
  createdAt?: string
}

export interface UpdateUserRequest {
  enabled: boolean
  roles: string[]
}

/**
 * Récupère les statistiques pour le dashboard admin
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get("/admin/stats")
  return response.data
}

/**
 * Récupère tous les utilisateurs (paginé)
 */
export const getAdminUsers = async (
  page = 0,
  size = 10
): Promise<Page<UserResponse>> => {
  const response = await api.get("/admin/users", {
    params: { page, size },
  })
  return response.data
}

/**
 * Met à jour un utilisateur (rôles et statut)
 */
export const updateUser = async (
  id: number,
  userData: UpdateUserRequest
): Promise<UserResponse> => {
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
 * Récupère toutes les catégories avec leurs IDs
 * En extrayant les catégories uniques depuis les produits
 */
export const getCategories = async (): Promise<Category[]> => {
  // Récupérer tous les produits (ou au moins une grande quantité)
  const response = await api.get<Page<Product>>("/products", {
    params: { page: 0, size: 100 }
  })
  
  // Extraire les catégories uniques avec leurs IDs
  const categoriesMap = new Map<number, Category>()
  
  response.data.content.forEach(product => {
    // Vérifier différents formats possibles
    if (product.category?.id && product.category?.name) {
      categoriesMap.set(product.category.id, {
        id: product.category.id,
        name: product.category.name
      })
    } else if (product.categoryId && product.categoryName) {
      categoriesMap.set(product.categoryId, {
        id: product.categoryId,
        name: product.categoryName
      })
    }
  })
  
  // Convertir en tableau et trier par nom
  return Array.from(categoriesMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  )
}