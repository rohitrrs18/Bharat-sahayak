import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 900;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || '';
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) return NextResponse.json({ error: 'Weather API not configured' }, { status: 500 });
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 });

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )},IN&appid=${key}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Weather API error');
    return NextResponse.json({
      city: data.name,
      temp: data.main?.temp,
      feels_like: data.main?.feels_like,
      humidity: data.main?.humidity,
      description: data.weather?.[0]?.description,
      wind: data.wind?.speed,
      rain: data.rain?.['1h'] || 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}