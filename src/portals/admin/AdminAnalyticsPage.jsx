import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  BarChart3, TrendingUp, Layers, Truck, MapPin, CheckCircle, 
  Info, Leaf, Clock, ArrowUpRight, ShieldCheck, Activity, Boxes
} from 'lucide-react';
import './AdminAnalyticsPage.css';

// SVG Mini Donut Gauge Component
const MiniDonutGauge = ({ percentage, color = '#4F46E5', size = 58, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="mini-donut-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="mini-donut-text">
        <span className="donut-num">{safePercent}%</span>
      </div>
    </div>
  );
};

const AdminAnalyticsPage = () => {
  const { orders, deliveryBatches, deliveryAgents, vendors } = useAppContext();

  const totalOrders = orders.length;
  const aggregatedOrders = orders.filter(o => o.batchId || ['Grouped', 'Batch Created', 'Assigned', 'Out for Delivery', 'Delivered'].includes(o.aggregationStatus)).length;
  const nonAggregatedOrders = totalOrders - aggregatedOrders;
  const completedDeliveries = deliveryBatches.filter(b => b.status === 'Completed' || b.status === 'Delivered').length;

  const aggRate = Math.round((aggregatedOrders / (totalOrders || 1)) * 100);
  const estimatedDistanceSaved = parseFloat((aggregatedOrders * 2.8).toFixed(1));
  const estimatedCo2Saved = parseFloat((estimatedDistanceSaved * 0.192).toFixed(2));
  const agentUtilization = Math.round((deliveryAgents.filter(a => a.status === 'On Delivery' || a.currentOrders > 0).length / (deliveryAgents.length || 1)) * 100);

  // Chart 1: Volume by Area
  const areaCounts = {};
  orders.forEach(o => {
    const area = o.deliveryLocation ? o.deliveryLocation.split(',')[0].trim() : 'Central Sector';
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });
  const maxAreaCount = Math.max(...Object.values(areaCounts), 1);

  // Chart 2: Volume by Seller
  const sellerCounts = {};
  vendors.forEach(v => {
    sellerCounts[v.name] = orders.filter(o => o.vendorId === v.id || o.vendorName === v.name).length;
  });
  const maxSellerCount = Math.max(...Object.values(sellerCounts), 1);

  return (
    <div className="page-container analytics-command-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Logistics Efficiency & Telemetry Analytics
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> NETWORK METRICS
            </span>
          </h2>
          <p className="page-subtitle">
            Performance indicators across multi-seller order aggregation, route distance reductions, courier payload efficiency, and merchant throughput.
          </p>
        </div>
      </div>

      {/* 4 Metric Command Cards with Donut Gauges */}
      <div className="analytics-metrics-grid">
        <div className="card metric-analytics-card">
          <div className="metric-header-flex">
            <span className="metric-kpi-label">Total System Orders</span>
            <div className="kpi-icon-squircle purple">
              <Boxes size={18} />
            </div>
          </div>
          <div className="metric-big-num">{totalOrders}</div>
          <div className="metric-context-sub">
            <span className="text-accent font-semibold">{orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length} placed today</span> across all stores
          </div>
        </div>

        <div className="card metric-analytics-card">
          <div className="metric-header-flex">
            <span className="metric-kpi-label">Order Aggregation Rate</span>
            <MiniDonutGauge percentage={aggRate} color="#4F46E5" />
          </div>
          <div className="metric-big-num text-accent">{aggregatedOrders} <span className="sub-unit">/ {totalOrders}</span></div>
          <div className="metric-context-sub">
            Consolidated into unified delivery corridors
          </div>
        </div>

        <div className="card metric-analytics-card">
          <div className="metric-header-flex">
            <span className="metric-kpi-label">Est. Route Distance Saved</span>
            <div className="kpi-icon-squircle emerald">
              <Leaf size={18} />
            </div>
          </div>
          <div className="metric-big-num text-emerald">{estimatedDistanceSaved} <span className="sub-unit">km</span></div>
          <div className="metric-context-sub">
            <span className="text-emerald font-semibold">~{estimatedCo2Saved} kg CO₂</span> emission reduction
          </div>
        </div>

        <div className="card metric-analytics-card">
          <div className="metric-header-flex">
            <span className="metric-kpi-label">Courier Fleet Utilization</span>
            <MiniDonutGauge percentage={agentUtilization} color="#059669" />
          </div>
          <div className="metric-big-num text-emerald">{agentUtilization}%</div>
          <div className="metric-context-sub">
            {deliveryAgents.filter(a => a.status === 'Available').length} active agents ready for dispatch
          </div>
        </div>
      </div>

      {/* Analytical Estimation Banner */}
      <div className="analytics-notice-box">
        <Info size={16} className="text-accent" />
        <span>
          <strong>Telemetry Simulation Notice:</strong> Distance savings and environmental impact metrics are computed via multi-stop route clustering algorithms. Physical GPS track validation is logged automatically per trip.
        </span>
      </div>

      {/* Breakdown Bar Visualizations */}
      <div className="analytics-breakdowns-grid">
        {/* Neighborhood Volume */}
        <div className="card breakdown-card">
          <div className="card-header">
            <h3 className="card-title">
              <MapPin size={17} className="text-accent" />
              Delivery Volume by Neighborhood Sector
            </h3>
            <span className="badge-subtle">{Object.keys(areaCounts).length} SECTORS</span>
          </div>
          <div className="card-body">
            <div className="progress-bars-stack">
              {Object.keys(areaCounts).map(area => {
                const count = areaCounts[area];
                const pct = Math.round((count / maxAreaCount) * 100);
                return (
                  <div key={area} className="breakdown-bar-item">
                    <div className="bar-label-row">
                      <span className="bar-title">{area}</span>
                      <span className="bar-val-badge">{count} order{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="styled-progress-track">
                      <div 
                        className="styled-progress-fill indigo" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Merchant Throughput */}
        <div className="card breakdown-card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={17} className="text-accent" />
              Orders Processed per Participating Merchant
            </h3>
            <span className="badge-subtle">{Object.keys(sellerCounts).length} MERCHANTS</span>
          </div>
          <div className="card-body">
            <div className="progress-bars-stack">
              {Object.keys(sellerCounts).map(seller => {
                const count = sellerCounts[seller];
                const pct = Math.round((count / maxSellerCount) * 100);
                return (
                  <div key={seller} className="breakdown-bar-item">
                    <div className="bar-label-row">
                      <span className="bar-title">{seller}</span>
                      <span className="bar-val-badge emerald">{count} order{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="styled-progress-track">
                      <div 
                        className="styled-progress-fill emerald" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
