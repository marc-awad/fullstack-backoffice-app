// pages/Home.tsx
import { useState, useEffect } from "react"
import { getProducts, getCategories } from "../services/productService"
import ProductCard from "../components/ProductCard"
import SearchBar from "../components/SearchBar"
import CategoryFilter from "../components/CategoryFilter"
import Pagination from "../components/Pagination"
import type { Product } from "../models/Product"

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres et pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const pageSize = 12

  // Chargement des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err)
      }
    }

    fetchCategories()
  }, [])

  // Chargement des produits
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getProducts({
          page: currentPage,
          size: pageSize,
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
        })

        setProducts(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch (err) {
        setError("Erreur lors du chargement des produits")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, searchQuery, selectedCategory])

  // Gestionnaires d'événements
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="container">
          <h1>Notre Catalogue</h1>
          <p>Découvrez nos produits de qualité</p>
        </div>
      </header>

      <div className="container">
        {/* Barre de recherche */}
        <div className="search-section">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>

        {/* Filtres par catégorie */}
        <div className="filter-section">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Résultats */}
        <div className="results-info">
          <p>
            {totalElements} produit{totalElements > 1 ? "s" : ""} trouvé
            {totalElements > 1 ? "s" : ""}
            {searchQuery && ` pour "${searchQuery}"`}
            {selectedCategory && ` dans ${selectedCategory}`}
          </p>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des produits...</p>
          </div>
        )}

        {/* Erreur */}
        {error && <div className="error-message">{error}</div>}

        {/* Grille de produits */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Aucun résultat */}
        {!loading && !error && products.length === 0 && (
          <div className="no-results">
            <p>😔 Aucun produit trouvé</p>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
