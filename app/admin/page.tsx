'use client';

import { useEffect, useState } from 'react';

const LANGS = [
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'en', name: 'English' },
];

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [saved, setSaved] = useState('');
  const [lang, setLang] = useState('hi');
  const [type, setType] = useState<'system' | 'vision'>('system');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('admin-secret') || '';
    setSecret(s);
  }, []);

  async function load() {
    if (!secret) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/prompts?language=${lang}`, {
        headers: { 'x-admin-secret': secret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrompt(type === 'system' ? data.system : data.vision);
      setStatus('Loaded ✓');
    } catch (e: any) {
      setStatus('❌ ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!secret) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({ language: lang, type, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('Saved ✓');
      localStorage.setItem('admin-secret', secret);
    } catch (e: any) {
      setStatus('❌ ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-4">🛠️ Admin — Prompt Editor</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Secret</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Same as ADMIN_SECRET in .env"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'system' | 'vision')}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="system">System (chat)</option>
              <option value="vision">Vision (image)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading || !secret}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm disabled:opacity-50"
          >
            📥 Load current
          </button>
          <button
            onClick={save}
            disabled={loading || !secret || !prompt}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            💾 Save override
          </button>
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={20}
        className="w-full border rounded-xl px-3 py-2 text-sm font-mono"
        placeholder="Prompt will appear here after Load, or paste a new one..."
      />

      {status && (
        <p className={`mt-3 text-sm ${status.startsWith('❌') ? 'text-red-600' : 'text-green-700'}`}>
          {status}
        </p>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Changes take effect immediately (no redeploy). If KV is not configured, this page
        is inactive and the app uses hardcoded defaults.
      </p>
    </div>
  );
}