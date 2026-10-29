import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Mail, Phone, MapPin, Users, ShoppingBag, Sparkles, 
  DollarSign, LayoutGrid, List, Eye, X, Check, Copy, 
  ChevronRight, Crown, Star, ArrowUpDown, Clock, Calendar, 
  ExternalLink, UserCheck, ShieldCheck
} from 'lucide-react';
import './CustomersPage.css';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo
  'linear-gradient(135deg, #059669 0%, #10b981 100%)', // Emerald
  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', // Amber
  'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', // Sky Blue
  'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', // Rose
  'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'  // Purple
];

const sampleAddresses = [
  '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
  '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
  '42/1 Besant Avenue, Adyar, Chennai - 600020',
  '88 Rajiv Gandhi Salai (OMR), Thoraipakkam, Chennai - 600097',
  '27 Panagal Park, T. Nagar, Chennai - 600017',
  '53 100 Feet Bypass Road, Velachery, Chennai - 600042'
];

const getInitials = (name) => {
  if (!name) return 'CU';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAreaBadge = (address) => {
  if (!address) return 'Chennai Metro';
  const areas = [
    'Anna Nagar East', 'Anna Nagar', 'Mandaveli', 'Adyar', 
    'Thoraipakkam', 'OMR', 'T. Nagar', 'Velachery', 'Mylapore', 
    'Besant Nagar', 'Alwarpet', 'Guindy'
  ];
  for (const a of areas) {
    if (address.toLowerCase().includes(a.toLowerCase())) return a;
  }
  return 'Chennai Metro';
};

const getLoyaltyTier = (totalSpent, orderCount) => {
  if (totalSpent >= 250 || orderCount >= 3) {
    return {
      label: 'VIP Patron',
      type: 'vip',
      color: '#b45309',
      bg: '#fef3c7',
      border: '#fde68a'
    };
  }
  if (orderCount >= 1) {
    return {
      label: 'Active Buyer',
      type: 'active',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0'
    };
  }
  return {
    label: 'New Prospect',
    type: 'prospect',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0'
  };
};

const CustomersPage = () => {
  const { customers = [], orders = [], currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'VIP' | 'PROSPECT'
  const [sortBy, setSortBy] = useState('spend_desc'); // 'spend_desc' | 'orders_desc' | 'name_asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;

  // Close modal on Escape key & manage scroll lock
  useEffect(() => {
    if (!selectedCustomer) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCustomer(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCustomer]);

  const CUSTOMER_NAMES = {
    c1: 'Priya Rajan',
    c2: 'Ramesh Kumar',
    c3: 'Ananya Sharma',
    c4: 'Karthik V'
  };

  // Enrich customer profiles with real order history and metrics
  const enrichedCustomers = useMemo(() => {
    const cleanList = (customers || [])
      .filter(c => {
        if (!c) return false;
        const name = String(c.name || '').toLowerCase();
        const uname = String(c.username || '').toLowerCase();
        const email = String(c.email || '').toLowerCase();
        return !name.includes('boomi') && !uname.includes('boomi') && !email.includes('boomi');
      })
      .map(c => {
        const legId = c.legacy_id || c.legacyId || c.username;
        const fullName = (legId && CUSTOMER_NAMES[legId]) || c.name || 'Customer';
        return {
          ...c,
          legacy_id: legId,
          name: fullName
        };
      });

    return cleanList.map((customer, idx) => {
      const cUuid = customer.uuid || customer.id;
      const cLegacy = customer.legacy_id || customer.legacyId || customer.username;
      const cName = (customer.name || '').toLowerCase().trim();
      const cUser = (customer.username || '').toLowerCase().trim();

      const customerOrders = orders.filter(o => {
        if (!o) return false;
        const matchesCustomer = (
          (o.customerId && (o.customerId === cUuid || o.customerId === customer.id || o.customerId === cLegacy)) ||
          (o.customerLegacyId && (o.customerLegacyId === cLegacy || o.customerLegacyId === cUser)) ||
          (o.customerName && (
            (cName && o.customerName.toLowerCase().trim() === cName) ||
            (cUser && o.customerName.toLowerCase().trim() === cUser) ||
            (cLegacy && o.customerName.toLowerCase().trim() === cLegacy.toLowerCase())
          ))
        );
        const matchesSeller = (currentUser?.role === 'admin' || o.vendorId === sellerId || !sellerId);
        return matchesCustomer && matchesSeller;
      });

      const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const fallbackAddress = sampleAddresses[idx % sampleAddresses.length];
      const address = customer.address || fallbackAddress;
      const orderCount = customerOrders.length;
      const avgOrderValue = orderCount > 0 ? (totalSpent / orderCount) : 0;
      const tier = getLoyaltyTier(totalSpent, orderCount);
      const area = getAreaBadge(address);
      const avatarGradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
      const email = customer.email || `${customer.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      const phone = customer.phone || '+91 98401 23456';

      return {
        ...customer,
        address,
        area,
        email,
        phone,
        orderCount,
        totalSpent,
        avgOrderValue,
        tier,
        avatarGradient,
        orders: customerOrders
      };
    });
  }, [customers, orders, currentUser, sellerId]);

  // KPI aggregates
  const totalCustomers = enrichedCustomers.length;
  const activeShoppers = enrichedCustomers.filter(c => c.orderCount > 0).length;
  const totalRevenue = enrichedCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const overallAov = activeShoppers > 0 ? (totalRevenue / activeShoppers) : 0;

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    let list = enrichedCustomers.filter(c => {
      const matchSearch = 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchSearch) return false;

      if (filterSegment === 'ACTIVE') return c.orderCount > 0;
      if (filterSegment === 'VIP') return c.tier.type === 'vip';
      if (filterSegment === 'PROSPECT') return c.orderCount === 0;
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'spend_desc') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orders_desc') return b.orderCount - a.orderCount;
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return list;
  }, [enrichedCustomers, searchTerm, filterSegment, sortBy]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="seller-customers-page">
      {/* Page Header */}
      <div className="deliveries-header-row">
        <div>
          <div className="orders-title-badge">
            <Users size={12} /> Local Patrons
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            Store Customer Base
          </h1>
          <p className="page-subtitle">
            Manage neighborhood shopper profiles, lifetime order metrics, and direct client communications.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="customer-kpi-grid">
        <div 
          className={`customer-kpi-card ${filterSegment === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterSegment('ALL')}
        >
          <div className="kpi-icon-wrap" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Users size={18} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Registered Patrons</span>
            <div className="kpi-val">{totalCustomers}</div>
          </div>
        </div>

        <div 
          className={`customer-kpi-card ${filterSegment === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setFilterSegment('ACTIVE')}
        >
          <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
            <ShoppingBag size={18} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Buyers</span>
            <div className="kpi-val">{activeShoppers}</div>
          </div>
        </div>

        <div 
          className={`customer-kpi-card ${filterSegment === 'VIP' ? 'active' : ''}`}
          onClick={() => setFilterSegment('VIP')}
        >
          <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Crown size={18} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Gross Patron Value</span>
            <div className="kpi-val">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="customer-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Sparkles size={18} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Avg. Value / Buyer</span>
            <div className="kpi-val">₹{overallAov.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon-left" />
          <input 
            type="text" 
            placeholder="Search by customer name, phone, email, or Chennai address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="toolbar-filters">
          <button 
            type="button"
            className={`filter-pill-btn ${filterSegment === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterSegment('ALL')}
          >
            All ({totalCustomers})
          </button>
          <button 
            type="button"
            className={`filter-pill-btn ${filterSegment === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setFilterSegment('ACTIVE')}
          >
            Active ({activeShoppers})
          </button>
          <button 
            type="button"
            className={`filter-pill-btn ${filterSegment === 'VIP' ? 'active' : ''}`}
            onClick={() => setFilterSegment('VIP')}
          >
            VIP Patrons ({enrichedCustomers.filter(c => c.tier.type === 'vip').length})
          </button>
          <button 
            type="button"
            className={`filter-pill-btn ${filterSegment === 'PROSPECT' ? 'active' : ''}`}
            onClick={() => setFilterSegment('PROSPECT')}
          >
            Prospects ({totalCustomers - activeShoppers})
          </button>
        </div>

        {/* Controls: Sort & View Toggle */}
        <div className="toolbar-controls">
          <div className="sort-dropdown-wrap">
            <ArrowUpDown size={14} className="sort-icon" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="toolbar-select"
            >
              <option value="spend_desc">Sort: Highest Spend</option>
              <option value="orders_desc">Sort: Most Orders</option>
              <option value="name_asc">Sort: Name (A to Z)</option>
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Empty State vs Grid vs Table */}
      {filteredCustomers.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">
            <Users size={32} />
          </div>
          <h3 className="orders-empty-title">No customers match your criteria</h3>
          <p className="orders-empty-desc">
            Try adjusting your search query or switching filter tabs to locate your store patrons.
          </p>
          <button 
            type="button"
            className="orders-action-btn primary"
            style={{ marginTop: '8px' }}
            onClick={() => { setSearchTerm(''); setFilterSegment('ALL'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Rich Grid View */
        <div className="customers-grid">
          {filteredCustomers.map(customer => {
            return (
              <div 
                key={customer.id} 
                className="customer-card"
                onClick={() => setSelectedCustomer(customer)}
              >
                {/* Top Row: Avatar, Name, Tier Badge, Area */}
                <div className="cust-top-row">
                  <div 
                    className="cust-avatar-large"
                    style={{ background: customer.avatarGradient }}
                  >
                    {getInitials(customer.name)}
                  </div>

                  <div className="cust-header-info">
                    <div className="cust-name-row">
                      <span className="cust-name">{customer.name}</span>
                      <span 
                        className={`cust-tier-badge ${customer.tier.type}`}
                        style={{ 
                          color: customer.tier.color, 
                          background: customer.tier.bg, 
                          borderColor: customer.tier.border 
                        }}
                      >
                        {customer.tier.type === 'vip' && <Crown size={10} />}
                        {customer.tier.type === 'active' && <Star size={10} />}
                        {customer.tier.label}
                      </span>
                    </div>

                    <div className="cust-area-pill">
                      <MapPin size={11} color="var(--primary)" />
                      <span>{customer.area}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Snippet */}
                <div className="cust-address-row">
                  <span>{customer.address}</span>
                </div>

                {/* Metrics Box */}
                <div className="cust-metrics-box">
                  <div className="cust-metric-item">
                    <span className="cust-metric-label">Orders</span>
                    <span className="cust-metric-value">{customer.orderCount}</span>
                  </div>
                  <div className="cust-metric-item">
                    <span className="cust-metric-label">Lifetime Spend</span>
                    <span className="cust-metric-value highlight">₹{customer.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="cust-metric-item">
                    <span className="cust-metric-label">Avg. Basket</span>
                    <span className="cust-metric-value">
                      {customer.orderCount > 0 ? `₹${customer.avgOrderValue.toFixed(0)}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Contact Bar */}
                <div className="cust-contact-bar">
                  <a 
                    href={`tel:${customer.phone}`} 
                    className="contact-link"
                    onClick={(e) => e.stopPropagation()}
                    title="Call customer"
                  >
                    <Phone size={12} color="var(--primary)" />
                    <span>{customer.phone}</span>
                  </a>
                  <a 
                    href={`mailto:${customer.email}`} 
                    className="contact-link"
                    onClick={(e) => e.stopPropagation()}
                    title="Email customer"
                  >
                    <Mail size={12} color="var(--text-muted)" />
                    <span>{customer.email}</span>
                  </a>
                </div>

                {/* Card Action Footer */}
                <div className="cust-card-footer">
                  <button 
                    type="button"
                    className="btn-inspect-customer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(customer);
                    }}
                  >
                    <Eye size={13} />
                    <span>View Orders & History</span>
                    <ChevronRight size={13} className="btn-arrow" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="customer-table-card">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Delivery Zone</th>
                <th>Contact</th>
                <th>Status Tier</th>
                <th>Orders</th>
                <th>Lifetime Spend</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} onClick={() => setSelectedCustomer(customer)}>
                  <td>
                    <div className="table-cust-cell">
                      <div 
                        className="table-avatar"
                        style={{ background: customer.avatarGradient }}
                      >
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <div className="table-cust-name">{customer.name}</div>
                        <div className="table-cust-sub">Member</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table-area-cell">
                      <MapPin size={12} color="var(--primary)" />
                      <span>{customer.area}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-contact-cell">
                      <span>{customer.phone}</span>
                      <span className="table-email">{customer.email}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`cust-tier-badge ${customer.tier.type}`}
                      style={{ 
                        color: customer.tier.color, 
                        background: customer.tier.bg, 
                        borderColor: customer.tier.border 
                      }}
                    >
                      {customer.tier.label}
                    </span>
                  </td>
                  <td>
                    <span className="table-orders-count">{customer.orderCount} orders</span>
                  </td>
                  <td>
                    <span className="table-spend-val">₹{customer.totalSpent.toFixed(2)}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      type="button"
                      className="table-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                      }}
                      title="Inspect Profile"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Details & Order History Modal */}
      {selectedCustomer && createPortal(
        <div 
          className="customer-modal-backdrop" 
          onClick={() => setSelectedCustomer(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="customer-modal-card" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="customer-modal-header">
              <div className="modal-header-profile">
                <div 
                  className="modal-avatar"
                  style={{ background: selectedCustomer.avatarGradient }}
                >
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="modal-cust-name">{selectedCustomer.name}</h2>
                    <span 
                      className={`cust-tier-badge ${selectedCustomer.tier.type}`}
                      style={{ 
                        color: selectedCustomer.tier.color, 
                        background: selectedCustomer.tier.bg, 
                        borderColor: selectedCustomer.tier.border 
                      }}
                    >
                      {selectedCustomer.tier.label}
                    </span>
                  </div>
                  <p className="modal-cust-sub">
                    Neighborhood Shopper · {selectedCustomer.area}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                className="modal-close-icon"
                onClick={() => setSelectedCustomer(null)}
                title="Close modal (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="customer-modal-body">
              {/* Profile & Contact Card */}
              <div className="modal-section-card">
                <h4 className="modal-section-title">
                  <UserCheck size={15} color="var(--primary)" /> Profile & Location Details
                </h4>

                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="info-label">Phone Number</span>
                    <div className="info-val-row">
                      <span className="info-val">{selectedCustomer.phone}</span>
                      <button 
                        type="button"
                        className="btn-copy-chip"
                        onClick={() => handleCopy(selectedCustomer.phone, 'phone')}
                        title="Copy phone"
                      >
                        {copiedId === 'phone' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="modal-info-item">
                    <span className="info-label">Email Address</span>
                    <div className="info-val-row">
                      <span className="info-val">{selectedCustomer.email}</span>
                      <button 
                        type="button"
                        className="btn-copy-chip"
                        onClick={() => handleCopy(selectedCustomer.email, 'email')}
                        title="Copy email"
                      >
                        {copiedId === 'email' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="modal-info-item full-width">
                    <span className="info-label">Verified Delivery Dropoff Address</span>
                    <div className="info-val-row">
                      <MapPin size={13} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span className="info-val">{selectedCustomer.address}</span>
                      <button 
                        type="button"
                        className="btn-copy-chip"
                        onClick={() => handleCopy(selectedCustomer.address, 'address')}
                        title="Copy address"
                      >
                        {copiedId === 'address' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifetime Stats */}
              <div className="modal-stats-row">
                <div className="modal-stat-box">
                  <span className="stat-label">Total Store Orders</span>
                  <span className="stat-value">{selectedCustomer.orderCount}</span>
                </div>
                <div className="modal-stat-box">
                  <span className="stat-label">Total Spend</span>
                  <span className="stat-value highlight">₹{selectedCustomer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="modal-stat-box">
                  <span className="stat-label">Avg. Basket Size</span>
                  <span className="stat-value">₹{selectedCustomer.avgOrderValue.toFixed(2)}</span>
                </div>
              </div>

              {/* Order History */}
              <div className="modal-orders-section">
                <h4 className="modal-section-title">
                  <ShoppingBag size={15} color="var(--primary)" /> Store Purchase History ({selectedCustomer.orders.length})
                </h4>

                {selectedCustomer.orders.length === 0 ? (
                  <div className="modal-empty-orders">
                    <Clock size={24} color="#94a3b8" />
                    <div>No store purchases recorded yet</div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                      Customer is registered in Chennai delivery radius. Future order dispatch runs will automatically log here.
                    </p>
                  </div>
                ) : (
                  <div className="modal-order-cards-list">
                    {selectedCustomer.orders.map((ord, oIdx) => {
                      const displayId = (ord.id || ord.orderId || `ORD-${oIdx + 1}`).slice(-8).toUpperCase();
                      const status = (ord.orderStatus || ord.status || 'DELIVERED').toUpperCase();

                      return (
                        <div key={ord.id || oIdx} className="modal-order-card">
                          <div className="modal-order-header">
                            <div>
                              <div className="modal-order-id">#{displayId}</div>
                              <div className="modal-order-date">
                                <Calendar size={11} /> {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'Recent Dispatch'}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span className="order-status-badge status-badge-ready">
                                {status}
                              </span>
                              <div className="modal-order-amt">₹{(ord.total || 0).toFixed(2)}</div>
                            </div>
                          </div>

                          {/* Items Preview */}
                          {ord.items && ord.items.length > 0 && (
                            <div className="modal-order-items-pills">
                              {ord.items.map((it, itIdx) => (
                                <span key={itIdx} className="order-item-chip">
                                  {it.name || it.productName || 'Item'} × {it.quantity || 1}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="customer-modal-footer">
              <a 
                href={`tel:${selectedCustomer.phone}`}
                className="btn-modal-action-phone"
              >
                <Phone size={13} /> Call {selectedCustomer.name.split(' ')[0]}
              </a>

              <button 
                type="button" 
                className="btn-modal-close-main"
                onClick={() => setSelectedCustomer(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomersPage;
