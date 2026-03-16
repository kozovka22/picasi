import { useState } from 'react'

export const useCommentPoster = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function postComment(author, content, weather = {}) {
        setLoading(true)
        setError(null)
        setData(null)

        try {
            const apiUrl = import.meta.env.VITE_API_URL

            const url = `${apiUrl}/api/comment/new`

            const payload = {
                author: author ? author : 'Anonym',
                content: content ? content : '',
                weatherInfo: weather || {}
            }

            console.log('Posting comment with payload:', payload)

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            })

            const text = await res.text().catch(() => '')

            if (!res.ok) {
                throw new Error(`Server returned ${res.status} ${res.statusText}: ${text}`)
            }

            setData(text)
            return { ok: true, text }
        } catch (e) {
            setError(e)
            return { ok: false, error: e }
        } finally {
            setLoading(false)
        }
    }

    return { data, loading, error, refresh: postComment }
}
