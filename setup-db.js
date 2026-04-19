require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@vercel/postgres');

async function setup() {
  const client = createClient();
  await client.connect();
  
  try {
    // Buat tabel users
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_banned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabel users berhasil dibuat');

    // Buat tabel chat_rooms
    await client.sql`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT DEFAULT 'Chat Baru',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabel chat_rooms berhasil dibuat');

    // Buat tabel messages
    await client.sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabel messages berhasil dibuat');

    // Buat user admin default
    await client.sql`
      INSERT INTO users (username, password, role)
      VALUES ('admin', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING
    `;
    console.log('✅ User admin dibuat (username: admin, password: admin123)');

    console.log('\n🎉 SEMUA TABEL BERHASIL!');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await client.end();
  }
}

setup();