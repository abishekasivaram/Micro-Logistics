import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Mail, Phone, MapPin, Users, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import './CustomersPage.css';

const CustomersPage = () => {
  const { customers = [], orders = [], currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';

  const enrichedCustomers = customers.map(customer => {
    const customerOrders = orders.filter(o => 
      (o.customerId === customer.id || o.customerName === customer.name) &&
      (currentUser?.role === 'admin' || o.vendorId === sellerId || o.vendorId === 'v1')
    );
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      ...customer,
      orderCount: customerOrders.length,
      totalSpent
    };
  });

  const filteredCustomers = enrichedCustomers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm) ||
    (c.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="seller-customers-page">
      {/* Header */}
      <div className="deliveries-header-row">
        <div>
          <div className="orders-title-badge">
            <Users size={12} /> Local Patrons
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            Store Customer Base
          </h1>
          <p className="page-subtitle">
            Profiles, lifetime order metrics, and contact info for your frequent neighborhood shoppers.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon-left" />
          <input 
            type="text" 
            placeholder="Search customers by name, phone or address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">
            <Users size={28} />
          </div>
          <h3 className="orders-empty-title">No customers found</h3>
          <p className="orders-empty-desc">
            Customers will appear here automatically when they place an order with your store.
          </p>
        </div>
      ) : (
        <div className="customers-grid">
          {filteredCustomers.map(customer => {
            const isVIP = customer.totalSpent > 1000 || customer.orderCount >= 3;
            return (
              <div key={customer.id} className="customer-card">
                <div className="cust-top-row">
                  <div className="cust-avatar-large">
                    {(customer.name || 'C').charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>
                        {customer.name}
                      </div>
                      {isVIP && (
                        <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                          VIP
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {customer.address || 'RS Puram, Coimbatore'}
                    </div>
                  </div>
                </div>

                <div className="cust-metrics-box">
                  <div className="cust-metric-item">
                    <span className="cust-metric-label">Orders Placed</span>
                    <span className="cust-metric-value">{customer.orderCount}</span>
                  </div>
                  <div className="cust-metric-item">
                    <span className="cust-metric-label">Lifetime Spend</span>
                    <span className="cust-metric-value">₹{customer.totalSpent.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--primary)" />
                    <span>{customer.phone || '+91 94432 10987'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--text-muted)" />
                    <span>{customer.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
