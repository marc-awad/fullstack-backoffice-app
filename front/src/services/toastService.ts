// services/toastService.ts
import toast from "react-hot-toast"

/**
 * Service centralisé pour afficher des notifications toast
 */
class ToastService {
  /**
   * Affiche un message de succès
   */
  success(message: string) {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    })
  }

  /**
   * Affiche un message d'erreur
   */
  error(message: string) {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        background: "#ef4444",
        color: "#fff",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    })
  }

  /**
   * Affiche un message d'information
   */
  info(message: string) {
    toast(message, {
      duration: 4000,
      position: "top-right",
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
        fontWeight: "500",
      },
    })
  }

  /**
   * Affiche un message d'avertissement
   */
  warning(message: string) {
    toast(message, {
      duration: 4500,
      position: "top-right",
      icon: "⚠️",
      style: {
        background: "#f59e0b",
        color: "#fff",
        fontWeight: "500",
      },
    })
  }

  /**
   * Affiche un toast de chargement
   * Retourne l'ID du toast pour pouvoir le fermer plus tard
   */
  loading(message: string) {
    return toast.loading(message, {
      position: "top-right",
      style: {
        background: "#6b7280",
        color: "#fff",
        fontWeight: "500",
      },
    })
  }

  /**
   * Ferme un toast spécifique
   */
  dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  /**
   * Met à jour un toast existant (utile pour les loading)
   */
  updateToSuccess(toastId: string, message: string) {
    toast.success(message, {
      id: toastId,
    })
  }

  updateToError(toastId: string, message: string) {
    toast.error(message, {
      id: toastId,
    })
  }
}

export const toastService = new ToastService()