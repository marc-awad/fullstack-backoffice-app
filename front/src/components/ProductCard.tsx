// components/ProductCard.tsx
import { Link } from "react-router-dom"
import type { Product } from "../models/Product"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              <span>📦</span>
            </div>
          )}
          {product.stockQuantity === 0 && (
            <div className="out-of-stock-badge">Rupture de stock</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>
          <p className="product-description">
            {product.description.length > 100
              ? `${product.description.substring(0, 100)}...`
              : product.description}
          </p>

          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="product-stock">
              {product.stockQuantity > 0
                ? `${product.stockQuantity} en stock`
                : "Épuisé"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
