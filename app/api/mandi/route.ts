import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || '';
  const commodity = searchParams.get('commodity') || '';
  const key = process.env.DATA_GOV_API_KEY;

  if (!key) return NextResponse.json({ error: 'Mandi API not configured' }, { status: 500 });
  if (!state) return NextResponse.json({ error: 'state required' }, { status: 400 });

  try {
    const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
    const params = new URLSearchParams({
      'api-key': key,
      format: 'json',
      limit: '20',
      'filters[state]': state,
    });
    if (commodity) params.append('filters[commodity]', commodity);

    const url = `https://api.data.gov.in/resource/${resourceId}?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Mandi API error');
    return NextResponse.json({ records: data.records || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}