import { useState, type FormEvent } from 'react'
import { useGeocoding, type GeocodingResult } from './useGeocoding'

export interface SelectedLocation {
  lat: number
  lon: number
  name: string
}

interface SearchBoxProps {
  onLocationSelect: (location: SelectedLocation) => void
}

function SearchBox({ onLocationSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const { searchAddress, loading, error } = useGeocoding()

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResults([])
    setHasSearched(false)
    const data = await searchAddress(query)
    setResults(data)
    setHasSearched(true)
  }

  const selectLocation = (result: GeocodingResult) => {
    onLocationSelect({
      lat: Number(result.lat),
      lon: Number(result.lon),
      name: result.display_name,
    })
  }

  return (
    <section className="search-panel" aria-label="Find a place">
      <form className="search-form" onSubmit={handleSearch}>
        <label htmlFor="address-search">Search for an address or place</label>
        <div className="search-controls">
          <input
            id="address-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Tower Bridge, London"
            aria-describedby="search-status"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      <div
        id="search-status"
        className="search-status"
        role="status"
        aria-live="polite"
      >
        {loading && <p>Searching for places…</p>}
        {error && (
          <p className="search-error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && hasSearched && results.length === 0 && (
          <p>No places found. Try a more specific search.</p>
        )}
      </div>

      {results.length > 0 && (
        <ul className="search-results" aria-label="Search results">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                className="search-result"
                type="button"
                onClick={() => selectLocation(result)}
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchBox
