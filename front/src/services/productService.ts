import api from "../api/axios"
import type { Product } from "../models/Product"
import type { Page } from "../models/Page"

const BASE_URL = "/products"
const ADMIN_URL = "/admin/products"

export const getProducts = async (
  page = 0,
  size = 10
): Promise<Page<Product>> => {
  try {
    const res = await api.get(BASE_URL, {
      params: { page, size },
    })
    return res.data
  } catch (err) {
    throw new Error("Erreur lors du chargement des produits")
  }
}

export const getProductById = async (id: number): Promise<Product> => {
  try {
    const res = await api.get(`${BASE_URL}/${id}`)
    return res.data
  } catch {
    throw new Error("Produit introuvable")
  }
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const res = await api.get(`${BASE_URL}/search`, {
      params: { query },
    })
    return res.data
  } catch {
    throw new Error("Erreur lors de la recherche")
  }
}

// 🔐 ADMIN

export const createProduct = async (product: Product): Promise<Product> => {
  try {
    const res = await api.post(ADMIN_URL, product)
    return res.data
  } catch {
    throw new Error("Création du produit impossible")
  }
}

export const updateProduct = async (
  id: number,
  product: Product
): Promise<Product> => {
  try {
    const res = await api.put(`${ADMIN_URL}/${id}`, product)
    return res.data
  } catch {
    throw new Error("Mise à jour impossible")
  }
}

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await api.delete(`${ADMIN_URL}/${id}`)
  } catch {
    throw new Error("Suppression impossible")
  }
}
