import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce.js'
import { useSearchPlace } from '../hooks/useSearchPlace.js'
import { useCurrentWeather } from '../hooks/useCurrentWeather.js'
import { useCommentGetter } from '../hooks/useCommentGetter.js'
import { useCommentPoster } from '../hooks/useCommentPoster.js'
import PlaceList from '../components/PlaceList.jsx'
import CommentForm from '../components/CommentForm.jsx'
import WeatherCard from '../components/WeatherCard.jsx'
import CommentSection from '../components/CommentSection.jsx'

export default function Home() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 200)
  const places = useSearchPlace(debouncedQuery)
  const [selectedPlace, setSelectedPlace] = useState(() => {
    try {
      const raw = localStorage.getItem('selectedPlace')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  const saveSelectedPlace = (p) => {
    setSelectedPlace(p)
    try {
      if (p) localStorage.setItem('selectedPlace', JSON.stringify(p))
      else localStorage.removeItem('selectedPlace')
    } catch (e) {
    }
  }

  const { data: currentWeather, loading: weatherLoading, error: weatherError } = useCurrentWeather(selectedPlace?.name || null)
  const { data: commentsData, loading: commentsLoading, error: commentsError, refresh: refreshComments, page: commentsPage, setPage: setCommentsPage } = useCommentGetter()
  const { refresh: postComment, loading: posting, error: postError } = useCommentPoster()

  const handleSelectPlace = (p) => { saveSelectedPlace(p); setQuery('') }

  const handlePost = async (author, content) => {
    const weatherPayload = currentWeather ? { 
      location: currentWeather.location.name,
      temperature: currentWeather.current.temp_c,
      temperature_feels_like: currentWeather.current.feelslike_c,
      humidity: currentWeather.current.humidity,
      wind_speed: currentWeather.current.wind_kph,
      condition_icon: currentWeather.current.condition.icon
    } : {}
    const res = await postComment((author || '').trim(), (content || '').trim(), weatherPayload)
    if (res.ok) refreshComments()
    return res
  }
return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px' }}>
        <Link to="/login" style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'none' }}>Admin Login</Link>
      </div>
      <div className="main1">
        <input className="place-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Vyber své vegetiště..." />
        <PlaceList places={places} selectedPlace={selectedPlace} onSelect={handleSelectPlace} query={query} />
        <WeatherCard selectedPlace={selectedPlace} currentWeather={currentWeather} weatherLoading={weatherLoading} weatherError={weatherError} />
        <CommentForm onPost={handlePost} posting={posting} postError={postError} />
      </div>
      <div className="main2">
    <CommentSection commentsData={commentsData} loading={commentsLoading} error={commentsError} onRefresh={refreshComments} page={commentsPage} onPageChange={setCommentsPage} />
      </div>
    </>
  )
}