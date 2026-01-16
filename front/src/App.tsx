// App.tsx
import { useEffect } from "react"
import AppRouter from "./router/AppRouter"
import { getProducts } from "./services/productService"
import "./index.css"

function App() {
  // Test de l'API au chargement (utile pour le debug)
  useEffect(() => {
    getProducts()
      .then((data) => {
        console.log("✅ Produits chargés:", data)
      })
      .catch((err) => {
        console.error("❌ Erreur API:", err)
      })
  }, [])

  return <AppRouter />
}

export default App
