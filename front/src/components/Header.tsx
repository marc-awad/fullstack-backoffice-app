// components/Header.tsx
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  ShoppingCart,
  Home,
  Package,
  ClipboardList,
  User,
  Shield,
  Hand,
  LogOut,
  Lock,
  Sparkles,
  Menu,
  X
} from "lucide-react"
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
          <ShoppingCart className="logo-icon" size={28} strokeWidth={2.5} />
          <span className="logo-text">E-commerce</span>
        </Link>

        {/* Menu burger (mobile) */}
        <button
          className={`burger-menu ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu de navigation"
        >
          {mobileMenuOpen ? (
            <X size={24} strokeWidth={2.5} />
          ) : (
            <Menu size={24} strokeWidth={2.5} />
          )}
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
                <Home className="nav-icon" size={18} strokeWidth={2.5} />
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
                <Package className="nav-icon" size={18} strokeWidth={2.5} />
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
                    <ClipboardList className="nav-icon" size={18} strokeWidth={2.5} />
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
                    <User className="nav-icon" size={18} strokeWidth={2.5} />
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
                  <Shield className="nav-icon" size={18} strokeWidth={2.5} />
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
                  <Hand className="greeting-icon" size={18} strokeWidth={2.5} />
                  Bonjour, <strong>{username}</strong>
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut className="btn-icon" size={18} strokeWidth={2.5} />
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
                  <Lock className="btn-icon" size={18} strokeWidth={2.5} />
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-register"
                  onClick={handleLinkClick}
                >
                  <Sparkles className="btn-icon" size={18} strokeWidth={2.5} />
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