import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const userId = parseInt(params.id);
    
    const rooms = await prisma.chatRoom.findMany({
      where: { userId: userId },
      include: { 
        messages: { 
          orderBy: { createdAt: 'asc' } 
        } 
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return new Response(JSON.stringify(rooms), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = parseInt(params.id);
    
    const rooms = await prisma.chatRoom.findMany({ where: { userId: userId } });
    for (const room of rooms) {
      await prisma.message.deleteMany({ where: { roomId: room.id } });
      await prisma.chatRoom.delete({ where: { id: room.id } });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}