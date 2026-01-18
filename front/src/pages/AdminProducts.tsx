// pages/AdminProducts.tsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAdminProducts, deleteProduct } from "../services/adminService"
import ProductFormModal from "../components/ProductFormModal"
import type { Product } from "../models/Product"
import type { Page } from "../models/Page"
import "../style/AdminProducts.css"

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState<Page<Product> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Delete confirmation state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getAdminProducts(currentPage, 10)
      setPage(data)
      setProducts(data.content)
    } catch (err: any) {
      console.error("Erreur lors du chargement des produits:", err)
      setError("Impossible de charger les produits")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
    fetchProducts() // Recharger la liste
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    setDeleting(true)
    try {
      await deleteProduct(productToDelete.id)
      setShowDeleteConfirm(false)
      setProductToDelete(null)
      fetchProducts() // Recharger la liste
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err)
      alert("Impossible de supprimer le produit")
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setProductToDelete(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  if (loading && products.length === 0) {
    return (
      <div className="admin-products">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-products">
      {/* Header */}
      <header className="products-header">
        <div className="header-content">
          <div>
            <h1>Gestion des produits</h1>
            <p>Gérer le catalogue de produits du site</p>
          </div>
          <div className="header-actions">
            <Link to="/admin" className="btn-secondary">
              ← Retour au dashboard
            </Link>
            <button onClick={handleAdd} className="btn-primary">
              <span className="btn-icon">➕</span>
              Ajouter un produit
            </button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn-retry">
            Réessayer
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>Aucun produit disponible</p>
                  <button onClick={handleAdd} className="btn-primary">
                    Créer le premier produit
                  </button>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-image">
                      {product.lienImage || product.imageUrl ? (
                        <img
                          src={product.lienImage || product.imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/60?text=No+Image"
                          }}
                        />
                      ) : (
                        <div className="no-image">📷</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="product-name">
                      <strong>{product.name}</strong>
                      <span className="product-description">
                        {product.description?.substring(0, 50)}
                        {product.description && product.description.length > 50
                          ? "..."
                          : ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">
                      {product.categoryName || product.category?.name || "N/A"}
                    </span>
                  </td>
                  <td>
                    <strong className="price">
                      {formatCurrency(product.price)}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${
                        product.stockQuantity === 0
                          ? "stock-empty"
                          : product.stockQuantity < 10
                          ? "stock-low"
                          : "stock-ok"
                      }`}
                    >
                      {product.stockQuantity} unités
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn-edit"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="btn-delete"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {page && page.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            ← Précédent
          </button>
          <span className="pagination-info">
            Page {currentPage + 1} sur {page.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= page.totalPages - 1}
            className="pagination-btn"
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <ProductFormModal
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button onClick={handleCancelDelete} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">⚠️</span>
                <p>
                  Êtes-vous sûr de vouloir supprimer le produit{" "}
                  <strong>{productToDelete.name}</strong> ?
                </p>
                <p className="warning-text">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCancelDelete}
                className="btn-secondary"
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-danger"
                disabled={deleting}
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
