import { useState } from 'react'

export default function CommentForm({ onPost, posting, postError }) {
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const MAX_CHARS = 500

  const submit = async () => {
    if (!content.trim()) return
    try {
      const res = await onPost(author, content)
      if (res && res.ok) {
        setContent('')
      }
    } catch (e) {
    }
  }

  return (
    <div className="comment-input">
        <h2>P*časení</h2>
        <div className="form-input">
        <input type="text" placeholder="Jak ti říkají?" value={author} onChange={e => setAuthor(e.target.value)} />
        <textarea
            rows={5}
            placeholder="Nadávej zde..."
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
            maxLength={MAX_CHARS}
        />
        <div style={{ fontSize: '0.85rem', color: content.length >= MAX_CHARS ? 'crimson' : '#666', margin: '6px 0' }}>{content.length}/{MAX_CHARS}</div>
        <button onClick={submit} disabled={posting || content.trim().length === 0}>{posting ? 'Odesílám...' : 'Odeslat'}</button>
        {postError && <p>Chyba při odesílání nadávky</p>}
        </div>
    </div>
  )
}
