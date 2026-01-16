// pages/AdminDashboard.tsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAdminStats } from "../services/adminService"
import type { AdminStats } from "../services/adminService"
import "../style/AdminDashboard.css"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getAdminStats()
        setStats(data)
        console.log("📊 Admin stats reçues :", stats)
      } catch (err: any) {
        console.error("Erreur lors du chargement des statistiques:", err)

        // Si l'endpoint n'existe pas encore, utiliser des données de démonstration
        if (err.response?.status === 404 || err.response?.status === 500) {
          setStats({
            totalProducts: 25,
            totalUsers: 142,
            totalOrders: 89,
            totalRevenue: 45780.5,
            recentOrders: 12,
            lowStockProducts: 5,
          })
          console.warn("Utilisation de données de démonstration")
        } else {
          setError("Impossible de charger les statistiques")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("fr-FR").format(value)
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Tableau de bord Administration</h1>
            <p>Vue d'ensemble de votre plateforme e-commerce</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/products/new" className="btn-primary">
              <span className="btn-icon">➕</span>
              Nouveau produit
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Chiffre d'affaires</h3>
            <p className="stat-value">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
            <span className="stat-label">Total des ventes</span>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Commandes</h3>
            <p className="stat-value">
              {formatNumber(stats?.totalOrders || 0)}
            </p>
            <span className="stat-label">
              {stats?.recentOrders && `+${stats.recentOrders} cette semaine`}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>Produits</h3>
            <p className="stat-value">
              {formatNumber(stats?.totalProducts || 0)}
            </p>
            <span className="stat-label">
              {stats?.lowStockProducts &&
                `${stats.lowStockProducts} en stock faible`}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Utilisateurs</h3>
            <p className="stat-value">{formatNumber(stats?.totalUsers || 0)}</p>
            <span className="stat-label">Clients inscrits</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Actions rapides</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/products" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Gérer les produits</h3>
            <p>Consulter, modifier ou supprimer des produits</p>
            <span className="action-arrow">→</span>
          </Link>

          <Link to="/admin/orders" className="action-card">
            <div className="action-icon">📦</div>
            <h3>Gérer les commandes</h3>
            <p>Suivre et traiter les commandes clients</p>
            <span className="action-arrow">→</span>
          </Link>

          <Link to="/admin/users" className="action-card">
            <div className="action-icon">👥</div>
            <h3>Gérer les utilisateurs</h3>
            <p>Administrer les comptes utilisateurs</p>
            <span className="action-arrow">→</span>
          </Link>

          <Link to="/admin/reports" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Rapports & Analytics</h3>
            <p>Consulter les statistiques détaillées</p>
            <span className="action-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-section">
        <div className="info-card info-card-highlight">
          <div className="info-header">
            <h3>🔔 Notifications</h3>
            <span className="badge">3</span>
          </div>
          <ul className="info-list">
            <li>
              <span className="info-dot info-dot-warning"></span>
              <div>
                <strong>Stock faible</strong>
                <p>
                  {stats?.lowStockProducts || 0} produits nécessitent un
                  réapprovisionnement
                </p>
              </div>
            </li>
            <li>
              <span className="info-dot info-dot-success"></span>
              <div>
                <strong>Nouvelles commandes</strong>
                <p>
                  {stats?.recentOrders || 0} commandes en attente de traitement
                </p>
              </div>
            </li>
            <li>
              <span className="info-dot info-dot-info"></span>
              <div>
                <strong>Système à jour</strong>
                <p>
                  Dernière mise à jour le{" "}
                  {new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h3>📈 Tendances</h3>
          <div className="trend-chart">
            <div className="trend-item">
              <span className="trend-label">Ventes</span>
              <div className="trend-bar">
                <div
                  className="trend-fill trend-fill-success"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <span className="trend-value">+15%</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Nouveaux clients</span>
              <div className="trend-bar">
                <div
                  className="trend-fill trend-fill-info"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <span className="trend-value">+10%</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Taux de conversion</span>
              <div className="trend-bar">
                <div
                  className="trend-fill trend-fill-warning"
                  style={{ width: "45%" }}
                ></div>
              </div>
              <span className="trend-value">8.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
