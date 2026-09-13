import React from 'react';
import './LoadingFallback.css';

const LoadingFallback = () => {
  return (
    <div className="loading-fallback-container" role="status" aria-live="polite">
      <div className="loading-fallback-spinner" aria-hidden="true"></div>
      <p className="loading-fallback-text">Loading...</p>
    </div>
  );
};

export default LoadingFallback;
