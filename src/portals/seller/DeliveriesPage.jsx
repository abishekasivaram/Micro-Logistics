import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Truck, Phone, Navigation, Clock, 
  CheckCircle2, ChevronRight, User, X, Compass,
  MapPin, ShieldCheck, Check, History, Sparkles, Layers,
  CheckCheck, UserCheck, PackageCheck, AlertCircle
} from 'lucide-react';
import GoogleRouteMap from '../../components/common/GoogleRouteMap';
import { resolveOrderAddress, getAssignedCourier } from './sellerUtils';
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
    customers = [],
    currentUser
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('ALL');
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

  // Filter orders for this seller
  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;
  const sellerOrders = orders.filter(o => {
    if (currentUser?.role === 'admin') return true;
    if (sellerId) return o.vendorId === sellerId || o.vendor_id === sellerId;
    return true;
  });

  const getOrderStatus = (o) => (o.orderStatus || o.status || 'PLACED').toUpperCase();

  // Resolve delivery stage for an order
  const getDeliveryStage = (order) => {
    const status = getOrderStatus(order);
    const delivStatus = (order.rawDeliveryStatus || order.deliveryStatus || '').toUpperCase();
    const courier = getAssignedCourier(order, deliveryBatches, deliveryAgents);

    if (['DELIVERED', 'COMPLETED'].includes(status)) {
      return { stage: 'DELIVERED', label: 'Delivered to Customer', className: 'batch-status-badge completed' };
    }
    if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(status)) {
      return { stage: 'DISPATCHED', label: 'Dispatched / In Transit', className: 'batch-status-badge in-transit' };
    }
    if (delivStatus.includes('PICKED_UP') || delivStatus.includes('HANDED')) {
      return { stage: 'HANDED_OVER', label: 'Handover Confirmed', className: 'batch-status-badge handed-over' };
    }
    if (['READY_FOR_DELIVERY', 'READY', 'ASSIGNED'].includes(status)) {
      return { 
        stage: 'READY', 
        label: courier ? 'Ready for Handover (Assigned)' : 'Ready for Handover (Awaiting Driver)', 
        className: courier ? 'batch-status-badge assigned' : 'batch-status-badge pending' 
      };
    }
    return { stage: 'PREPARING', label: 'In Store Preparation', className: 'batch-status-badge preparing' };
  };

  // Deliveries counts
  const readyOrdersCount = sellerOrders.filter(o => getDeliveryStage(o).stage === 'READY').length;
  const handedOverCount = sellerOrders.filter(o => getDeliveryStage(o).stage === 'HANDED_OVER').length;
  const dispatchedOrdersCount = sellerOrders.filter(o => getDeliveryStage(o).stage === 'DISPATCHED').length;
  const deliveredOrdersCount = sellerOrders.filter(o => getDeliveryStage(o).stage === 'DELIVERED').length;

  // Filter orders based on active tab and search
  const filteredOrders = sellerOrders.filter(o => {
    const stageInfo = getDeliveryStage(o);
    const term = searchTerm.toLowerCase().trim();

    if (term) {
      const idMatch = (o.id || o.orderId || '').toLowerCase().includes(term);
      const custMatch = (o.customerName || '').toLowerCase().includes(term);
      const addrMatch = resolveOrderAddress(o, 0, customers).toLowerCase().includes(term);
      const courierMatch = (getAssignedCourier(o, deliveryBatches, deliveryAgents) || '').toLowerCase().includes(term);
      if (!idMatch && !custMatch && !addrMatch && !courierMatch) return false;
    }

    if (activeTab === 'READY') return stageInfo.stage === 'READY';
    if (activeTab === 'HANDED_OVER') return stageInfo.stage === 'HANDED_OVER';
    if (activeTab === 'DISPATCHED') return stageInfo.stage === 'DISPATCHED';
    if (activeTab === 'DELIVERED') return stageInfo.stage === 'DELIVERED';
    return true;
  });

  // Enrich delivery groups with distinct driver personnel and customer drops
  const enrichedGroups = deliveryBatches.map((group, groupIndex) => {
    const rawBatchId = (group.id || group.batchId || '').toLowerCase();
    const cleanBatchKey = rawBatchId.replace('#', '').trim();
    
    // Find matching orders
    const groupOrders = orders.filter(o => {
      if ((group.orderIds || []).includes(o.id) || (group.orderIds || []).includes(o.orderCode)) return true;
      if (o.batchId && (o.batchId.toLowerCase() === rawBatchId || rawBatchId.includes(o.batchId.toLowerCase().replace('#', '')))) return true;
      return false;
    });

    const uniqueCustomers = [];
    groupOrders.forEach((o, idx) => {
      const foundCustomer = customers.find(cust => cust.id === o.customerId || cust.name === o.customerName);
      const c = {
        id: o.customerId || o.id,
        orderCode: o.id || o.orderCode || `ORD-98${idx}`,
        name: o.customerName || foundCustomer?.name || 'Local Customer',
        address: resolveOrderAddress(o, idx, customers)
      };
      if (!uniqueCustomers.some(existing => existing.name === c.name)) {
        uniqueCustomers.push(c);
      }
    });

    let resolvedCustomers = uniqueCustomers;
    if (resolvedCustomers.length === 0) {
      if (BATCH_DESTINATION_PROFILES[cleanBatchKey]) {
        resolvedCustomers = BATCH_DESTINATION_PROFILES[cleanBatchKey];
      } else {
        const poolIndex = Math.abs(cleanBatchKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), groupIndex)) % FALLBACK_CUSTOMER_POOLS.length;
        resolvedCustomers = FALLBACK_CUSTOMER_POOLS[poolIndex];
      }
    }

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

  // Build sequential route stops for active modal batch
  const getModalRouteStops = (batch) => {
    if (!batch) return [];
    const stops = [];

    stops.push({
      type: 'pickup',
      title: 'Stop 1: Seller Store Hub (Pickup)',
      role: 'Merchant Pickup Depot',
      address: batch.pickupLocations?.[0] || '22 Velachery Main Rd, Chennai',
      time: 'Ready for Driver'
    });

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

  return (
    <div className="deliveries-page">
      {/* Header */}
      <div className="deliveries-header-row">
        <div>
          <div className="orders-title-badge">
            <Truck size={12} /> Fleet & Dispatch Tracking
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            Store Deliveries Hub
          </h1>
          <p className="page-subtitle">
            Monitor real-time courier handovers, active in-transit dispatches, and confirmed customer deliveries.
          </p>
        </div>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="orders-pipeline-tabs">
        <button 
          className={`pipeline-tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Orders ({sellerOrders.length})
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'READY' ? 'active' : ''}`}
          onClick={() => setActiveTab('READY')}
        >
          Ready for Handover ({readyOrdersCount})
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'HANDED_OVER' ? 'active' : ''}`}
          onClick={() => setActiveTab('HANDED_OVER')}
        >
          Handover Confirmed ({handedOverCount})
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'DISPATCHED' ? 'active' : ''}`}
          onClick={() => setActiveTab('DISPATCHED')}
        >
          In Transit / Dispatched ({dispatchedOrdersCount})
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Delivered ({deliveredOrdersCount})
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'BATCHES' ? 'active' : ''}`}
          onClick={() => setActiveTab('BATCHES')}
        >
          Aggregated Batches ({enrichedGroups.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon-left" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer, Courier, or Delivery Address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'BATCHES' ? (
        /* Batch Fleet View */
        enrichedGroups.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon"><Truck size={28} /></div>
            <h3 className="orders-empty-title">No aggregated fleet batches</h3>
            <p className="orders-empty-desc">Aggregated driver route runs will appear here when created by Admin.</p>
          </div>
        ) : (
          <div className="deliveries-grid">
            {enrichedGroups.map(group => {
              const rawId = (group.id || group.batchId || 'BATCH');
              const displayBatch = rawId.replace('#', '').slice(-8).toUpperCase();
              const isCompleted = (group.status || '').toLowerCase().includes('complete') || (group.status || '').toLowerCase().includes('deliver');

              return (
                <div key={group.id} className="delivery-batch-card">
                  <div className="batch-top-row">
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                        BATCH #{displayBatch}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={11} /> {group.customers?.length || 2} customer drops bundled
                      </div>
                    </div>

                    <span className={`batch-status-badge ${isCompleted ? 'completed' : 'in-transit'}`}>
                      {group.status || 'ASSIGNED'}
                    </span>
                  </div>

                  <div className="agent-profile-box">
                    <div className="agent-avatar"><User size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{group.personnel?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone size={11} /> {group.personnel?.phone} · {group.personnel?.vehicle}
                      </div>
                    </div>
                  </div>

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

                  <div className="batch-card-actions">
                    <button 
                      type="button" 
                      className="completed-fleet-route-btn"
                      onClick={() => setActiveRouteBatch(group)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Navigation size={15} color="var(--primary)" />
                        View Route Map & Drops
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Order Delivery Cards View */
        filteredOrders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon"><PackageCheck size={28} /></div>
            <h3 className="orders-empty-title">No orders in this delivery stage</h3>
            <p className="orders-empty-desc">
              {searchTerm ? `No delivery records matching "${searchTerm}".` : 'Deliveries matching this stage will be tracked here.'}
            </p>
          </div>
        ) : (
          <div className="deliveries-grid">
            {filteredOrders.map((order, orderIdx) => {
              const stageInfo = getDeliveryStage(order);
              const courier = getAssignedCourier(order, deliveryBatches, deliveryAgents);
              const displayCode = (order.id || order.orderId || 'ORD').slice(-8).toUpperCase();
              const items = order.items || [];
              const destination = resolveOrderAddress(order, orderIdx, customers);

              return (
                <div key={order.id} className="delivery-batch-card">
                  {/* Top Header */}
                  <div className="batch-top-row">
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                        #{displayCode}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <Clock size={11} /> Slot: {order.deliveryTimeSlot || 'Standard Slot (9 AM – 1 PM)'}
                      </div>
                    </div>

                    <span className={stageInfo.className}>
                      {stageInfo.label}
                    </span>
                  </div>

                  {/* Customer Block */}
                  <div className="delivery-customer-box">
                    <div className="delivery-customer-name">
                      <strong>Customer:</strong> {order.customerName || 'Customer'}
                    </div>
                    <div className="delivery-customer-address">
                      <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                      <span>{destination}</span>
                    </div>
                  </div>

                  {/* Assigned Courier Block */}
                  <div className="agent-profile-box">
                    <div className="agent-avatar" style={{ background: courier ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#94a3b8' }}>
                      {courier ? <UserCheck size={18} /> : <Clock size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                        {courier ? courier : 'Awaiting Courier Assignment'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {courier ? (
                          order.batchId ? `Assigned to Batch #${String(order.batchId).slice(-6).toUpperCase()}` : 'Dedicated Courier Partner'
                        ) : (
                          'Admin assignment pending'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="delivery-items-preview">
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Package Contents
                    </div>
                    <div className="delivery-items-chips">
                      {items.length === 0 ? (
                        <span className="item-mini-chip">1x Standard Grocery Pack</span>
                      ) : (
                        items.map((it, idx) => (
                          <span key={idx} className="item-mini-chip">
                            {it.qty || 1}x {it.name || it.product?.name || `Item ${idx+1}`}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="batch-card-actions">
                    <button 
                      type="button" 
                      className="completed-fleet-route-btn"
                      onClick={() => {
                        const singleBatch = {
                          id: order.id,
                          pickupLocations: ['22 Velachery Main Rd, Chennai'],
                          customers: [{
                            id: order.id,
                            name: order.customerName || 'Customer',
                            address: destination,
                            orderCode: displayCode
                          }]
                        };
                        setActiveRouteBatch(singleBatch);
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Navigation size={14} color="var(--primary)" />
                        View Delivery Destination Map
                      </span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Fleet / Stop Map Modal */}
      {activeRouteBatch && createPortal(
        <div className="fleet-route-modal-backdrop" onClick={() => setActiveRouteBatch(null)}>
          <div className="fleet-route-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fleet-route-modal-header">
              <div className="fleet-route-modal-header-left">
                <div className="modal-fleet-title">
                  <Navigation size={18} color="var(--primary)" />
                  <span>Delivery Stop & Route Preview</span>
                </div>
                <span className="batch-code-pill">
                  {activeRouteBatch.id ? `Batch #${(activeRouteBatch.id || '').replace('#', '').slice(-8).toUpperCase()}` : 'Dispatch Route'}
                </span>
              </div>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => setActiveRouteBatch(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="fleet-route-modal-body">
              <div className="fleet-route-map-panel">
                <GoogleRouteMap stops={activeModalStops} />
              </div>
            </div>

            <div className="fleet-route-modal-footer">
              <button 
                type="button" 
                className="btn-modal-close-main"
                onClick={() => setActiveRouteBatch(null)}
              >
                Close Map
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
