import React from 'react';
import './Tabs.css';

export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="ui-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`ui-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ui-tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};
