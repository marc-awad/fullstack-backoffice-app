import api from "../api/axios"
import type { Product } from "../models/Product"
import type { Page } from "../models/Page"

const BASE_URL = "/products"
const ADMIN_URL = "/admin/products"

// =======================
// PUBLIC
// =======================

export interface GetProductsParams {
  page?: number
  size?: number
  search?: string
  category?: string
  sort?: string
}

/**
 * Récupère la liste des produits avec pagination et filtres
 */
export const getProducts = async (
  params: GetProductsParams = {}
): Promise<Page<Product>> => {
  const { page = 0, size = 12, search, category, sort } = params

  const response = await api.get<Page<Product>>(BASE_URL, {
    params: {
      page,
      size,
      search,
      category,
      sort,
    },
  })

  return response.data
}

/**
 * Récupère un produit par son ID
 */
export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Récupère toutes les catégories disponibles
 */
export const getCategories = async (): Promise<string[]> => {
  const response = await api.get<string[]>(`${BASE_URL}/categories`)
  return response.data
}

// =======================
// ADMIN
// =======================

export const createProduct = async (product: Product): Promise<Product> => {
  const res = await api.post(ADMIN_URL, product)
  return res.data
}

export const updateProduct = async (
  id: number,
  product: Product
): Promise<Product> => {
  const res = await api.put(`${ADMIN_URL}/${id}`, product)
  return res.data
}

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`${ADMIN_URL}/${id}`)
}
