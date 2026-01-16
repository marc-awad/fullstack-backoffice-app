import api from "../api/axios"
import type { Order } from "../models/Order"
import type { CreateOrderRequest } from "../models/CreateOrderRequest"

const BASE_URL = "/orders"

export const createOrder = async (
  orderData: CreateOrderRequest
): Promise<Order> => {
  try {
    const res = await api.post(BASE_URL, orderData)
    return res.data
  } catch (error) {
    throw new Error("Erreur lors de la création de la commande")
  }
}

export const getMyOrders = async (): Promise<Order[]> => {
  // Utilisez "api" au lieu de "axios"
  const response = await api.get("/orders/my-orders") // ou '/api/orders' selon votre backend

  // 🎯 Normalisation des données
  return response.data.map((apiOrder: any) => ({
    id: apiOrder.orderId,
    userId: apiOrder.userId,
    createdAt: apiOrder.orderDate,
    totalPrice: apiOrder.totalAmount,
    status: apiOrder.status,
    items: apiOrder.items.map((apiItem: any) => ({
      productId: apiItem.productId,
      productName: apiItem.productName,
      quantity: apiItem.quantity,
      price: apiItem.unitPrice,
    })),
  }))
}
