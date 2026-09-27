import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { LANGUAGES } from '@/lib/languages';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
  }

  try {
    await kv.set('config:languages', LANGUAGES);
    return NextResponse.json({ ok: true, count: LANGUAGES.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}