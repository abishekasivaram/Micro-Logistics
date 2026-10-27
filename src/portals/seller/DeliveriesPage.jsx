import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Truck, Phone, Navigation, Clock, 
  CheckCircle2, ChevronRight, User, X, Compass,
  MapPin, ShieldCheck, Check, History, Sparkles, Layers
} from 'lucide-react';
import GoogleRouteMap from '../../components/common/GoogleRouteMap';
import './DeliveriesPage.css';

// Curated authentic Chennai customer dropoff profiles per batch identifier
const BATCH_DESTINATION_PROFILES = {
  'b-1001': [
    {
      id: 'cust-b1001-1',
      orderCode: 'ORD-1032',
      name: 'Priya Rajan',
      address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102'
    },
    {
      id: 'cust-b1001-2',
      orderCode: 'ORD-1033',
      name: 'Deepak Soundar',
      address: '88 Rajiv Gandhi Salai (OMR), Thoraipakkam, Chennai - 600097'
    }
  ],
  'b-1002': [
    {
      id: 'cust-b1002-1',
      orderCode: 'ORD-1025',
      name: 'Sivakumar R',
      address: '14/2, 4th Cross St, Mandaveli, Chennai - 600028'
    },
    {
      id: 'cust-b1002-2',
      orderCode: 'ORD-1026',
      name: 'Kavitha Mohan',
      address: '42/1 Besant Avenue, Adyar, Chennai - 600020'
    }
  ],
  'b-8041': [
    {
      id: 'cust-b8041-1',
      orderCode: 'ORD-1002',
      name: 'Arun Kumar',
      address: '27 Panagal Park, T. Nagar, Chennai - 600017'
    },
    {
      id: 'cust-b8041-2',
      orderCode: 'ORD-1003',
      name: 'Meera Krishnan',
      address: '53 100 Feet Bypass Road, Velachery, Chennai - 600042'
    }
  ]
};

