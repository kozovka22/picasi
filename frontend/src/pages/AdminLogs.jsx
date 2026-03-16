import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (p) => {
    const token = sessionStorage.getItem('adminToken');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/logs?page=${p}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
        setTotalPages(data.total_pages || 1);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="admin-logs" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Systémové logy</h1>
        <Link to="/admin" className="button">Zpět na Dashboard</Link>
      </div>

      {loading ? <p>Načítám logy...</p> : (
        <>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '10px' }}>Čas</th>
                <th style={{ padding: '10px' }}>Uživatel</th>
                <th style={{ padding: '10px' }}>Akce</th>
                <th style={{ padding: '10px' }}>Zpráva</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}><strong>{log.user}</strong></td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      background: log.action.includes('FAILED') || log.action.includes('UNAUTHORIZED') ? '#fee2e2' : '#f0fdf4',
                      color: log.action.includes('FAILED') || log.action.includes('UNAUTHORIZED') ? '#991b1b' : '#166534'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {log.message}
                    {log.comment && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', borderLeft: '2px solid #ccc', paddingLeft: '8px' }}>
                        "{log.comment.content.substring(0, 50)}..." od {log.comment.author}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Předchozí</button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Další</button>
          </div>
        </>
      )}
    </div>
  );
}
