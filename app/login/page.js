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
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Rain icon with maroon shadow */}
        <div style={styles.iconWrapper}>
          <span style={styles.rainIcon}>🌧️</span>
        </div>
        
        <h1 style={styles.title}>
          Rain<span style={styles.titleAccent}>Chat</span>
        </h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Masuk ke akunmu' : 'Buat akun baru'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            {isLogin ? '🔓 Login' : '📝 Register'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
          {isLogin ? '✨ Buat akun baru' : '🔙 Sudah punya akun? Login'}
        </button>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

      </div>
    </div>
  );
}

// FULL STYLE OBJECT - MAROON #800000 DENGAN BAYANGAN HITAM TEBAL & BOLD
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a0303',
    backgroundImage: 'radial-gradient(circle at 25% 40%, rgba(128,0,0,0.25) 0%, #0f0101 100%)',
    padding: '20px',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  card: {
    maxWidth: '460px',
    width: '100%',
    background: '#fffaf7',
    backgroundImage: 'linear-gradient(135deg, #fff8f5 0%, #ffefef 100%)',
    borderRadius: '48px',
    padding: '44px 36px',
    textAlign: 'center',
    boxShadow: '20px 20px 0 #4a0000, 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,245,235,0.9)',
    border: '1px solid #c27878',
    transition: 'transform 0.1s ease',
  },
  iconWrapper: {
    marginBottom: '16px',
  },
  rainIcon: {
    fontSize: '72px',
    display: 'inline-block',
    filter: 'drop-shadow(8px 8px 0 #5a1a1a) drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
  },
  title: {
    fontSize: '46px',
    fontWeight: '800',
    marginBottom: '8px',
    letterSpacing: '-1px',
    color: '#3a0202',
    textShadow: '4px 4px 0 #e0b3b3',
  },
  titleAccent: {
    color: '#800000',
    textShadow: '4px 4px 0 #e0b3b3',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b2a2a',
    marginBottom: '36px',
    fontWeight: '500',
    borderBottom: '2px solid #e0b3b3',
    display: 'inline-block',
    paddingBottom: '6px',
    textShadow: '0px 1px 0px #fff0e6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '6px',
    color: '#5a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    border: '2px solid #d99b9b',
    borderRadius: '28px',
    backgroundColor: '#fffef8',
    outline: 'none',
    transition: 'all 0.1s ease',
    boxShadow: 'inset 0 2px 5px rgba(128,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)',
    fontFamily: 'inherit',
    color: '#2c0808',
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: '12px',
    padding: '14px 24px',
    fontSize: '18px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '44px',
    cursor: 'pointer',
    background: '#800000',
    backgroundImage: 'linear-gradient(145deg, #a51c1c, #6b0000)',
    color: '#fff5f0',
    boxShadow: '0 9px 0 #2f0000, 0 4px 18px rgba(0,0,0,0.4)',
    transition: 'transform 0.05s ease, box-shadow 0.1s ease',
    letterSpacing: '0.8px',
  },
  switchBtn: {
    background: 'transparent',
    border: 'none',
    color: '#800000',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '12px',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    textShadow: '0px 0px 1px #ffc0c0',
    transition: 'opacity 0.1s',
  },
  errorBox: {
    marginTop: '24px',
    padding: '12px 18px',
    background: '#fff0f0',
    borderLeft: '6px solid #c0392b',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
  },
  errorIcon: {
    fontSize: '20px',
  },
  errorText: {
    color: '#9b2c1d',
    fontWeight: '600',
    fontSize: '13px',
  },
  decorLine: {
    height: '3px',
    background: '#800000',
    width: '80px',
    margin: '32px auto 16px auto',
    borderRadius: '10px',
    boxShadow: '0 2px 4px black',
  },
  footerText: {
    fontSize: '11px',
    color: '#aa6f6f',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};

