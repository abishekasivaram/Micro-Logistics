import React, { useState } from 'react';
import { 
  Navigation, MapPin, Store, Clock, ArrowUp, ArrowDown, 
  ExternalLink, Compass, CheckCircle2, ChevronRight, AlertCircle, RotateCcw, Eye, Play
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import GoogleRouteMap from '../../components/common/GoogleRouteMap';
import './RoutePage.css';

const RoutePage = () => {
  const { activeBatch, orders, hasBatch, setSelectedOrderForDrawer, addToast } = useDelivery();

  // Initial sequence generator: Hub Pickups first, then Deliveries
  const generateInitialStops = () => {
    if (!activeBatch || !orders) return [];

    const hubStops = (activeBatch.hubs || []).map((h, idx) => ({
      id: `stop-hub-${h.id}`,
      type: 'pickup',
      title: h.name,
      address: h.address,
      eta: '09:00 AM',
      distanceKm: (1.2 + idx * 0.8).toFixed(1),
      status: h.status || 'COLLECTED',
      parcels: h.parcels || 2,
      lat: 13.0418 + idx * 0.005,
      lng: 80.2341 + idx * 0.005
    }));

    const deliveryStops = orders.map((o, idx) => ({
      id: `stop-deliv-${o.id}`,
      type: 'delivery',
      title: o.customerName,
      address: o.address,
      eta: o.eta || `11:${15 + idx * 20} AM`,
      distanceKm: (2.1 + idx * 0.7).toFixed(1),
      status: o.status,
      codAmount: o.codAmount,
      orderRef: o,
      lat: o.lat || 13.0441 + idx * 0.004,
      lng: o.lng || 80.2392 - idx * 0.004
    }));

    return [...hubStops, ...deliveryStops];
  };

  const [stops, setStops] = useState(generateInitialStops);
  const [activeStopIndex, setActiveStopIndex] = useState(2); // Current Stop index

  if (!hasBatch || !activeBatch || stops.length === 0) {
    return (
      <div className="dl-route-page">
        <PageHeader
          breadcrumbs={['Operations', 'GPS']}
          title="Delivery Route"
          subtitle="Sequential navigation mesh & multi-stop route planner"
        />
        <EmptyState
          icon={Navigation}
          title="No route assigned yet"
          description="Your optimized route sequence will automatically generate when dispatch assigns a delivery batch."
        />
      </div>
    );
  }

  // Move stop up in sequence
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newStops = [...stops];
    const temp = newStops[index];
    newStops[index] = newStops[index - 1];
    newStops[index - 1] = temp;
    setStops(newStops);
    addToast('Route sequence updated and re-optimized', 'info');
  };

  // Move stop down in sequence
  const handleMoveDown = (index) => {
    if (index >= stops.length - 1) return;
    const newStops = [...stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + 1];
    newStops[index + 1] = temp;
    setStops(newStops);
    addToast('Route sequence updated and re-optimized', 'info');
  };

  // Launch Google Maps turn-by-turn navigation for current stop
  const handleStartNavigation = (stop) => {
    const targetStop = stop || stops[activeStopIndex] || stops[0];
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(targetStop.address || 'Chennai')}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const currentStop = stops[activeStopIndex] || stops[0];
  const totalDistance = stops.reduce((acc, s) => acc + parseFloat(s.distanceKm || 0), 0).toFixed(1);

  return (
    <div className="dl-route-page">
      <PageHeader
        breadcrumbs={['Operations', 'GPS']}
        title="Delivery Route"
        subtitle={`Batch ${activeBatch.batchId} • ${stops.length} Total Waypoints (${totalDistance} km)`}
        badge="Live Navigation Ready"
        actions={
          <button
            type="button"
            className="dl-btn dl-btn-primary start-nav-btn"
            onClick={() => handleStartNavigation(currentStop)}
          >
            <Navigation size={16} />
            <span>Start Navigation (Google Maps)</span>
            <ExternalLink size={13} className="ml-1 opacity-70" />
          </button>
        }
      />

      {/* Route Split Layout: Left Stop List, Right Interactive Map */}
      <div className="route-split-layout">
        {/* Left Column: Ordered Stop List with Reordering */}
        <div className="route-stops-column">
          {/* Summary Strip Card */}
          <div className="dl-card route-summary-card">
            <div className="route-summary-item">
              <span className="summary-label">Total Distance</span>
              <span className="summary-val dl-tabular">{totalDistance} km</span>
            </div>
            <div className="route-summary-item">
              <span className="summary-label">Estimated Route Time</span>
              <span className="summary-val dl-tabular">{activeBatch.estimatedTimeMins} mins</span>
            </div>
            <div className="route-summary-item">
              <span className="summary-label">Current Waypoint</span>
              <span className="summary-val text-primary dl-tabular">#{activeStopIndex + 1} of {stops.length}</span>
            </div>
          </div>

          {/* Sequential Waypoint Cards */}
          <div className="stops-sequence-list">
            {stops.map((stop, index) => {
              const isCurrent = index === activeStopIndex;
              const isCompleted = stop.status === 'DELIVERED' || stop.status === 'COLLECTED';
              const isPickup = stop.type === 'pickup';

              return (
                <div
                  key={stop.id}
                  className={`dl-card stop-waypoint-card ${isCurrent ? 'is-current' : ''} ${isCompleted ? 'is-completed' : ''}`}
                  onClick={() => {
                    setActiveStopIndex(index);
                    if (stop.orderRef) setSelectedOrderForDrawer(stop.orderRef);
                  }}
                >
                  {/* Waypoint Number Pill */}
                  <div className={`waypoint-badge ${isCurrent ? 'badge-current' : isCompleted ? 'badge-completed' : 'badge-pending'}`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                  </div>

                  {/* Waypoint Main Info */}
                  <div className="waypoint-info-col">
                    <div className="waypoint-header-row">
                      <span className={`waypoint-type-tag ${isPickup ? 'type-pickup' : 'type-delivery'}`}>
                        {isPickup ? <Store size={12} /> : <MapPin size={12} />}
                        <span>{isPickup ? 'Merchant Hub' : 'Delivery Drop'}</span>
                      </span>

                      {isCurrent && (
                        <span className="current-pulse-badge">
                          <span className="dl-live-dot" /> NEXT STOP
                        </span>
                      )}

                      <span className="waypoint-eta dl-tabular">
                        <Clock size={12} /> {stop.eta}
                      </span>
                    </div>

                    <h4 className="waypoint-title">{stop.title}</h4>
                    <p className="waypoint-address">{stop.address}</p>

                    <div className="waypoint-meta-strip">
                      <span className="meta-distance dl-tabular">+{stop.distanceKm} km from prev</span>
                      {stop.codAmount > 0 && (
                        <span className="meta-cod dl-tabular">₹{stop.codAmount} COD</span>
                      )}
                    </div>
                  </div>

                  {/* Reorder Up/Down & Nav Actions */}
                  <div className="waypoint-reorder-actions" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      className="reorder-arrow-btn"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Move Up in Route"
                      aria-label="Move Up in Route"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="reorder-arrow-btn"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === stops.length - 1}
                      title="Move Down in Route"
                      aria-label="Move Down in Route"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tactical Map View */}
        <div className="route-map-column">
          <div className="dl-card route-map-card">
            <div className="map-card-header">
              <div className="map-title-group">
                <Compass size={18} className="text-primary" />
                <span className="map-title dl-heading">Tactical Dispatch Map</span>
              </div>
              <span className="map-active-target">
                Target: {currentStop.title}
              </span>
            </div>

            <div className="interactive-map-frame">
              <GoogleRouteMap
                activeBatch={activeBatch}
                stops={stops}
                activeStopIndex={activeStopIndex}
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePage;
