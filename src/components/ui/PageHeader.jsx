import React from 'react';
import './PageHeader.css';

export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="ui-page-header">
      <div className="ui-page-header-text">
        <h1 className="ui-page-title">{title}</h1>
        {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="ui-page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};
