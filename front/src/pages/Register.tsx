import { useState } from "react"
import { register } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import "../index.css"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !email || !password || !confirm) {
      setError("Tous les champs sont obligatoires")
      return
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    try {
      await register({
        username,
        email,
        password,
      })
      navigate("/login")
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription")
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Créer un compte</h2>

        {error && <p className="error">{error}</p>}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button type="submit">S’inscrire</button>

        <p>
          Déjà un compte ? <Link to="/login">Connexion</Link>
        </p>
      </form>
    </div>
  )
}
