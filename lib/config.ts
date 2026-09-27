import { kv } from '@vercel/kv';
import { LANGUAGES as DEFAULT_LANGS, type Language, type LanguageCode } from './languages';
import { buildSystemPrompt as DEFAULT_SYS, buildVisionPrompt as DEFAULT_VIS } from './prompts';

const KEY_LANGS = 'config:languages';
const KEY_PROMPT_SYS = (lang: LanguageCode) => `config:prompt:system:${lang}`;
const KEY_PROMPT_VIS = (lang: LanguageCode) => `config:prompt:vision:${lang}`;

const hasKV =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

let _langCache: { data: Language[]; ts: number } | null = null;
const CACHE_MS = 60_000;

export function kvEnabled(): boolean {
  return hasKV;
}

export async function getLanguages(): Promise<Language[]> {
  if (!hasKV) return DEFAULT_LANGS;
  if (_langCache && Date.now() - _langCache.ts < CACHE_MS) return _langCache.data;
  try {
    const data = await kv.get<Language[]>(KEY_LANGS);
    const result = data && data.length > 0 ? data : DEFAULT_LANGS;
    _langCache = { data: result, ts: Date.now() };
    return result;
  } catch (e) {
    console.error('KV read languages failed:', e);
    return DEFAULT_LANGS;
  }
}

export async function getSystemPrompt(lang: LanguageCode): Promise<string> {
  if (!hasKV) return DEFAULT_SYS(lang);
  try {
    const custom = await kv.get<string>(KEY_PROMPT_SYS(lang));
    return custom || DEFAULT_SYS(lang);
  } catch {
    return DEFAULT_SYS(lang);
  }
}

export async function getVisionPrompt(lang: LanguageCode): Promise<string> {
  if (!hasKV) return DEFAULT_VIS(lang);
  try {
    const custom = await kv.get<string>(KEY_PROMPT_VIS(lang));
    return custom || DEFAULT_VIS(lang);
  } catch {
    return DEFAULT_VIS(lang);
  }
}

export async function saveLanguages(langs: Language[]): Promise<void> {
  if (!hasKV) throw new Error('KV not configured');
  await kv.set(KEY_LANGS, langs);
  _langCache = null;
}

export async function saveSystemPrompt(lang: LanguageCode, prompt: string): Promise<void> {
  if (!hasKV) throw new Error('KV not configured');
  await kv.set(KEY_PROMPT_SYS(lang), prompt);
}

export async function saveVisionPrompt(lang: LanguageCode, prompt: string): Promise<void> {
  if (!hasKV) throw new Error('KV not configured');
  await kv.set(KEY_PROMPT_VIS(lang), prompt);
}

export async function listPromptOverrides(): Promise<{
  system: LanguageCode[];
  vision: LanguageCode[];
}> {
  if (!hasKV) return { system: [], vision: [] };
  const codes: LanguageCode[] = ['hi', 'ta', 'te', 'bn', 'mr', 'en'];
  const system: LanguageCode[] = [];
  const vision: LanguageCode[] = [];
  try {
    await Promise.all(
      codes.map(async (c) => {
        const s = await kv.get<string>(KEY_PROMPT_SYS(c));
        if (s) system.push(c);
        const v = await kv.get<string>(KEY_PROMPT_VIS(c));
        if (v) vision.push(c);
      })
    );
  } catch (e) {
    console.error('listPromptOverrides error:', e);
  }
  return { system, vision };
}