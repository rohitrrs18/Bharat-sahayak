'use client';

import { useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '@/lib/languages';
import { createRecognition, isSpeechRecognitionSupported } from '@/lib/speech';

interface Props {
  language: LanguageCode;
  onResult: (text: string) => void;
}

export default function VoiceInput({ language, onResult }: Props) {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  function start() {
    if (!supported) return;
    const rec = createRecognition(language);
    if (!rec) return;
    recognitionRef.current = rec;

    rec.onresult = (e: any) => {
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
      if (finalText.trim()) onResult(finalText.trim());
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);

    rec.start();
    setRecording(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  if (!supported) return null;

  return (
    <button
      onClick={recording ? stop : start}
      className={`rounded-xl px-3 py-2.5 font-medium transition ${
        recording
          ? 'bg-red-600 text-white recording-pulse'
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`}
      aria-label={recording ? 'Stop recording' : 'Start voice input'}
      title={recording ? 'Stop' : 'Speak'}
    >
      {recording ? '⏹' : '🎤'}
    </button>
  );
}