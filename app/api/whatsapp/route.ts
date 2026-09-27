import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getSystemPrompt } from '@/lib/config';
import { getLiveContext } from '@/lib/context';
import type { LanguageCode } from '@/lib/languages';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';
export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const hasKV =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const memSessions = new Map<string, { role: 'user' | 'assistant'; content: string }[]>();

async function getSession(phone: string) {
  if (hasKV) {
    try {
      const s = await kv.get<{ role: 'user' | 'assistant'; content: string }[]>(
        `wa:${phone}`
      );
      return s || [];
    } catch {
      return [];
    }
  }
  return memSessions.get(phone) || [];
}

async function saveSession(phone: string, history: any[]) {
  const trimmed = history.slice(-20);
  if (hasKV) {
    try {
      await kv.set(`wa:${phone}`, trimmed, { ex: 60 * 60 * 24 * 7 });
    } catch (e) {
      console.error('KV write failed', e);
    }
  } else {
    memSessions.set(phone, trimmed);
  }
}

function detectLanguage(text: string): LanguageCode {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0900-\u097F]/.test(text)) {
    if (/\b(आहे|तुम्ही|मला|कृपया|माझ्या)\b/.test(text)) return 'mr';
    return 'hi';
  }
  return 'en';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return NextResponse.json({ ok: true });

    const from = message.from;
    const text = message.text?.body?.trim() || '';
    if (!text) return NextResponse.json({ ok: true });

    const language = detectLanguage(text);
    const history = await getSession(from);
    history.push({ role: 'user', content: text });
    const trimmed = history.slice(-10);

    const [systemPrompt, liveContext] = await Promise.all([
      getSystemPrompt(language),
      getLiveContext(text),
    ]);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt + liveContext },
        ...trimmed,
      ],
      temperature: 0.6,
      max_tokens: 700,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      'क्षमा करें, कुछ गड़बड़ हुई। कृपया फिर कोशिश करें।';

    history.push({ role: 'assistant', content: reply });
    await saveSession(from, history);

    await sendWhatsAppMessage(from, reply);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('WhatsApp webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneId || !token) {
    console.warn('WhatsApp env vars missing; skipping send');
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text.slice(0, 4000) },
    }),
  });
}