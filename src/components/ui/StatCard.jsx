import React from 'react';
import './StatCard.css';
import { Card } from './Card';

export const StatCard = ({ title, value, delta, deltaLabel, icon: Icon, loading = false }) => {
  return (
    <Card className="ui-stat-card">
      {loading ? (
        <div className="ui-stat-card-loading">
          <div className="ui-skeleton ui-skeleton-icon"></div>
          <div className="ui-skeleton ui-skeleton-value"></div>
          <div className="ui-skeleton ui-skeleton-title"></div>
        </div>
      ) : (
        <>
          <div className="ui-stat-header">
            {Icon && (
              <div className="ui-stat-icon-wrapper">
                <Icon size={20} />
              </div>
            )}
            <div className="ui-stat-title">{title}</div>
          </div>
          <div className="ui-stat-body">
            <div className="ui-stat-value">{value}</div>
            {delta && (
              <div className={`ui-stat-delta ${delta.startsWith('+') || delta.startsWith('▲') ? 'positive' : delta.startsWith('-') || delta.startsWith('▼') ? 'negative' : 'neutral'}`}>
                {delta} {deltaLabel && <span className="ui-stat-delta-label">{deltaLabel}</span>}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
