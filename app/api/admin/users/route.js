import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: semua user
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, isBanned: true },
  });
  return new Response(JSON.stringify(users));
}

// PUT: ban/unban user
export async function PUT(req) {
  const { userId, isBanned } = await req.json();
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned },
  });
  return new Response(JSON.stringify({ success: true }));
}