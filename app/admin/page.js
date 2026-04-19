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

  if (!role) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: '300px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>Admin Panel</h2>
        <button onClick={() => router.push('/')} style={{ width: '100%', padding: '10px', margin: '10px 0', background: '#3498db', border: 'none', color: 'white', cursor: 'pointer' }}>
          Kembali ke Chat
        </button>
        <button onClick={() => {
          localStorage.clear();
          router.push('/login');
        }} style={{ width: '100%', padding: '10px', margin: '10px 0', background: '#e74c3c', border: 'none', color: 'white', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Daftar User</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', background: '#f2f2f2' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f2f2f2' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f2f2f2' }}>Role</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f2f2f2' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f2f2f2' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.isBanned ? '⚠️ Banned' : '✅ Aktif'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => viewUserChats(user.id)} style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}>Lihat Chat</button>
                  <button onClick={() => banUser(user.id, !user.isBanned)} style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', background: user.isBanned ? 'green' : 'orange', color: 'white' }}>
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                  <button onClick={() => deleteUserChats(user.id)} style={{ padding: '5px 10px', cursor: 'pointer', background: 'red', color: 'white' }}>Hapus Riwayat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedUser && (
          <div style={{ marginTop: '30px' }}>
            <h2>Riwayat Chat User ID: {selectedUser}</h2>
            {userChats.map((room, idx) => (
              <div key={idx} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                <h3>Room: {room.title}</h3>
                {room.messages.map((msg, msgIdx) => (
                  <div key={msgIdx} style={{ marginLeft: '20px', marginBottom: '5px', color: msg.role === 'user' ? 'blue' : 'green' }}>
                    <strong>{msg.role === 'user' ? 'User' : 'AI'}:</strong> {msg.content}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}