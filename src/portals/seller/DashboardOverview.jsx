import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Truck, CheckCircle, Clock, Package, AlertTriangle, 
  DollarSign, MapPin, Zap, Info, X, TrendingUp, Sparkles, Copy, 
  ChevronRight, Calendar
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { orders, currentUser, updateSellerProfile, createDeliveryBatch } = useAppContext();
  const navigate = useNavigate();

  const [isStoreClosedModalOpen, setIsStoreClosedModalOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState(currentUser?.isOpen !== false);
  const [copiedId, setCopiedId] = useState(false);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'seller-uuid-4694-d04c';
  const displayId = sellerId.slice(0, 8) + '...' + sellerId.slice(-4);

  const sellerOrders = orders.filter(o => currentUser?.role === 'admin' || o.vendorId === sellerId);
  const totalOrders = sellerOrders.length;
  const newOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'PLACED').length;
  const preparingOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'PREPARING').length;
  const readyOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'READY_FOR_DELIVERY').length;
  const completedOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'DELIVERED').length;
  const todayRevenue = sellerOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const waitingOrders = sellerOrders.filter(o => o.aggregationStatus === 'Waiting for Aggregation');

  const handleCopyId = () => {
    navigator.clipboard.writeText(sellerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const toggleStatus = () => {
    if (storeStatus) {
      setIsStoreClosedModalOpen(true);
    } else {
      setStoreStatus(true);
      updateSellerProfile({ isOpen: true });
    }
  };

  const confirmCloseStore = () => {
    setStoreStatus(false);
    updateSellerProfile({ isOpen: false });
    setIsStoreClosedModalOpen(false);
  };

  // Mock batch details
  const hasBatches = waitingOrders.length > 0;
  
  return (
    <div className="dashboard-page">
      {/* Page Header Row */}
      <div className="dashboard-header-row">
        <div className="store-title-group">
          <div className="store-badge-row">
            <span style={{ 
              background: 'var(--success-soft)', color: 'var(--success)', 
              fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px' 
            }}>
              SELLER DASHBOARD
            </span>
            <div className="store-id-tooltip" onClick={handleCopyId} title={sellerId}>
              {displayId} {copiedId ? <CheckCircle size={12} /> : <Copy size={12} />}
            </div>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.02em', margin: '4px 0 0 0' }}>
            {currentUser?.shopName || 'Local Seller Store'}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '6px', borderRadius: '999px', border: '1px solid var(--border)' }}>
          <button 
            style={{ 
              padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '500',
              background: storeStatus ? 'var(--success-soft)' : 'transparent',
              color: storeStatus ? 'var(--success)' : 'var(--text-muted)'
            }}
            onClick={() => !storeStatus && toggleStatus()}
          >
            Open for orders
          </button>
          <button 
            style={{ 
              padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '500',
              background: !storeStatus ? 'var(--danger-soft)' : 'transparent',
              color: !storeStatus ? 'var(--danger)' : 'var(--text-muted)'
            }}
            onClick={() => storeStatus && toggleStatus()}
          >
            Closed
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="stat-card" onClick={() => navigate('/orders')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><ShoppingBag size={18} strokeWidth={1.75} /></div>
            <span className="stat-delta positive">▲ 12%</span>
          </div>
          <div>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/orders?status=new')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}><Package size={18} strokeWidth={1.75} /></div>
            <span className="stat-delta positive">▲ 4%</span>
          </div>
          <div>
            <div className="stat-value">{newOrders}</div>
            <div className="stat-label">New Orders</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/orders?status=preparing')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}><Clock size={18} strokeWidth={1.75} /></div>
            <span className="stat-delta neutral">–</span>
          </div>
          <div>
            <div className="stat-value">{preparingOrders}</div>
            <div className="stat-label">Preparing</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/orders?status=ready')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}><Truck size={18} strokeWidth={1.75} /></div>
            <span className="stat-delta positive">▲ 8%</span>
          </div>
          <div>
            <div className="stat-value">{readyOrders}</div>
            <div className="stat-label">Ready for Delivery</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/orders?status=completed')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--bg)', color: 'var(--text)' }}><CheckCircle size={18} strokeWidth={1.75} /></div>
            <span className="stat-delta negative">▼ 2%</span>
          </div>
          <div>
            <div className="stat-value">{completedOrders}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/seller/analytics')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><DollarSign size={18} strokeWidth={1.75} /></div>
            <span className="stat-delta positive">▲ 15%</span>
          </div>
          <div>
            <div className="stat-value">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(todayRevenue)}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Hero & Alerts */}
      <div className="middle-row">
        <div className="ai-hero-card">
          <div className="ai-sparkle-badge"><Sparkles size={12} /> AI Delivery Coordinator</div>
          {hasBatches ? (
            <>
              <div className="ai-info-chips">
                <div className="ai-chip"><Package size={14} /> {waitingOrders.length} nearby orders</div>
                <div className="ai-chip"><MapPin size={14} /> RS Puram</div>
                <div className="ai-chip"><Clock size={14} /> 10:00 AM – 11:30 AM</div>
                <div className="ai-chip"><Truck size={14} /> Van Suggested</div>
                <div className="ai-chip"><MapPin size={14} /> 8.4 km</div>
              </div>
              <div className="ai-savings-split">
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Individual deliveries</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹120</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Batched delivery</div>
                  <div className="savings-highlight">Save ₹45 · 37.5%</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)' }}>₹75</div>
                  <div className="progress-bar-thin">
                    <div className="progress-fill" style={{ width: '62.5%' }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" style={{ padding: '8px 24px', fontSize: '14px', borderRadius: '8px', background: 'var(--primary)', color: 'white' }}>
                  Create Delivery Batch
                </button>
                <button className="btn btn-secondary" style={{ padding: '8px 24px', fontSize: '14px', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  Review orders
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Zap size={48} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No batches to suggest yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>New aggregation suggestions will appear here when nearby orders match time windows.</p>
            </div>
          )}
        </div>

        <div className="alert-card">
          <h3 className="card-title-h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> Smart Alerts</h3>
          <div className="alert-list">
            <div className="alert-item">
              <Info size={16} color="var(--info)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="alert-content">
                <div className="alert-title">Stock warning</div>
                <div className="alert-desc">Aashirvaad Atta is running low (2 left).</div>
                <div className="alert-time">5 min ago</div>
              </div>
              <button className="alert-dismiss"><X size={14}/></button>
            </div>
            <div className="alert-item">
              <TrendingUp size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="alert-content">
                <div className="alert-title">High Demand</div>
                <div className="alert-desc">Orders in RS Puram are up 15% today.</div>
                <div className="alert-time">1 hour ago</div>
              </div>
              <button className="alert-dismiss"><X size={14}/></button>
            </div>
            <div className="alert-item">
              <Clock size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="alert-content">
                <div className="alert-title">Prep time increase</div>
                <div className="alert-desc">Average prep time is 22m (target 15m).</div>
                <div className="alert-time">2 hours ago</div>
              </div>
              <button className="alert-dismiss"><X size={14}/></button>
            </div>
          </div>
          <button style={{ marginTop: 'auto', paddingTop: '16px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '500', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => navigate('/seller/notifications')}>
            View all alerts <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        <div className="alert-card">
          <h3 className="card-title-h3">Top Delivery Zones</h3>
          <div className="zone-list">
            <div className="zone-row">
              <div className="zone-header"><span>RS Puram</span> <span>28</span></div>
              <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '90%' }}></div></div>
            </div>
            <div className="zone-row">
              <div className="zone-header"><span>Gandhipuram</span> <span>21</span></div>
              <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '70%' }}></div></div>
            </div>
            <div className="zone-row">
              <div className="zone-header"><span>Saibaba Colony</span> <span>15</span></div>
              <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '50%' }}></div></div>
            </div>
            <div className="zone-row">
              <div className="zone-header"><span>Peelamedu</span> <span>12</span></div>
              <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '40%' }}></div></div>
            </div>
          </div>
        </div>

        <div className="alert-card">
          <h3 className="card-title-h3">Seller Performance</h3>
          <div className="perf-meter">
            <div className="perf-header">
              <span style={{ color: 'var(--text-muted)' }}>On-time delivery</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>94%</span>
            </div>
            <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '94%', background: 'var(--success)' }}></div></div>
          </div>
          <div className="perf-meter">
            <div className="perf-header">
              <span style={{ color: 'var(--text-muted)' }}>Avg prep time</span>
              <span style={{ color: 'var(--warning)', fontWeight: '600' }}>18m</span>
            </div>
            <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '80%', background: 'var(--warning)' }}></div></div>
          </div>
          <div className="perf-meter">
            <div className="perf-header">
              <span style={{ color: 'var(--text-muted)' }}>Acceptance rate</span>
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>98%</span>
            </div>
            <div className="zone-bar-bg"><div className="zone-bar-fill" style={{ width: '98%', background: 'var(--primary)' }}></div></div>
          </div>
        </div>

        <div className="alert-card">
          <h3 className="card-title-h3">AI Demand Forecast</h3>
          <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '16px' }}>
            {[30, 40, 25, 60, 80, 50, 45].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 4 ? 'var(--primary)' : 'var(--primary-soft)', height: `${h}%`, borderRadius: '4px 4px 0 0' }}></div>
            ))}
          </div>
          <div style={{ background: 'var(--info-soft)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--info)' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--info)', textTransform: 'uppercase', marginBottom: '4px' }}>Peak Day Expected</div>
            <div style={{ fontSize: '13px', color: 'var(--text)' }}>Demand spikes on Friday (80+ orders). Pre-pack top items.</div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isStoreClosedModalOpen}
        onClose={() => setIsStoreClosedModalOpen(false)}
        onConfirm={confirmCloseStore}
        title="Close Store?"
        message="Are you sure you want to stop receiving new orders? You will still need to fulfill any active orders."
        confirmText="Yes, close store"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default DashboardOverview;
