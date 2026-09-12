import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Store, Search, Filter, CheckCircle, Ban, Eye, X, Star, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { getStatusBadgeClass } from '../../utils/aggregationUtils';
import '../seller/DashboardOverview.css';

const AdminSellersPage = () => {
  const { vendors, updateSellerStatus, orders, products } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [selectedSeller, setSelectedSeller] = useState(null);

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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Seller Network Directory & Onboarding</h2>
          <p>Manage, verify, approve, and audit participating local sellers in the Micro-Logistics Network.</p>
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
              placeholder="Search by store name, owner, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select className="form-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending Approval</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select className="form-control" value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Areas</option>
              {areas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller ID</th>
                <th>Business & Owner</th>
                <th>Category</th>
                <th>Location Area</th>
                <th>Contact Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">No local sellers matched your search criteria.</td></tr>
              ) : (
                filteredVendors.map(v => {
                  const sellerStatus = v.status || 'Active';
                  return (
                    <tr key={v.id}>
                      <td className="font-medium">{v.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={v.logo} alt={v.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <strong style={{ display: 'block', color: '#1e293b' }}>{v.name}</strong>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Owner: {v.ownerName || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-secondary">{v.category}</span></td>
                      <td>{v.area || 'Central'}</td>
                      <td>{v.phone}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(sellerStatus)}`}>
                          {sellerStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{v.joinDate || '2026-01-01'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => setSelectedSeller(v)} title="View Store Profile">
                            <Eye size={14} /> View
                          </button>
                          {sellerStatus === 'Pending' && (
                            <button className="btn btn-sm btn-primary" onClick={() => updateSellerStatus(v.id, 'Active')} title="Approve Onboarding">
                              <CheckCircle size={14} /> Approve
                            </button>
                          )}
                          {sellerStatus === 'Active' && (
                            <button className="btn btn-sm btn-outline text-danger" onClick={() => updateSellerStatus(v.id, 'Suspended')} title="Suspend Store">
                              <Ban size={14} /> Suspend
                            </button>
                          )}
                          {sellerStatus === 'Suspended' && (
                            <button className="btn btn-sm btn-outline text-success" onClick={() => updateSellerStatus(v.id, 'Active')} title="Activate Store">
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

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Store size={22} className="text-primary" /> {selectedSeller.name}
              </h3>
              <button className="modal-close" onClick={() => setSelectedSeller(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
                <img src={selectedSeller.logo} alt={selectedSeller.name} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0 }}>{selectedSeller.name}</h4>
                    <span className={`badge ${getStatusBadgeClass(selectedSeller.status || 'Active')}`}>
                      {selectedSeller.status || 'Active'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{selectedSeller.description}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '14px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div><strong>Owner:</strong> {selectedSeller.ownerName || 'N/A'}</div>
                <div><strong>Category:</strong> {selectedSeller.category}</div>
                <div><strong>Phone:</strong> {selectedSeller.phone}</div>
                <div><strong>Email:</strong> {selectedSeller.email}</div>
                <div><strong>Hours:</strong> {selectedSeller.operatingHours}</div>
                <div><strong>Rating:</strong> ⭐ {selectedSeller.rating || 4.8} / 5</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Pickup Address:</strong> {selectedSeller.address}</div>
              </div>

              <h5 style={{ marginBottom: '8px' }}>Associated Catalog Products</h5>
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                {products.filter(p => p.vendorId === selectedSeller.id).length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No products uploaded by this seller yet.</p>
                ) : (
                  products.filter(p => p.vendorId === selectedSeller.id).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                      <span>{p.name}</span>
                      <span className="font-medium">₹{p.price.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedSeller.status === 'Active' ? (
                  <button className="btn btn-outline text-danger" onClick={() => { updateSellerStatus(selectedSeller.id, 'Suspended'); setSelectedSeller(null); }}>
                    Suspend Store
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => { updateSellerStatus(selectedSeller.id, 'Active'); setSelectedSeller(null); }}>
                    Approve / Activate Store
                  </button>
                )}
              </div>
              <button className="btn btn-outline" onClick={() => setSelectedSeller(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellersPage;
