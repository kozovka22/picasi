import { useState, useEffect } from 'react'

/* vtipnost která mi zachrání prdel před monthly request limitem - https://stackoverflow.com/questions/77123890/debounce-in-reactjs */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
