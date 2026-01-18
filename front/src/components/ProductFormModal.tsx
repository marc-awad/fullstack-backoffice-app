// components/ProductFormModal.tsx
import { useState, useEffect } from "react"
import {
  createProduct,
  updateProduct,
  getCategories,
  type ProductRequest,
  type Category,
} from "../services/adminService"
import type { Product } from "../models/Product"
import "../style/ProductFormModal.css"

interface Props {
  product: Product | null
  onClose: () => void
}

export default function ProductFormModal({ product, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductRequest>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stockQuantity: product?.stockQuantity || 0,
    categoryId: product?.categoryId || product?.category?.id || 0,
    lienImage: product?.lienImage || product?.imageUrl || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    console.log("🔄 Chargement des catégories...")
    try {
      const data = await getCategories()
      console.log("✅ Catégories reçues:", data)
      
      // Si l'API retourne des strings, les transformer en objets avec index comme ID
      const categoriesArray = Array.isArray(data) 
        ? data.map((name, index) => ({
            id: index + 1,
            name: typeof name === 'string' ? name : name.name
          }))
        : data
      
      console.log("📋 Catégories transformées:", categoriesArray)
      setCategories(categoriesArray)
    } catch (err) {
      console.error("❌ Erreur lors du chargement des catégories:", err)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise"
    }

    if (formData.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0"
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Le stock ne peut pas être négatif"
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      newErrors.categoryId = "La catégorie est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setError(null)

    console.log("📤 Données envoyées au backend:", formData)

    try {
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      onClose()
    } catch (err: any) {
      console.error("❌ Erreur lors de la sauvegarde:", err)
      console.error("📋 Détails de l'erreur:", err.response?.data)
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de la sauvegarde"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stockQuantity" || name === "categoryId"
          ? Number(value)
          : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? "Modifier le produit" : "Nouveau produit"}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                Nom du produit <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
                placeholder="Ex: iPhone 15 Pro"
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? "input-error" : ""}
                placeholder="Description détaillée du produit"
                rows={4}
              />
              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">
                  Prix (€) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? "input-error" : ""}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && (
                  <span className="field-error">{errors.price}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="stockQuantity">
                  Stock <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className={errors.stockQuantity ? "input-error" : ""}
                  placeholder="0"
                  min="0"
                />
                {errors.stockQuantity && (
                  <span className="field-error">{errors.stockQuantity}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">
                Catégorie <span className="required">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={errors.categoryId ? "input-error" : ""}
              >
                <option value="" key="empty">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="field-error">{errors.categoryId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lienImage">URL de l'image</label>
              <input
                type="url"
                id="lienImage"
                name="lienImage"
                value={formData.lienImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.lienImage && (
              <div className="image-preview">
                <img
                  src={formData.lienImage}
                  alt="Aperçu"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? "Enregistrement..."
                : product
                ? "Mettre à jour"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}