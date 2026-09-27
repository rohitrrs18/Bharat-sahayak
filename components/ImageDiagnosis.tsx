'use client';

import { useRef, useState } from 'react';
import type { LanguageCode } from '@/lib/languages';

interface Props {
  language: LanguageCode;
  onResult: (reply: string) => void;
  onError: (msg: string) => void;
}

export default function ImageDiagnosis({ language, onResult, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      onError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onError('Image too large (max 8MB).');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('image', file);
      form.append('language', language);

      const res = await fetch('/api/diagnose', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Diagnosis failed');
      onResult(data.reply);
    } catch (e: any) {
      onError(e.message || 'Diagnosis failed');
    } finally {
      setLoading(false);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setPreview(null);
      }, 400);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      <button
        onClick={pick}
        disabled={loading}
        className="rounded-xl px-3 py-2.5 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 font-medium"
        title="Upload crop photo"
        aria-label="Upload crop photo"
      >
        {loading ? '⏳' : '📷'}
      </button>

      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="crop" className="rounded-lg mb-3 max-h-64 mx-auto" />
            <p className="text-sm text-gray-700">🔍 Analyzing your crop...</p>
          </div>
        </div>
      )}
    </>
  );
}