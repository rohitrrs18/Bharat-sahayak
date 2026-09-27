'use client';

import type { Language, LanguageCode } from '@/lib/languages';

interface Props {
  languages: Language[];
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
}

export default function LanguageSelector({ languages, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang) => {
        const active = lang.code === value;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              active
                ? 'bg-green-600 text-white border-green-600 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-700'
            }`}
            lang={lang.code}
          >
            {lang.nativeName}
          </button>
        );
      })}
    </div>
  );
}