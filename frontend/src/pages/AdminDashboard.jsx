import React, { useState, useEffect } from 'react';
import CommentSection from '../components/CommentSection.jsx';
import { useCommentGetter } from '../hooks/useCommentGetter.js';

export default function AdminDashboard() {
  const { data: commentsData, loading, error, refresh, page, setPage } = useCommentGetter();

  const handleToggleHide = async (commentId) => {
    const token = sessionStorage.getItem('adminToken');
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const res = await fetch(`${apiUrl}/api/comment/toggle-hide?id=${commentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        refresh();
      } else {
        alert('Chyba při změně viditelnosti');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout}>Odhlásit se</button>
      </div>
      <CommentSection 
        commentsData={commentsData} 
        loading={loading} 
        error={error} 
        onRefresh={refresh} 
        page={page} 
        onPageChange={setPage}
        isAdmin={true}
        onToggleHide={handleToggleHide}
      />
    </div>
  );
}
