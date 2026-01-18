// App.tsx
import { Toaster } from "react-hot-toast"
import AppRouter from "./router/AppRouter"

function App() {
  return (
    <>
      {/* Composant Toaster pour afficher les notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Options par défaut pour tous les toasts
          duration: 4000,
          style: {
            fontSize: "14px",
            maxWidth: "500px",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Router de l'application */}
      <AppRouter />
    </>
  )
}

export default App