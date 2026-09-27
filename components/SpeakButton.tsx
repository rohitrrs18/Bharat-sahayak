'use client';

import { useEffect, useState } from 'react';
import type { LanguageCode } from '@/lib/languages';
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '@/lib/speech';

interface Props {
  text: string;
  language: LanguageCode;
}

export default function SpeakButton({ text, language }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechSynthesisSupported());
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => stopSpeaking();
  }, []);

  if (!supported) return null;

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speak(text, language);
      setSpeaking(true);
      const words = text.split(/\s+/).length;
      const ms = Math.max(1500, (words / 2.5) * 1000);
      setTimeout(() => setSpeaking(false), ms);
    }
  }

  return (
    <button
      onClick={toggle}
      className="text-xs text-gray-500 hover:text-green-700 px-2 py-1 rounded transition"
      aria-label={speaking ? 'Stop speaking' : 'Read aloud'}
      title={speaking ? 'Stop' : 'Listen'}
    >
      {speaking ? '🔇' : '🔊'}
    </button>
  );
}