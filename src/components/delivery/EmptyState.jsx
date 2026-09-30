import React from 'react';
import { PackageX } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({
  icon: Icon = PackageX,
  title = "You're all clear",
  description = "New batches will appear here as soon as dispatch assigns them.",
  primaryAction,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`dl-empty-state ${className}`}>
      <div className="empty-icon-halo">
        <div className="empty-icon-inner">
          <Icon size={32} strokeWidth={1.75} className="empty-svg" />
        </div>
      </div>

      <h3 className="empty-title dl-heading">{title}</h3>
      <p className="empty-desc">{description}</p>

      {(primaryAction || secondaryAction) && (
        <div className="empty-actions">
          {primaryAction && (
            <button
              type="button"
              className="dl-btn dl-btn-primary"
              onClick={primaryAction.onClick}
            >
              {primaryAction.icon && <primaryAction.icon size={16} />}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              className="dl-btn dl-btn-secondary"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon && <secondaryAction.icon size={16} />}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
