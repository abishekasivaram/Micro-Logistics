import React from 'react';

export const Skeleton = ({ width = '100%', height = '16px', borderRadius = '8px', className = '', style = {} }) => {
  return (
    <div
      className={`dl-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const SkeletonCard = ({ height = '160px', className = '' }) => {
  return (
    <div className={`dl-card ${className}`} style={{ padding: '1.25rem', height }}>
      <div className="dl-skeleton" style={{ width: '40%', height: '14px', marginBottom: '1rem' }} />
      <div className="dl-skeleton" style={{ width: '70%', height: '28px', marginBottom: '1rem' }} />
      <div className="dl-skeleton" style={{ width: '50%', height: '12px' }} />
    </div>
  );
};

export default Skeleton;
