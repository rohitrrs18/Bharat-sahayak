'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, getLanguage, type Language, type LanguageCode } from '@/lib/languages';
import LanguageSelector from './LanguageSelector';
import VoiceInput from './VoiceInput';
import SpeakButton from './SpeakButton';
import ImageDiagnosis from './ImageDiagnosis';
import PWAInstaller from './PWAInstaller';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: boolean;
}

const STORAGE_KEY = 'bharat-sahayak-lang';

export default function ChatInterface() {
  const [languages, setLanguages] = useState<Language[]>(LANGUAGES);
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t =
    languages.find((l) => l.code === language) || getLanguage(language);

  // Fetch languages dynamically
  useEffect(() => {
    fetch('/api/languages')
      .then((r) => r.json())
      .then((d) => {
        if (d.languages?.length) setLanguages(d.languages);
      })
      .catch(() => {});
  }, []);

  // Load saved language
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && languages.some((l) => l.code === saved)) setLanguage(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages]);

  // Reset chat on language change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    const langDef = languages.find((l) => l.code === language) || getLanguage(language);
    setMessages([{ role: 'assistant', content: langDef.greeting }]);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setError(null);
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([{ role: 'assistant', content: t.greeting }]);
    setError(null);
  }

  function handleImageReply(reply: string) {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: '📷 Photo sent for diagnosis', image: true },
      { role: 'assistant', content: reply },
    ]);
  }

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col h-[100dvh] px-3 sm:px-4">
      <PWAInstaller />

      <header className="pt-5 pb-3 border-b border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🌾</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-800">
                Bharat Sahayak
              </h1>
              <p className="text-xs text-gray-600">
                कृषि AI सहायक • Farmer AI Assistant
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-xs sm:text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg px-3 py-1.5"
          >
            🔄 New
          </button>
        </div>
        <LanguageSelector languages={languages} value={language} onChange={setLanguage} />
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-4"
        lang={language}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                m.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
              }`}
            >
              {m.content}
              {m.role === 'assistant' && !loading && (
                <div className="mt-1 -mb-1 flex justify-end">
                  <SpeakButton text={m.content} language={language} />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="py-3 border-t border-green-200">
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-300 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 p-2">
          <ImageDiagnosis
            language={language}
            onResult={handleImageReply}
            onError={setError}
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.placeholder}
            rows={1}
            lang={language}
            className="flex-1 resize-none outline-none px-2 py-2 text-[15px] max-h-32 bg-transparent"
            style={{ minHeight: '40px' }}
          />
          <VoiceInput language={language} onResult={(text) => sendMessage(text)} />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl px-4 py-2.5 font-medium transition"
            aria-label="Send"
          >
            ➤
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 text-center">
          🎤 Speak • 📷 Photo • 🔊 Listen • 💬 Try: <em>"आज का मंडी भाव बताओ"</em> or{' '}
          <em>"मौसम कैसा रहेगा?"</em>
        </p>
      </div>
    </div>
  );
}