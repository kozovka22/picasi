import { useState, useEffect } from 'react'

export const useCommentGetter = (initialPage = 1) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(initialPage)

  const fetchComments = async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const url = `${apiUrl}/api/comment/list?page=${encodeURIComponent(p)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Neodpověď :(')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error('useCommentGetter error', e)
      setError(e)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments(page)
  }, [page])

  return { data, loading, error, refresh: () => fetchComments(page), page, setPage }
}
