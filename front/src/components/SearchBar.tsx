// components/SearchBar.tsx
import { Search } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

export default function SearchBar({
  onSearch,
  placeholder = "Rechercher un produit...",
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timer = setTimeout(() => {
      onSearch(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleClear = () => {
    setQuery("")
  }

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
<Search className="search-icon" size={20} strokeWidth={2.5} />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="clear-button" onClick={handleClear}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
