import type { OrderItem } from "./OrderItem"

export interface Order {
  id: number
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItem[]
}
