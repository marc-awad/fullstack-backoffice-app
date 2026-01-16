// pages/NewOrder.tsx
import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { createOrder } from "../services/orderService"
import { getProducts } from "../services/productService"
import type { Product } from "../models/Product"
import type { CreateOrderRequest } from "../models/CreateOrderRequest"
import "../style/NewOrder.css"

interface LocationState {
  product?: Product
  quantity?: number
}

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  // État du formulaire
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    state?.product || null
  )
  const [quantity, setQuantity] = useState(state?.quantity || 1)
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(!state?.product)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Charger les produits si pas de produit pré-sélectionné
  useEffect(() => {
    if (!state?.product) {
      const fetchProducts = async () => {
        try {
          setLoadingProducts(true)
          const data = await getProducts({ page: 0, size: 100 })
          // Filtrer uniquement les produits en stock
          const inStockProducts = data.content.filter(
            (p) => p.stockQuantity > 0
          )
          setProducts(inStockProducts)
        } catch (err) {
          setError("Impossible de charger les produits")
          console.error(err)
        } finally {
          setLoadingProducts(false)
        }
      }

      fetchProducts()
    }
  }, [state?.product])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === parseInt(productId))
    if (product) {
      setSelectedProduct(product)
      setQuantity(1) // Réinitialiser la quantité
      setError(null)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedProduct) return

    if (newQuantity < 1) {
      setQuantity(1)
    } else if (newQuantity > selectedProduct.stockQuantity) {
      setQuantity(selectedProduct.stockQuantity)
      setError(`Stock maximum : ${selectedProduct.stockQuantity} unités`)
    } else {
      setQuantity(newQuantity)
      setError(null)
    }
  }

  const getTotalPrice = () => {
    if (!selectedProduct) return 0
    return selectedProduct.price * quantity
  }

  const validateOrder = (): boolean => {
    if (!selectedProduct) {
      setError("Veuillez sélectionner un produit")
      return false
    }

    if (quantity < 1) {
      setError("La quantité doit être au moins 1")
      return false
    }

    if (quantity > selectedProduct.stockQuantity) {
      setError(
        `Stock insuffisant. Disponible : ${selectedProduct.stockQuantity}`
      )
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (validateOrder()) {
      setShowConfirmation(true)
    }
  }

  const handleConfirmOrder = async () => {
    if (!selectedProduct) return

    setLoading(true)
    setError(null)

    try {
      const orderData: CreateOrderRequest = {
        items: [
          {
            productId: selectedProduct.id,
            quantity: quantity,
            price: selectedProduct.price,
          },
        ],
      }

      await createOrder(orderData)

      // Redirection vers "Mes commandes" après succès
      navigate("/orders", {
        state: { message: "Commande passée avec succès !" },
      })
    } catch (err: any) {
      console.error("Erreur lors de la création de la commande:", err)

      if (err.response?.status === 400) {
        setError(
          "Stock insuffisant ou produit indisponible. Veuillez vérifier votre commande."
        )
      } else {
        setError(
          "Une erreur est survenue lors de la création de la commande. Veuillez réessayer."
        )
      }

      setShowConfirmation(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

  // Chargement des produits
  if (loadingProducts) {
    return (
      <div className="new-order-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des produits...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="new-order-page">
      {/* Header */}
      <header className="order-header">
        <div className="container">
          <h1>Nouvelle commande</h1>
          <p>Sélectionnez votre produit et validez votre commande</p>
        </div>
      </header>

      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Accueil</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/orders">Mes commandes</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Nouvelle commande</span>
        </nav>

        <div className="order-form-container">
          <form onSubmit={handleSubmit} className="order-form">
            {/* Sélection du produit */}
            <div className="form-section">
              <h2>1. Sélection du produit</h2>

              {state?.product ? (
                // Produit pré-sélectionné
                <div className="selected-product-card">
                  <div className="product-image-small">
                    {selectedProduct?.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                      />
                    ) : (
                      <div className="image-placeholder">📦</div>
                    )}
                  </div>
                  <div className="product-details">
                    <h3>{selectedProduct?.name}</h3>
                    <p className="product-category">
                      {selectedProduct?.category}
                    </p>
                    <p className="product-price">
                      {formatPrice(selectedProduct?.price || 0)}
                    </p>
                    <p className="product-stock">
                      Stock disponible : {selectedProduct?.stockQuantity} unités
                    </p>
                  </div>
                  <Link to="/" className="btn-change-product">
                    Changer de produit
                  </Link>
                </div>
              ) : (
                // Sélection manuelle
                <div className="form-group">
                  <label htmlFor="product">Produit *</label>
                  <select
                    id="product"
                    value={selectedProduct?.id || ""}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">-- Choisir un produit --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatPrice(product.price)} (Stock :{" "}
                        {product.stockQuantity})
                      </option>
                    ))}
                  </select>

                  {products.length === 0 && (
                    <p className="info-message">
                      Aucun produit en stock disponible pour le moment.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantité */}
            {selectedProduct && (
              <div className="form-section">
                <h2>2. Quantité</h2>
                <div className="form-group">
                  <label htmlFor="quantity">Quantité *</label>
                  <div className="quantity-selector-large">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      min="1"
                      max={selectedProduct.stockQuantity}
                      required
                      className="quantity-input"
                    />
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= selectedProduct.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  <p className="help-text">
                    Maximum disponible : {selectedProduct.stockQuantity} unités
                  </p>
                </div>
              </div>
            )}

            {/* Récapitulatif */}
            {selectedProduct && (
              <div className="form-section summary-section">
                <h2>3. Récapitulatif</h2>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Prix unitaire</span>
                    <span>{formatPrice(selectedProduct.price)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Quantité</span>
                    <span>× {quantity}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <strong>{formatPrice(getTotalPrice())}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && <div className="error-message">{error}</div>}

            {/* Boutons d'action */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!selectedProduct || loading}
              >
                {loading ? "Traitement..." : "Valider la commande"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && selectedProduct && (
        <div className="modal-overlay" onClick={handleCancelConfirmation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la commande</h2>
              <button
                className="modal-close"
                onClick={handleCancelConfirmation}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>Vous êtes sur le point de commander :</p>
              <div className="confirmation-details">
                <div className="confirmation-item">
                  <strong>{selectedProduct.name}</strong>
                  <span>
                    {quantity} × {formatPrice(selectedProduct.price)}
                  </span>
                </div>
                <div className="confirmation-total">
                  <span>Total à payer</span>
                  <strong>{formatPrice(getTotalPrice())}</strong>
                </div>
              </div>
              <p className="confirmation-note">
                ⚠️ Cette action est irréversible. Voulez-vous continuer ?
              </p>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleCancelConfirmation}
                className="btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmOrder}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span> Traitement...
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
