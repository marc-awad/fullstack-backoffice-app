import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { getProducts } from "./services/productService";

function App() {
  useEffect(() => {
    getProducts(0, 5)
      .then((data) => {
        console.log("Produits:", data);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
      });
  }, []);

  return <AppRouter />;
}

export default App;
