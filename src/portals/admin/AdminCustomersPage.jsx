import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, Search, Eye, X, Phone, Mail, MapPin, CheckCircle, Ban } from 'lucide-react';
import { getStatusBadgeClass } from '../../utils/aggregationUtils';
import '../seller/DashboardOverview.css';

const AdminCustomersPage = () => {
  const { customers, updateCustomerStatus, orders } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const areas = Array.from(new Set(customers.map(c => c.area))).filter(Boolean);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === 'ALL' || c.area === areaFilter;
    const matchesStatus = statusFilter === 'ALL' || (c.status || 'Active') === statusFilter;
    return matchesSearch && matchesArea && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Customer Account Management</h2>
          <p>Global view of registered customer accounts, delivery addresses, and order histories.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by customer name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select className="form-control" value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Delivery Areas</option>
              {areas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>

            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Account Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name & Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Primary Delivery Area</th>
                <th>Total Orders</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">No customer accounts matched your search criteria.</td></tr>
              ) : (
                filteredCustomers.map(c => {
                  const custOrders = orders.filter(o => o.customerId === c.id || o.customerName === c.name);
                  const custStatus = c.status || 'Active';
                  return (
                    <tr key={c.id}>
                      <td className="font-medium">{c.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={c.avatar} alt={c.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <strong style={{ display: 'block', color: '#1e293b' }}>{c.name}</strong>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>@{c.username || 'user'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.area || 'Anna Nagar'}</td>
                      <td className="font-semibold">{custOrders.length || c.totalOrders || 0}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(custStatus)}`}>
                          {custStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => setSelectedCustomer(c)} title="View Customer Details">
                            <Eye size={14} /> View
                          </button>
                          {custStatus === 'Active' ? (
                            <button className="btn btn-sm btn-outline text-danger" onClick={() => updateCustomerStatus(c.id, 'Suspended')} title="Suspend Account">
                              <Ban size={14} /> Suspend
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-outline text-success" onClick={() => updateCustomerStatus(c.id, 'Active')} title="Activate Account">
                              <CheckCircle size={14} /> Activate
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
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Users size={22} className="text-primary" /> {selectedCustomer.name} Profile
              </h3>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: 0 }}>{selectedCustomer.name}</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>@{selectedCustomer.username || 'user'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '14px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div><strong>Email:</strong> {selectedCustomer.email}</div>
                <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                <div><strong>Delivery Area:</strong> {selectedCustomer.area}</div>
                <div><strong>Status:</strong> {selectedCustomer.status || 'Active'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Default Delivery Address:</strong> {selectedCustomer.address}</div>
              </div>

              <h5 style={{ marginBottom: '8px' }}>Recent Order History</h5>
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                {orders.filter(o => o.customerId === selectedCustomer.id || o.customerName === selectedCustomer.name).length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No orders placed yet by this customer.</p>
                ) : (
                  orders.filter(o => o.customerId === selectedCustomer.id || o.customerName === selectedCustomer.name).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                      <span><strong>{o.orderId || o.id}</strong> ({o.vendorName || 'Seller'})</span>
                      <span className="font-medium">₹{o.total.toFixed(2)} — {o.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
