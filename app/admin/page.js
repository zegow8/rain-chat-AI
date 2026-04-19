'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
    } else if (userRole !== 'admin') {
      router.push('/');
    } else {
      setRole(userRole);
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
  };

  const viewUserChats = async (userId) => {
    setSelectedUser(userId);
    const res = await fetch(`/api/admin/users/${userId}/chats`);
    const data = await res.json();
    setUserChats(data);
  };

  const banUser = async (userId, isBanned) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isBanned }),
    });
    loadUsers();
  };

  const deleteUserChats = async (userId) => {
    if (!confirm('Hapus semua riwayat chat user ini?')) return;
    await fetch(`/api/admin/users/${userId}/chats`, { method: 'DELETE' });
    if (selectedUser === userId) {
      setUserChats([]);
    }
    loadUsers();
  };

  if (!role) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR - MAROON #800000 DENGAN BAYANGAN HITAM TEBAL */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <h2 style={styles.logo}>🛡️ Admin Panel</h2>
          <p style={styles.logoSub}>RainChat · Maroon Ops</p>
        </div>
        
        <button onClick={() => router.push('/')} style={styles.backBtn}>
          ← Kembali ke Chat
        </button>
        
        <button onClick={() => {
          localStorage.clear();
          router.push('/login');
        }} style={styles.logoutBtn}>
          Logout
        </button>

        <div style={styles.statsBadge}>
          <span style={styles.statsText}>👥 Total User</span>
          <span style={styles.statsNumber}>{users.length}</span>
        </div>
      </div>

      {/* MAIN CONTENT - MAROON VIBES */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚡ Manajemen Pengguna</h1>
          <p style={styles.subtitle}>Kelola user, ban/unban, dan riwayat chat dengan kuasa penuh</p>
        </div>

        {/* TABEL USER */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>
                    <span style={styles.username}>{user.username}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={user.isBanned ? styles.badgeBanned : styles.badgeActive}>
                      {user.isBanned ? '⚠️ Banned' : '✅ Aktif'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <button onClick={() => viewUserChats(user.id)} style={styles.btnView}>
                        📄 Chat
                      </button>
                      <button onClick={() => banUser(user.id, !user.isBanned)} style={user.isBanned ? styles.btnUnban : styles.btnBan}>
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button onClick={() => deleteUserChats(user.id)} style={styles.btnDelete}>
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIWAYAT CHAT USER */}
        {selectedUser && (
          <div style={styles.chatHistory}>
            <div style={styles.chatHeader}>
              <h2 style={styles.chatTitle}>💬 Riwayat Chat User ID: {selectedUser}</h2>
              <button onClick={() => setSelectedUser(null)} style={styles.closeHistory}>
                ✖ Tutup
              </button>
            </div>
            <div style={styles.chatList}>
              {userChats.length === 0 ? (
                <p style={styles.noChats}>Belum ada riwayat chat untuk user ini.</p>
              ) : (
                userChats.map((room, idx) => (
                  <div key={idx} style={styles.roomCard}>
                    <div style={styles.roomHeader}>
                      <h3 style={styles.roomTitle}>📁 {room.title}</h3>
                      <span style={styles.roomDate}>
                        {new Date(room.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={styles.messagesContainer}>
                      {room.messages.map((msg, msgIdx) => (
                        <div key={msgIdx} style={msg.role === 'user' ? styles.userMsg : styles.aiMsg}>
                          <strong>{msg.role === 'user' ? '👤 User' : '🤖 RainChat'}:</strong>
                          <span style={styles.msgContent}>{msg.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLE OBJECT - FULL MAROON #800000 DENGAN BAYANGAN HITAM TEBAL
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#1a0303',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '24px',
    color: '#800000',
    fontWeight: 'bold',
  },
  // SIDEBAR MAROON
  sidebar: {
    width: '300px',
    background: '#4a0404',
    backgroundImage: 'linear-gradient(145deg, #5c0a0a 0%, #3a0303 100%)',
    color: '#fce4e4',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '12px 0 24px rgba(0,0,0,0.8), inset -1px 0 0 rgba(255,200,200,0.15)',
    borderRight: '2px solid #2c0000',
  },
  logoArea: {
    marginBottom: '32px',
    borderBottom: '2px solid #a03030',
    paddingBottom: '16px',
  },
  logo: {
    fontSize: '26px',
    fontWeight: '800',
    marginBottom: '6px',
    textShadow: '4px 4px 0 #1a0000',
    letterSpacing: '-0.5px',
    color: '#ffd5d5',
  },
  logoSub: {
    fontSize: '11px',
    color: '#e0b3b3',
    textShadow: '2px 2px 2px #1a0000',
    opacity: 0.9,
  },
  backBtn: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    background: '#9e2d2d',
    backgroundImage: 'linear-gradient(to bottom, #b33a3a, #7a1f1f)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 6px 0 #3a0101',
    transition: 'transform 0.05s ease',
    fontSize: '14px',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    marginBottom: '28px',
    background: '#881c1c',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 5px 0 #3a0000',
    fontSize: '14px',
  },
  statsBadge: {
    background: '#631212',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.4)',
    border: '1px solid #a14444',
    marginTop: 'auto',
  },
  statsText: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#ffcece',
  },
  statsNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffb5b5',
    textShadow: '2px 2px 0 #2a0000',
    marginTop: '6px',
  },
  // MAIN AREA
  main: {
    flex: 1,
    padding: '28px 32px',
    backgroundColor: '#fae6e6',
    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(128,0,0,0.06) 2%, transparent 2.5%)',
    backgroundSize: '28px 28px',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '32px',
    borderLeft: '6px solid #800000',
    paddingLeft: '20px',
    boxShadow: '-3px 0 8px rgba(128,0,0,0.2)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#5a0202',
    textShadow: '3px 3px 0 #e0b3b3',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b2e2e',
    fontWeight: '500',
    fontSize: '14px',
  },
  tableWrapper: {
    background: '#fffaf5',
    borderRadius: '20px',
    overflow: 'auto',
    boxShadow: '12px 12px 0 #4a1a1a, 0 8px 20px rgba(0,0,0,0.3)',
    border: '1px solid #c28a8a',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'inherit',
  },
  th: {
    borderBottom: '3px solid #800000',
    padding: '14px 12px',
    background: '#f5e6e6',
    color: '#4a0202',
    fontWeight: '800',
    fontSize: '14px',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid #e0c4c4',
    transition: 'background 0.1s',
  },
  td: {
    padding: '14px 12px',
    color: '#3c1a1a',
    fontWeight: '500',
  },
  username: {
    fontWeight: '600',
    color: '#5c1818',
  },
  badgeAdmin: {
    background: '#800000',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 3px black',
  },
  badgeUser: {
    background: '#2d4a2d',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 3px black',
  },
  badgeActive: {
    background: '#2b6e2b',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  badgeBanned: {
    background: '#a12222',
    color: '#ffcfcf',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  actionGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  btnView: {
    background: '#9e4a4a',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    boxShadow: '0 2px 3px black',
  },
  btnBan: {
    background: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    boxShadow: '0 2px 3px black',
  },
  btnUnban: {
    background: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    boxShadow: '0 2px 3px black',
  },
  btnDelete: {
    background: '#6b1a1a',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    boxShadow: '0 2px 3px black',
  },
  // CHAT HISTORY SECTION
  chatHistory: {
    marginTop: '40px',
    background: '#fff8f0',
    borderRadius: '24px',
    boxShadow: '12px 12px 0 #4a1a1a, 0 6px 18px black',
    overflow: 'hidden',
  },
  chatHeader: {
    background: '#800000',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ffbcbc',
  },
  chatTitle: {
    color: '#fff0e6',
    fontSize: '20px',
    fontWeight: '800',
    textShadow: '2px 2px 0 #2a0000',
    margin: 0,
  },
  closeHistory: {
    background: '#2f0a0a',
    color: '#ffbebe',
    border: '1px solid #d98c8c',
    padding: '6px 16px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px black',
  },
  chatList: {
    padding: '20px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  noChats: {
    textAlign: 'center',
    color: '#8b5a5a',
    padding: '40px',
    fontStyle: 'italic',
  },
  roomCard: {
    background: '#ffffff',
    borderRadius: '20px',
    marginBottom: '24px',
    border: '1px solid #dbb0b0',
    boxShadow: '6px 6px 0 #b16e6e',
    overflow: 'hidden',
  },
  roomHeader: {
    background: '#f1dfdf',
    padding: '12px 20px',
    borderBottom: '2px solid #c08282',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#4a1313',
    margin: 0,
  },
  roomDate: {
    fontSize: '11px',
    color: '#8b4a4a',
    fontWeight: '500',
  },
  messagesContainer: {
    padding: '16px 20px',
    background: '#fefaf5',
  },
  userMsg: {
    background: '#f3e0e0',
    padding: '10px 16px',
    borderRadius: '18px',
    marginBottom: '12px',
    color: '#3a1010',
    borderLeft: '5px solid #800000',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.05)',
  },
  aiMsg: {
    background: '#e8f0e8',
    padding: '10px 16px',
    borderRadius: '18px',
    marginBottom: '12px',
    color: '#1d471d',
    borderLeft: '5px solid #2e7d32',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.05)',
  },
  msgContent: {
    marginLeft: '8px',
    fontWeight: 'normal',
    wordBreak: 'break-word',
  },
};