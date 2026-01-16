import type { OrderItem } from "./OrderItem"

export interface Order {
  id: number // Standard et clair
  userId?: number
  createdAt: string // Standard dans le monde JS/TS
  totalPrice: number // Cohérent avec "price" dans OrderItem
  status: string
  items: OrderItem[]
}
