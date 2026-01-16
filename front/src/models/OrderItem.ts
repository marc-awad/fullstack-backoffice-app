export interface OrderItem {
  productId: number
  productName?: string
  quantity: number
  price: number // On standardise avec "price" au lieu de "unitPrice"
}
