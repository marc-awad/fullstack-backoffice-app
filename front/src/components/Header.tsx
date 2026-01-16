// components/Header.tsx
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  logout,
} from "../services/authService"
import "../style/Header.css"

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isAuth, setIsAuth] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Mettre à jour l'état d'authentification à chaque changement de route
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)

      if (authenticated) {
        const user = getCurrentUser()
        setUsername(user?.sub || null)
        setIsAdmin(getUserRole() === "ADMIN")
      } else {
        setUsername(null)
        setIsAdmin(false)
      }
    }

    checkAuth()
  }, [location]) // Se déclenche à chaque changement de route

  const handleLogout = () => {
    logout()
    setIsAuth(false)
    setUsername(null)
    setIsAdmin(false)
    setMobileMenuOpen(false)
    navigate("/")
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo" onClick={handleLinkClick}>
          <span className="logo-icon">🛒</span>
          <span className="logo-text">E-commerce</span>
        </Link>

        {/* Menu burger (mobile) */}
        <button
          className={`burger-menu ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu de navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation principale */}
        <nav className={`header-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${isActivePath("/") ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">🏠</span>
                Accueil
              </Link>
            </li>

            <li>
              <Link
                to="/"
                className={`nav-link ${
                  isActivePath("/products") ? "active" : ""
                }`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">📦</span>
                Produits
              </Link>
            </li>

            {/* Liens pour utilisateurs authentifiés */}
            {isAuth && (
              <>
                <li>
                  <Link
                    to="/orders"
                    className={`nav-link ${
                      isActivePath("/orders") ? "active" : ""
                    }`}
                    onClick={handleLinkClick}
                  >
                    <span className="nav-icon">📋</span>
                    Mes commandes
                  </Link>
                </li>

                <li>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${
                      isActivePath("/dashboard") ? "active" : ""
                    }`}
                    onClick={handleLinkClick}
                  >
                    <span className="nav-icon">👤</span>
                    Mon compte
                  </Link>
                </li>
              </>
            )}

            {/* Lien Admin (seulement si ADMIN) */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`nav-link admin-link ${
                    isActivePath("/admin") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">🛡️</span>
                  Administration
                </Link>
              </li>
            )}
          </ul>

          {/* Section utilisateur */}
          <div className="header-user">
            {isAuth ? (
              <div className="user-menu">
                <span className="user-greeting">
                  👋 Bonjour, <strong>{username}</strong>
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  <span className="btn-icon">🚪</span>
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn-login"
                  onClick={handleLinkClick}
                >
                  <span className="btn-icon">🔐</span>
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-register"
                  onClick={handleLinkClick}
                >
                  <span className="btn-icon">✨</span>
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
