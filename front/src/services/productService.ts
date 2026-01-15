import api from "../api/axios"
import type { Product } from "../models/Product"

export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products")
  return res.data
}

export const createProduct = async (product: Product) => {
  return api.post("/admin/products", product)
}
