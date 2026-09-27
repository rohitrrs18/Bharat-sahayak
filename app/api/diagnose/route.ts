import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getVisionPrompt } from '@/lib/config';
import type { LanguageCode } from '@/lib/languages';

export const runtime = 'nodejs';
export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Server missing GROQ_API_KEY.' },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get('image') as File | null;
    const language = (form.get('language') as LanguageCode) || 'hi';

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const MAX_MB = 8;
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Image too large (max ${MAX_MB}MB)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mime = file.type || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${base64}`;

    const visionPrompt = await getVisionPrompt(language);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        { role: 'system', content: visionPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                language === 'en'
                  ? 'Diagnose this crop/plant image and give treatment advice.'
                  : 'इस फसल की तस्वीर देखकर बीमारी और इलाज बताइए।',
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        } as any,
      ],
      temperature: 0.4,
      max_tokens: 900,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Diagnose API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Diagnosis failed.' },
      { status: 500 }
    );
  }
}