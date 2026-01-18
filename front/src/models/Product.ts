// models/Product.ts
export interface Product {
  id: number
  name: string
  description: string
  price: number
  stockQuantity: number
  category?: {
    id: number
    name: string
  }
  categoryId?: number
  categoryName?: string
  lienImage?: string
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
