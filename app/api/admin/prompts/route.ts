import { NextRequest, NextResponse } from 'next/server';
import {
  saveSystemPrompt,
  saveVisionPrompt,
  getSystemPrompt,
  getVisionPrompt,
  listPromptOverrides,
} from '@/lib/config';
import type { LanguageCode } from '@/lib/languages';

export const runtime = 'nodejs';

const VALID_CODES: LanguageCode[] = ['hi', 'ta', 'te', 'bn', 'mr', 'en'];

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('language') as LanguageCode | null;

  if (code && VALID_CODES.includes(code)) {
    const [system, vision] = await Promise.all([
      getSystemPrompt(code),
      getVisionPrompt(code),
    ]);
    return NextResponse.json({ language: code, system, vision });
  }

  const overrides = await listPromptOverrides();
  return NextResponse.json({ overrides });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { language, type, prompt } = await req.json();
    if (!language || !VALID_CODES.includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }
    if (!type || !['system', 'vision'].includes(type)) {
      return NextResponse.json({ error: 'type must be system|vision' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }

    if (type === 'system') await saveSystemPrompt(language, prompt);
    else await saveVisionPrompt(language, prompt);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}