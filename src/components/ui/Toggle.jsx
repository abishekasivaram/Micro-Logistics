import React from 'react';
import './Toggle.css';

export const Toggle = ({ checked, onChange, label, leftLabel, rightLabel, ...props }) => {
  return (
    <label className="ui-toggle-wrapper">
      {leftLabel && <span className={`ui-toggle-label ${!checked ? 'active' : ''}`}>{leftLabel}</span>}
      <div className="ui-toggle">
        <input 
          type="checkbox" 
          className="ui-toggle-input" 
          checked={checked} 
          onChange={onChange} 
          {...props} 
        />
        <div className="ui-toggle-track"></div>
        <div className="ui-toggle-thumb"></div>
      </div>
      {label && <span className="ui-toggle-label">{label}</span>}
      {rightLabel && <span className={`ui-toggle-label ${checked ? 'active' : ''}`}>{rightLabel}</span>}
    </label>
  );
};
