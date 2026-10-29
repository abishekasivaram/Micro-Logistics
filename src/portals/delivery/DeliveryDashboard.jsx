import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PackageCheck, Truck, MapPin, TrendingUp, ArrowRight, Lock, 
  Clock, Navigation, ShieldCheck, CheckCircle2, AlertCircle, 
  RotateCw, Eye, Sparkles, Battery, BatteryCharging, Zap, Compass, ChevronRight, Boxes,
  Phone, MessageSquare, ExternalLink, Calendar, Check, Award, ArrowUpRight, X
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
    setSelectedOrderForDrawer, acceptBatch, rejectBatch
  } = useDelivery();

  // Compute Greeting by time of day
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17) timeGreeting = 'Good evening';

  const agentDisplayName = agentProfile?.name || 'Fleet Captain';
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const availability = agentProfile?.availability || 'Available';

  // Active batch progress computations
  const totalStops = orders?.length || 0;
  const completedCount = (orders || []).filter(o => o.status === 'DELIVERED').length;
  const progressPercent = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0;

  // Hubs computations
  const totalHubs = (activeBatch?.hubs || []).length || 1;
  const collectedHubs = (activeBatch?.hubs || []).filter(h => h.status === 'COLLECTED').length;
  const isAllHubsCollected = totalHubs > 0 && collectedHubs >= totalHubs;
  const nextHub = (activeBatch?.hubs || []).find(h => h.status !== 'COLLECTED') || (activeBatch?.hubs || [])[0];

  // Dynamic next stop calculation (never hardcoded)
  const pendingOrders = (orders || []).filter(o => o.status !== 'DELIVERED');
  const nextStopOrder = pendingOrders[0] || (orders || [])[0];
  const currentDropIndex = (orders || []).findIndex(o => o.id === nextStopOrder?.id);
  const dropNumber = currentDropIndex >= 0 ? currentDropIndex + 1 : 1;

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
                  <img 
                    src={agentProfile.avatar} 
                    alt={agentDisplayName} 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span>{String(agentDisplayName || 'DA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
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
                <span className="pilot-badge-id">ID: {agentProfile?.agentId || 'DA'}</span>
                <span className="pilot-role-tag">
                  <ShieldCheck size={13} className="text-emerald" />
                  <span>Fleet Courier • {agentProfile?.agentCode || '#FL-FLEET'}</span>
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
                {hasBatch && activeBatch && (
                  <span className="batch-live-indicator-pill">
                    <span className="dl-live-dot" /> 
                    {activeBatch.status === 'ASSIGNED' ? 'NEW ASSIGNMENT' : activeBatch.status === 'PICKUP_IN_PROGRESS' ? 'PICKUP ROUTINE' : 'IN FLIGHT'}
                  </span>
                )}
              </div>
              {hasBatch && activeBatch && (
                <div className="batch-eta-timer-pill">
                  <Clock size={13} className="text-primary" />
                  <span>ETA {activeBatch.deliverySlot || '12:15 PM'} • <strong>{activeBatch.status === 'ASSIGNED' ? 'Awaiting Acceptance' : activeBatch.status === 'PICKUP_IN_PROGRESS' ? 'Pickup Routine' : 'In Flight'}</strong></span>
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
                      <span className="mission-priority-tag">High Priority • Aggregated Batch</span>
                    </div>
                  </div>
                  <DeliveryStatusBadge status={activeBatch.status} size="md" />
                </div>

                {/* State 1: Clean Assignment Acceptance Invitation (Step 4 of Delivery Workflow) */}
                {(activeBatch.status === 'ASSIGNED' || activeBatch.status === 'PENDING_ASSIGNMENT') ? (
                  <div style={{
                    margin: '16px 0',
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.09) 0%, rgba(234, 88, 12, 0.05) 100%)',
                    border: '1.5px solid rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#FEF3C7',
                        color: '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Truck size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: '#B45309', background: '#FDE68A', padding: '2px 8px', borderRadius: '999px' }}>
                            DISPATCH INVITATION
                          </span>
                          <span style={{ fontSize: '12px', color: '#92400E' }}>Slot: {activeBatch.deliverySlot}</span>
                        </div>
                        <h3 style={{ margin: '6px 0 2px', fontSize: '17px', fontWeight: '700', color: '#78350F' }}>
                          Batch #{activeBatch.batchId} Ready for Acceptance
                        </h3>
                        <p style={{ margin: 0, fontSize: '13.5px', color: '#92400E', lineHeight: '1.4' }}>
                          Contains {totalStops} aggregated order(s) across {totalHubs} merchant hub(s). Please accept this assignment before visiting vendors for collection.
                        </p>
                      </div>
                    </div>

                    {/* Quick Trip Metrics */}
                    <div className="mission-metrics-matrix">
                      <div className="m-metric-card">
                        <span className="m-metric-label">Total Cargo</span>
                        <span className="m-metric-val dl-tabular">{totalStops} Parcels</span>
                      </div>
                      <div className="m-metric-card">
                        <span className="m-metric-label">Route Corridor</span>
                        <span className="m-metric-val dl-tabular">{activeBatch?.totalDistanceKm || 3.8} km total</span>
                      </div>
                      <div className="m-metric-card">
                        <span className="m-metric-label">Est. Mission Time</span>
                        <span className="m-metric-val dl-tabular">{activeBatch?.estimatedTimeMins || 36} mins</span>
                      </div>
                      <div className="m-metric-card">
                        <span className="m-metric-label">Merchant Hubs</span>
                        <span className="m-metric-val dl-tabular">{totalHubs} Hub(s)</span>
                      </div>
                    </div>

                    {/* Single Focused Action Row */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await acceptBatch(activeBatch.batchId);
                          if (res?.success !== false) {
                            navigate('/delivery/pickup');
                          }
                        }}
                        style={{
                          flex: 2,
                          padding: '13px 18px',
                          background: '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '9px',
                          fontWeight: '700',
                          fontSize: '14.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
                        }}
                      >
                        <Check size={18} strokeWidth={2.5} /> Accept Assignment & Start Pickups
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectBatch(activeBatch.batchId)}
                        style={{
                          flex: 1,
                          padding: '13px 16px',
                          background: '#fff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '9px',
                          fontWeight: '600',
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <X size={16} /> Decline / Reassign
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* State 2 & 3: Dynamic Visual Pipeline Progress */}
                    <div className="mission-pipeline-tracker">
                      <div className="pipeline-stages-row">
                        <div className={`pipeline-stage ${isAllHubsCollected ? 'is-completed' : 'is-active'}`}>
                          <div className="stage-icon-circle">
                            {isAllHubsCollected ? <Check size={12} strokeWidth={2.5} /> : <Boxes size={12} />}
                          </div>
                          <div className="stage-text">
                            <span className="stage-name">Hub Pickups</span>
                            <span className="stage-detail">{collectedHubs} of {totalHubs} Hubs Secured</span>
                          </div>
                        </div>

                        <div className={`pipeline-connector ${isAllHubsCollected ? 'is-active' : ''}`} />

                        <div className={`pipeline-stage ${isAllHubsCollected && completedCount < totalStops ? 'is-active' : completedCount >= totalStops ? 'is-completed' : 'is-pending'}`}>
                          <div className="stage-icon-circle pulse-stage">
                            <Navigation size={12} />
                          </div>
                          <div className="stage-text">
                            <span className="stage-name">In Transit</span>
                            <span className="stage-detail">{activeBatch?.totalDistanceKm || 3.8} km Corridor</span>
                          </div>
                        </div>

                        <div className={`pipeline-connector ${completedCount > 0 ? 'is-active' : ''}`} />

                        <div className={`pipeline-stage ${completedCount >= totalStops ? 'is-completed' : completedCount > 0 ? 'is-active' : 'is-pending'}`}>
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

                    {/* Tactical Waypoint Target Card */}
                    {activeBatch.status === 'PICKUP_IN_PROGRESS' && nextHub ? (
                      /* Hub Pickup Target */
                      <div className="tactical-waypoint-card">
                        <div className="waypoint-header-strip">
                          <div className="waypoint-radar-tag">
                            <span className="dl-live-dot" />
                            <span>NEXT STOP TARGET • MERCHANT HUB PICKUP</span>
                          </div>
                          <div className="waypoint-eta-badge">
                            <Boxes size={13} />
                            <span>{nextHub.parcels || 1} package(s) to collect</span>
                          </div>
                        </div>

                        <div className="waypoint-content-grid">
                          <div className="waypoint-customer-details">
                            <div className="customer-avatar-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                              <Store size={20} />
                            </div>
                            <div className="customer-text-meta">
                              <h3 className="customer-name-heading">{nextHub.name}</h3>
                              <p className="customer-destination-addr">
                                <MapPin size={14} className="text-primary inline-icon" />
                                <span>{nextHub.address}</span>
                              </p>
                              <span className="customer-note-pill">
                                <AlertCircle size={12} /> Collect manifest packages from seller counter
                              </span>
                            </div>
                          </div>

                          <div className="waypoint-payment-box">
                            <div className="waypoint-prepaid-pill">
                              <CheckCircle2 size={13} className="text-emerald" />
                              <span>Hub Pickup Routine</span>
                            </div>
                            <span className="items-count-tag">{nextHub.parcels || 1} parcel(s) assigned</span>
                          </div>
                        </div>

                        <div className="waypoint-quick-action-bar">
                          <a href={`tel:${nextHub.phone || '+919840122334'}`} className="wp-action-btn btn-call" title="Call Merchant">
                            <Phone size={14} />
                            <span>Call Seller</span>
                          </a>
                          <a 
                            href={`https://wa.me/${String(nextHub.phone || '919840122334').replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="wp-action-btn btn-wa"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextHub.address || 'Chennai')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="wp-action-btn btn-nav"
                            title="Navigate to merchant"
                          >
                            <Navigation size={14} />
                            <span>Start Maps</span>
                            <ArrowUpRight size={13} />
                          </a>
                          <button 
                            type="button" 
                            className="wp-action-btn btn-details"
                            onClick={() => navigate('/delivery/pickup')}
                          >
                            <Boxes size={14} />
                            <span>Open Pickup Routine</span>
                          </button>
                        </div>
                      </div>
                    ) : nextStopOrder ? (
                      /* Doorstep Drop Target */
                      <div className="tactical-waypoint-card">
                        <div className="waypoint-header-strip">
                          <div className="waypoint-radar-tag">
                            <span className="dl-live-dot" />
                            <span>NEXT STOP TARGET • DROP #${dropNumber} OF ${totalStops}</span>
                          </div>
                          <div className="waypoint-eta-badge">
                            <Clock size={13} />
                            <span>ETA: {nextStopOrder.eta || '11:15 AM'} (6 min away)</span>
                          </div>
                        </div>

                        <div className="waypoint-content-grid">
                          <div className="waypoint-customer-details">
                            <div className="customer-avatar-box">
                              <span>{String(nextStopOrder.customerName || 'Customer').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="customer-text-meta">
                              <h3 className="customer-name-heading">{nextStopOrder.customerName || 'Customer'}</h3>
                              <p className="customer-destination-addr">
                                <MapPin size={14} className="text-primary inline-icon" />
                                <span>{nextStopOrder.address || 'Chennai'}</span>
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
                            <span className="items-count-tag">{nextStopOrder.items?.length || 1} package items</span>
                          </div>
                        </div>

                        {/* Quick Tactical Actions inside Waypoint */}
                        <div className="waypoint-quick-action-bar">
                          <a href={`tel:${nextStopOrder.customerPhone || '+919840233441'}`} className="wp-action-btn btn-call" title="Call customer">
                            <Phone size={14} />
                            <span>Call</span>
                          </a>
                          <a 
                            href={`https://wa.me/${String(nextStopOrder.customerPhone || '919840233441').replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="wp-action-btn btn-wa"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextStopOrder.address || 'Chennai')}`}
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
                    ) : null}

                    {/* Batch Metrics Matrix */}
                    <div className="mission-metrics-matrix">
                      <div className="m-metric-card">
                        <span className="m-metric-label">Total Cargo</span>
                        <span className="m-metric-val dl-tabular">{totalStops} Parcels</span>
                      </div>
                      <div className="m-metric-card">
                        <span className="m-metric-label">Route Corridor</span>
                        <span className="m-metric-val dl-tabular">{activeBatch?.totalDistanceKm || 3.8} km total</span>
                      </div>
                      <div className="m-metric-card">
                        <span className="m-metric-label">Est. Mission Time</span>
                        <span className="m-metric-val dl-tabular">{activeBatch?.estimatedTimeMins || 36} mins</span>
                      </div>
                      <div className="m-metric-card">
                        <span className="m-metric-label">Remaining Drops</span>
                        <span className="m-metric-val dl-tabular">{Math.max(0, totalStops - completedCount)} pending</span>
                      </div>
                    </div>

                    {/* Primary Mission Action Footer */}
                    <div className="mission-footer-action-row">
                      <button 
                        type="button" 
                        className="mission-cta-primary continue-mission-btn"
                        onClick={() => navigate(isAllHubsCollected ? '/delivery/status' : '/delivery/pickup')}
                      >
                        <PackageCheck size={18} />
                        <span>
                          {isAllHubsCollected 
                            ? `Complete Doorstep Drops (${totalStops - completedCount} pending)`
                            : `Open Merchant Pickups (${totalHubs - collectedHubs} hubs pending)`
                          }
                        </span>
                      </button>

                      <button
                        type="button"
                        className="mission-cta-secondary"
                        onClick={() => navigate('/delivery/status')}
                      >
                        <ShieldCheck size={16} />
                        <span>Delivery Status & OTP</span>
                      </button>
                    </div>
                  </>
                )}
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
                <span className="t-val dl-tabular">{shiftSummary?.hoursOnline || '5.4 hrs'}</span>
                <span className="t-subtext">Since 07:00 AM</span>
              </div>
              <div className="telemetry-cell">
                <span className="t-label">Distance Run</span>
                <span className="t-val dl-tabular">{shiftSummary?.distanceTraveledKm || 38.5} km</span>
                <span className="t-subtext">Avg 18.2 km/h</span>
              </div>
              <div className="telemetry-cell">
                <span className="t-label">Completed Drops</span>
                <span className="t-val dl-tabular">{shiftSummary?.ordersCompleted ?? completedCount} orders</span>
                <span className="t-subtext text-emerald">100% on-time</span>
              </div>
              <div className="telemetry-cell cell-earnings-highlight">
                <span className="t-label">Estimated Payout</span>
                <span className="t-val t-earnings dl-tabular">{shiftSummary?.estimatedEarnings || '₹850'}</span>
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
              <span className="feed-event-count dl-tabular">{(timeline || []).length} events logged</span>
            </div>

            <div className="feed-items-scroll">
              <DeliveryTimeline items={timeline || []} maxItems={6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
