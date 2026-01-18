// api/axios.ts
import axios from "axios"
import { getToken, logout } from "../services/authService"
import { toastService } from "../services/toastService"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 secondes
})

/**
 * Intercepteur de requête
 * Ajoute automatiquement le token JWT à toutes les requêtes
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("❌ Erreur lors de la préparation de la requête:", error)
    return Promise.reject(error)
  }
)

/**
 * Intercepteur de réponse
 * Gère les erreurs HTTP globalement
 */
api.interceptors.response.use(
  (response) => {
    // Succès - retourner la réponse normalement
    return response
  },
  (error) => {
    console.error("❌ Erreur interceptée:", error)

    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
      console.error("❌ Erreur réseau - pas de réponse du serveur")
      toastService.error("Erreur de connexion. Vérifiez votre connexion internet.")
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // Gestion par code HTTP
    switch (status) {
      case 401:
        // Non authentifié - Redirection vers login
        console.warn("⚠️ 401 - Session expirée ou non authentifié")
        toastService.error("Votre session a expiré. Veuillez vous reconnecter.")
        logout()
        
        // Éviter les redirections multiples
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
        break

      case 403:
        // Non autorisé
        console.warn("⚠️ 403 - Accès refusé")
        toastService.error("Vous n'avez pas les autorisations nécessaires.")
        
        // Optionnel: redirection vers page unauthorized
        if (window.location.pathname !== "/unauthorized") {
          setTimeout(() => {
            window.location.href = "/unauthorized"
          }, 1500)
        }
        break

      case 404:
        // Ressource non trouvée
        console.warn("⚠️ 404 - Ressource non trouvée")
        // Note: on n'affiche pas de toast ici car géré dans les composants
        break

      case 409:
        // Conflit (ex: email déjà utilisé)
        console.warn("⚠️ 409 - Conflit")
        const conflictMessage = data?.message || "Cette ressource existe déjà."
        toastService.error(conflictMessage)
        break

      case 422:
        // Validation échouée
        console.warn("⚠️ 422 - Validation échouée")
        const validationMessage = data?.message || "Les données fournies sont invalides."
        toastService.error(validationMessage)
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // Erreurs serveur
        console.error("❌ Erreur serveur:", status)
        toastService.error("Une erreur serveur est survenue. Veuillez réessayer plus tard.")
        break

      default:
        // Autres erreurs
        console.error("❌ Erreur HTTP:", status)
        const defaultMessage = data?.message || "Une erreur est survenue."
        toastService.error(defaultMessage)
    }

    return Promise.reject(error)
  }
)

export default api