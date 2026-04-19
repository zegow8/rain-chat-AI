import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { messages, roomId } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    await prisma.message.create({
      data: { roomId: parseInt(roomId), role: 'user', content: userMessage },
    });

    const history = await prisma.message.findMany({
      where: { roomId: parseInt(roomId) },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const chatHistory = history.map(msg => ({ role: msg.role, content: msg.content }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Kamu adalah RainChat, AI gaul. Panggil user "Bang".' },
        ...chatHistory,
      ],
    });

    const aiMessage = completion.choices[0].message.content;

    await prisma.message.create({
      data: { roomId: parseInt(roomId), role: 'assistant', content: aiMessage },
    });

    return Response.json({ message: aiMessage });
    
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}