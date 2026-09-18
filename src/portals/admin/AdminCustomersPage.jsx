import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Users, Search, Eye, X, Phone, Mail, MapPin, CheckCircle, Ban, 
  ShoppingBag, ShieldCheck, User, Calendar, Clock, DollarSign, Package, Check 
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './AdminCustomersPage.css';

const AdminCustomersPage = () => {
  const { customers, updateCustomerStatus, orders } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [suspendModalData, setSuspendModalData] = useState(null);
  const [inspectTab, setInspectTab] = useState('profile'); // 'profile' | 'orders'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCustomer) {
        setSelectedCustomer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      document.body.classList.add('admin-modal-open');
    } else {
      document.body.classList.remove('admin-modal-open');
    }
    return () => {
      document.body.classList.remove('admin-modal-open');
    };
  }, [selectedCustomer]);

  const areas = Array.from(new Set(customers.map(c => c.area))).filter(Boolean);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === 'ALL' || c.area === areaFilter;
    const matchesStatus = statusFilter === 'ALL' || (c.status || 'Active') === statusFilter;
    return matchesSearch && matchesArea && matchesStatus;
  });

  const getInitials = (name) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Customer Accounts & Delivery Profiles
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> {customers.length} REGISTERED
            </span>
          </h2>
          <p className="page-subtitle">
            Central directory of registered consumers, active delivery addresses, recurring orders, and account status controls.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="table-filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by customer name, email, phone..."
              value={searchTerm}
              aria-label="Search customers by name, email, or phone"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="form-select" 
              value={areaFilter} 
              aria-label="Filter customers by delivery area"
              onChange={e => setAreaFilter(e.target.value)} 
            >
              <option value="ALL">All Delivery Zones ({areas.length})</option>
              {areas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>

            <select 
              className="form-select" 
              value={statusFilter} 
              aria-label="Filter customers by account status"
              onChange={e => setStatusFilter(e.target.value)} 
            >
              <option value="ALL">All Account Statuses</option>
              <option value="Active">Active Accounts</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Customer Profile</th>
              <th>Email Address</th>
              <th>Contact Number</th>
              <th>Primary Delivery Corridor</th>
              <th>Orders Placed</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state-box">
                  <h4>No customers match query</h4>
                  <p>Try searching with another keyword or resetting delivery area filters.</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => {
                const custOrders = orders.filter(o => o.customerId === c.id || o.customerName === c.name);
                const custStatus = c.status || 'Active';
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="order-id-chip">{c.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {c.avatar ? (
                          <img 
                            src={c.avatar} 
                            alt={c.name} 
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
                          />
                        ) : (
                          <div className="avatar-squircle">
                            {getInitials(c.name)}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{c.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>@{c.username || 'consumer'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475569' }}>{c.email}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-family-mono)', color: '#475569' }}>
                        {c.phone}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                        <MapPin size={12} className="text-indigo" />
                        <span>{c.area || 'Anna Nagar Sector'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-subtle" style={{ fontWeight: 600, color: '#0F172A' }}>
                        {custOrders.length || c.totalOrders || 0} orders
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={custStatus} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => setSelectedCustomer(c)} 
                          title="View Customer Profile"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                        {custStatus === 'Active' ? (
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => setSuspendModalData(c)} 
                            title="Suspend Account"
                          >
                            <Ban size={13} /> Suspend
                          </button>
                        ) : (
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => updateCustomerStatus(c.id, 'Active')} 
                            title="Re-activate Account"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="table-footer">
          <span>Displaying {filteredCustomers.length} of {customers.length} total customer accounts</span>
          <span style={{ fontFamily: 'var(--font-family-mono)' }}>DATA RETENTION: ENCRYPTED</span>
        </div>
      </div>

      {/* Premium Customer Inspect Modal */}
      {selectedCustomer && (() => {
        const custOrders = orders.filter(o => o.customerId === selectedCustomer.id || o.customerName === selectedCustomer.name);
        const custTotalSpend = custOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const custActiveOrders = custOrders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status || o.orderStatus)).length;

        return createPortal(
          <div className="customer-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
            <div 
              className="customer-inspect-modal" 
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-inspect-title"
            >
              {/* Header Banner - Pure Crisp White Theme */}
              <div className="customer-modal-banner">
                <div className="customer-modal-top-bar">
                  <StatusBadge status={selectedCustomer.status || 'Active'} />
                  <button 
                    className="customer-modal-close" 
                    onClick={() => setSelectedCustomer(null)}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="customer-identity-row">
                  {selectedCustomer.avatar ? (
                    <img 
                      src={selectedCustomer.avatar} 
                      alt={selectedCustomer.name} 
                      className="customer-avatar-large" 
                    />
                  ) : (
                    <div className="customer-avatar-fallback">
                      {getInitials(selectedCustomer.name)}
                    </div>
                  )}
                  <div className="customer-title-block">
                    <h2 id="customer-inspect-title">{selectedCustomer.name}</h2>
                    <div className="customer-subtitle-meta">
                      <span className="order-id-chip">{selectedCustomer.id}</span>
                      <span>•</span>
                      <span>@{selectedCustomer.username || 'customer'}</span>
                      <span>•</span>
                      <span>{selectedCustomer.area || 'Central Sector'} Corridor</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="customer-modal-tabs">
                <button 
                  className={`customer-tab-btn ${inspectTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setInspectTab('profile')}
                >
                  <User size={15} /> Customer Profile
                </button>
                <button 
                  className={`customer-tab-btn ${inspectTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setInspectTab('orders')}
                >
                  <ShoppingBag size={15} /> Order History ({custOrders.length})
                </button>
              </div>

              {/* Body */}
              <div className="customer-modal-body">
                {inspectTab === 'profile' && (
                  <>
                    {/* KPI Cards */}
                    <div className="customer-kpi-grid">
                      <div className="customer-kpi-card">
                        <span className="customer-kpi-label">Lifetime Orders</span>
                        <span className="customer-kpi-val">{custOrders.length || selectedCustomer.totalOrders || 0}</span>
                        <span className="customer-kpi-sub">{custActiveOrders} active transits</span>
                      </div>
                      <div className="customer-kpi-card">
                        <span className="customer-kpi-label">Total Spend</span>
                        <span className="customer-kpi-val text-emerald">₹{custTotalSpend.toFixed(2)}</span>
                        <span className="customer-kpi-sub">Gross order volume</span>
                      </div>
                      <div className="customer-kpi-card">
                        <span className="customer-kpi-label">Delivery Zone</span>
                        <span className="customer-kpi-val" style={{ fontSize: '1.1rem' }}>{selectedCustomer.area || 'Anna Nagar'}</span>
                        <span className="customer-kpi-sub">Priority local zone</span>
                      </div>
                    </div>

                    <div className="customer-sections-grid">
                      <div className="customer-card-panel">
                        <h4 className="customer-panel-title">
                          <MapPin size={16} className="text-accent" />
                          Delivery Location Details
                        </h4>
                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Default Dropoff Address</span>
                            <span className="seller-detail-value">{selectedCustomer.address}</span>
                          </div>
                        </div>
                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Corridor Coordinates</span>
                            <span className="seller-detail-value font-mono" style={{ fontSize: '0.8125rem' }}>
                              Lat: {selectedCustomer.lat || 13.0827} • Lng: {selectedCustomer.lng || 80.2707}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="customer-card-panel">
                        <h4 className="customer-panel-title">
                          <Phone size={16} className="text-accent" />
                          Contact & Account Information
                        </h4>
                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Direct Contact Phone</span>
                            <span className="seller-detail-value font-mono">{selectedCustomer.phone}</span>
                            <a href={`tel:${selectedCustomer.phone}`} className="seller-detail-action">
                              <Phone size={12} /> Call Customer
                            </a>
                          </div>
                        </div>
                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Email Address</span>
                            <span className="seller-detail-value">{selectedCustomer.email}</span>
                            <a href={`mailto:${selectedCustomer.email}`} className="seller-detail-action">
                              <Mail size={12} /> Email Customer
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {inspectTab === 'orders' && (
                  <div>
                    {custOrders.length === 0 ? (
                      <div className="seller-empty-tab-state">
                        <div className="seller-empty-icon-wrap"><ShoppingBag size={24} /></div>
                        <h4>No Orders Placed</h4>
                        <p>This customer has not placed any orders yet.</p>
                      </div>
                    ) : (
                      <div className="seller-orders-table-wrapper">
                        <table className="seller-orders-mini-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Merchant</th>
                              <th>Items</th>
                              <th>Total</th>
                              <th>Status</th>
                              <th>Schedule</th>
                            </tr>
                          </thead>
                          <tbody>
                            {custOrders.map(o => (
                              <tr key={o.id}>
                                <td><span className="order-id-chip">{o.orderId || o.id}</span></td>
                                <td><strong>{o.vendorName || o.sellerName || 'Local Seller'}</strong></td>
                                <td>{o.items?.length || 1} items</td>
                                <td><span className="monetary-amount">₹{Number(o.total || 0).toFixed(2)}</span></td>
                                <td><StatusBadge status={o.status || o.orderStatus} /></td>
                                <td>{o.deliveryTimeSlot || o.deliveryDate || 'Today'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="customer-modal-footer">
                <div>
                  {selectedCustomer.status === 'Active' ? (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => setSuspendModalData(selectedCustomer)}
                    >
                      <Ban size={14} /> Suspend Account
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        updateCustomerStatus(selectedCustomer.id, 'Active');
                        setSelectedCustomer({ ...selectedCustomer, status: 'Active' });
                      }}
                    >
                      <CheckCircle size={14} /> Reactivate Account
                    </button>
                  )}
                </div>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {suspendModalData && (
        <ConfirmationModal
          isOpen={!!suspendModalData}
          onClose={() => setSuspendModalData(null)}
          onConfirm={() => {
            updateCustomerStatus(suspendModalData.id, 'Suspended');
            if (selectedCustomer?.id === suspendModalData.id) {
              setSelectedCustomer({ ...selectedCustomer, status: 'Suspended' });
            }
            setSuspendModalData(null);
          }}
          type="danger"
          title="Suspend Customer Account"
          message={`You are about to suspend the account of ${suspendModalData.name}. They will lose access to the platform immediately.`}
          confirmLabel="Suspend Account"
          icon="ban"
        />
      )}
    </div>
  );
};

export default AdminCustomersPage;
