import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PackageCheck, Truck, MapPin, TrendingUp, ArrowRight, Lock, 
  Clock, Navigation, ShieldCheck, CheckCircle2, AlertCircle, 
  RotateCw, Eye, Sparkles, Battery, BatteryCharging, Zap, Compass, ChevronRight, Boxes,
  Phone, MessageSquare, ExternalLink, Calendar, Check, Award, ArrowUpRight
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import StatCard from '../../components/delivery/StatCard';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import DeliveryTimeline from '../../components/delivery/DeliveryTimeline';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { 
    agentProfile, updateAgentAvailability, stats, activeBatch, 
    orders, timeline, shiftSummary, hasBatch, setHasBatch,
    setSelectedOrderForDrawer 
  } = useDelivery();

  // Compute Greeting by time of day
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17) timeGreeting = 'Good evening';

  const agentDisplayName = agentProfile?.name || 'David Anand';
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const availability = agentProfile?.availability || 'Available';

  // Active batch progress computations
  const totalStops = orders?.length || 5;
  const completedCount = orders?.filter(o => o.status === 'DELIVERED').length || 2;
  const progressPercent = Math.round((completedCount / totalStops) * 100);

  // Next stop calculation
  const nextStopOrder = orders?.find(o => o.status === 'OUT_FOR_DELIVERY') || 
                        orders?.find(o => o.status === 'PICKED_UP' || o.status === 'PENDING') || 
                        orders?.[0];

  return (
    <div className="dl-dashboard-page">
      {/* 1. Fleet Hero Command Deck */}
      <div className="dashboard-hero-deck">
        <div className="hero-deck-glow" />

        <div className="hero-deck-main">
          {/* Pilot Identity with Live Beacon */}
          <div className="hero-pilot-profile">
            <div className="pilot-avatar-wrap">
              <div className="pilot-avatar-img">
                {agentProfile?.avatar ? (
                  <img src={agentProfile.avatar} alt={agentDisplayName} />
                ) : (
                  <span>{agentDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className={`pilot-status-beacon ${availability === 'Available' ? 'is-live' : availability === 'On Break' ? 'is-break' : 'is-offline'}`} />
            </div>

            <div className="pilot-details">
              <div className="pilot-meta-strip">
                <span className="pilot-date-badge">
                  <Calendar size={13} />
                  <span>{todayDateStr}</span>
                </span>
                <span className="pilot-weather-chip">
                  <span>🌤️ 28°C Chennai</span>
                </span>
              </div>

              <h1 className="pilot-greeting dl-heading">
                {timeGreeting}, <span className="pilot-highlight-name">{agentDisplayName}</span>
              </h1>

              <div className="pilot-id-row">
                <span className="pilot-badge-id">ID: {agentProfile?.agentId || 'Da1'}</span>
                <span className="pilot-role-tag">
                  <ShieldCheck size={13} className="text-emerald" />
                  <span>Fleet Captain • #FL-8820</span>
                </span>
                <span className="pilot-rating-tag">
                  <Award size={13} className="text-amber" />
                  <span>4.96 ★ Pilot Rating</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tactical Availability Segmented Switcher & Simulator Button */}
          <div className="hero-deck-actions">
            <div className="availability-segmented-deck">
              <span className="availability-deck-title">Dispatch Status</span>
              <div className="segmented-switch-bar" role="radiogroup" aria-label="Agent dispatch availability">
                {[
                  { id: 'Available', label: 'Available', dotClass: 'dot-available' },
                  { id: 'On Break', label: 'On Break', dotClass: 'dot-break' },
                  { id: 'Offline', label: 'Offline', dotClass: 'dot-offline' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`segmented-switch-btn ${availability === opt.id ? 'is-active' : ''}`}
                    onClick={() => updateAgentAvailability(opt.id)}
                    aria-checked={availability === opt.id}
                    role="radio"
                  >
                    <span className={`switch-dot ${opt.dotClass}`} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Preview Mode Toggle */}
            <button
              type="button"
              className="mission-mode-toggle-btn"
              onClick={() => setHasBatch(prev => !prev)}
              title="Toggle preview between active batch and all clear empty state"
            >
              <RotateCw size={13} />
              <span>Simulate: <strong>{hasBatch ? 'Active Mission' : 'Standby Mode'}</strong></span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Telemetry StatCards Grid */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="Completed Today"
          value={stats.completedToday.value}
          trend={stats.completedToday.trend}
          isPositive={stats.completedToday.isPositive}
          comparison={stats.completedToday.comparison}
          sparkline={stats.completedToday.sparkline}
          icon={PackageCheck}
          color="primary"
        />

        <StatCard
          title="Active Batches"
          value={hasBatch ? stats.activeBatches.value : 0}
          trend={hasBatch ? stats.activeBatches.trend : 'Standby'}
          isPositive={true}
          comparison={hasBatch ? stats.activeBatches.comparison : 'Awaiting Assignment'}
          sparkline={stats.activeBatches.sparkline}
          icon={Truck}
          color="warning"
        />

        <StatCard
          title="Total Pickups"
          value={hasBatch ? stats.totalPickups.value : 0}
          trend={hasBatch ? stats.totalPickups.trend : '0 pending'}
          isPositive={true}
          comparison={hasBatch ? stats.totalPickups.comparison : 'Ready for orders'}
          sparkline={stats.totalPickups.sparkline}
          icon={MapPin}
          color="info"
        />

        <StatCard
          title="On-Time Rate"
          value={stats.onTimeRate.value}
          trend={stats.onTimeRate.trend}
          isPositive={stats.onTimeRate.isPositive}
          comparison={stats.onTimeRate.comparison}
          sparkline={stats.onTimeRate.sparkline}
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* 3. Main Operational Command Columns */}
      <div className="dashboard-main-columns">
        {/* Left Column: Active Batch Card + Quick Actions */}
        <div className="dashboard-left-col">
          {/* Current Active Batch Mission Deck */}
          <div className="dashboard-section-block">
            <div className="section-title-row">
              <div className="title-with-pill">
                <h2 className="section-heading dl-heading">Current Active Batch</h2>
                {hasBatch && (
                  <span className="batch-live-indicator-pill">
                    <span className="dl-live-dot" /> IN FLIGHT
                  </span>
                )}
              </div>
              {hasBatch && (
                <div className="batch-eta-timer-pill">
                  <Clock size={13} className="text-primary" />
                  <span>ETA 12:15 PM • <strong>38 mins remaining</strong></span>
                </div>
              )}
            </div>

            {hasBatch && activeBatch ? (
              <div className="active-batch-mission-card">
                {/* Mission Header */}
                <div className="mission-card-header">
                  <div className="mission-id-block">
                    <div className="mission-badge-chip">
                      <Truck size={14} />
                      <span className="dl-tabular">{activeBatch.batchId}</span>
                    </div>
                    <div className="mission-zone-info">
                      <span className="mission-corridor">{activeBatch.zone}</span>
                      <span className="mission-priority-tag">High Priority • Cold Chain</span>
                    </div>
                  </div>
                  <DeliveryStatusBadge status={activeBatch.status} size="md" />
                </div>

                {/* 3-Stage Visual Pipeline Progress */}
                <div className="mission-pipeline-tracker">
                  <div className="pipeline-stages-row">
                    <div className="pipeline-stage is-completed">
                      <div className="stage-icon-circle">
                        <Check size={12} strokeWidth={2.5} />
                      </div>
                      <div className="stage-text">
                        <span className="stage-name">Hub Pickups</span>
                        <span className="stage-detail">3 of 3 Hubs Secured</span>
                      </div>
                    </div>

                    <div className="pipeline-connector is-active" />

                    <div className="pipeline-stage is-active">
                      <div className="stage-icon-circle pulse-stage">
                        <Navigation size={12} />
                      </div>
                      <div className="stage-text">
                        <span className="stage-name">In Transit</span>
                        <span className="stage-detail">14.2 km Corridor</span>
                      </div>
                    </div>

                    <div className="pipeline-connector" />

                    <div className="pipeline-stage is-pending">
                      <div className="stage-icon-circle">
                        <span className="stage-number dl-tabular">{completedCount}/{totalStops}</span>
                      </div>
                      <div className="stage-text">
                        <span className="stage-name">Doorstep Drops</span>
                        <span className="stage-detail">{completedCount} of {totalStops} Delivered ({progressPercent}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mission-progress-bar-track">
                    <div 
                      className="mission-progress-bar-fill" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tactical Waypoint Target Card (Next Stop) */}
                {nextStopOrder && (
                  <div className="tactical-waypoint-card">
                    <div className="waypoint-header-strip">
                      <div className="waypoint-radar-tag">
                        <span className="dl-live-dot" />
                        <span>NEXT STOP TARGET • DROP #3 OF {totalStops}</span>
                      </div>
                      <div className="waypoint-eta-badge">
                        <Clock size={13} />
                        <span>ETA: {nextStopOrder.eta || '11:15 AM'} (6 min away)</span>
                      </div>
                    </div>

                    <div className="waypoint-content-grid">
                      <div className="waypoint-customer-details">
                        <div className="customer-avatar-box">
                          <span>{nextStopOrder.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                        </div>
                        <div className="customer-text-meta">
                          <h3 className="customer-name-heading">{nextStopOrder.customerName}</h3>
                          <p className="customer-destination-addr">
                            <MapPin size={14} className="text-primary inline-icon" />
                            <span>{nextStopOrder.address}</span>
                          </p>
                          {nextStopOrder.notes && (
                            <span className="customer-note-pill">
                              <AlertCircle size={12} /> {nextStopOrder.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="waypoint-payment-box">
                        {nextStopOrder.codAmount > 0 ? (
                          <div className="waypoint-cod-pill">
                            <span className="cod-label">Cash on Delivery</span>
                            <span className="cod-amount dl-tabular">₹{nextStopOrder.codAmount}</span>
                          </div>
                        ) : (
                          <div className="waypoint-prepaid-pill">
                            <CheckCircle2 size={13} className="text-emerald" />
                            <span>Prepaid (UPI)</span>
                          </div>
                        )}
                        <span className="items-count-tag">{nextStopOrder.items?.length || 2} package items</span>
                      </div>
                    </div>

                    {/* Quick Tactical Actions inside Waypoint */}
                    <div className="waypoint-quick-action-bar">
                      <a href={`tel:${nextStopOrder.customerPhone || '+919840233441'}`} className="wp-action-btn btn-call" title="Call customer">
                        <Phone size={14} />
                        <span>Call</span>
                      </a>
                      <a 
                        href={`https://wa.me/${(nextStopOrder.customerPhone || '919840233441').replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="wp-action-btn btn-wa"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextStopOrder.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="wp-action-btn btn-nav"
                        title="Start Google Maps navigation"
                      >
                        <Navigation size={14} />
                        <span>Start Maps</span>
                        <ArrowUpRight size={13} />
                      </a>
                      <button 
                        type="button" 
                        className="wp-action-btn btn-details"
                        onClick={() => setSelectedOrderForDrawer(nextStopOrder)}
                      >
                        <Eye size={14} />
                        <span>Full Details</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Batch Metrics Matrix */}
                <div className="mission-metrics-matrix">
                  <div className="m-metric-card">
                    <span className="m-metric-label">Total Cargo</span>
                    <span className="m-metric-val dl-tabular">{totalStops} Parcels (12.4 kg)</span>
                  </div>
                  <div className="m-metric-card">
                    <span className="m-metric-label">Route Corridor</span>
                    <span className="m-metric-val dl-tabular">{activeBatch.totalDistanceKm} km total</span>
                  </div>
                  <div className="m-metric-card">
                    <span className="m-metric-label">Est. Mission Time</span>
                    <span className="m-metric-val dl-tabular">{activeBatch.estimatedTimeMins} mins</span>
                  </div>
                  <div className="m-metric-card">
                    <span className="m-metric-label">Remaining Drops</span>
                    <span className="m-metric-val dl-tabular">{totalStops - completedCount} pending</span>
                  </div>
                </div>

                {/* Primary Mission Action Footer */}
                <div className="mission-footer-action-row">
                  <button 
                    type="button" 
                    className="mission-cta-primary continue-mission-btn"
                    onClick={() => navigate('/delivery/route')}
                  >
                    <span>Continue Turn-by-Turn Route</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="mission-cta-secondary"
                    onClick={() => navigate('/delivery/status')}
                  >
                    <ShieldCheck size={16} />
                    <span>Update Status & Proof</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Rich Empty State when no batch is assigned */
              <EmptyState
                icon={Truck}
                title="You're all clear"
                description="New batches will appear here as soon as dispatch assigns them. Make sure your status is set to Available."
                primaryAction={{
                  label: "Go Online & Assign",
                  icon: Sparkles,
                  onClick: () => {
                    updateAgentAvailability('Available');
                    setHasBatch(true);
                  }
                }}
                secondaryAction={{
                  label: "View Delivery History",
                  icon: Eye,
                  onClick: () => navigate('/delivery/history')
                }}
              />
            )}
          </div>
        </div>

        {/* Right Column: Shift Telemetry + Live Activity Timeline */}
        <div className="dashboard-right-col">
          {/* Shift Telemetry & Vehicle Intelligence Card */}
          <div className="shift-telemetry-advanced-card">
            <div className="shift-card-top-header">
              <div className="telemetry-title-block">
                <div className="telemetry-spark-icon">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="telemetry-header-title dl-heading">Shift Diagnostics</h3>
                  <span className="telemetry-sub-meta">Cargo EV Fleet Telemetry</span>
                </div>
              </div>
              <span className="ev-battery-meter">
                <BatteryCharging size={14} className="text-emerald" />
                <span className="dl-tabular">82%</span>
              </span>
            </div>

            {/* EV Battery Gauge Bar */}
            <div className="battery-gauge-wrapper">
              <div className="gauge-label-row">
                <span className="gauge-name">Vehicle Battery Range</span>
                <span className="gauge-range-value">140 km remaining</span>
              </div>
              <div className="battery-gauge-track">
                <div className="battery-gauge-fill" style={{ width: '82%' }} />
              </div>
            </div>

            {/* Performance Metric Cells Grid */}
            <div className="telemetry-metrics-grid">
              <div className="telemetry-cell">
                <span className="t-label">Hours Online</span>
                <span className="t-val dl-tabular">{shiftSummary.hoursOnline}</span>
                <span className="t-subtext">Since 07:00 AM</span>
              </div>
              <div className="telemetry-cell">
                <span className="t-label">Distance Run</span>
                <span className="t-val dl-tabular">{shiftSummary.distanceTraveledKm} km</span>
                <span className="t-subtext">Avg 18.2 km/h</span>
              </div>
              <div className="telemetry-cell">
                <span className="t-label">Completed Drops</span>
                <span className="t-val dl-tabular">{shiftSummary.ordersCompleted} orders</span>
                <span className="t-subtext text-emerald">100% on-time</span>
              </div>
              <div className="telemetry-cell cell-earnings-highlight">
                <span className="t-label">Estimated Payout</span>
                <span className="t-val t-earnings dl-tabular">{shiftSummary.estimatedEarnings}</span>
                <span className="t-subtext text-emerald">+₹240 incentives</span>
              </div>
            </div>

            {/* Efficiency score footer */}
            <div className="telemetry-footer-strip">
              <span className="efficiency-tag">
                <Award size={13} className="text-amber" /> 99.4% Efficiency Score
              </span>
              <span className="sync-timestamp dl-tabular">Updated live</span>
            </div>
          </div>

          {/* Today's Live Activity Feed */}
          <div className="live-activity-feed-card">
            <div className="feed-header-bar">
              <div className="feed-title-block">
                <h3 className="feed-card-title dl-heading">Today's Timeline</h3>
                <span className="feed-live-beacon">
                  <span className="dl-live-dot" /> LIVE
                </span>
              </div>
              <span className="feed-event-count dl-tabular">{timeline.length} events logged</span>
            </div>

            <div className="feed-items-scroll">
              <DeliveryTimeline items={timeline} maxItems={6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
