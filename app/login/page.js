'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isLogin ? 'login' : 'register', username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      router.push('/');
    } else {
      setError(data.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
      <h1>RainChat ☁️</h1>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          required
        />
        <button type="submit" style={{ padding: '10px 20px', margin: '10px 0' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
        {isLogin ? 'Buat akun baru' : 'Sudah punya akun? Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}