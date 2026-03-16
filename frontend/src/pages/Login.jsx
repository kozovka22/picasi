import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [pass, setPass] = useState('');
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: pass,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        alert('Neplatné přihlašovací údaje');
      }
    } catch (err) {
      console.error('Chyba při přihlašování:', err);
      alert('Chyba při přihlašování');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Admin Login</h1>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input 
        type="password" 
        value={pass} 
        onChange={e => setPass(e.target.value)} 
        placeholder="Password" 
      />
      <button type="submit" style={{ marginLeft: '10px' }}>Login</button>
    </form>
  );
}
