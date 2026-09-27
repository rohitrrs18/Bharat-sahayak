// Fetch live context to inject into the AI prompt.
// Gracefully returns empty string if APIs are not configured.

const STATE_ALIASES: Record<string, string> = {
  // Common Indian state names → normalize
  up: 'Uttar Pradesh',
  mp: 'Madhya Pradesh',
  ap: 'Andhra Pradesh',
  hp: 'Himachal Pradesh',
  tn: 'Tamil Nadu',
  mh: 'Maharashtra',
  wb: 'West Bengal',
  pb: 'Punjab',
  hr: 'Haryana',
  br: 'Bihar',
  gj: 'Gujarat',
  rj: 'Rajasthan',
  ka: 'Karnataka',
  kl: 'Kerala',
  od: 'Odisha',
  tg: 'Telangana',
  ts: 'Telangana',
  as: 'Assam',
  jh: 'Jharkhand',
  cg: 'Chhattisgarh',
  uk: 'Uttarakhand',
  ga: 'Goa',
};

export function normalizeState(input: string): string {
  const cleaned = input.trim();
  if (!cleaned) return '';
  const key = cleaned.toLowerCase().replace(/[^a-z]/g, '');
  return STATE_ALIASES[key] || cleaned;
}

// --- Weather (OpenWeatherMap) ---
async function getWeather(state: string): Promise<string> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key || !state) return '';
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      state
    )},IN&appid=${key}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) return '';
    const data = await res.json();
    const temp = data?.main?.temp;
    const feels = data?.main?.feels_like;
    const hum = data?.main?.humidity;
    const desc = data?.weather?.[0]?.description;
    const wind = data?.wind?.speed;
    const rain = data?.rain?.['1h'] || data?.rain?.['3h'] || 0;
    return `Weather in ${state}: ${temp}°C (feels ${feels}°C), ${desc}, humidity ${hum}%, wind ${wind} m/s, rain last hour ${rain}mm.`;
  } catch (e) {
    console.error('Weather fetch failed:', e);
    return '';
  }
}

// --- Mandi prices (data.gov.in — Agmarknet) ---
async function getMandiPrices(state: string, commodity?: string): Promise<string> {
  const key = process.env.DATA_GOV_API_KEY;
  if (!key || !state) return '';
  try {
    const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
    const params = new URLSearchParams({
      'api-key': key,
      format: 'json',
      limit: '5',
      'filters[state]': state,
    });
    if (commodity) params.append('filters[commodity]', commodity);

    const url = `https://api.data.gov.in/resource/${resourceId}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hr
    if (!res.ok) return '';
    const data = await res.json();
    const records = data?.records || [];
    if (!records.length) return '';

    const lines = records.slice(0, 5).map((r: any) => {
      return `• ${r.commodity} @ ${r.market} (${r.district}): ₹${r.modal_price}/quintal on ${r.arrival_date}`;
    });
    return `Recent mandi prices in ${state}:\n${lines.join('\n')}`;
  } catch (e) {
    console.error('Mandi fetch failed:', e);
    return '';
  }
}

/**
 * Extract a state name and/or commodity from the user's message.
 * Simple keyword match — works reasonably well in English & transliterated names.
 */
export function extractLocationAndCrop(text: string): {
  state: string;
  commodity: string;
} {
  const lower = text.toLowerCase();
  const states = [
    'uttar pradesh', 'madhya pradesh', 'andhra pradesh', 'himachal pradesh',
    'tamil nadu', 'maharashtra', 'west bengal', 'punjab', 'haryana',
    'bihar', 'gujarat', 'rajasthan', 'karnataka', 'kerala', 'odisha',
    'telangana', 'assam', 'jharkhand', 'chhattisgarh', 'uttarakhand',
    'goa', 'delhi', 'up', 'mp', 'ap', 'hp', 'tn', 'mh', 'wb',
  ];
  let state = '';
  for (const s of states) {
    if (lower.includes(s)) {
      state = normalizeState(s);
      break;
    }
  }

  const crops = [
    'wheat', 'rice', 'paddy', 'maize', 'cotton', 'sugarcane', 'soybean',
    'onion', 'potato', 'tomato', 'groundnut', 'mustard', 'gram', 'bajra',
    'jowar', 'ragi', 'turmeric', 'chilli', 'garlic', 'ginger', 'banana',
    'mango', 'grapes', 'pomegranate',
  ];
  let commodity = '';
  for (const c of crops) {
    if (lower.includes(c)) {
      commodity = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  return { state, commodity };
}

/**
 * Build a live-context string to prepend to the system prompt.
 * Only fetches what's likely needed based on keywords, to save API calls.
 */
export async function getLiveContext(userMessage: string): Promise<string> {
  const { state, commodity } = extractLocationAndCrop(userMessage);
  const lower = userMessage.toLowerCase();

  const wantsWeather =
    /weather|rain|मौसम|बारिश|வானிலை|వాతావరణ|আবহাওয়া|हवामान/i.test(lower);
  const wantsPrice =
    /price|mandi|market|rate|भाव|मंडी|दाम|விலை|சந்தை|ధర|మార్కెట్|দর|বাজার|भाजी|बाजारभाव/i.test(
      lower
    );

  const parts: string[] = [];

  if (state && (wantsWeather || wantsPrice)) {
    const tasks: Promise<string>[] = [];
    if (wantsWeather) tasks.push(getWeather(state));
    if (wantsPrice) tasks.push(getMandiPrices(state, commodity));
    const results = await Promise.all(tasks);
    results.forEach((r) => r && parts.push(r));
  }

  if (!parts.length) return '';
  return `\n\n=== LIVE CONTEXT (use for accuracy) ===\n${parts.join('\n\n')}\n=== END LIVE CONTEXT ===`;
}