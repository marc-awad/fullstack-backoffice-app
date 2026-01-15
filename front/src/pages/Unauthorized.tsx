// pages/Unauthorized.tsx
import { Link } from "react-router-dom"

export default function Unauthorized() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>403</h1>
      <h2 style={{ marginBottom: "1rem" }}>Accès non autorisé</h2>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <Link
        to="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
        }}
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
