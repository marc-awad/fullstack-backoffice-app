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
  try {
    const res = await api.get(`${BASE_URL}/my-orders`)
    return res.data
  } catch {
    throw new Error("Impossible de charger les commandes")
  }
}
