import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, 
  Download, RefreshCw, ArrowUpRight, ArrowDownRight, 
  CreditCard, DollarSign, Clock, CheckCircle2, 
  AlertCircle, ShieldCheck, ChevronRight, Copy, Check, 
  ExternalLink, FileText, Sparkles, Package, Truck, 
  Layers, Store, X, ArrowRight, Eye, Printer
} from 'lucide-react';
import './SellerAnalyticsPage.css';

/* ─── Premium Sparkline ──────────────────────────────────────────────────── */
const Sparkline = ({ data, color, type = 'line' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 84;
  const height = 32;

  if (type === 'bar') {
    const barWidth = 6;
    const gap = (width - data.length * barWidth) / (data.length - 1);
    return (
      <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`}>
        {data.map((val, i) => {
          const h = Math.max(((val - min) / range) * (height - 4), 4);
          const x = i * (barWidth + gap);
          const y = height - h;
          return (
            <rect 
              key={i} 
              x={x} 
              y={y} 
              width={barWidth} 
              height={h} 
              fill={color} 
              rx="2" 
              opacity={i === data.length - 1 ? 1 : 0.65} 
            />
          );
        })}
      </svg>
    );
  }

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  const gradId = `spark-grad-${color.replace('#', '')}`;

  return (
    <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={`0,${height} ${points} ${width},${height}`} />
      <polyline fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const SellerAnalyticsPage = () => {
  const { orders = [], currentUser } = useAppContext();
  const [timeRange, setTimeRange] = useState('30D');
  const [activeChartMetric, setActiveChartMetric] = useState('gross'); // 'gross' | 'net' | 'orders'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [settlementFilter, setSettlementFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [copiedUtr, setCopiedUtr] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSyncLedger = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Settlement ledger synced with HDFC Gateway in 210ms.');
    }, 600);
  };

  const handleExport = () => {
    showToast(`Downloading Kannan-DeptStore-Ledger-${timeRange}-2026.csv...`);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedUtr(id);
    showToast(`Copied UTR "${text}" to clipboard.`);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  // Comprehensive Multi-Range Dataset
  const rangeData = useMemo(() => {
    const map = {
      '7D': {
        gmv: 18450.00,
        gmvDelta: '+18.4%',
        netPayout: 16236.00,
        netDelta: '+16.2%',
        completedOrders: 62,
        ordersDelta: '+14.1%',
        aov: 297.58,
        aovDelta: '+5.2%',
        sparkGross: [1950, 2200, 2050, 2800, 2600, 3400, 3450],
        sparkNet: [1716, 1936, 1804, 2464, 2288, 2992, 3036],
        sparkOrders: [6, 8, 7, 10, 9, 11, 11],
        sparkAov: [325, 275, 292, 280, 288, 309, 313],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        chartGross: [2100, 2450, 2200, 2950, 2650, 3100, 3000],
        chartNet: [1848, 2156, 1936, 2596, 2332, 2728, 2640],
        chartOrders: [7, 9, 8, 11, 9, 10, 8],
        nextPayout: 'Tomorrow (₹4,890.00)'
      },
      '30D': {
        gmv: 74890.00,
        gmvDelta: '+14.2%',
        netPayout: 65903.20,
        netDelta: '+12.8%',
        completedOrders: 248,
        ordersDelta: '+8.4%',
        aov: 301.97,
        aovDelta: '+5.1%',
        sparkGross: [8900, 10400, 9600, 12800, 13600, 14200, 15390],
        sparkNet: [7832, 9152, 8448, 11264, 11968, 12496, 13543],
        sparkOrders: [30, 34, 32, 42, 45, 47, 51],
        sparkAov: [296, 305, 300, 304, 302, 302, 301],
        labels: ['Sep 01', 'Sep 06', 'Sep 12', 'Sep 18', 'Sep 24', 'Sep 30'],
        chartGross: [9800, 11400, 10200, 13800, 14200, 15490],
        chartNet: [8624, 10032, 8976, 12144, 12496, 13631],
        chartOrders: [32, 38, 34, 46, 47, 51],
        nextPayout: 'Tomorrow (₹12,480.00)'
      },
      '90D': {
        gmv: 218600.00,
        gmvDelta: '+22.1%',
        netPayout: 192368.00,
        netDelta: '+20.4%',
        completedOrders: 712,
        ordersDelta: '+16.8%',
        aov: 307.02,
        aovDelta: '+6.4%',
        sparkGross: [21000, 24000, 22000, 26000, 29000, 31000, 34000],
        sparkNet: [18480, 21120, 19360, 22880, 25520, 27280, 29920],
        sparkOrders: [68, 79, 71, 84, 94, 101, 110],
        sparkAov: [308, 303, 309, 309, 308, 306, 309],
        labels: ['Jul 01', 'Jul 15', 'Aug 01', 'Aug 15', 'Sep 01', 'Sep 15', 'Sep 30'],
        chartGross: [28000, 31000, 29500, 34000, 36500, 39000, 42000],
        chartNet: [24640, 27280, 25960, 29920, 32120, 34320, 36960],
        chartOrders: [91, 101, 96, 111, 119, 127, 136],
        nextPayout: 'In 3 Days (₹14,920.00)'
      },
      '1Y': {
        gmv: 892400.00,
        gmvDelta: '+34.5%',
        netPayout: 785312.00,
        netDelta: '+32.1%',
        completedOrders: 2980,
        ordersDelta: '+28.2%',
        aov: 299.46,
        aovDelta: '+7.8%',
        sparkGross: [54000, 62000, 59000, 71000, 78000, 84000, 92000],
        sparkNet: [47520, 54560, 51920, 62480, 68640, 73920, 80960],
        sparkOrders: [180, 206, 197, 237, 260, 280, 307],
        sparkAov: [300, 300, 299, 299, 300, 300, 299],
        labels: ['Q4 25', 'Q1 26', 'Q2 26', 'Q3 26'],
        chartGross: [195000, 218000, 234000, 245400],
        chartNet: [171600, 191840, 205920, 215952],
        chartOrders: [650, 726, 780, 824],
        nextPayout: 'In 5 Days (₹18,500.00)'
      }
    };
    return map[timeRange] || map['30D'];
  }, [timeRange]);

  // Dynamic Metric Theme Colors
  const themeColors = {
    gross: { stroke: '#4f46e5', fill: '#4f46e5', light: 'rgba(79, 70, 229, 0.28)', label: 'Gross GMV' },
    net: { stroke: '#059669', fill: '#059669', light: 'rgba(5, 150, 105, 0.28)', label: 'Net Disbursal' },
    orders: { stroke: '#0284c7', fill: '#0284c7', light: 'rgba(2, 132, 199, 0.28)', label: 'Order Volume' }
  };
  const activeTheme = themeColors[activeChartMetric] || themeColors.gross;

  // Main Trajectory Chart Coordinates
  const activeSeries = activeChartMetric === 'gross' 
    ? rangeData.chartGross 
    : activeChartMetric === 'net' 
    ? rangeData.chartNet 
    : rangeData.chartOrders;

  const maxVal = Math.max(...activeSeries);
  const minVal = Math.min(...activeSeries) * 0.80;
  const valRange = maxVal - minVal || 1;

  const pointsCoordinates = activeSeries.map((val, i) => {
    const x = (i / (activeSeries.length - 1)) * 100;
    const y = 90 - ((val - minVal) / valRange) * 75;
    return { x, y, val, label: rangeData.labels[i] };
  });

  // Calculate ultra-smooth cubic bezier spline curve
  const smoothCurve = useMemo(() => {
    if (!pointsCoordinates.length) return '';
    if (pointsCoordinates.length === 1) return `M ${pointsCoordinates[0].x},${pointsCoordinates[0].y}`;

    let d = `M ${pointsCoordinates[0].x},${pointsCoordinates[0].y}`;
    for (let i = 0; i < pointsCoordinates.length - 1; i++) {
      const curr = pointsCoordinates[i];
      const next = pointsCoordinates[i + 1];
      const prev = pointsCoordinates[i > 0 ? i - 1 : 0];
      const nextNext = pointsCoordinates[i < pointsCoordinates.length - 2 ? i + 2 : pointsCoordinates.length - 1];

      const cp1x = curr.x + (next.x - prev.x) * 0.18;
      const cp1y = curr.y + (next.y - prev.y) * 0.18;
      const cp2x = next.x - (nextNext.x - curr.x) * 0.18;
      const cp2y = next.y - (nextNext.y - curr.y) * 0.18;

      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
    }
    return d;
  }, [pointsCoordinates]);

  const smoothAreaPath = useMemo(() => {
    if (!smoothCurve) return '';
    return `${smoothCurve} L 100,100 L 0,100 Z`;
  }, [smoothCurve]);

  // Category breakdown
  const categoryBreakdown = [
    { name: 'Dairy Products', pct: 46, revenue: 34450, units: 382, color: '#4f46e5' },
    { name: 'Farm Vegetables', pct: 23, revenue: 17225, units: 240, color: '#059669' },
    { name: 'Artisan Bakery', pct: 14, revenue: 10485, units: 165, color: '#d97706' },
    { name: 'Grains & Pulses', pct: 17, revenue: 12730, units: 198, color: '#0284c7' }
  ];

  // Hourly Heatmap Distribution
  const hourlyData = [
    { time: '06:00 - 09:00', label: 'Morning Rush', pct: 88, orders: 82, isPeak: true },
    { time: '09:00 - 12:00', label: 'Mid-day Pantry', pct: 54, orders: 48, isPeak: false },
    { time: '12:00 - 15:00', label: 'Lunch Prep', pct: 36, orders: 32, isPeak: false },
    { time: '15:00 - 18:00', label: 'Afternoon Batch', pct: 48, orders: 44, isPeak: false },
    { time: '18:00 - 21:00', label: 'Dinner Peak', pct: 76, orders: 70, isPeak: true }
  ];

  // Top Products Table
  const topProducts = [
    {
      id: 'p-1',
      name: 'Aavin Green Milk 500ml',
      category: 'Dairy',
      units: 210,
      revenue: 4620.00,
      prepTime: '5.2m',
      status: 'healthy',
      stockLabel: 'In Stock (120)'
    },
    {
      id: 'p-2',
      name: 'Organic Whole Wheat Atta 5kg',
      category: 'Grains & Flour',
      units: 84,
      revenue: 21840.00,
      prepTime: '8.4m',
      status: 'low',
      stockLabel: 'Low Stock (4 left)'
    },
    {
      id: 'p-3',
      name: 'Fresh Farm Spinach Bunch',
      category: 'Vegetables',
      units: 145,
      revenue: 2900.00,
      prepTime: '4.8m',
      status: 'healthy',
      stockLabel: 'In Stock (85)'
    },
    {
      id: 'p-4',
      name: 'Farm Fresh Eggs (Pack of 6)',
      category: 'Dairy & Poultry',
      units: 98,
      revenue: 4410.00,
      prepTime: '5.0m',
      status: 'healthy',
      stockLabel: 'In Stock (54)'
    },
    {
      id: 'p-5',
      name: 'Fresh Country Curd 400g',
      category: 'Dairy',
      units: 112,
      revenue: 3920.00,
      prepTime: '5.5m',
      status: 'healthy',
      stockLabel: 'In Stock (62)'
    }
  ];

  // Direct Bank Settlements
  const settlements = [
    {
      id: 'st-1',
      ref: 'CMS-9847291039',
      date: 'Yesterday, 18:30 IST',
      period: 'Sep 22 - Sep 28',
      gross: 16193.18,
      commission: 1943.18,
      net: 14250.00,
      bank: 'HDFC Bank ••••4567',
      status: 'settled',
      statusLabel: 'Settled'
    },
    {
      id: 'st-2',
      ref: 'CMS-8739182390',
      date: '7 days ago',
      period: 'Sep 15 - Sep 21',
      gross: 9580.11,
      commission: 1149.61,
      net: 8430.50,
      bank: 'HDFC Bank ••••4567',
      status: 'settled',
      statusLabel: 'Settled'
    },
    {
      id: 'st-3',
      ref: 'CMS-7628190283',
      date: '14 days ago',
      period: 'Sep 08 - Sep 14',
      gross: 13750.00,
      commission: 1650.00,
      net: 12100.00,
      bank: 'HDFC Bank ••••4567',
      status: 'settled',
      statusLabel: 'Settled'
    },
    {
      id: 'st-4',
      ref: 'CMS-6519283740',
      date: '21 days ago',
      period: 'Sep 01 - Sep 07',
      gross: 21800.00,
      commission: 2616.00,
      net: 19184.00,
      bank: 'HDFC Bank ••••4567',
      status: 'settled',
      statusLabel: 'Settled'
    }
  ];

  const filteredSettlements = settlementFilter === 'all' 
    ? settlements 
    : settlements.filter(s => s.status === settlementFilter);

  return (
    <div className="analytics-page">
      {/* ─── Toast Feedback ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="notif-toast-banner" style={{
          position: 'fixed',
          top: '24px',
          right: '28px',
          zIndex: 10000,
          background: '#0f172a',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          border: '1px solid #334155'
        }}>
          <CheckCircle2 size={16} className="text-success" style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header & Time Filter Bar ───────────────────────────────── */}
      <div className="analytics-header-row">
        <div className="analytics-title-group">
          <div className="analytics-telemetry-badge">
            <span className="analytics-pulse-dot" />
            <span>FINANCIAL &amp; SALES TELEMETRY • AUDITED LEDGER</span>
          </div>
          <h1 className="analytics-page-title">Store Revenue &amp; Growth Analytics</h1>
          <p className="analytics-page-subtitle">
            Real-time financial reconciliation, commission audit, batch velocity, and banking disbursements for Kannan Dept Store.
          </p>
        </div>

        <div className="analytics-header-controls">
          {/* Time Range Toggle */}
          <div className="time-range-toggle-group">
            {['7D', '30D', '90D', '1Y'].map(t => (
              <button 
                key={t}
                type="button"
                className={`time-range-btn ${timeRange === t ? 'active' : ''}`}
                onClick={() => setTimeRange(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <button 
            type="button" 
            className="btn-analytics-action"
            onClick={handleSyncLedger}
            title="Reconcile with banking ledger"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Reconciling...' : 'Re-sync Ledger'}</span>
          </button>

          <button 
            type="button" 
            className="btn-analytics-primary"
            onClick={handleExport}
            title="Export CSV Statement"
          >
            <Download size={15} />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 Executive KPI Metric Cards (With Trend Sparklines) ─ */}
      <div className="metrics-grid">
        {/* KPI 1: Gross Merchandise Value */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Gross Merchandise Value</div>
              <div className="metric-card-value">
                ₹{rangeData.gmv.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="metric-card-sublabel">Total customer checkouts in {timeRange}</div>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Bank Payout */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Net Bank Payout (88%)</div>
              <div className="metric-card-value" style={{ color: '#059669' }}>
                ₹{rangeData.netPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="metric-card-sublabel">Transferred directly to HDFC Bank</div>
            </div>
          </div>
        </div>

        {/* KPI 3: Completed Orders */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Completed Orders</div>
              <div className="metric-card-value">{rangeData.completedOrders}</div>
              <div className="metric-card-sublabel">Delivered &amp; OTP verified</div>
            </div>
          </div>
        </div>

        {/* KPI 4: Average Order Basket (AOV) */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Average Order Basket (AOV)</div>
              <div className="metric-card-value">
                ₹{rangeData.aov.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="metric-card-sublabel">3.4 items per cart avg</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Interactive Revenue Trajectory & Sales by Category ─ */}
      <div className="charts-row">
        {/* Left: Interactive Revenue Trajectory Chart */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div className="chart-panel-title-area">
              <div className="chart-icon-box">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="chart-panel-title">Revenue Trajectory (INR)</h3>
                <p className="chart-panel-subtitle">
                  Audited sales velocity with live point telemetry • Hover for exact figures
                </p>
              </div>
            </div>

            {/* Metric Mode Selector */}
            <div className="chart-metric-selector">
              <button 
                type="button" 
                className={`chart-mode-pill ${activeChartMetric === 'gross' ? 'active' : ''}`}
                onClick={() => setActiveChartMetric('gross')}
              >
                Gross GMV
              </button>
              <button 
                type="button" 
                className={`chart-mode-pill ${activeChartMetric === 'net' ? 'active' : ''}`}
                onClick={() => setActiveChartMetric('net')}
              >
                Net Disbursal
              </button>
              <button 
                type="button" 
                className={`chart-mode-pill ${activeChartMetric === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveChartMetric('orders')}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="line-chart-area">
            {/* Y-Axis Labels */}
            <div className="chart-y-axis">
              <span>{activeChartMetric === 'orders' ? `${Math.round(maxVal)} orders` : `₹${(maxVal / 1000).toFixed(1)}k`}</span>
              <span>{activeChartMetric === 'orders' ? `${Math.round(maxVal * 0.75)} orders` : `₹${((maxVal * 0.75) / 1000).toFixed(1)}k`}</span>
              <span>{activeChartMetric === 'orders' ? `${Math.round(maxVal * 0.5)} orders` : `₹${((maxVal * 0.5) / 1000).toFixed(1)}k`}</span>
              <span>{activeChartMetric === 'orders' ? `${Math.round(maxVal * 0.25)} orders` : `₹${((maxVal * 0.25) / 1000).toFixed(1)}k`}</span>
              <span>₹0</span>
            </div>

            {/* Horizontal Gridlines */}
            <div className="chart-grid-lines">
              <div className="chart-grid-line" />
              <div className="chart-grid-line" />
              <div className="chart-grid-line" />
              <div className="chart-grid-line" />
              <div className="chart-grid-line" />
            </div>

            {/* Smooth SVG Spline Chart */}
            <svg 
              className="line-chart-svg" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`area-gradient-${activeChartMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeTheme.stroke} stopOpacity="0.32" />
                  <stop offset="60%" stopColor={activeTheme.stroke} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={activeTheme.stroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area spline fill */}
              <path 
                d={smoothAreaPath} 
                fill={`url(#area-gradient-${activeChartMetric})`} 
                vectorEffect="non-scaling-stroke" 
              />

              {/* Smooth cubic bezier line */}
              <path 
                d={smoothCurve} 
                fill="none" 
                stroke={activeTheme.stroke} 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                vectorEffect="non-scaling-stroke" 
              />
            </svg>

            {/* Interactive HTML Layer - ALWAYS 100% Round Dots & Gliding Crosshair */}
            <div 
              className="chart-interactive-layer"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Vertical Crosshair Line */}
              {hoveredIndex !== null && pointsCoordinates[hoveredIndex] && (
                <div 
                  className="chart-crosshair-line"
                  style={{ 
                    left: `${pointsCoordinates[hoveredIndex].x}%`,
                    borderColor: activeTheme.stroke
                  }}
                />
              )}

              {/* Interactive Round Markers */}
              {pointsCoordinates.map((p, i) => (
                <div
                  key={i}
                  className={`chart-point-anchor ${hoveredIndex === i ? 'is-active' : ''}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  <div 
                    className="chart-point-ring" 
                    style={{ 
                      borderColor: activeTheme.stroke,
                      boxShadow: hoveredIndex === i 
                        ? `0 0 0 5px ${activeTheme.light}, 0 4px 12px rgba(0, 0, 0, 0.15)` 
                        : '0 2px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div 
                      className="chart-point-core" 
                      style={{ backgroundColor: activeTheme.stroke }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Luxury Glassmorphism Tooltip on Hover */}
            {hoveredIndex !== null && pointsCoordinates[hoveredIndex] && (
              <div 
                className="chart-tooltip"
                style={{ 
                  left: `calc(52px + ${pointsCoordinates[hoveredIndex].x}% * (100% - 52px) / 100)`,
                  top: `${pointsCoordinates[hoveredIndex].y}%`
                }}
              >
                <div className="tooltip-date">{pointsCoordinates[hoveredIndex].label}</div>
                <div className="tooltip-val" style={{ color: activeTheme.stroke }}>
                  {activeChartMetric === 'orders' 
                    ? `${pointsCoordinates[hoveredIndex].val} Orders`
                    : `₹${pointsCoordinates[hoveredIndex].val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </div>
                <div className="tooltip-orders">
                  {activeChartMetric === 'gross' 
                    ? `Net Payout (88%): ₹${(pointsCoordinates[hoveredIndex].val * 0.88).toFixed(2)}` 
                    : activeChartMetric === 'net'
                    ? `Gross GMV: ₹${(pointsCoordinates[hoveredIndex].val / 0.88).toFixed(2)}`
                    : `Verified Dispatches`}
                </div>
              </div>
            )}

            {/* X-Axis Labels */}
            <div className="chart-x-axis">
              {rangeData.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sales by Category with Interactive Donut */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <h3 className="chart-panel-title">Sales by Category</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top Revenue Shares</span>
          </div>

          <div className="donut-chart-container">
            <div className="donut-svg-wrapper">
              <svg className="donut-svg" viewBox="0 0 100 100">
                {/* Circumference for r=34 is 2 * PI * 34 ≈ 213.6 */}
                <circle 
                  className="donut-segment" 
                  cx="50" cy="50" r="34" 
                  stroke="#4f46e5" 
                  strokeDasharray="98.2 213.6" 
                  strokeDashoffset="0"
                  onMouseEnter={() => setActiveCategoryIndex(0)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                />
                <circle 
                  className="donut-segment" 
                  cx="50" cy="50" r="34" 
                  stroke="#059669" 
                  strokeDasharray="49.1 213.6" 
                  strokeDashoffset="-98.2"
                  onMouseEnter={() => setActiveCategoryIndex(1)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                />
                <circle 
                  className="donut-segment" 
                  cx="50" cy="50" r="34" 
                  stroke="#d97706" 
                  strokeDasharray="29.9 213.6" 
                  strokeDashoffset="-147.3"
                  onMouseEnter={() => setActiveCategoryIndex(2)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                />
                <circle 
                  className="donut-segment" 
                  cx="50" cy="50" r="34" 
                  stroke="#0284c7" 
                  strokeDasharray="36.3 213.6" 
                  strokeDashoffset="-177.2"
                  onMouseEnter={() => setActiveCategoryIndex(3)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                />
              </svg>

              <div className="donut-center-text">
                <div className="donut-center-val">
                  {activeCategoryIndex !== null 
                    ? `${categoryBreakdown[activeCategoryIndex].pct}%` 
                    : '100%'}
                </div>
                <div className="donut-center-label">
                  {activeCategoryIndex !== null 
                    ? categoryBreakdown[activeCategoryIndex].name.split(' ')[0] 
                    : 'Total'}
                </div>
              </div>
            </div>

            {/* Legend List */}
            <div className="donut-legend">
              {categoryBreakdown.map((item, idx) => (
                <div 
                  key={idx}
                  className={`legend-item ${activeCategoryIndex === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveCategoryIndex(idx)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  <div className="legend-label">
                    <div className="legend-dot" style={{ background: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <div className="legend-metrics">
                    <span className="legend-revenue">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="legend-pct-pill">{item.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Hourly Order Velocity & Top Selling Products ──────── */}
      <div className="secondary-analytics-row">
        {/* Hourly Velocity Heatmap */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h3 className="chart-panel-title">Trading Peak Hours &amp; Order Velocity</h3>
              <p className="chart-panel-subtitle">Hourly customer dispatch distribution across time windows</p>
            </div>
            <span className="delta-pill positive" style={{ fontSize: '0.72rem' }}>
              <Sparkles size={11} /> Morning &amp; Dinner Rush
            </span>
          </div>

          <div className="hourly-bars-container">
            {hourlyData.map((h, i) => (
              <div key={i} className="hourly-bar-row">
                <div className="hourly-time-label">
                  <div>{h.time}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{h.label}</div>
                </div>
                <div className="hourly-track">
                  <div 
                    className={`hourly-fill ${h.isPeak ? 'peak' : ''}`} 
                    style={{ width: `${h.pct}%` }} 
                  />
                </div>
                <div className="hourly-orders-badge">
                  {h.orders} orders
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing SKUs Table */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h3 className="chart-panel-title">Top Selling Products &amp; SKU Velocity</h3>
              <p className="chart-panel-subtitle">Highest grossing catalog items during current period</p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>5 Top Performers</span>
          </div>

          <table className="top-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units</th>
                <th>Revenue</th>
                <th>Prep SLA</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, idx) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <span className={`product-rank-badge ${idx === 0 ? 'gold' : ''}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="product-info-name">{p.name}</div>
                        <div className="product-info-cat">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: '700' }}>{p.units}</td>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>
                    ₹{p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', color: '#059669', fontWeight: '600' }}>
                      <Clock size={12} /> {p.prepTime}
                    </span>
                  </td>
                  <td>
                    <span className={`stock-status-pill ${p.status}`}>
                      {p.stockLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Row 5: Direct Bank Settlements & Audit Ledger ───────────── */}
      <div className="payouts-panel">
        <div className="payouts-header">
          <div className="payouts-title-group">
            <h3>Direct Bank Settlements &amp; Financial Ledger</h3>
            <p>
              Automated weekly payouts transferred directly to verified bank account: <strong>HDFC Bank (••••4567)</strong>
            </p>
          </div>
          <div className="payouts-next-pill">
            <CheckCircle2 size={15} />
            <span>Next Scheduled Payout: {rangeData.nextPayout}</span>
          </div>
        </div>

        {/* Filter row */}
        <div className="payouts-filter-row">
          <div className="payouts-status-tabs">
            <button 
              type="button"
              className={`payout-tab-btn ${settlementFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSettlementFilter('all')}
            >
              All Settlements
            </button>
            <button 
              type="button"
              className={`payout-tab-btn ${settlementFilter === 'settled' ? 'active' : ''}`}
              onClick={() => setSettlementFilter('settled')}
            >
              Settled ({settlements.length})
            </button>
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Platform Commission: <strong>12% Fixed</strong> • Zero Gateway Surcharge
          </div>
        </div>

        {/* Table */}
        <table className="payouts-table">
          <thead>
            <tr>
              <th>Net Disbursed (88%)</th>
              <th>Status</th>
              <th>Settlement Cycle</th>
              <th>Transfer Date</th>
              <th>Reference / UTR Code</th>
              <th>Bank Account</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSettlements.map((st) => (
              <tr key={st.id}>
                <td style={{ fontWeight: '800', fontSize: '0.95rem', color: '#059669', fontFeatureSettings: '"tnum"' }}>
                  ₹{st.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span className="delta-pill positive">
                    <CheckCircle2 size={11} /> {st.statusLabel}
                  </span>
                </td>
                <td style={{ color: '#475569', fontWeight: '600' }}>{st.period}</td>
                <td style={{ color: '#64748b' }}>{st.date}</td>
                <td>
                  <div className="utr-code-box">
                    <span>{st.ref}</span>
                    <button 
                      type="button"
                      className="btn-utr-copy"
                      onClick={() => copyToClipboard(st.ref, st.id)}
                      title="Copy UTR Reference"
                    >
                      {copiedUtr === st.id ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                    </button>
                  </div>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.775rem' }}>{st.bank}</td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    type="button"
                    className="btn-view-invoice"
                    onClick={() => setSelectedInvoice(st)}
                  >
                    <FileText size={13} />
                    <span>Receipt</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Settlement Receipt / Invoice Modal ───────────────────────── */}
      {selectedInvoice && (
        <div className="settlement-modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="settlement-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settlement-modal-header">
              <h3 className="settlement-modal-title">
                <FileText size={18} style={{ color: '#4f46e5' }} />
                <span>Settlement Breakdown Receipt</span>
              </h3>
              <button 
                type="button" 
                className="btn-utr-copy" 
                onClick={() => setSelectedInvoice(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="settlement-modal-body">
              <div className="invoice-summary-banner">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    Net Disbursed to Merchant
                  </div>
                  <div className="invoice-summary-amount">
                    ₹{selectedInvoice.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <span className="delta-pill positive" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>
                  <CheckCircle2 size={13} /> Bank Settled
                </span>
              </div>

              <div className="invoice-line-items">
                <div className="invoice-row">
                  <span>Gross Merchandise Sales (GMV)</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>
                    ₹{selectedInvoice.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="invoice-row">
                  <span>MicroLogi Platform Commission (12%)</span>
                  <span style={{ color: '#dc2626', fontWeight: '600' }}>
                    - ₹{selectedInvoice.commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="invoice-row">
                  <span>Multi-Seller Batching Subsidy</span>
                  <span style={{ color: '#059669', fontWeight: '600' }}>Waived (₹0.00)</span>
                </div>
                <div className="invoice-row">
                  <span>Payment Gateway Processing (2%)</span>
                  <span style={{ color: '#059669', fontWeight: '600' }}>Subsidized by Platform</span>
                </div>
                <div className="invoice-row bold">
                  <span>Total Transferred Amount</span>
                  <span style={{ color: '#059669', fontSize: '1rem' }}>
                    ₹{selectedInvoice.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', fontSize: '0.775rem', color: '#64748b', lineHeight: '1.6', border: '1px solid #e2e8f0' }}>
                <div><strong>UTR Reference:</strong> {selectedInvoice.ref}</div>
                <div><strong>Destination Account:</strong> {selectedInvoice.bank}</div>
                <div><strong>Settlement Period:</strong> {selectedInvoice.period}</div>
                <div><strong>Cleared On:</strong> {selectedInvoice.date}</div>
              </div>
            </div>

            <div className="settlement-modal-footer">
              <button 
                type="button" 
                className="btn-analytics-action"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-analytics-primary"
                onClick={() => {
                  showToast(`Printing Tax Invoice receipt for ${selectedInvoice.ref}...`);
                  setSelectedInvoice(null);
                }}
              >
                <Printer size={14} />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalyticsPage;
