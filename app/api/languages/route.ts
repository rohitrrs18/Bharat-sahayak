import { NextResponse } from 'next/server';
import { getLanguages } from '@/lib/config';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET() {
  const langs = await getLanguages();
  return NextResponse.json({ languages: langs });
}