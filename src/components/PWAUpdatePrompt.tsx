// src/components/PWAUpdatePrompt.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

export const PWAUpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleUpdate = () => setShowUpdate(true);
    window.addEventListener('pwa-update-available', handleUpdate);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwRegistration(registration);
        if (registration.waiting) setShowUpdate(true);
      });
    }

    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-600 text-white rounded-lg shadow-xl p-4 max-w-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-semibold">New Version Available!</h4>
            <p className="text-sm opacity-90">Click update to get the latest features.</p>
          </div>
          <Button onClick={handleUpdate} variant="secondary" size="sm">
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;