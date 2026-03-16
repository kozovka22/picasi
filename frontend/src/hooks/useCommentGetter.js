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
      const token = sessionStorage.getItem('adminToken')
      const isAdmin = token ? true : false
      const apiUrl = import.meta.env.VITE_API_URL
      const url = `${apiUrl}/api/comment/list?page=${encodeURIComponent(p)}${isAdmin ? '&admin=true' : ''}`
      const headers = {}
      if (isAdmin) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const res = await fetch(url, { headers })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Neodpověď :( Status: ${res.status} ${text}`)
      }
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
