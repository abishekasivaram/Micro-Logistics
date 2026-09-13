import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import './OfflineBanner.css';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <aside className="offline-banner" role="status" aria-live="polite">
      <WifiOff size={16} />
      <span>You are currently working offline. Cached changes will sync upon reconnection.</span>
    </aside>
  );
};

export default OfflineBanner;
