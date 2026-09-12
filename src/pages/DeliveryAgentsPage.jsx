import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navigation, Plus, Search, UserCheck, Phone, Edit, X, Star, Truck } from 'lucide-react';
import { getStatusBadgeClass } from '../utils/aggregationUtils';
import './DashboardOverview.css';

const DeliveryAgentsPage = () => {
  const { deliveryAgents, addDeliveryAgent, updateDeliveryAgent, deliveryBatches } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', phone: '', currentArea: 'T. Nagar', capacity: 5, vehicle: 'Electric Scooter' });

  const filteredAgents = deliveryAgents.filter(a => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = (a.name || '').toLowerCase().includes(sTerm) ||
                          (a.phone || '').toLowerCase().includes(sTerm) ||
                          (a.currentArea || '').toLowerCase().includes(sTerm);
    const matchesStatus = statusFilter === 'ALL' || (a.status || 'Available') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.phone) return;
    addDeliveryAgent(newAgent);
    setIsAddModalOpen(false);
    setNewAgent({ name: '', phone: '', currentArea: 'T. Nagar', capacity: 5, vehicle: 'Electric Scooter' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Delivery Personnel & Fleet Directory</h2>
          <p>Onboard local delivery agents, configure order carrying capacities, monitor active routes, and update availability.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Add New Delivery Agent
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by agent name, phone, operating area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Delivery">On Delivery</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent ID</th>
                <th>Driver Name</th>
                <th>Contact Phone</th>
                <th>Assigned Area</th>
                <th>Vehicle Type</th>
                <th>Capacity / Active</th>
                <th>Status</th>
                <th>Rating</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr><td colSpan="9" className="empty-state">No delivery personnel found matching your filters.</td></tr>
              ) : (
                filteredAgents.map(a => {
                  const agentBatches = deliveryBatches.filter(b => b.agentId === a.id && b.status !== 'Completed');
                  const isAvail = a.status === 'Available' || a.availability === 'Available';

                  return (
                    <tr key={a.id}>
                      <td className="font-medium">{a.id}</td>
                      <td className="font-semibold" style={{ color: '#1e293b' }}>{a.name}</td>
                      <td>{a.phone}</td>
                      <td>{a.currentArea}</td>
                      <td>{a.vehicle || 'Scooter'}</td>
                      <td>
                        <span className="font-medium">{a.currentOrders || 0} / {a.capacity || 5} orders</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td>⭐ {a.rating || 4.8}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className={`btn btn-sm ${isAvail ? 'btn-outline text-danger' : 'btn-outline text-success'}`}
                          onClick={() => updateDeliveryAgent(a.id, { status: isAvail ? 'Offline' : 'Available', availability: isAvail ? 'Offline' : 'Available' })}
                        >
                          {isAvail ? 'Set Offline' : 'Set Available'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Onboard New Delivery Agent</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Arun Kumar"
                    value={newAgent.name}
                    onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    required 
                    placeholder="e.g. 9876543210"
                    value={newAgent.phone}
                    onChange={e => setNewAgent({ ...newAgent, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Operating Area / Hub</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Adyar / Mylapore"
                    value={newAgent.currentArea}
                    onChange={e => setNewAgent({ ...newAgent, currentArea: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Max Order Carrying Capacity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="1" 
                    max="10" 
                    value={newAgent.capacity}
                    onChange={e => setNewAgent({ ...newAgent, capacity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Vehicle Type</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Ather 450X EV / TVS XL 100"
                    value={newAgent.vehicle}
                    onChange={e => setNewAgent({ ...newAgent, vehicle: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgentsPage;
