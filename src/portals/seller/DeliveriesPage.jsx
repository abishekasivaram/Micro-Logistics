import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Map as MapIcon, Truck, Phone, Navigation, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';
import './DeliveriesPage.css';

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const { 
    deliveryBatches = [], 
    deliveryAgents = [], 
    orders = [], 
    customers = [], 
    updateBatchStatus, 
    currentUser 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');

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
    groupOrders.forEach(o => {
      const c = customers.find(cust => cust.id === o.customerId) || {
        id: o.customerId || o.id,
        name: o.customerName || 'Local Customer',
        address: o.deliveryAddress || 'RS Puram, Coimbatore'
      };
      if (!uniqueCustomers.some(existing => existing.name === c.name)) {
        uniqueCustomers.push(c);
      }
    });
    
    return {
      ...group,
      personnel: agent || (group.driverName ? { name: group.driverName, phone: group.driverPhone || '+91 98765 43210', vehicle: 'Electric Cargo' } : null),
      orders: groupOrders,
      customers: uniqueCustomers.length > 0 ? uniqueCustomers : [
        { id: 'c1', name: 'Priyarajan M', address: '12/4 RS Puram East Zone' },
        { id: 'c2', name: 'Sivakumar R', address: '45 Cross Cut Road, Gandhipuram' }
      ]
    };
  });

  const filteredGroups = enrichedGroups.filter(g => 
    (g.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (g.personnel && g.personnel.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            return (
              <div key={group.id} className="delivery-batch-card">
                <div className="batch-top-row">
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', fontSize: '15px' }}>
                      BATCH #{displayBatch}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {group.orders.length} bundled order(s)
                    </div>
                  </div>

                  <span className={`order-status-badge status-badge-ready`}>
                    {group.status || 'Assigned'}
                  </span>
                </div>

                {/* Driver Box */}
                <div className="agent-profile-box">
                  <div className="agent-avatar">
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>
                      {group.personnel?.name || 'Assigned Driver'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} /> {group.personnel?.phone || '+91 98765 43210'} · {group.personnel?.vehicle || 'Electric Scooter'}
                    </div>
                  </div>
                </div>

                {/* Destinations */}
                <div className="destinations-pill-list">
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Drop Destinations
                  </div>
                  {group.customers.length === 0 ? (
                    <div className="destination-chip">
                      <Navigation size={12} color="var(--primary)" /> RS Puram East Zone
                    </div>
                  ) : (
                    group.customers.map(c => (
                      <div key={c.id} className="destination-chip">
                        <Navigation size={12} color="var(--primary)" />
                        <span><strong>{c.name}</strong> · {c.address}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Route Button */}
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="orders-action-btn primary"
                    onClick={() => {
                      const target = currentUser?.role === 'admin' ? '/admin/routes' : '/track-delivery';
                      navigate(target, { state: { batchId: group.id } });
                    }}
                  >
                    <MapIcon size={14} /> View Fleet Route
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
