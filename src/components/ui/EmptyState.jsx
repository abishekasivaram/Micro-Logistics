import React from 'react';
import './EmptyState.css';

export const EmptyState = ({ icon: Icon, title, description, primaryAction, secondaryAction }) => {
  return (
    <div className="ui-empty-state">
      {Icon && (
        <div className="ui-empty-state-icon">
          <Icon size={32} />
        </div>
      )}
      <h3 className="ui-empty-state-title">{title}</h3>
      {description && <p className="ui-empty-state-desc">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="ui-empty-state-actions">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
};
