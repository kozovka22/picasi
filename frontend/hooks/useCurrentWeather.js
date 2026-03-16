import { useState, useEffect } from 'react'

export const useCurrentWeather = (query) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const qStr = query == null ? '' : String(query)
    if (!qStr.trim()) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = `https://api.weatherapi.com/v1/current.json?key=b726d90bc5894460b64154330250111&q=${encodeURIComponent(qStr)}`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error('Network response was not ok')
        const json = await res.json()
        setData(json)
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('useCurrentWeather error', e)
          setError(e)
          setData(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    return () => controller.abort()
  }, [query])

  return { data, loading, error }
}
