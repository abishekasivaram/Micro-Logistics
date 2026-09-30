import React from 'react';
import './Button.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  return (
    <button 
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${isLoading ? 'ui-btn-loading' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="ui-btn-spinner" /> : null}
      {children}
    </button>
  );
};
