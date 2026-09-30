import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({
  title,
  value,
  trend,
  isPositive = true,
  comparison = 'vs yesterday',
  icon: Icon,
  sparkline = [],
  color = 'primary'
}) => {
  // Generate SVG path for sparkline with gradient area fill
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 96;
    const height = 34;
    const pad = 4;

    const coords = sparkline.map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * (width - pad * 2) + pad;
      const y = height - pad - ((val - min) / range) * (height - pad * 2);
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });

    const linePoints = coords.map(p => `${p.x},${p.y}`).join(' ');
    const areaPoints = `${coords[0].x},${height} ` + coords.map(p => `${p.x},${p.y}`).join(' ') + ` ${coords[coords.length - 1].x},${height}`;
    const lastPoint = coords[coords.length - 1];
    const gradId = `spark-grad-${color}-${(title || '').replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="stat-sparkline" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradId})`} />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill="currentColor" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill="currentColor" opacity="0.3" />
      </svg>
    );
  };

  return (
    <div className={`dl-card dl-stat-card dl-card-hover stat-theme-${color}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-value-row">
          <span className="stat-number dl-tabular">{value}</span>
          <div className="stat-sparkline-container">
            {renderSparkline()}
          </div>
        </div>

        {trend && (
          <div className="stat-trend-row">
            <span className={`stat-trend-pill ${isPositive ? 'trend-up' : 'trend-down'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trend}</span>
            </span>
            {comparison && <span className="stat-comparison-text">{comparison}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
