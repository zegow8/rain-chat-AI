import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const roomId = parseInt(searchParams.get('roomId'));

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
  });

  return new Response(JSON.stringify(messages));
}