import React from 'react';
import './Badge.css';

export const Badge = ({ children, variant = 'info', className = '', ...props }) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};