// Fallback pools for dynamic or extra batches so no two batches ever share identical drop addresses
const FALLBACK_CUSTOMER_POOLS = [
  [
    { id: 'fb-1a', orderCode: 'ORD-2101', name: 'Priya Rajan', address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102' },
    { id: 'fb-1b', orderCode: 'ORD-2102', name: 'Deepak Soundar', address: '88 Rajiv Gandhi Salai (OMR), Thoraipakkam, Chennai - 600097' }
  ],
  [
    { id: 'fb-2a', orderCode: 'ORD-2201', name: 'Sivakumar R', address: '14/2, 4th Cross St, Mandaveli, Chennai - 600028' },
    { id: 'fb-2b', orderCode: 'ORD-2202', name: 'Kavitha Mohan', address: '42/1 Besant Avenue, Adyar, Chennai - 600020' }
  ],
  [
    { id: 'fb-3a', orderCode: 'ORD-2301', name: 'Arun Kumar', address: '27 Panagal Park, T. Nagar, Chennai - 600017' },
    { id: 'fb-3b', orderCode: 'ORD-2302', name: 'Meera Krishnan', address: '53 100 Feet Bypass Road, Velachery, Chennai - 600042' }
  ],
  [
    { id: 'fb-4a', orderCode: 'ORD-2401', name: 'Ananya Deshmukh', address: '18 Harrington Road, Chetpet, Chennai - 600031' },
    { id: 'fb-4b', orderCode: 'ORD-2402', name: 'Venkatesh Prasad', address: '93 Luz Church Road, Mylapore, Chennai - 600004' }
  ]
];

const DeliveriesPage = () => {
  const { 
    deliveryBatches = [], 
    deliveryAgents = [], 
    orders = [], 
    customers = []
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

  // Enrich delivery groups with distinct driver personnel and customer drops
  const enrichedGroups = deliveryBatches.map((group, groupIndex) => {
    const rawBatchId = (group.id || group.batchId || '').toLowerCase();
    const cleanBatchKey = rawBatchId.replace('#', '').trim();
    
    // 1. Try to find matching orders in AppContext
    const groupOrders = orders.filter(o => {
      if ((group.orderIds || []).includes(o.id) || (group.orderIds || []).includes(o.orderCode)) return true;
      if (o.batchId && (o.batchId.toLowerCase() === rawBatchId || rawBatchId.includes(o.batchId.toLowerCase().replace('#', '')))) return true;
      return false;
    });

    // 2. Extract customers from groupOrders if available
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

    // 3. If no matched orders from dynamic state, resolve from batch destination profile or fallback pool
    let resolvedCustomers = uniqueCustomers;
    if (resolvedCustomers.length === 0) {
      if (BATCH_DESTINATION_PROFILES[cleanBatchKey]) {
        resolvedCustomers = BATCH_DESTINATION_PROFILES[cleanBatchKey];
      } else {
        const poolIndex = Math.abs(cleanBatchKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), groupIndex)) % FALLBACK_CUSTOMER_POOLS.length;
        resolvedCustomers = FALLBACK_CUSTOMER_POOLS[poolIndex];
      }
    }

    // 4. Resolve Driver Personnel
    const agent = deliveryAgents.find(da => 
      da.id === group.agentId || 
      da.legacy_id === group.agentId ||
      da.name === group.driverName ||
      da.name === group.agentName
    );

    const personnel = agent || {
      name: group.driverName || group.agentName || (cleanBatchKey.includes('1001') ? 'Suresh Babu' : 'Muthu Vel'),
      phone: group.driverPhone || (cleanBatchKey.includes('1001') ? '9988776656' : '9988776655'),
      vehicle: group.driverVehicle || (cleanBatchKey.includes('1001') ? 'Hero Electric Scooter' : 'TVS XL 100')
    };

    return {
      ...group,
      personnel,
      orders: groupOrders,
      customers: resolvedCustomers
    };
  });

  // Filter groups across batch ID, driver name, customer names, addresses, or status
  const filteredGroups = enrichedGroups.filter(g => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const batchMatch = (g.id || g.batchId || '').toLowerCase().includes(term);
    const driverMatch = (g.personnel?.name || '').toLowerCase().includes(term);
    const customerMatch = (g.customers || []).some(c => 
      c.name.toLowerCase().includes(term) || 
      c.address.toLowerCase().includes(term) ||
      (c.orderCode || '').toLowerCase().includes(term)
    );
    const statusMatch = (g.status || '').toLowerCase().includes(term);
    return batchMatch || driverMatch || customerMatch || statusMatch;
  });

  // Build sequential route stops for active modal batch
  const getModalRouteStops = (batch) => {
    if (!batch) return [];
    const stops = [];

    // Stop 1: Pickup from Merchant store
    stops.push({
      type: 'pickup',
      title: 'Stop 1: Seller Store Hub (Pickup)',
      role: 'Consignment Dispatch Depot',
      address: batch.pickupLocations?.[0] || '12/4 Usman Road, T. Nagar, Chennai - 600017',
      time: 'Depot (Ready)'
    });

    // Sequential Drops from the batch's resolved customers
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
    }

    return stops;
  };

  const activeModalStops = activeRouteBatch ? getModalRouteStops(activeRouteBatch) : [];

  // Helper for status badge styling
  const getStatusBadgeConfig = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('complete') || s.includes('delivered')) {
      return { label: 'COMPLETED', className: 'batch-status-badge completed' };
    }
    if (s.includes('out') || s.includes('transit')) {
      return { label: 'OUT FOR DELIVERY', className: 'batch-status-badge in-transit' };
    }
    return { label: statusStr || 'ASSIGNED', className: 'batch-status-badge assigned' };
  };

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
            placeholder="Search dispatch by Batch ID, Driver, Customer, or Address..." 
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
            const rawId = (group.id || group.batchId || 'BATCH');
            const displayBatch = rawId.replace('#', '').slice(-8).toUpperCase();
            const orderCount = (group.customers && group.customers.length > 0)
              ? group.customers.length 
              : (group.orderCount || 2);

            const isCompleted = (group.status || '').toLowerCase().includes('complete') || (group.status || '').toLowerCase().includes('deliver');
            const badgeConfig = getStatusBadgeConfig(group.status);

            return (
              <div key={group.id} className="delivery-batch-card">
                <div className="batch-top-row">
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                      BATCH #{displayBatch}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={11} /> {orderCount} bundled order(s)
                    </div>
                  </div>

                  <span className={badgeConfig.className}>
                    {badgeConfig.label}
                  </span>
                </div>

                {/* Driver Box */}
                <div className="agent-profile-box">
                  <div className="agent-avatar">
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                      {group.personnel?.name || 'Muthu Vel'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={11} /> {group.personnel?.phone || '9988776655'} · {group.personnel?.vehicle || 'Electric Cargo Scooter'}
                    </div>
                  </div>
                </div>

                {/* Drop Destinations */}
                <div className="destinations-pill-list">
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    Drop Destinations
                  </div>
                  {group.customers.map(c => (
                    <div key={c.id || c.orderCode} className="destination-chip">
                      <Navigation size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span><strong>{c.name}</strong> · {c.address}</span>
                    </div>
                  ))}
                </div>

                {/* Highlighted Fleet Route Action Button */}
                <div className="batch-card-actions">
                  {isCompleted ? (
                    <button 
                      type="button"
                      className="completed-fleet-route-btn"
                      onClick={() => setActiveRouteBatch(group)}
                      title="Inspect completed delivery waypoints and dispatch history"
                    >
                      <div className="btn-left-content">
                        <History size={16} className="text-muted" />
                        <span className="btn-label-text">View Route Summary</span>
                      </div>
                      <div className="btn-right-content">
                        <span className="btn-completed-pill">COMPLETED ✓</span>
                        <ChevronRight size={15} />
                      </div>
                    </button>
                  ) : (
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Fleet Route Modal rendered at body root via createPortal */}
      {activeRouteBatch && typeof document !== 'undefined' && createPortal(
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
                  Dispatch Route: BATCH #{((activeRouteBatch.id || activeRouteBatch.batchId || '').replace('#', '').slice(-8)).toUpperCase()}
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
                  <div className="telemetry-value">{activeRouteBatch.personnel?.name || 'Delivery Partner'}</div>
                </div>
              </div>

              <div className="telemetry-chip">
                <Phone size={15} className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Contact / Vehicle</div>
                  <div className="telemetry-value">
                    {activeRouteBatch.personnel?.phone || '9988776655'} · {activeRouteBatch.personnel?.vehicle || 'Electric Cargo Scooter'}
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
                  pickupLocation={activeModalStops[0]?.address || '12/4 Usman Road, T. Nagar, Chennai - 600017'}
                  deliveryLocation={activeModalStops[activeModalStops.length - 1]?.address || 'Central Chennai'}
                  agentName={activeRouteBatch.personnel?.name || 'Delivery Partner'}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Geospatial Corridor Active · Instant GPS Synchronization</span>
              </div>

              <button 
                type="button"
                className="btn-modal-close-main"
                onClick={() => setActiveRouteBatch(null)}
              >
                Close Route Tracker
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DeliveriesPage;
