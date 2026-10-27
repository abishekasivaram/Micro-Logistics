import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Map as MapIcon, Truck, Phone, Navigation, Clock, 
  CheckCircle2, ChevronRight, User, X, Compass, ExternalLink, 
  Route as RouteIcon, MapPin, ShieldCheck, ArrowRight
} from 'lucide-react';
import GoogleRouteMap from '../../components/common/GoogleRouteMap';
import './DeliveriesPage.css';

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const { 
    deliveryBatches = [], 
    deliveryAgents = [], 
    orders = [], 
    customers = [], 
    currentUser 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeRouteBatch, setActiveRouteBatch] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveRouteBatch(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enrich delivery groups
  const enrichedGroups = deliveryBatches.map(group => {
    const batchIdStr = (group.id || group.batchId || '').toLowerCase();
    
    // Match orders either by orderIds array or by order.batchId matching group.id
    const groupOrders = orders.filter(o => {
      if ((group.orderIds || []).includes(o.id)) return true;
      if (o.batchId && (o.batchId.toLowerCase() === batchIdStr || batchIdStr.includes(o.batchId.toLowerCase().replace('#', '')))) return true;
      return false;
    });

    const agent = deliveryAgents.find(da => 
      da.id === group.agentId || 
      da.legacy_id === group.agentId ||
      da.name === group.driverName
    );
    
    // Extract unique customers
    const uniqueCustomers = [];
    groupOrders.forEach((o, idx) => {
      const foundCustomer = customers.find(cust => cust.id === o.customerId || cust.name === o.customerName);
      const c = {
        id: o.customerId || o.id,
        orderCode: o.id || o.orderCode || `ORD-98${idx}`,
        name: o.customerName || foundCustomer?.name || 'Local Customer',
        address: o.deliveryLocation || o.deliveryAddress || foundCustomer?.address || `Plot ${10 + idx * 14}, Sector ${idx + 1}, Chennai`
      };
      if (!uniqueCustomers.some(existing => existing.name === c.name)) {
        uniqueCustomers.push(c);
      }
    });
    
    return {
      ...group,
      personnel: agent || (group.driverName ? { name: group.driverName, phone: group.driverPhone || '+91 98401 23456', vehicle: 'Electric Cargo Scooter' } : null),
      orders: groupOrders,
      customers: uniqueCustomers
    };
  });

  const filteredGroups = enrichedGroups.filter(g => 
    (g.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (g.personnel && g.personnel.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Build sequential route stops for active modal batch
  const getModalRouteStops = (batch) => {
    if (!batch) return [];
    const stops = [];

    // Stop 1: Pickup from Merchant store
    stops.push({
      type: 'pickup',
      title: 'Stop 1: Seller Store Hub (Pickup)',
      role: 'Consignment Dispatch Depot',
      address: batch.pickupLocations?.[0] || '12 T. Nagar Main Rd, Chennai - 600017',
      time: 'Depot (Ready)'
    });

    // Sequential Drops
    if (batch.customers && batch.customers.length > 0) {
      batch.customers.forEach((c, idx) => {
        stops.push({
          type: 'drop',
          title: `Stop ${idx + 2}: ${c.name}`,
          role: `Delivery Dropoff (${c.orderCode || `Order #${idx + 1}`})`,
          address: c.address,
          time: `~${15 + idx * 12} mins`
        });
      });
    } else {
      // Realistic default drops if batch has no explicit customers array
      stops.push({
        type: 'drop',
        title: 'Stop 2: Sivakumar R',
        role: 'Delivery Dropoff (ORD-B041A)',
        address: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
        time: '~18 mins'
      });
      stops.push({
        type: 'drop',
        title: 'Stop 3: Kavitha Mohan',
        role: 'Delivery Dropoff (ORD-B041B)',
        address: '42/1 Besant Avenue, Adyar, Chennai - 600020',
        time: '~30 mins'
      });
    }

    return stops;
  };

  const activeModalStops = activeRouteBatch ? getModalRouteStops(activeRouteBatch) : [];

  return (
    <div className="deliveries-page">
      {/* Header */}
      <div className="deliveries-header-row">
        <div>
          <div className="orders-title-badge">
            <Truck size={12} /> Fleet Tracking
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            Active Delivery Dispatches
          </h1>
          <p className="page-subtitle">
            Track micro-logistics batches, assigned delivery partners, and live drop-offs for your store.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon-left" />
          <input 
            type="text" 
            placeholder="Search dispatch by Batch ID or Driver name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Batches Grid */}
      {filteredGroups.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">
            <Truck size={28} />
          </div>
          <h3 className="orders-empty-title">No active dispatch runs</h3>
          <p className="orders-empty-desc">
            When customer orders are aggregated into delivery runs, you can monitor the driver assignments here.
          </p>
        </div>
      ) : (
        <div className="deliveries-grid">
          {filteredGroups.map(group => {
            const displayBatch = (group.id || group.batchId || 'BATCH').slice(-8).toUpperCase();
            const orderCount = group.orders.length > 0 ? group.orders.length : (group.customers.length > 0 ? group.customers.length : 2);

            return (
              <div key={group.id} className="delivery-batch-card">
                <div className="batch-top-row">
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', fontSize: '15px' }}>
                      BATCH #{displayBatch}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {orderCount} bundled order(s)
                    </div>
                  </div>

                  <span className="order-status-badge status-badge-ready">
                    {group.status || 'Out for Delivery'}
                  </span>
                </div>

                {/* Driver Box */}
                <div className="agent-profile-box">
                  <div className="agent-avatar">
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>
                      {group.personnel?.name || 'David Anand'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} /> {group.personnel?.phone || '9840123456'} · {group.personnel?.vehicle || 'Electric Cargo Scooter'}
                    </div>
                  </div>
                </div>

                {/* Destinations */}
                <div className="destinations-pill-list">
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Drop Destinations
                  </div>
                  {group.customers.length === 0 ? (
                    <>
                      <div className="destination-chip">
                        <Navigation size={12} color="var(--primary)" />
                        <span><strong>Sivakumar R</strong> · 14/2, 4th Cross St, Mandaveli, Chennai - 600028</span>
                      </div>
                      <div className="destination-chip">
                        <Navigation size={12} color="var(--primary)" />
                        <span><strong>Kavitha Mohan</strong> · 42/1 Besant Avenue, Adyar, Chennai - 600020</span>
                      </div>
                    </>
                  ) : (
                    group.customers.map(c => (
                      <div key={c.id} className="destination-chip">
                        <Navigation size={12} color="var(--primary)" />
                        <span><strong>{c.name}</strong> · {c.address}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Highlighted Fleet Route Action Button */}
                <div className="batch-card-actions">
                  <button 
                    type="button"
                    className="highlight-fleet-route-btn"
                    onClick={() => setActiveRouteBatch(group)}
                    title="View live GPS corridor, driver location & dropoff stops"
                  >
                    <div className="btn-left-content">
                      <span className="btn-beacon-dot" />
                      <Compass size={16} className="compass-icon-spin" />
                      <span className="btn-label-text">View Fleet Route</span>
                    </div>
                    <div className="btn-right-content">
                      <span className="btn-live-pill">LIVE ROUTE</span>
                      <ChevronRight size={15} className="btn-chevron-slide" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Fleet Route Modal */}
      {activeRouteBatch && (
        <div 
          className="fleet-route-modal-backdrop" 
          onClick={() => setActiveRouteBatch(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="fleet-route-modal-card" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="fleet-route-modal-header">
              <div className="header-title-area">
                <div className="badge-route-status">
                  <span className="live-pulse-dot" /> LIVE FLEET GPS CORRIDOR
                </div>
                <h2 className="modal-batch-heading">
                  Dispatch Route: BATCH #{((activeRouteBatch.id || activeRouteBatch.batchId || '').slice(-8)).toUpperCase()}
                </h2>
                <p className="modal-batch-sub">
                  Real-time geographic waypoint progression, store pickup, and consolidated customer deliveries.
                </p>
              </div>
              <button 
                type="button"
                className="modal-close-btn" 
                onClick={() => setActiveRouteBatch(null)}
                title="Close Route Tracker (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Telemetry Bar */}
            <div className="fleet-route-telemetry-bar">
              <div className="telemetry-chip">
                <User size={15} className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Assigned Courier</div>
                  <div className="telemetry-value">{activeRouteBatch.personnel?.name || 'David Anand'}</div>
                </div>
              </div>

              <div className="telemetry-chip">
                <Phone size={15} className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Contact / Vehicle</div>
                  <div className="telemetry-value">
                    {activeRouteBatch.personnel?.phone || '9840123456'} · {activeRouteBatch.personnel?.vehicle || 'Electric Cargo Scooter'}
                  </div>
                </div>
              </div>

              <div className="telemetry-chip">
                <Clock size={15} className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Est. Mission Time</div>
                  <div className="telemetry-value">~28 mins (4.8 km)</div>
                </div>
              </div>

              <div className="telemetry-chip">
                <Navigation size={15} className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Corridor Status</div>
                  <div className="telemetry-value" style={{ color: 'var(--success, #10b981)', fontWeight: '700' }}>
                    {activeRouteBatch.status || 'Out for Delivery'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Map + Stops Side-by-Side */}
            <div className="fleet-route-modal-body">
              {/* Map Embed Column */}
              <div className="modal-map-viewport">
                <GoogleRouteMap 
                  stops={activeModalStops}
                  pickupLocation={activeModalStops[0]?.address || '12 T. Nagar Main Rd, Chennai'}
                  deliveryLocation={activeModalStops[activeModalStops.length - 1]?.address || '42/1 Besant Avenue, Adyar, Chennai'}
                  agentName={activeRouteBatch.personnel?.name || 'David Anand'}
                  status={activeRouteBatch.status || 'Out for Delivery'}
                  estimatedTime="28 mins"
                />
              </div>

              {/* Waypoint Stops Column */}
              <div className="modal-stops-panel">
                <div className="stops-panel-header">
                  <div className="stops-panel-title">
                    <Compass size={16} color="var(--primary)" />
                    <span>Sequential Stops ({activeModalStops.length})</span>
                  </div>
                  <span className="stops-eta-summary">Total ETA ~28m</span>
                </div>

                <div className="modal-stops-list">
                  {activeModalStops.map((stop, sIdx) => (
                    <div key={sIdx} className={`modal-stop-card ${stop.type}`}>
                      <div className="stop-badge-num">
                        {stop.type === 'pickup' ? (
                          <MapPin size={12} />
                        ) : (
                          <span>{sIdx}</span>
                        )}
                      </div>
                      <div className="stop-details">
                        <div className="stop-name-row">
                          <span className="stop-name">{stop.title}</span>
                          <span className="stop-eta">{stop.time}</span>
                        </div>
                        <div className="stop-role">{stop.role}</div>
                        <div className="stop-address">{stop.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="fleet-route-modal-footer">
              <button 
                type="button"
                className="btn-modal-fullscreen"
                onClick={() => {
                  navigate('/seller/routes', { state: { batchId: activeRouteBatch.id } });
                  setActiveRouteBatch(null);
                }}
              >
                <ExternalLink size={14} /> Open Fullscreen Mission Control
              </button>

              <button 
                type="button"
                className="btn-modal-close-main"
                onClick={() => setActiveRouteBatch(null)}
              >
                Close Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
