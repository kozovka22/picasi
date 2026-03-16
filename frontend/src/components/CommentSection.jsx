import CommentForm from './CommentForm.jsx'

export default function CommentSection({ commentsData, loading, error, onRefresh, page, onPageChange, isAdmin, onToggleHide }) {

  const list = Array.isArray(commentsData) ? commentsData : (commentsData?.data || []);

  return (
    <div className="comments">

      {loading ? <p>Načítám nadávky...</p> : error ? <p>Chyba při načítání nadávek</p> : (
        <>
            <div className="paging">
              {commentsData?.page !== undefined && (
                <p>Strana {commentsData.page} / {commentsData.total_pages} — Celkem {commentsData.total}</p>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => onPageChange(Math.max(1, (page || commentsData?.page || 1) - 1))} disabled={(page || commentsData?.page || 1) <= 1}>Prev</button>
                <button onClick={() => onPageChange((page || commentsData?.page || 1) + 1)} disabled={commentsData && (page || commentsData.page) >= (commentsData.total_pages || 1)}>Next</button>
                <button onClick={onRefresh}>Reload</button>
              </div>
            </div>
          <ul>
            {list.map(c => (
              <li className={`comment-card ${c.hidden ? 'comment-hidden' : ''}`} key={c.id}>
                {c.weatherInfo && (
                  <div className="comment-data">
                    <div className="comment-weather">
                      <img src={(c.weatherInfo.condition_icon?.startsWith('http') ? c.weatherInfo.condition_icon : ('https:' + c.weatherInfo.condition_icon))} alt="" />
                      <div className="comment-afterImage">
                        <div>
                          <span>Teplota <b>{c.weatherInfo.temperature} °C</b></span>
                          <span>Pocitově <b>{c.weatherInfo.temperature_feels_like} °C</b></span>
                        </div>
                        <div>
                          <span>Fučalo <b>{c.weatherInfo.wind_speed} km/h</b></span>
                          <span>Humidita <b>{c.weatherInfo.humidity}%</b></span>
                        </div>
                      </div>
                    </div>
                    <div className="comment-content">
                      <strong>{c.author}</strong> · <span>{c.created_at}</span> · <span>{c.weatherInfo.location}</span>
                      <p>{c.content}</p> 
                      {isAdmin && (
                        <button 
                          onClick={() => onToggleHide(c.id)}
                          style={{ marginTop: '0.5rem', background: c.hidden ? '#4ade80' : '#f87171' }}
                        >
                          {c.hidden ? 'Unhide' : 'Hide'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}