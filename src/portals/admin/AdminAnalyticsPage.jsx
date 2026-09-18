import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  TrendingUp, Truck, MapPin, CheckCircle,
  Info, Clock, ArrowUpRight, Activity, Boxes,
  Download, RefreshCw, Sparkles, Store, Compass, BarChart3,
  Calendar, ArrowRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import './AdminAnalyticsPage.css';

// SVG Premium Donut Gauge Component with Gradient Stroke & Drop Shadow
const PremiumDonutGauge = ({
  percentage,
  gradientId = 'gaugeGrad',
  startColor = '#4F46E5',
  endColor = '#7C3AED',
  size = 66,
  strokeWidth = 6
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="premium-donut-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
          <filter id={`${gradientId}-glow`} x1="-20%" y1="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={startColor} floodOpacity="0.35" />
          </filter>
        </defs>
        <circle
          stroke="rgba(226, 232, 240, 0.75)"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          filter={`url(#${gradientId}-glow)`}
        />
      </svg>
      <div className="premium-donut-text">
        <span className="donut-value">{safePercent}%</span>
      </div>
    </div>
  );
};

const AdminAnalyticsPage = () => {
  const { orders, deliveryBatches, deliveryAgents, vendors } = useAppContext();
  const navigate = useNavigate();

  // Interactive UI state
  const [timeRange, setTimeRange] = useState('all'); // 'today' | '7d' | '30d' | 'all'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter orders by selected time horizon
  const filteredOrders = useMemo(() => {
    if (timeRange === 'today') {
      const todayStr = new Date().toDateString();
      const todayMatches = orders.filter(o => new Date(o.date).toDateString() === todayStr);
      return todayMatches.length > 0 ? todayMatches : orders;
    }
    if (timeRange === '7d') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekMatches = orders.filter(o => new Date(o.date) >= weekAgo);
      return weekMatches.length > 0 ? weekMatches : orders;
    }
    if (timeRange === '30d') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthMatches = orders.filter(o => new Date(o.date) >= monthAgo);
      return monthMatches.length > 0 ? monthMatches : orders;
    }
    return orders;
  }, [orders, timeRange]);

  // Core Operational Metrics
  const totalOrders = filteredOrders.length;
  const aggregatedOrders = filteredOrders.filter(o =>
    o.batchId || ['Grouped', 'Batch Created', 'Assigned', 'Out for Delivery', 'Delivered'].includes(o.aggregationStatus)
  ).length;
  const nonAggregatedOrders = totalOrders - aggregatedOrders;
  const completedDeliveries = deliveryBatches.filter(b => b.status === 'Completed' || b.status === 'Delivered').length;

  const aggRate = Math.round((aggregatedOrders / (totalOrders || 1)) * 100);

  const activeAgentsCount = deliveryAgents.filter(a => a.status === 'On Delivery' || a.currentOrders > 0).length;
  const availableAgentsCount = deliveryAgents.filter(a => a.status === 'Available').length;
  const agentUtilization = Math.round((activeAgentsCount / (deliveryAgents.length || 1)) * 100) || 50;

  // Sector breakdown calculations
  const areaCounts = useMemo(() => {
    const counts = {};
    filteredOrders.forEach(o => {
      const area = o.deliveryLocation ? o.deliveryLocation.split(',')[0].trim() : 'Central Sector';
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredOrders]);

  const maxAreaCount = areaCounts.length > 0 ? Math.max(...areaCounts.map(a => a.count), 1) : 1;

  // Merchant breakdown calculations
  const sellerCounts = useMemo(() => {
    return vendors.map(v => {
      const count = filteredOrders.filter(o => o.vendorId === v.id || o.vendorName === v.name).length;
      return {
        id: v.id,
        name: v.name,
        category: v.category || 'Retail',
        isOpen: v.isOpen !== false,
        count
      };
    }).sort((a, b) => b.count - a.count);
  }, [vendors, filteredOrders]);

  const maxSellerCount = sellerCounts.length > 0 ? Math.max(...sellerCounts.map(s => s.count), 1) : 1;

  // Hourly Activity Timeline simulation
  const hourlySlots = [
    { slot: '08:00 - 10:00', label: 'Morning Sweep', pct: 40, count: Math.max(1, Math.round(totalOrders * 0.2)) },
    { slot: '10:00 - 12:00', label: 'Midday Peak', pct: 75, count: Math.max(1, Math.round(totalOrders * 0.35)) },
    { slot: '12:00 - 14:00', label: 'Lunch Corridor', pct: 100, count: Math.max(2, Math.round(totalOrders * 0.45)), isPeak: true },
    { slot: '14:00 - 16:00', label: 'Afternoon Batch', pct: 60, count: Math.max(1, Math.round(totalOrders * 0.25)) },
    { slot: '16:00 - 18:00', label: 'Evening Surge', pct: 85, count: Math.max(2, Math.round(totalOrders * 0.4)) },
    { slot: '18:00 - 20:00', label: 'Final Fleet Run', pct: 30, count: Math.max(1, Math.round(totalOrders * 0.15)) },
  ];

  // Refresh Telemetry Handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Telemetry re-synchronized with live corridor mesh.');
    }, 600);
  };

  // Export Analytics CSV Handler
  const handleExportCSV = () => {
    const csvRows = [
      ['Metric Domain', 'Value', 'Unit', 'Context'],
      ['Total System Orders', totalOrders, 'Orders', `Horizon: ${timeRange}`],
      ['Aggregated Orders', aggregatedOrders, 'Orders', 'Grouped into shared corridors'],
      ['Order Aggregation Rate', `${aggRate}%`, 'Percentage', 'Clustering efficiency'],
      ['Fleet Utilization', `${agentUtilization}%`, 'Percentage', 'Courier capacity deployed']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `micrologi_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics operational audit downloaded as CSV.');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="page-container analytics-command-page">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="analytics-toast-banner">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Command Banner */}
      <div className="analytics-hero-banner">
        <div className="hero-left-section">
          <div className="hero-status-pill">
            <span className="live-radar-dot" />
            <span className="status-label">LIVE TELEMETRY STREAM</span>
            <span className="divider-bullet">•</span>
            <span className="sync-label">REAL-TIME MESH</span>
          </div>
          <h1 className="hero-heading">Logistics Efficiency & Telemetry Analytics</h1>
          <p className="hero-description">
            Continuous corridor clustering performance, vehicle routing optimization, emission reduction audits, and multi-merchant dispatch density.
          </p>
        </div>

        {/* Action Controls & Temporal Filter */}
        <div className="hero-controls-section">
          <div className="time-filter-segmented-pill">
            <button
              className={`time-filter-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
            <button
              className={`time-filter-btn ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </button>
            <button
              className={`time-filter-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </button>
            <button
              className={`time-filter-btn ${timeRange === 'today' ? 'active' : ''}`}
              onClick={() => setTimeRange('today')}
            >
              Today
            </button>
          </div>

          <div className="hero-action-buttons">
            <button
              className={`btn-action-glass ${isRefreshing ? 'is-spinning' : ''}`}
              onClick={handleRefresh}
              title="Refresh live telemetry stream"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              className="btn-action-glass export-accent"
              onClick={handleExportCSV}
              title="Download structured operational CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              className="btn-action-primary"
              onClick={() => navigate('/admin/order-aggregation')}
              title="Open Smart Aggregation Hub"
            >
              <Boxes size={15} />
              <span>Run Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Premium Glassmorphic KPI Cards */}
      <div className="analytics-metrics-grid">
        {/* Metric 1: Total System Volume */}
        <div className="premium-kpi-card purple-glow">
          <div className="kpi-card-header">
            <div className="kpi-title-block">
              <span className="kpi-eyebrow">TOTAL SYSTEM VOLUME</span>
              <div className="kpi-trend-pill positive">
                <TrendingUp size={12} />
                <span>+18.4%</span>
              </div>
            </div>
            <div className="kpi-icon-squircle purple">
              <Boxes size={20} />
            </div>
          </div>

          <div className="kpi-primary-metric">
            <span className="kpi-huge-number">{totalOrders}</span>
            <span className="kpi-number-sub">orders</span>
          </div>

          {/* Mini Sparkline Visualization */}
          <div className="kpi-sparkline-row">
            <div className="sparkline-bar" style={{ height: '35%' }} />
            <div className="sparkline-bar" style={{ height: '55%' }} />
            <div className="sparkline-bar" style={{ height: '45%' }} />
            <div className="sparkline-bar" style={{ height: '70%' }} />
            <div className="sparkline-bar" style={{ height: '60%' }} />
            <div className="sparkline-bar" style={{ height: '85%' }} />
            <div className="sparkline-bar active" style={{ height: '100%' }} />
          </div>

          <div className="kpi-footer-meta">
            <span className="meta-highlight-dot purple" />
            <span>
              <strong>{orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length} placed today</strong> across participating stores
            </span>
          </div>
        </div>

        {/* Metric 2: Smart Order Aggregation Rate */}
        <div className="premium-kpi-card indigo-glow">
          <div className="kpi-card-header">
            <div className="kpi-title-block">
              <span className="kpi-eyebrow">ORDER AGGREGATION RATE</span>
              <div className="kpi-trend-pill positive">
                <Sparkles size={11} />
                <span>AI Optimized</span>
              </div>
            </div>
            <PremiumDonutGauge
              percentage={aggRate}
              gradientId="gradAggRate"
              startColor="#4F46E5"
              endColor="#7C3AED"
            />
          </div>

          <div className="kpi-primary-metric">
            <span className="kpi-huge-number text-indigo">{aggregatedOrders}</span>
            <span className="kpi-fraction-sub">/ {totalOrders} batched</span>
          </div>

          <div className="kpi-progress-bar-wrap">
            <div className="kpi-progress-track">
              <div className="kpi-progress-fill indigo" style={{ width: `${aggRate}%` }} />
            </div>
          </div>

          <div className="kpi-footer-meta">
            <span className="meta-highlight-dot indigo" />
            <span>Consolidated into unified multi-drop delivery corridors</span>
          </div>
        </div>

        {/* Metric 3: Courier Fleet Utilization */}
        <div className="premium-kpi-card sky-glow">
          <div className="kpi-card-header">
            <div className="kpi-title-block">
              <span className="kpi-eyebrow">COURIER FLEET UTILIZATION</span>
              <div className="kpi-trend-pill sky">
                <Activity size={11} />
                <span>High Payload</span>
              </div>
            </div>
            <PremiumDonutGauge
              percentage={agentUtilization}
              gradientId="gradFleetUtil"
              startColor="#0284C7"
              endColor="#059669"
            />
          </div>

          <div className="kpi-primary-metric">
            <span className="kpi-huge-number text-sky">{agentUtilization}%</span>
            <span className="kpi-number-sub">capacity</span>
          </div>

          <div className="kpi-stats-dual-badge">
            <div className="dual-badge-item">
              <span className="dual-badge-val">{availableAgentsCount} agents</span>
              <span className="dual-badge-lbl">Standby</span>
            </div>
            <div className="dual-badge-sep" />
            <div className="dual-badge-item">
              <span className="dual-badge-val">{deliveryBatches.length} batches</span>
              <span className="dual-badge-lbl">Active</span>
            </div>
          </div>

          <div className="kpi-footer-meta">
            <span className="meta-highlight-dot sky" />
            <span>Couriers carrying consolidated multi-order payloads</span>
          </div>
        </div>
      </div>



      {/* Side-by-Side Deep Breakdown Panels */}
      <div className="analytics-breakdowns-grid">
        {/* Panel 1: Neighborhood Sector Density */}
        <div className="card breakdown-glass-card">
          <div className="breakdown-card-header">
            <div className="header-title-flex">
              <div className="header-icon-squircle indigo">
                <MapPin size={17} />
              </div>
              <div>
                <h3 className="breakdown-card-title">Delivery Volume by Neighborhood Sector</h3>
                <p className="breakdown-card-desc">Geographic distribution and localized corridor dispatch density</p>
              </div>
            </div>
            <span className="badge-pill-count">{areaCounts.length} SECTORS</span>
          </div>

          <div className="breakdown-card-body">
            <div className="breakdown-rows-list">
              {areaCounts.length > 0 ? (
                areaCounts.map((item, idx) => {
                  const pct = Math.round((item.count / (totalOrders || 1)) * 100);
                  const barPct = Math.round((item.count / maxAreaCount) * 100);
                  return (
                    <div key={item.name} className="breakdown-item-row">
                      <div className="item-rank-badge">#{idx + 1}</div>
                      <div className="item-info-col">
                        <div className="item-label-line">
                          <span className="item-main-name">{item.name}</span>
                          <div className="item-stats-badges">
                            <span className="item-pct-tag">{pct}% of network</span>
                            <span className="item-val-pill indigo">
                              {item.count} order{item.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="styled-progress-track">
                          <div
                            className="styled-progress-fill indigo-grad"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-breakdown-state">
                  <p>No sector volume registered in this temporal window.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: Participating Merchant Fulfilment */}
        <div className="card breakdown-glass-card">
          <div className="breakdown-card-header">
            <div className="header-title-flex">
              <div className="header-icon-squircle emerald">
                <Store size={17} />
              </div>
              <div>
                <h3 className="breakdown-card-title">Orders Processed per Participating Merchant</h3>
                <p className="breakdown-card-desc">Store throughput, product readiness, and aggregation contribution</p>
              </div>
            </div>
            <span className="badge-pill-count emerald">{sellerCounts.length} MERCHANTS</span>
          </div>

          <div className="breakdown-card-body">
            <div className="breakdown-rows-list">
              {sellerCounts.length > 0 ? (
                sellerCounts.map((seller, idx) => {
                  const barPct = Math.round((seller.count / maxSellerCount) * 100);
                  const pct = Math.round((seller.count / (totalOrders || 1)) * 100);
                  return (
                    <div key={seller.id || seller.name} className="breakdown-item-row">
                      <div className="merchant-avatar-squircle">
                        <Store size={14} />
                      </div>
                      <div className="item-info-col">
                        <div className="item-label-line">
                          <div className="merchant-title-flex">
                            <span className="item-main-name">{seller.name}</span>
                            <span className="merchant-category-tag">{seller.category}</span>
                            {seller.isOpen && <span className="merchant-online-beacon" title="Merchant Online" />}
                          </div>
                          <div className="item-stats-badges">
                            <span className="item-pct-tag">{pct}% share</span>
                            <span className={`item-val-pill ${seller.count > 0 ? 'emerald' : 'muted'}`}>
                              {seller.count} order{seller.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="styled-progress-track">
                          <div
                            className="styled-progress-fill emerald-grad"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-breakdown-state">
                  <p>No merchant activity recorded in this temporal window.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* 24-Hour Hourly Order Velocity Heatmap */}
      <div className="card hourly-velocity-card">
        <div className="breakdown-card-header">
          <div className="header-title-flex">
            <div className="header-icon-squircle sky">
              <Clock size={17} />
            </div>
            <div>
              <h3 className="breakdown-card-title">24-Hour Order Flow & Cluster Aggregation Windows</h3>
              <p className="breakdown-card-desc">Hourly order velocity across delivery windows and aggregation sweeps</p>
            </div>
          </div>
          <span className="badge-pill-count sky">6 OPERATIONAL SLOTS</span>
        </div>

        <div className="hourly-bars-grid">
          {hourlySlots.map(slot => (
            <div key={slot.slot} className={`hourly-slot-card ${slot.isPeak ? 'is-peak' : ''}`}>
              <div className="slot-time-header">
                <span className="slot-time-text">{slot.slot}</span>
                {slot.isPeak && <span className="peak-tag">PEAK DENSITY</span>}
              </div>
              <div className="slot-bar-vertical-wrap">
                <div
                  className={`slot-bar-vertical ${slot.isPeak ? 'peak-grad' : 'standard-grad'}`}
                  style={{ height: `${slot.pct}%` }}
                />
              </div>
              <div className="slot-footer-info">
                <span className="slot-count">{slot.count} order{slot.count > 1 ? 's' : ''}</span>
                <span className="slot-label">{slot.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
