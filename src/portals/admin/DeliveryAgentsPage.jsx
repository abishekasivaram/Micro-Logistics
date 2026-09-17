import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { Navigation, Plus, Search, UserCheck, Phone, Edit, X, Star, Truck, UserX, Shield, Bike } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const DeliveryAgentsPage = () => {
  const { deliveryAgents, addDeliveryAgent, updateDeliveryAgent, deliveryBatches } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', phone: '', currentArea: 'T. Nagar', capacity: 5, vehicle: 'Electric Scooter' });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

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

  const getInitials = (name) => {
    if (!name) return 'DA';
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
            Delivery Fleet & Courier Operations
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> {deliveryAgents.length} FLEET UNITS
            </span>
          </h2>
          <p className="page-subtitle">
            Real-time tracking of active field delivery agents, vehicle dispatch allocation, payload capacity, and availability toggles.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} /> Onboard New Agent
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="table-filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by agent name, phone, operating area..."
              value={searchTerm}
              aria-label="Search delivery agents by name, phone, or operating area"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="form-select" 
              value={statusFilter} 
              aria-label="Filter delivery agents by status"
              onChange={e => setStatusFilter(e.target.value)} 
            >
              <option value="ALL">All Fleet Statuses</option>
              <option value="Available">Available (Ready)</option>
              <option value="On Delivery">On Delivery</option>
              <option value="Offline">Offline / Off-Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Agent Ref</th>
              <th>Courier Agent</th>
              <th>Direct Phone</th>
              <th>Operating Sector</th>
              <th>Vehicle Asset</th>
              <th>Active Load</th>
              <th>Status</th>
              <th>Performance</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state-box">
                  <h4>No fleet agents found</h4>
                  <p>Try modifying your search criteria or add a new delivery agent.</p>
                </td>
              </tr>
            ) : (
              filteredAgents.map(a => {
                const isAvail = a.status === 'Available' || a.availability === 'Available';
                const currentOrders = a.currentOrders || 0;
                const capacity = a.capacity || 5;
                const loadPercentage = Math.min((currentOrders / capacity) * 100, 100);

                return (
                  <tr key={a.id}>
                    <td>
                      <span className="order-id-chip">{a.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar-squircle" style={{ background: '#ECFDF5', color: '#059669', borderColor: 'rgba(5, 150, 105, 0.2)' }}>
                          {getInitials(a.name)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{a.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Verified Driver</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-family-mono)', color: '#475569' }}>
                        {a.phone}
                      </span>
                    </td>
                    <td>
                      <span className="aggregation-tag">{a.currentArea || 'Central'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                        <Truck size={14} className="text-accent" />
                        <span>{a.vehicle || 'Electric Scooter'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '110px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 600 }}>{currentOrders} / {capacity}</span>
                          <span style={{ color: '#64748B' }}>{Math.round(loadPercentage)}%</span>
                        </div>
                        <div className="mini-progress-track">
                          <div 
                            className={`mini-progress-fill ${loadPercentage > 80 ? '' : 'indigo'}`}
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={a.status || 'Available'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: '#D97706' }}>
                        <Star size={13} fill="#D97706" />
                        <span>{a.rating || 4.9}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className={`btn btn-sm ${isAvail ? 'btn-danger' : 'btn-outline'}`}
                        onClick={() => updateDeliveryAgent(a.id, { 
                          status: isAvail ? 'Offline' : 'Available', 
                          availability: isAvail ? 'Offline' : 'Available' 
                        })}
                        style={{ minWidth: '96px' }}
                      >
                        {isAvail ? 'Set Offline' : 'Set Active'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="table-footer">
          <span>Displaying {filteredAgents.length} of {deliveryAgents.length} active fleet agents</span>
          <span style={{ fontFamily: 'var(--font-family-mono)' }}>TELEMETRY PING: 100% ONLINE</span>
        </div>
      </div>

      {/* Onboard Agent Modal - Mounted via Portal to document.body */}
      {isAddModalOpen && createPortal(
        <div className="modal-backdrop-command" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-title-with-icon">
                <div className="modal-icon-badge">
                  <Navigation size={20} />
                </div>
                <div>
                  <h3>Onboard Delivery Agent</h3>
                  <span className="modal-subtitle">Enroll verified courier to local fleet mesh</span>
                </div>
              </div>
              <button className="modal-close-trigger" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-dialog-body">
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Driver Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Ramesh Kumar"
                    value={newAgent.name}
                    onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Contact Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="e.g. 9840198765"
                    value={newAgent.phone}
                    onChange={e => setNewAgent({ ...newAgent, phone: e.target.value })}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Primary Operating Area</label>
                    <select 
                      className="form-select"
                      value={newAgent.currentArea}
                      onChange={e => setNewAgent({ ...newAgent, currentArea: e.target.value })}
                    >
                      <option value="T. Nagar">T. Nagar Sector</option>
                      <option value="Adyar">Adyar Sector</option>
                      <option value="Anna Nagar">Anna Nagar Sector</option>
                      <option value="Velachery">Velachery Sector</option>
                      <option value="Mylapore">Mylapore Sector</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Vehicle Asset Type</label>
                    <select 
                      className="form-select"
                      value={newAgent.vehicle}
                      onChange={e => setNewAgent({ ...newAgent, vehicle: e.target.value })}
                    >
                      <option value="Electric Scooter">Electric Scooter</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Cargo E-Bike">Cargo E-Bike</option>
                      <option value="Delivery Van">Delivery Van</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Max Order Batch Capacity</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    className="form-control" 
                    value={newAgent.capacity}
                    onChange={e => setNewAgent({ ...newAgent, capacity: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} /> Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DeliveryAgentsPage;
