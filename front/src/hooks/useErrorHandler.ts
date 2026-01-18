// hooks/useErrorHandler.ts
import { useCallback } from "react"
import { errorHandler } from "../services/errorHandler"
import { toastService } from "../services/toastService"

/**
 * Hook personnalisé pour gérer les erreurs de manière uniforme
 * 
 * @example
 * const { handleError, handleAsyncError } = useErrorHandler()
 * 
 * // Utilisation avec try-catch
 * try {
 *   await someApiCall()
 * } catch (error) {
 *   handleError(error, "Erreur lors de la création")
 * }
 * 
 * // Utilisation avec fonction async
 * const onClick = handleAsyncError(async () => {
 *   await someApiCall()
 *   toastService.success("Succès!")
 * }, "Erreur lors de la création")
 */
export function useErrorHandler() {
  /**
   * Gère une erreur et affiche un toast
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    errorHandler.handleError(error, customMessage)
  }, [])

  /**
   * Wrapper pour les fonctions async qui gère automatiquement les erreurs
   */
  const handleAsyncError = useCallback(
    <T extends unknown[], R>(
      asyncFn: (...args: T) => Promise<R>,
      errorMessage?: string
    ) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          return await asyncFn(...args)
        } catch (error) {
          handleError(error, errorMessage)
          return undefined
        }
      }
    },
    [handleError]
  )

  /**
   * Wrapper avec loading toast
   */
  const handleAsyncWithLoading = useCallback(
    <T extends unknown[], R>(
      asyncFn: (...args: T) => Promise<R>,
      loadingMessage: string,
      successMessage?: string,
      errorMessage?: string
    ) => {
      return async (...args: T): Promise<R | undefined> => {
        const toastId = toastService.loading(loadingMessage)
        
        try {
          const result = await asyncFn(...args)
          
          if (successMessage) {
            toastService.updateToSuccess(toastId, successMessage)
          } else {
            toastService.dismiss(toastId)
          }
          
          return result
        } catch (error) {
          toastService.updateToError(
            toastId,
            errorMessage || "Une erreur est survenue"
          )
          handleError(error, errorMessage)
          return undefined
        }
      }
    },
    [handleError]
  )

  return {
    handleError,
    handleAsyncError,
    handleAsyncWithLoading,
  }
}