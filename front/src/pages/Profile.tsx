// pages/Profile.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUserProfile, updateProfile } from "../services/userService"
import { logout } from "../services/authService"
import type { UpdateProfileRequest, UserProfile } from "../services/userService"
import "../style/Profile.css"

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    username: "",
    email: "",
  })
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const userProfile = await getCurrentUserProfile()
      setProfile(userProfile)
      setFormData({
        username: userProfile.username,
        email: userProfile.email,
      })
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error)
      setMessage({
        type: "error",
        text: "Impossible de charger le profil. Veuillez vous reconnecter.",
      })
      setTimeout(() => {
        logout()
        navigate("/login")
      }, 2000)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setMessage({ type: "error", text: "Le nom d'utilisateur est requis" })
      return false
    }

    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "L'email est requis" })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Email invalide" })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await updateProfile(formData)
      setMessage({
        type: "success",
        text: "Profil mis à jour avec succès ! Veuillez vous reconnecter.",
      })
      setIsEditing(false)

      // Déconnexion après 2 secondes
      setTimeout(() => {
        handleLogout()
      }, 2000)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour du profil"
      setMessage({
        type: "error",
        text: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setMessage(null)
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
      })
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadge = (roles: string[]): string => {
    return roles.includes("ROLE_ADMIN") ? "ADMIN" : "USER"
  }

  if (isLoadingProfile) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Chargement du profil...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Erreur de chargement</div>
      </div>
    )
  }

  const roleBadge = getRoleBadge(profile.roles)

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          <span className={`role-badge role-${roleBadge.toLowerCase()}`}>
            {roleBadge}
          </span>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {!isEditing ? (
          <div className="profile-info">
            <div className="info-group">
              <label>Nom d'utilisateur</label>
              <p>{profile.username}</p>
            </div>

            <div className="info-group">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>

            <div className="info-group">
              <label>Rôle</label>
              <p>{roleBadge}</p>
            </div>

            <div className="info-group">
              <label>Statut</label>
              <p
                className={
                  profile.enabled ? "status-active" : "status-inactive"
                }
              >
                {profile.enabled ? "✓ Actif" : "✗ Inactif"}
              </p>
            </div>

            <div className="info-group">
              <label>Compte créé le</label>
              <p>{formatDate(profile.createdAt)}</p>
            </div>

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Modifier mes informations
              </button>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-info">
              <p>
                ⚠️ Attention : La modification de votre profil nécessitera une
                reconnexion.
              </p>
              <p>Le mot de passe ne peut pas être modifié depuis cette page.</p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
