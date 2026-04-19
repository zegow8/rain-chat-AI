import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get('userId'));

  const rooms = await prisma.chatRoom.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  return Response.json(rooms);
}

export async function POST(req) {
  const { userId, title } = await req.json();

  const roomCount = await prisma.chatRoom.count({ where: { userId } });
  if (roomCount >= 10) {
    const oldestRoom = await prisma.chatRoom.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (oldestRoom) {
      await prisma.message.deleteMany({ where: { roomId: oldestRoom.id } });
      await prisma.chatRoom.delete({ where: { id: oldestRoom.id } });
    }
  }

  const newRoom = await prisma.chatRoom.create({
    data: { userId, title: title || 'Chat Baru' },
  });

  return Response.json(newRoom);
}

export async function PUT(req) {
  const { roomId, title } = await req.json();
  
  const updatedRoom = await prisma.chatRoom.update({
    where: { id: parseInt(roomId) },
    data: { title },
  });
  
  return Response.json(updatedRoom);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const roomId = parseInt(searchParams.get('roomId'));

  await prisma.message.deleteMany({ where: { roomId } });
  await prisma.chatRoom.delete({ where: { id: roomId } });

  return Response.json({ success: true });
}