'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomTitle, setRoomTitle] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cek login
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    const uname = localStorage.getItem('username');
    const r = localStorage.getItem('role');
    if (!uid) {
      router.push('/login');
    } else {
      setUserId(parseInt(uid));
      setUsername(uname);
      setRole(r);
      loadRooms(parseInt(uid));
    }
  }, []);

  // Scroll ke bawah otomatis
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load rooms
  const loadRooms = async (uid) => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch(`/api/rooms?userId=${uid}`);
      const data = await res.json();
      setRooms(data);
      if (data.length > 0) {
        setCurrentRoomId(data[0].id);
        setRoomTitle(data[0].title);
        loadMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
    setIsLoadingRooms(false);
  };

  // Load messages
  const loadMessages = async (roomId) => {
    try {
      const res = await fetch(`/api/messages?roomId=${roomId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Create new room
  const createNewRoom = async () => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: 'Chat Baru' }),
      });
      const newRoom = await res.json();
      setRooms([newRoom, ...rooms]);
      setCurrentRoomId(newRoom.id);
      setRoomTitle(newRoom.title);
      setMessages([]);
      setShowNewChat(false);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Gagal membuat chat baru');
    }
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    if (!confirm('Yakin mau hapus chat ini?')) return;
    try {
      await fetch(`/api/rooms?roomId=${roomId}`, { method: 'DELETE' });
      const newRooms = rooms.filter(r => r.id !== roomId);
      setRooms(newRooms);
      if (currentRoomId === roomId && newRooms.length > 0) {
        setCurrentRoomId(newRooms[0].id);
        setRoomTitle(newRooms[0].title);
        loadMessages(newRooms[0].id);
      } else if (newRooms.length === 0) {
        setCurrentRoomId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Send message manual
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentRoomId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Tambah pesan user ke UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          roomId: currentRoomId,
        }),
      });

      if (!res.ok) throw new Error('Gagal mengirim pesan');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      
      // Update room title kalo ini chat pertama
      if (messages.length === 0) {
        const newTitle = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
        setRoomTitle(newTitle);
        // Update di database
        await fetch('/api/rooms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: currentRoomId, title: newTitle }),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf bang, AI lagi error. Coba lagi ya nanti 🤙' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId || isLoadingRooms) return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>🌧️ RainChat</h2>
      <p>Loading...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* SIDEBAR - MAROON DARK WITH BOLD SHADOW */}
      <div style={{ 
        width: '300px', 
        background: '#4a0404', /* deep maroon #800000 vibes but richer */
        backgroundImage: 'linear-gradient(145deg, #5c0a0a 0%, #3a0303 100%)',
        color: '#fce4e4', 
        padding: '20px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '12px 0 20px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,215,215,0.1)',
        borderRight: '2px solid #2c0000'
      }}>
        <h2 style={{ 
          marginBottom: '5px', 
          fontSize: '28px', 
          fontWeight: '800',
          textShadow: '5px 5px 0 #1a0000, 3px 3px 12px black',
          letterSpacing: '-0.5px',
          color: '#ffd5d5'
        }}>🌧️ RainChat</h2>
        <p style={{ 
          fontSize: '12px', 
          color: '#e0b3b3', 
          marginBottom: '20px',
          textShadow: '2px 2px 2px #1a0000',
          fontWeight: '500'
        }}>Halo, {username} {role === 'admin' && '👑'}</p>
        
        <button onClick={() => setShowNewChat(true)} style={{
          width: '100%', 
          padding: '12px', 
          marginBottom: '15px', 
          background: '#9e2d2d',
          backgroundImage: 'linear-gradient(to bottom, #b33a3a, #7a1f1f)',
          color: 'white', 
          border: 'none', 
          borderRadius: '12px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          boxShadow: '0 8px 0 #3a0101, 0 5px 15px rgba(0,0,0,0.5)',
          transition: 'transform 0.05s ease, box-shadow 0.1s ease',
          fontSize: '14px',
          letterSpacing: '0.5px'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          + Chat Baru
        </button>

        {showNewChat && (
          <div style={{ 
            background: '#631212', 
            padding: '12px', 
            borderRadius: '14px', 
            marginBottom: '15px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #a14444'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#ffcece' }}>Buat chat baru?</p>
            <button onClick={createNewRoom} style={{ marginRight: '10px', padding: '6px 14px', cursor: 'pointer', background: '#b34747', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px black' }}>Ya</button>
            <button onClick={() => setShowNewChat(false)} style={{ padding: '6px 14px', cursor: 'pointer', background: '#2f0a0a', color: '#ffbebe', border: '1px solid #a14444', borderRadius: '8px', fontWeight: 'bold' }}>Batal</button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rooms.length === 0 && (
            <p style={{ textAlign: 'center', color: '#e0b3b3', fontSize: '14px', textShadow: '1px 1px 0 #2a0000' }}>Belum ada chat. Klik + Chat Baru</p>
          )}
          {rooms.map(room => (
            <div key={room.id} style={{
              padding: '12px',
              marginBottom: '10px',
              background: currentRoomId === room.id ? '#8b2a2a' : '#4f0b0b',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.1s',
              boxShadow: currentRoomId === room.id ? '0 6px 0 #2e0000, inset 0 1px 1px rgba(255,255,200,0.2)' : '0 4px 6px rgba(0,0,0,0.4)',
              border: currentRoomId === room.id ? '1px solid #e08686' : '1px solid #6b2a2a'
            }}>
              <div onClick={() => {
                setCurrentRoomId(room.id);
                setRoomTitle(room.title);
                loadMessages(room.id);
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', textShadow: '1px 1px 0 #3a0101', color: '#fff0f0' }}>
                  {room.title.length > 30 ? room.title.substring(0, 30) + '...' : room.title}
                </div>
                <div style={{ fontSize: '10px', color: '#e0b0b0', marginTop: '4px' }}>
                  {new Date(room.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }} style={{ background: '#a11f1f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', padding: '4px 12px', fontSize: '11px', marginTop: '8px', fontWeight: 'bold', boxShadow: '0 2px 3px black' }}>
                Hapus
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button onClick={() => {
            localStorage.clear();
            router.push('/login');
          }} style={{
            width: '100%', padding: '10px', marginBottom: '10px', background: '#881c1c', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 5px 0 #3a0000', fontSize: '14px'
          }}>
            Logout
          </button>

          {role === 'admin' && (
            <button onClick={() => router.push('/admin')} style={{
              width: '100%', padding: '10px', background: '#5a1e3a', color: '#ffd9e6', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 0 #2e0015'
            }}>
              🛡️ Panel Admin
            </button>
          )}
        </div>
      </div>

      {/* CHAT AREA - MAROON FROST + BOLD SHADOWS */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#fae6e6',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(128,0,0,0.08) 2%, transparent 2.5%)',
        backgroundSize: '28px 28px',
        boxShadow: '-8px 0 20px rgba(0,0,0,0.3) inset'
      }}>
        <div style={{ 
          padding: '20px 28px', 
          background: '#fef3f3',
          borderBottom: '4px solid #800000',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,245,0.8)'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '800',
            color: '#5a0202',
            textShadow: '3px 3px 0 #e0b3b3, 1px 1px 4px rgba(0,0,0,0.2)',
            letterSpacing: '-0.3px'
          }}>💬 {roomTitle || 'RainChat AI'}</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '100px', filter: 'drop-shadow(4px 6px 0 rgba(128,0,0,0.3))' }}>
              <div style={{ fontSize: '72px', marginBottom: '20px', textShadow: '5px 5px 0 #7a2a2a' }}>🌧️</div>
              <h3 style={{ color: '#5c1a1a', fontWeight: '800', textShadow: '2px 2px 0 #eccaca' }}>Halo {username}! 👋</h3>
              <p style={{ color: '#6b2e2e', fontWeight: '500', background: '#fff0f0', display: 'inline-block', padding: '8px 20px', borderRadius: '60px', boxShadow: '0 5px 0 #b06f6f' }}>Mulai ngobrol dengan RainChat, AI paling gaul sepanjang masa!</p>
            </div>
          )}
          {messages.map((m, index) => (
            <div key={index} style={{ marginBottom: '24px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '70%',
                padding: '14px 22px',
                borderRadius: '28px',
                backgroundColor: m.role === 'user' ? '#800000' : '#ffffff',
                color: m.role === 'user' ? '#fff5f0' : '#3c1a1a',
                boxShadow: m.role === 'user' 
                  ? '8px 8px 0 #2d0000, 0 5px 12px rgba(0,0,0,0.3)' 
                  : '6px 6px 0 #bc8a8a, 0 3px 8px rgba(0,0,0,0.1)',
                border: m.role === 'user' ? '1px solid #d96c6c' : '1px solid #eccfcf',
                fontWeight: '500'
              }}>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>{m.role === 'user' ? username : '🌧️ RainChat'}</strong>
                <div style={{ lineHeight: '1.45', wordBreak: 'break-word' }}>{m.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'inline-block', padding: '14px 24px', borderRadius: '28px', backgroundColor: '#fff', boxShadow: '5px 5px 0 #bc8a8a' }}>
                <strong>🌧️ RainChat:</strong> <span style={{ color: '#a14444', fontWeight: 'bold' }}>mengetik...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ 
          padding: '20px 28px', 
          background: '#fff5f0', 
          borderTop: '4px solid #800000',
          boxShadow: '0 -8px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,245,215,0.9)',
          display: 'flex', 
          gap: '12px' 
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan ke RainChat..."
            style={{ 
              flex: 1, 
              padding: '14px 22px', 
              borderRadius: '60px', 
              border: '2px solid #b55a5a', 
              fontSize: '15px', 
              outline: 'none',
              backgroundColor: '#fffbfb',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1), 0 2px 3px rgba(128,0,0,0.2)',
              fontWeight: '500',
              color: '#3c0808'
            }}
            disabled={!currentRoomId || isLoading}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!currentRoomId || isLoading || !input.trim()} 
            style={{ 
              padding: '12px 32px', 
              borderRadius: '60px', 
              backgroundColor: '#800000',
              backgroundImage: 'linear-gradient(145deg, #a51c1c, #6b0000)',
              color: 'white', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '15px',
              boxShadow: '0 7px 0 #350000, 0 4px 12px black',
              transition: 'transform 0.05s, box-shadow 0.1s',
              letterSpacing: '0.8px'
            }}
            onMouseDown={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 4px 0 #350000';
              }
            }}
            onMouseUp={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 7px 0 #350000';
              }
            }}
          >
            Kirim ➤
          </button>
        </form>
      </div>
    </div>
  );
}