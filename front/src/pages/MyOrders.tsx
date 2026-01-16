// pages/MyOrders.tsx
import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { getMyOrders } from "../services/orderService"
import type { Order } from "../models/Order"
import "../style/MyOrders.css"

interface LocationState {
  message?: string
}

export default function MyOrders() {
  const location = useLocation()
  const state = location.state as LocationState

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    state?.message || null
  )

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getMyOrders()
        const sortedOrders = data.sort(/*...*/)
        setOrders(sortedOrders)
      } catch (err: any) {
        console.error("Erreur complète:", err)
        console.error("Réponse du serveur:", err.response?.data)
        console.error("Status:", err.response?.status)

        setError("Erreur lors du chargement de vos commandes")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Effacer le message de succès après 5 secondes
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return "Date non disponible"
    }

    try {
      const date = new Date(dateString)

      if (isNaN(date.getTime())) {
        return "Date invalide"
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Erreur formatage date:", error, dateString)
      return "Date invalide"
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "En attente",
      PROCESSING: "En cours",
      SHIPPED: "Expédiée",
      DELIVERED: "Livrée",
      CANCELLED: "Annulée",
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status: string) => {
    return `status-badge status-${status.toLowerCase()}`
  }

  return (
    <div className="my-orders-page">
      {/* Header */}
      <header className="orders-header">
        <div className="container">
          <h1>Mes Commandes</h1>
          <p>Consultez l'historique de vos achats</p>
        </div>
      </header>

      <div className="container">
        {/* Message de succès */}
        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {successMessage}
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement de vos commandes...</p>
          </div>
        )}

        {/* Erreur */}
        {error && <div className="error-message">{error}</div>}

        {/* Liste des commandes */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                {/* En-tête de la commande */}
                <div className="order-header">
                  <div className="order-info">
                    <h3>Commande #{order.id}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={getStatusClass(order.status)}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Détails de la commande */}
                <div className="order-details">
                  <div className="order-items">
                    <h4>
                      {order.items.length} article
                      {order.items.length > 1 ? "s" : ""}
                    </h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={`${order.id}-${item.productId}-${index}`}>
                          <span className="item-quantity">
                            {item.quantity}x
                          </span>
                          <span className="item-product">
                            Produit #{item.productId}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-summary">
                    <div className="order-total">
                      <span>Total</span>
                      <strong>{formatPrice(order.totalPrice)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aucune commande */}
        {!loading && !error && orders.length === 0 && (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>Aucune commande pour le moment</h2>
            <p>Vous n'avez pas encore passé de commande.</p>
            <Link to="/" className="btn-primary">
              Découvrir nos produits
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
