import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { action, username, password } = await req.json();

    if (action === 'register') {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return new Response(JSON.stringify({ error: 'Username sudah dipakai' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const user = await prisma.user.create({
        data: { username, password, role: 'user' },
      });

      return new Response(JSON.stringify({ 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'login') {
      const user = await prisma.user.findUnique({ where: { username } });
      
      if (!user || user.password !== password) {
        return new Response(JSON.stringify({ error: 'Username atau password salah' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (user.isBanned) {
        return new Response(JSON.stringify({ error: 'Akun kamu telah diblokir admin' }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}