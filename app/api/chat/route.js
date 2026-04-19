import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { messages, roomId } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    // Simpan pesan user
    await prisma.message.create({
      data: { roomId: parseInt(roomId), role: 'user', content: userMessage },
    });

    // Panggil OpenRouter pake key lo
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: 'Kamu adalah RainChat, AI gaul. Panggil user "Bang". Bahasa campuran Indonesia-Jaksel. Pakai kata "Anjay", "Gokil", "Gaskeun".' },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Simpan jawaban AI
    await prisma.message.create({
      data: { roomId: parseInt(roomId), role: 'assistant', content: aiMessage },
    });

    return Response.json({ message: aiMessage });
    
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ message: 'Maaf bang, error nih. Coba lagi ya!' });
  }
}