import React, { useState, useEffect } from 'react';
import { Cloud, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  You're offline
                </p>
                <p className="text-xs text-red-600">
                  Some features may be limited
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-red-600">
          <WifiOff className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Offline</span>
        </div>
      </>
    );
  }

  if (showNotification) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  You're back online
                </p>
                <p className="text-xs text-green-600">
                  Syncing data...
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-green-600">
          <Wifi className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Online</span>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center text-gray-500">
      <Cloud className="h-4 w-4 mr-1" />
      <span className="text-xs font-medium">Online</span>
    </div>
  );
};

interface ConnectionStatusProps {
  isOnline: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline,
  className,
}) => {
  return (
    <div className={cn('flex items-center', className)}>
      <div
        className={cn(
          'h-2 w-2 rounded-full mr-2',
          isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
        )}
      />
      <span className="text-xs">
        {isOnline ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};