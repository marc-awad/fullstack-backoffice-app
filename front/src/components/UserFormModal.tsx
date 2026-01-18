// components/UserFormModal.tsx
import { useState } from "react"
import { updateUser, type UserResponse, type UpdateUserRequest } from "../services/adminService"
import "../style/ProductFormModal.css"
import { AlertTriangle } from "lucide-react"

interface Props {
  user: UserResponse
  onClose: () => void
}

export default function UserFormModal({ user, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateUserRequest>({
    enabled: user.enabled,
    roles: user.roles || ["USER"],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      await updateUser(user.id, formData)
      onClose()
    } catch (err: any) {
      console.error("❌ Erreur lors de la mise à jour:", err)
      console.error("📋 Détails:", err.response?.data)
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de la mise à jour"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }))
  }

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => {
      const roles = prev.roles || []
      const hasRole = roles.includes(role)
      
      if (hasRole) {
        // Retirer le rôle (mais garder au moins USER)
        const newRoles = roles.filter((r) => r !== role)
        return {
          ...prev,
          roles: newRoles.length > 0 ? newRoles : ["USER"],
        }
      } else {
        // Ajouter le rôle
        return {
          ...prev,
          roles: [...roles, role],
        }
      }
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier l'utilisateur</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
<AlertTriangle className="error-icon" size={24} strokeWidth={2.5} />
                <p>{error}</p>
              </div>
            )}

            {/* Informations non modifiables */}
            <div className="user-info-section">
              <div className="info-row">
                <span className="info-label">Nom d'utilisateur:</span>
                <span className="info-value">{user.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ID:</span>
                <span className="info-value">#{user.id}</span>
              </div>
            </div>

            <div className="divider"></div>

            {/* Statut du compte */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={handleEnabledChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">
                  Compte activé
                </span>
              </label>
              <p className="field-hint">
                {formData.enabled
                  ? "L'utilisateur peut se connecter"
                  : "L'utilisateur ne peut pas se connecter"}
              </p>
            </div>

            {/* Rôles */}
            <div className="form-group">
              <label>Rôles de l'utilisateur</label>
              <div className="roles-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.roles?.includes("USER") || false}
                    onChange={() => handleRoleToggle("USER")}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    <span className="role-badge role-user">USER</span>
                    <span className="role-description">
                      Accès de base à la plateforme
                    </span>
                  </span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.roles?.includes("ADMIN") || false}
                    onChange={() => handleRoleToggle("ADMIN")}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    <span className="role-badge role-admin">ADMIN</span>
                    <span className="role-description">
                      Accès complet à l'administration
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Résumé */}
            <div className="summary-section">
              <h4>Résumé des modifications</h4>
              <ul>
                <li>
                  Statut:{" "}
                  <strong>
                    {formData.enabled ? "Actif ✓" : "Désactivé ✗"}
                  </strong>
                </li>
                <li>
                  Rôles:{" "}
                  <strong>
                    {formData.roles?.join(", ") || "USER"}
                  </strong>
                </li>
              </ul>
            </div>
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}