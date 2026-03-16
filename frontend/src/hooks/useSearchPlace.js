import { useState, useEffect } from 'react'

export const useSearchPlace = (query) => {
  const [places, setPlaces] = useState([])

  useEffect(() => {
    /* ošetření inputu */
    if (!query || query.trim() === '') {
      setPlaces([])
      return
    }
    /* vtipná věc z dokumentace, abortování async funkcí, https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort až na to zase zapomenu */
    const controller = new AbortController()

    const getData = async () => {
      try {
        const apiKey = import.meta.env.VITE_API_KEY
        const response = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=` + encodeURIComponent(query),
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error('API mě nemá ráda :(')
        const data = await response.json()
        setPlaces(data)
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Nový důvod k nadávání z useSearchPlace: ', e)
        }
        setPlaces([])
      }
    }

    getData()

    return () => controller.abort()
  }, [query])
  /* call při každé změně query :3 */
  return places
}
