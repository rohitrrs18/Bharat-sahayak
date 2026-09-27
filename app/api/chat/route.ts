import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getSystemPrompt } from '@/lib/config';
import { getLiveContext } from '@/lib/context';
import type { LanguageCode } from '@/lib/languages';

export const runtime = 'nodejs';
export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Server missing GROQ_API_KEY.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const language: LanguageCode = body.language || 'hi';

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const trimmed = messages.slice(-10);
    const lastUserMsg =
      [...trimmed].reverse().find((m) => m.role === 'user')?.content || '';

    // Fetch dynamic prompt + live context in parallel
    const [systemPrompt, liveContext] = await Promise.all([
      getSystemPrompt(language),
      getLiveContext(lastUserMsg),
    ]);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt + liveContext },
        ...trimmed.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}