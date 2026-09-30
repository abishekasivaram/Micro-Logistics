import React from 'react';
import { ChevronRight } from 'lucide-react';
import './PageHeader.css';

const PageHeader = ({
  breadcrumbs = ['Control Tower'],
  title,
  subtitle,
  badge,
  actions,
  children
}) => {
  return (
    <div className="dl-page-header">
      <div className="header-breadcrumbs">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="crumb-item">{crumb}</span>
            {idx < breadcrumbs.length - 1 && (
              <ChevronRight size={12} className="crumb-separator" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="header-title-bar">
        <div className="title-left">
          <div className="title-badge-row">
            <h1 className="dl-page-title dl-heading">{title}</h1>
            {badge && <span className="title-badge">{badge}</span>}
          </div>
          {subtitle && <p className="dl-page-subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="header-actions-group">{actions}</div>}
      </div>

      {children && <div className="header-bottom-slot">{children}</div>}
    </div>
  );
};

export default PageHeader;
