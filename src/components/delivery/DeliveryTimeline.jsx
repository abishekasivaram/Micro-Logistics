import React from 'react';
import './DeliveryTimeline.css';

const DeliveryTimeline = ({ items = [], maxItems }) => {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No activity recorded yet today.</p>
      </div>
    );
  }

  return (
    <div className="dl-timeline">
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        return (
          <div key={item.id || index} className="timeline-item">
            <div className="timeline-time-col">
              <span className="timeline-time dl-tabular">{item.time}</span>
            </div>

            <div className="timeline-axis">
              <div className={`timeline-dot dot-${item.type || 'neutral'}`} />
              {!isLast && <div className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <div className="timeline-header-row">
                <span className="timeline-title">{item.title}</span>
                {item.badge && (
                  <span className={`timeline-badge badge-${item.type || 'neutral'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              {item.desc && <p className="timeline-desc">{item.desc}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryTimeline;
