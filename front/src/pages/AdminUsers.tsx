// pages/AdminUsers.tsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  AlertCircle,
  Users as UsersIcon,
  Edit2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle
} from "lucide-react"
import { getAdminUsers } from "../services/adminService"
import UserFormModal from "../components/UserFormModal"
import type { UserResponse } from "../services/adminService"
import type { Page } from "../models/Page"
import "../style/AdminUsers.css"

export default function AdminUsers() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [page, setPage] = useState<Page<UserResponse> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getAdminUsers(currentPage, 10)
      setPage(data)
      setUsers(data.content)
    } catch (err: any) {
      console.error("Erreur lors du chargement des utilisateurs:", err)
      setError("Impossible de charger les utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    fetchUsers() // Recharger la liste
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading && users.length === 0) {
    return (
      <div className="admin-users">
        <div className="loading-container">
          <Loader2 className="spinner" size={50} strokeWidth={2.5} />
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-users">
      {/* Header */}
      <header className="users-header">
        <div className="header-content">
          <div>
            <h1>Gestion des utilisateurs</h1>
            <p>Gérer les comptes et les permissions des utilisateurs</p>
          </div>
          <div className="header-actions">
            <Link to="/admin" className="btn-secondary">
              <ArrowLeft className="btn-icon" size={18} strokeWidth={2.5} />
              Retour au dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <AlertCircle className="error-icon" size={24} strokeWidth={2.5} />
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn-retry">
            Réessayer
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Rôles</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <UsersIcon className="empty-icon" size={64} strokeWidth={2} />
                  <p>Aucun utilisateur trouvé</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="user-id">#{user.id}</span>
                  </td>
                  <td>
                    <div className="user-name">
                      <strong>{user.username}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>
                  <td>
                    <div className="roles-list">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role}
                            className={`role-badge role-${role.toLowerCase()}`}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="role-badge role-user">USER</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.enabled ? "status-active" : "status-inactive"
                      }`}
                    >
                      {user.enabled ? (
                        <>
                          <CheckCircle size={16} strokeWidth={2.5} />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle size={16} strokeWidth={2.5} />
                          Désactivé
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="date-text">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn-edit"
                        title="Modifier"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {page && page.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            Précédent
          </button>
          <span className="pagination-info">
            Page {currentPage + 1} sur {page.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= page.totalPages - 1}
            className="pagination-btn"
          >
            Suivant
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showModal && selectedUser && (
        <UserFormModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  )
}