import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

export const SimpleInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowButton(false);
      console.log('App already installed');
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('📱 Install prompt available!');
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      setIsInstalled(true);
      setShowButton(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      alert('To install this app:\n1. Click the install icon (⊕) in the address bar\n2. Or tap "Add to Home Screen" in your browser menu');
      return;
    }

    console.log('Showing install prompt');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted install');
      setShowButton(false);
    } else {
      console.log('❌ User dismissed install');
    }
    setDeferredPrompt(null);
  };

  // Don't show if installed
  if (isInstalled) return null;
  
return (
  <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
    <Button
      onClick={handleInstall}
      variant="primary"
      size="lg"
      className="shadow-lg flex items-center gap-2 animate-pulse"
      leftIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      }
    >
      {showButton ? '📱 Install App' : '📱 Install PWA'}
    </Button>
  </div>
);
  // Always show a button for testing
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <Button
        onClick={handleInstall}
        variant="primary"
        size="lg"
        className="shadow-lg flex items-center gap-2 animate-pulse"
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
      >
        📱 Install App
      </Button>
    </div>
  );
};

export default SimpleInstallButton;