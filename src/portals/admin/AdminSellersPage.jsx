import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Store, Search, Filter, CheckCircle, Ban, Eye, X, Star, Clock, 
  MapPin, Phone, Mail, ShieldCheck, UserCheck, Package, ShoppingBag, 
  ExternalLink, Calendar, Layers, AlertCircle, Sparkles, Navigation,
  DollarSign, TrendingUp, Check
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './AdminSellersPage.css';

const AdminSellersPage = () => {
  const { vendors, updateSellerStatus, orders, products } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [suspendModalData, setSuspendModalData] = useState(null);
  const [inspectTab, setInspectTab] = useState('overview'); // 'overview' | 'catalog' | 'orders' | 'compliance'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedSeller) {
        setSelectedSeller(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSeller]);

  useEffect(() => {
    if (selectedSeller) {
      document.body.classList.add('admin-modal-open');
    } else {
      document.body.classList.remove('admin-modal-open');
    }
    return () => {
      document.body.classList.remove('admin-modal-open');
    };
  }, [selectedSeller]);

  // Extract categories & areas
  const categories = Array.from(new Set(vendors.map(v => v.category))).filter(Boolean);
  const areas = Array.from(new Set(vendors.map(v => v.area))).filter(Boolean);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || (v.status || 'Active') === statusFilter;
    const matchesArea = areaFilter === 'ALL' || v.area === areaFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesArea;
  });

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Seller Network Directory & Onboarding
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> {vendors.length} STORES
            </span>
          </h2>
          <p className="page-subtitle">
            Manage merchant profiles, verify business compliance, oversee inventory catalog health, and manage store access permissions.
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
              placeholder="Search by store name, owner, email..."
              value={searchTerm}
              aria-label="Search local sellers by store name, owner, or email"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="form-select" 
              value={categoryFilter} 
              aria-label="Filter sellers by category"
              onChange={e => setCategoryFilter(e.target.value)} 
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select 
              className="form-select" 
              value={statusFilter} 
              aria-label="Filter sellers by status"
              onChange={e => setStatusFilter(e.target.value)} 
            >
              <option value="ALL">All Verification States</option>
              <option value="Active">Active Stores</option>
              <option value="Pending">Pending Compliance</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select 
              className="form-select" 
              value={areaFilter} 
              aria-label="Filter sellers by area"
              onChange={e => setAreaFilter(e.target.value)} 
            >
              <option value="ALL">All Delivery Zones ({areas.length})</option>
              {areas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Store ID</th>
              <th>Business Entity & Owner</th>
              <th>Category</th>
              <th>Dispatch Zone</th>
              <th>Direct Line</th>
              <th>Network Status</th>
              <th>Onboarded</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state-box">
                  <h4>No merchants match criteria</h4>
                  <p>Check search keywords or adjust active filter selections above.</p>
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => {
                const sellerStatus = v.status || 'Active';
                return (
                  <tr key={v.id}>
                    <td>
                      <span className="order-id-chip">{v.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {v.logo ? (
                          <img 
                            src={v.logo} 
                            alt={v.name} 
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
                          />
                        ) : (
                          <div className="avatar-squircle">
                            {getInitials(v.name)}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{v.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Owner: {v.ownerName || 'Verified Merchant'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="aggregation-tag">{v.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                        <MapPin size={12} className="text-amber" />
                        <span>{v.area || 'Central Sector'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475569', fontFamily: 'var(--font-family-mono)' }}>
                        {v.phone}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={sellerStatus} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                        {v.joinDate || '2026-01-01'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => setSelectedSeller(v)} 
                          title="View Store Profile"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                        
                        {sellerStatus === 'Pending' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => updateSellerStatus(v.id, 'Active')}
                            title="Verify and Approve Seller"
                          >
                            <UserCheck size={13} /> Approve
                          </button>
                        )}
                        
                        {sellerStatus === 'Active' && (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => setSuspendModalData(v)}
                            title="Suspend Seller Access"
                          >
                            <Ban size={13} /> Suspend
                          </button>
                        )}
                        
                        {sellerStatus === 'Suspended' && (
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => updateSellerStatus(v.id, 'Active')}
                            title="Re-activate Seller"
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
          <span>Displaying {filteredVendors.length} of {vendors.length} registered sellers</span>
          <span style={{ fontFamily: 'var(--font-family-mono)' }}>NETWORK COMPLIANCE: 100%</span>
        </div>
      </div>

      {/* Premium Seller Inspect Modal */}
      {selectedSeller && (() => {
        const sellerProducts = products.filter(p => p.vendorId === selectedSeller.id || p.vendorName === selectedSeller.name);
        const sellerOrders = orders.filter(o => o.vendorId === selectedSeller.id || o.sellerId === selectedSeller.id || o.vendorName === selectedSeller.name);
        const sellerRevenue = sellerOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const activeOrdersCount = sellerOrders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status || o.orderStatus)).length;

        return createPortal(
          <div className="seller-modal-backdrop" onClick={() => setSelectedSeller(null)}>
            <div 
              className="seller-inspect-modal" 
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="seller-inspect-title"
            >
              {/* Top Banner / Hero (Pure White Crisp Theme) */}
              <div className="seller-modal-banner">
                <div className="seller-modal-top-bar">
                  <div className="seller-modal-badge-group">
                    <span className="seller-live-pill">
                      <span className="seller-live-dot" />
                      {selectedSeller.isOpen !== false ? 'STORE OPEN' : 'STORE CLOSED'}
                    </span>
                    <StatusBadge status={selectedSeller.status || 'Active'} />
                  </div>

                  <button 
                    className="seller-modal-close" 
                    onClick={() => setSelectedSeller(null)}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="seller-identity-row">
                  {selectedSeller.logo ? (
                    <img 
                      src={selectedSeller.logo} 
                      alt={selectedSeller.name} 
                      className="seller-avatar-large" 
                    />
                  ) : (
                    <div className="seller-avatar-fallback">
                      {getInitials(selectedSeller.name)}
                    </div>
                  )}

                  <div className="seller-title-block">
                    <h2 id="seller-inspect-title">{selectedSeller.name}</h2>
                    <div className="seller-subtitle-meta">
                      <span className="seller-id-tag">{selectedSeller.id}</span>
                      <span>•</span>
                      <span>Owner: <strong>{selectedSeller.ownerName || 'Merchant'}</strong></span>
                      <span>•</span>
                      <span className="seller-rating-pill">
                        <Star size={13} fill="#FBBF24" />
                        {selectedSeller.rating || 4.8} / 5.0
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {selectedSeller.prepTime || '15-25 mins'} prep
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segmented Navigation Tabs */}
              <div className="seller-modal-tabs">
                <button 
                  className={`seller-tab-btn ${inspectTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setInspectTab('overview')}
                >
                  <Store size={15} /> Store Overview
                </button>
                <button 
                  className={`seller-tab-btn ${inspectTab === 'catalog' ? 'active' : ''}`}
                  onClick={() => setInspectTab('catalog')}
                >
                  <Package size={15} /> Products Catalog
                  <span className="seller-tab-count">{sellerProducts.length}</span>
                </button>
                <button 
                  className={`seller-tab-btn ${inspectTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setInspectTab('orders')}
                >
                  <ShoppingBag size={15} /> Orders Manifest
                  <span className="seller-tab-count">{sellerOrders.length}</span>
                </button>
                <button 
                  className={`seller-tab-btn ${inspectTab === 'compliance' ? 'active' : ''}`}
                  onClick={() => setInspectTab('compliance')}
                >
                  <ShieldCheck size={15} /> Compliance & SLA
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div className="seller-modal-body">
                {inspectTab === 'overview' && (
                  <>
                    {/* KPI Grid */}
                    <div className="seller-kpi-grid">
                      <div className="seller-kpi-card">
                        <div className="seller-kpi-header">
                          <span>Total Orders</span>
                          <div className="seller-kpi-icon indigo"><ShoppingBag size={15} /></div>
                        </div>
                        <div className="seller-kpi-value">{sellerOrders.length}</div>
                        <span className="seller-kpi-sub">{activeOrdersCount} in active fulfillment</span>
                      </div>

                      <div className="seller-kpi-card">
                        <div className="seller-kpi-header">
                          <span>Total Sales</span>
                          <div className="seller-kpi-icon emerald"><DollarSign size={15} /></div>
                        </div>
                        <div className="seller-kpi-value">₹{sellerRevenue.toFixed(2)}</div>
                        <span className="seller-kpi-sub">Lifetime gross value</span>
                      </div>

                      <div className="seller-kpi-card">
                        <div className="seller-kpi-header">
                          <span>Live Catalog</span>
                          <div className="seller-kpi-icon amber"><Package size={15} /></div>
                        </div>
                        <div className="seller-kpi-value">{sellerProducts.length}</div>
                        <span className="seller-kpi-sub">{sellerProducts.filter(p => p.status === 'In Stock').length} currently in stock</span>
                      </div>

                      <div className="seller-kpi-card">
                        <div className="seller-kpi-header">
                          <span>Customer Rating</span>
                          <div className="seller-kpi-icon purple"><Star size={15} /></div>
                        </div>
                        <div className="seller-kpi-value">{selectedSeller.rating || 4.8} ★</div>
                        <span className="seller-kpi-sub">Verified merchant</span>
                      </div>
                    </div>

                    {/* 2-Column Info Grid */}
                    <div className="seller-sections-grid">
                      <div className="seller-card-panel">
                        <h4 className="seller-panel-title">
                          <MapPin size={16} className="text-accent" />
                          Location & Dispatch Corridor
                        </h4>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Storefront Address</span>
                            <span className="seller-detail-value">{selectedSeller.address || 'Address on file'}</span>
                          </div>
                        </div>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Corridor / Operating Sector</span>
                            <span className="seller-detail-value">{selectedSeller.area || 'Central Corridor'}</span>
                          </div>
                        </div>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">GPS Spatial Coordinates</span>
                            <span className="seller-detail-value font-mono" style={{ fontSize: '0.8125rem' }}>
                              Lat: {selectedSeller.lat || 13.0418} • Lng: {selectedSeller.lng || 80.2341}
                            </span>
                          </div>
                        </div>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Store Overview</span>
                            <span className="seller-detail-value" style={{ fontWeight: 400, color: '#475569' }}>
                              {selectedSeller.description || 'Verified local merchant on the Smart Micro-Logistics Network.'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="seller-card-panel">
                        <h4 className="seller-panel-title">
                          <Phone size={16} className="text-accent" />
                          Communications & Operating Hours
                        </h4>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Direct Contact Telephone</span>
                            <span className="seller-detail-value font-mono">{selectedSeller.phone}</span>
                            <a href={`tel:${selectedSeller.phone}`} className="seller-detail-action">
                              <Phone size={12} /> Call Merchant
                            </a>
                          </div>
                        </div>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Registered Business Email</span>
                            <span className="seller-detail-value">{selectedSeller.email}</span>
                            <a href={`mailto:${selectedSeller.email}`} className="seller-detail-action">
                              <Mail size={12} /> Send Official Email
                            </a>
                          </div>
                        </div>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Daily Operating Hours</span>
                            <span className="seller-detail-value">{selectedSeller.operatingHours || selectedSeller.timing || '7:00 AM - 9:00 PM'}</span>
                          </div>
                        </div>

                        <div className="seller-detail-row">
                          <div className="seller-detail-content">
                            <span className="seller-detail-label">Merchant Category</span>
                            <span className="aggregation-tag">{selectedSeller.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {inspectTab === 'catalog' && (
                  <div>
                    {sellerProducts.length === 0 ? (
                      <div className="seller-empty-tab-state">
                        <div className="seller-empty-icon-wrap"><Package size={24} /></div>
                        <h4>No Products in Catalog</h4>
                        <p>This merchant has not published any active inventory items yet.</p>
                      </div>
                    ) : (
                      <div className="seller-products-list">
                        {sellerProducts.map(p => (
                          <div key={p.id} className="seller-product-item">
                            <div className="seller-product-left">
                              <img 
                                src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} 
                                alt={p.name} 
                                className="seller-product-img" 
                              />
                              <div className="seller-product-info">
                                <span className="seller-product-name">{p.name}</span>
                                <span className="seller-product-meta">{p.category} • Prep: {p.prepTime || '10 mins'}</span>
                              </div>
                            </div>
                            <div className="seller-product-right">
                              <span className="seller-product-price">₹{Number(p.price).toFixed(2)}</span>
                              <span className={`status-pill ${p.stock > 10 ? 'status-success' : p.stock > 0 ? 'status-pending' : 'status-danger'}`}>
                                <span className="pill-dot" />
                                {p.status || (p.stock > 0 ? `${p.stock} in stock` : 'Out of stock')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {inspectTab === 'orders' && (
                  <div>
                    {sellerOrders.length === 0 ? (
                      <div className="seller-empty-tab-state">
                        <div className="seller-empty-icon-wrap"><ShoppingBag size={24} /></div>
                        <h4>No Orders Placed Yet</h4>
                        <p>Orders from customers assigned to this seller will appear here in real-time.</p>
                      </div>
                    ) : (
                      <div className="seller-orders-table-wrapper">
                        <table className="seller-orders-mini-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Items</th>
                              <th>Total</th>
                              <th>Delivery Slot</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sellerOrders.map(o => (
                              <tr key={o.id}>
                                <td><span className="order-id-chip">{o.orderId || o.id}</span></td>
                                <td><strong>{o.customerName || 'Customer'}</strong></td>
                                <td>{o.items?.length || 1} items</td>
                                <td><span className="monetary-amount">₹{Number(o.total || 0).toFixed(2)}</span></td>
                                <td>{o.deliveryTimeSlot || 'Today'}</td>
                                <td><StatusBadge status={o.status || o.orderStatus} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {inspectTab === 'compliance' && (
                  <div className="seller-sections-grid">
                    <div className="seller-card-panel">
                      <h4 className="seller-panel-title">
                        <ShieldCheck size={16} className="text-accent" />
                        Verification & Legal Standing
                      </h4>
                      <div className="seller-detail-row">
                        <div className="seller-detail-content">
                          <span className="seller-detail-label">Network Join Date</span>
                          <span className="seller-detail-value">{selectedSeller.joinDate || '2026-01-01'}</span>
                        </div>
                      </div>
                      <div className="seller-detail-row">
                        <div className="seller-detail-content">
                          <span className="seller-detail-label">Compliance Verification Status</span>
                          <span className="seller-detail-value text-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Check size={14} /> Full KYC & Merchant License Verified
                          </span>
                        </div>
                      </div>
                      <div className="seller-detail-row">
                        <div className="seller-detail-content">
                          <span className="seller-detail-label">Legal Entity Representative</span>
                          <span className="seller-detail-value">{selectedSeller.ownerName || 'Authorized Signatory'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="seller-card-panel">
                      <h4 className="seller-panel-title">
                        <TrendingUp size={16} className="text-accent" />
                        Platform Performance & SLA
                      </h4>
                      <div className="seller-detail-row">
                        <div className="seller-detail-content">
                          <span className="seller-detail-label">Aggregation SLA Tier</span>
                          <span className="seller-detail-value">Tier 1 • High Priority Dispatch</span>
                        </div>
                      </div>
                      <div className="seller-detail-row">
                        <div className="seller-detail-content">
                          <span className="seller-detail-label">Fulfillment Accuracy</span>
                          <span className="seller-detail-value text-emerald font-bold">99.2% on-time handover</span>
                        </div>
                      </div>
                      <div className="seller-detail-row">
                        <div className="seller-detail-content">
                          <span className="seller-detail-label">Platform Settlement Tier</span>
                          <span className="seller-detail-value">Standard Net-7 Daily Direct Bank Settlement</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="seller-modal-footer">
                <div className="seller-footer-actions-left">
                  {selectedSeller.status === 'Pending' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        updateSellerStatus(selectedSeller.id, 'Active');
                        setSelectedSeller({ ...selectedSeller, status: 'Active' });
                      }}
                    >
                      <UserCheck size={14} /> Approve & Onboard Store
                    </button>
                  )}

                  {selectedSeller.status === 'Active' && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => setSuspendModalData(selectedSeller)}
                    >
                      <Ban size={14} /> Suspend Store Access
                    </button>
                  )}

                  {selectedSeller.status === 'Suspended' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        updateSellerStatus(selectedSeller.id, 'Active');
                        setSelectedSeller({ ...selectedSeller, status: 'Active' });
                      }}
                    >
                      <CheckCircle size={14} /> Reactivate Store
                    </button>
                  )}
                </div>

                <div className="seller-footer-actions-right">
                  <a 
                    href={`tel:${selectedSeller.phone}`} 
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Phone size={13} /> Call
                  </a>
                  <a 
                    href={`mailto:${selectedSeller.email}`} 
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Mail size={13} /> Email
                  </a>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setSelectedSeller(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Confirmation Warning Modal for Suspending Seller */}
      <ConfirmationModal
        isOpen={Boolean(suspendModalData)}
        onClose={() => setSuspendModalData(null)}
        onConfirm={() => {
          if (suspendModalData) {
            updateSellerStatus(suspendModalData.id, 'Suspended');
            if (selectedSeller && selectedSeller.id === suspendModalData.id) {
              setSelectedSeller({ ...selectedSeller, status: 'Suspended' });
            }
            setSuspendModalData(null);
          }
        }}
        title="Suspend Merchant Store Access?"
        message="Suspending this seller will revoke their product visibility on the customer marketplace and freeze automated consignment fulfillment until administrative re-verification."
        subjectName={suspendModalData?.shopName || suspendModalData?.name}
        subjectInfo={`Store ID: ${suspendModalData?.id} | Category: ${suspendModalData?.category || 'General'} | Owner: ${suspendModalData?.name}`}
        confirmText="Suspend Store"
        cancelText="Cancel"
        variant="danger"
        badgeText="COMPLIANCE SUSPENSION"
        icon={Ban}
      />
    </div>
  );
};

export default AdminSellersPage;
