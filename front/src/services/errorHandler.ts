// services/errorHandler.ts
import { AxiosError } from "axios"
import { toastService } from "./toastService"

/**
 * Messages d'erreur traduits et compréhensibles
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "Requête invalide. Veuillez vérifier les informations saisies.",
  401: "Votre session a expiré. Veuillez vous reconnecter.",
  403: "Vous n'avez pas les autorisations nécessaires pour effectuer cette action.",
  404: "La ressource demandée est introuvable.",
  409: "Cette ressource existe déjà ou un conflit est survenu.",
  422: "Les données fournies sont invalides.",
  429: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
  500: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  502: "Le serveur est temporairement indisponible.",
  503: "Le service est temporairement indisponible. Veuillez réessayer plus tard.",
  504: "Le serveur met trop de temps à répondre.",
}

/**
 * Messages d'erreur par défaut
 */
const DEFAULT_ERROR_MESSAGE = "Une erreur inattendue est survenue."
const NETWORK_ERROR_MESSAGE = "Erreur de connexion. Vérifiez votre connexion internet."

/**
 * Interface pour les erreurs API
 */
interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]> | string[]
  status?: number
}

/**
 * Classe pour gérer les erreurs de l'application
 */
class ErrorHandler {
  /**
   * Gère les erreurs Axios et affiche un toast approprié
   */
  handleError(error: unknown, customMessage?: string): void {
    console.error("❌ Erreur capturée:", error)

    // Cas 1: Erreur Axios (erreur HTTP)
    if (this.isAxiosError(error)) {
      this.handleAxiosError(error, customMessage)
      return
    }

    // Cas 2: Erreur JavaScript standard
    if (error instanceof Error) {
      toastService.error(customMessage || error.message || DEFAULT_ERROR_MESSAGE)
      return
    }

    // Cas 3: Erreur inconnue
    toastService.error(customMessage || DEFAULT_ERROR_MESSAGE)
  }

  /**
   * Gère spécifiquement les erreurs Axios
   */
  private handleAxiosError(error: AxiosError<ApiErrorResponse>, customMessage?: string): void {
    // Pas de réponse du serveur (erreur réseau)
    if (!error.response) {
      toastService.error(NETWORK_ERROR_MESSAGE)
      return
    }

    const { status, data } = error.response

    // Message personnalisé en priorité
    if (customMessage) {
      toastService.error(customMessage)
      return
    }

    // Message du backend
    const backendMessage = this.extractBackendMessage(data)
    if (backendMessage) {
      toastService.error(backendMessage)
      return
    }

    // Message par défaut selon le code HTTP
    const statusMessage = ERROR_MESSAGES[status] || DEFAULT_ERROR_MESSAGE
    toastService.error(statusMessage)
  }

  /**
   * Extrait le message d'erreur de la réponse backend
   */
  private extractBackendMessage(data: ApiErrorResponse): string | null {
    // Format 1: { message: "..." }
    if (data?.message) {
      return data.message
    }

    // Format 2: { error: "..." }
    if (data?.error) {
      return data.error
    }

    // Format 3: { errors: { field: ["message"] } }
    if (data?.errors) {
      if (Array.isArray(data.errors)) {
        return data.errors.join(", ")
      }
      if (typeof data.errors === "object") {
        const messages = Object.values(data.errors).flat()
        return messages.join(", ")
      }
    }

    return null
  }

  /**
   * Vérifie si l'erreur est une erreur Axios
   */
  private isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
    return (error as AxiosError).isAxiosError === true
  }

  /**
   * Récupère le code d'erreur HTTP
   */
  getErrorStatus(error: unknown): number | null {
    if (this.isAxiosError(error)) {
      return error.response?.status || null
    }
    return null
  }

  /**
   * Vérifie si l'erreur est une erreur d'authentification (401)
   */
  isAuthError(error: unknown): boolean {
    return this.getErrorStatus(error) === 401
  }

  /**
   * Vérifie si l'erreur est une erreur de permissions (403)
   */
  isForbiddenError(error: unknown): boolean {
    return this.getErrorStatus(error) === 403
  }

  /**
   * Vérifie si l'erreur est une erreur not found (404)
   */
  isNotFoundError(error: unknown): boolean {
    return this.getErrorStatus(error) === 404
  }

  /**
   * Vérifie si l'erreur est une erreur serveur (5xx)
   */
  isServerError(error: unknown): boolean {
    const status = this.getErrorStatus(error)
    return status !== null && status >= 500 && status < 600
  }
}

export const errorHandler = new ErrorHandler()