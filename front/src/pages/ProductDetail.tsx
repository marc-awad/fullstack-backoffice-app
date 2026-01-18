// pages/ProductDetail.tsx
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  AlertCircle,
  Loader2,
  Package,
  XCircle,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Plus,
  Lightbulb,
  ArrowLeft
} from "lucide-react"
import { getProductById } from "../services/productService"
import type { Product } from "../models/Product"
import "../style/ProductDetail.css"

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!localStorage.getItem("token")

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID du produit manquant")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getProductById(parseInt(id))
        setProduct(data)
      } catch (err: any) {
        console.error("Erreur lors du chargement du produit:", err)
        if (err.response?.status === 404) {
          setError("Produit non trouvé")
        } else {
          setError("Impossible de charger le produit. Veuillez réessayer.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion
      navigate("/login", { state: { from: `/products/${id}` } })
      return
    }

    // TODO: Implémenter l'ajout au panier
    alert(`Ajout de ${quantity} ${product?.name} au panier (à implémenter)`)
  }

  const handleOrder = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${id}` } })
      return
    }

    // Rediriger vers la page de commande
    navigate("/orders/new", { state: { product, quantity } })
  }

  // État de chargement
  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-spinner">
          <Loader2 className="spinner" size={50} strokeWidth={2.5} />
          <p>Chargement du produit...</p>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-container">
          <AlertCircle className="error-icon" size={64} strokeWidth={2} />
          <h2>Oups !</h2>
          <p className="error-message">{error || "Produit introuvable"}</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Retour
            </button>
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Affichage du produit
  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to="/">Produits</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>



      {/* Contenu principal */}
<div className="product-detail-content">
  {/* Image du produit */}
  <div className="product-image-section">
    {(() => {
      const imageUrl = product.imageUrl || product.lienImage

      return imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image-large"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl)
              e.currentTarget.style.display = "none"
              const placeholder =
                e.currentTarget.nextElementSibling as HTMLElement
              if (placeholder) placeholder.style.display = "flex"
            }}
          />

          {/* Placeholder caché par défaut */}
          <div
            className="product-image-placeholder-large"
            style={{ display: "none" }}
          >
            <Package className="placeholder-icon" size={80} strokeWidth={2} />
            <p>Aucune image disponible</p>
          </div>
        </>
      ) : (
        <div className="product-image-placeholder-large">
          <Package className="placeholder-icon" size={80} strokeWidth={2} />
          <p>Aucune image disponible</p>
        </div>
      )
    })()}

    {product.stockQuantity === 0 && (
      <div className="stock-badge out-of-stock">
        <XCircle size={20} strokeWidth={2.5} />
        Rupture de stock
      </div>
    )}

    {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
      <div className="stock-badge low-stock">
        <AlertTriangle size={20} strokeWidth={2.5} />
        Stock limité
      </div>
    )}

    {product.stockQuantity > 5 && (
      <div className="stock-badge in-stock">
        <CheckCircle size={20} strokeWidth={2.5} />
        En stock
      </div>
    )}
  </div>


        {/* Informations du produit */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <span className="product-category-badge">{product.category}</span>
          </div>

          <div className="product-price-section">
            <span className="product-price-large">
              {formatPrice(product.price)}
            </span>
            <span className="product-stock-info">
              {product.stockQuantity > 0
                ? `${product.stockQuantity} unité${
                    product.stockQuantity > 1 ? "s" : ""
                  } disponible${product.stockQuantity > 1 ? "s" : ""}`
                : "Indisponible"}
            </span>
          </div>

          <div className="product-description-section">
            <h2>Description</h2>
            <p className="product-description-text">{product.description}</p>
          </div>

          {/* Sélection de quantité */}
          {product.stockQuantity > 0 && (
            <div className="quantity-section">
              <label htmlFor="quantity">Quantité :</label>
              <div className="quantity-selector">
                <button
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
                  max={product.stockQuantity}
                  className="quantity-input"
                />
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="product-actions">
            {product.stockQuantity > 0 ? (
              <>
                <button className="btn-primary btn-large" onClick={handleOrder}>
                  <ShoppingCart className="btn-icon" size={20} strokeWidth={2.5} />
                  Commander maintenant
                </button>
                <button
                  className="btn-secondary btn-large"
                  onClick={handleAddToCart}
                >
                  <Plus className="btn-icon" size={20} strokeWidth={2.5} />
                  Ajouter au panier
                </button>
              </>
            ) : (
              <button className="btn-disabled btn-large" disabled>
                <XCircle className="btn-icon" size={20} strokeWidth={2.5} />
                Produit indisponible
              </button>
            )}
          </div>

          {!isAuthenticated && product.stockQuantity > 0 && (
            <div className="auth-notice">
              <p>
                <Lightbulb className="notice-icon" size={18} strokeWidth={2.5} />
                <Link to="/login">Connectez-vous</Link> pour passer commande
              </p>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="product-meta">
            {product.createdAt && (
              <div className="meta-item">
                <span className="meta-label">Ajouté le :</span>
                <span className="meta-value">
                  {formatDate(product.createdAt)}
                </span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Référence :</span>
              <span className="meta-value">#{product.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de retour */}
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} strokeWidth={2.5} />
          Retour aux produits
        </button>
      </div>
    </div>
  )
}