// models/Product.ts
export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}
