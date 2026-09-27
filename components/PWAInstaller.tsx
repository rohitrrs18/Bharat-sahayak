'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      if (!sessionStorage.getItem('pwa-prompted')) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    sessionStorage.setItem('pwa-prompted', '1');
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white border border-green-200 shadow-lg rounded-2xl p-4 z-40 animate-fade-in">
      <p className="text-sm text-gray-800 mb-3">
        📱 <strong>Install Bharat Sahayak</strong> on your phone for offline access!
      </p>
      <div className="flex gap-2">
        <button
          onClick={install}
          className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700"
        >
          Install
        </button>
        <button
          onClick={() => {
            sessionStorage.setItem('pwa-prompted', '1');
            setShow(false);
          }}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Later
        </button>
      </div>
    </div>
  );
}