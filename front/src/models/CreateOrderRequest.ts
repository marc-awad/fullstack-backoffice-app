import type { OrderItem } from "./OrderItem"

export interface CreateOrderRequest {
  items: OrderItem[]
}
