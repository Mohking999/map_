import { useEffect, useRef, useState } from 'react'

export interface GeocodingResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const result = value as Record<string, unknown>
  return (
    typeof result.place_id === 'number' &&
    typeof result.display_name === 'string' &&
    typeof result.lat === 'string' &&
    Number.isFinite(Number(result.lat)) &&
    typeof result.lon === 'string' &&
    Number.isFinite(Number(result.lon))
  )
}

export function useGeocoding() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestController = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      requestController.current?.abort()
    },
    [],
  )

  const searchAddress = async (query: string): Promise<GeocodingResult[]> => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      setError('Enter an address or place to search.')
      return []
    }

    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: normalizedQuery,
        format: 'json',
        limit: '5',
      })
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        throw new Error(`Address search failed (${response.status}).`)
      }

      const payload: unknown = await response.json()
      if (!Array.isArray(payload) || !payload.every(isGeocodingResult)) {
        throw new Error('The address search returned an unexpected response.')
      }

      return payload
    } catch (caught: unknown) {
      if (controller.signal.aborted) {
        return []
      }

      setError(
        caught instanceof Error
          ? caught.message
          : 'Address search failed. Please try again.',
      )
      return []
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setLoading(false)
      }
    }
  }

  return { searchAddress, loading, error }
}
