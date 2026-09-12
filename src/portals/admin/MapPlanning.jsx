import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Map, MapPin, Truck, CheckCircle, Package } from 'lucide-react';
import './MapPlanning.css';

const MapPlanning = () => {
  const { 
    orders, 
    vendors, 
    customers, 
    deliveryPersonnel, 
    deliveryGroups, 
    createDeliveryGroup 
  } = useAppContext();
  
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');

  // Handle pre-selected orders from Orders page
  useEffect(() => {
    if (location.state?.preSelectedOrders) {
      setSelectedOrders(location.state.preSelectedOrders);
      // Clear the state so it doesn't re-trigger unnecessarily, though React Router handles history state
    }
  }, [location.state]);

  // Helper to get full data
  const getFullOrderData = (order) => {
    return {
      ...order,
      vendor: vendors.find(v => v.id === order.vendorId) || {},
      customer: customers.find(c => c.id === order.customerId) || {}
    };
  };

  // Only show orders that are NOT yet assigned to a delivery group
  const availableOrders = orders
    .filter(o => !o.deliveryGroupId)
    .map(getFullOrderData);

  const toggleOrderSelection = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleAssignDelivery = () => {
     if (selectedOrders.length === 0) return;
     
     // createDeliveryGroup updates global state
     createDeliveryGroup(selectedOrders, selectedDriver || null);
     
     setSelectedOrders([]);
     setSelectedDriver('');
     
     // Optionally navigate to deliveries page after creation
     // navigate('/deliveries');
  };

  return (
    <div className="map-planning-container">
      <div className="map-planning-header">
        <h2>Map-Based Delivery Planning</h2>
        <p>Group nearby orders for efficient delivery routing</p>
      </div>

      <div className="map-planning-layout">
        {/* Panel 1: Available Orders */}
        <div className="panel order-panel">
          <h3>Available Orders</h3>
          <div className="order-list">
            {availableOrders.map(order => (
              <div 
                key={order.id} 
                className={`order-card ${selectedOrders.includes(order.id) ? 'selected' : ''}`}
                onClick={() => toggleOrderSelection(order.id)}
              >
                <div className="order-card-header">
                  <span className="order-id">{order.id}</span>
                  <span className="order-status badge badge-pending">{order.status}</span>
                </div>
                <div className="order-details">
                  <p><strong>Vendor:</strong> {order.vendor.name}</p>
                  <p><strong>Customer:</strong> {order.customer.name}</p>
                  <p><strong>Items:</strong> {order.items.reduce((acc, item) => acc + item.qty, 0)}</p>
                </div>
              </div>
            ))}
            {availableOrders.length === 0 && <p className="empty-state">No unassigned orders available.</p>}
          </div>
        </div>

        {/* Panel 2: Map Area */}
        <div className="panel map-panel">
          <div className="map-placeholder">
            <div className="map-visual">
                {vendors.map((vendor, idx) => (
                    <div key={vendor.id} className="map-marker vendor-marker" style={{ top: `${20 + idx * 30}%`, left: `${30 + idx * 10}%` }}>
                        <MapPin size={24} color="var(--color-primary)" />
                        <span className="marker-label">{vendor.name}</span>
                    </div>
                ))}
                {customers.map((customer, idx) => (
                    <div key={customer.id} className="map-marker customer-marker" style={{ top: `${60 - idx * 15}%`, left: `${60 + idx * 10}%` }}>
                        <Package size={20} color="var(--color-warning)" />
                        <span className="marker-label">{customer.name}</span>
                    </div>
                ))}
                {deliveryPersonnel.map((dp, idx) => (
                    <div key={dp.id} className="map-marker dp-marker" style={{ top: `${40 + idx * 10}%`, left: `${10 + idx * 40}%` }}>
                        <Truck size={24} color={dp.status === 'Available' ? "var(--color-success)" : "var(--color-text-secondary)"} />
                        <span className="marker-label">{dp.name}</span>
                    </div>
                ))}
            </div>
            <div className="map-overlay">
              <span><Map size={16} /> Interactive Map Placeholder</span>
              <small>Orders selected: {selectedOrders.length}</small>
            </div>
          </div>
        </div>

        {/* Panel 3: Delivery Grouping */}
        <div className="panel group-panel">
          <h3>Delivery Grouping</h3>
          
          <div className={selectedOrders.length === 0 ? "group-planning-state" : "active-group-state"}>
            {selectedOrders.length === 0 ? (
              <>
                <p>Select orders from the left panel to group them.</p>
                <div className="selected-summary">
                  <span>0</span> orders selected
                </div>
              </>
            ) : (
              <>
                <div className="group-header">
                  <h4>New Group Planning</h4>
                  <span className="badge badge-planning">Draft</span>
                </div>
                
                <div className="group-stats">
                  <div className="stat-row">
                    <span>Selected Orders:</span>
                    <strong>{selectedOrders.length}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Estimated Distance:</span>
                    <strong>~4.2 miles</strong>
                  </div>
                </div>

                <div className="assignment-section">
                  <label>Assign Personnel (Optional):</label>
                  <select 
                    className="form-control"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                  >
                    <option value="">Leave Unassigned</option>
                    {deliveryPersonnel.filter(dp => dp.status === 'Available').map(dp => (
                      <option key={dp.id} value={dp.id}>{dp.name} (Available)</option>
                    ))}
                  </select>
                </div>

                <div className="group-actions">
                  <button className="btn btn-outline w-full" onClick={() => setSelectedOrders([])}>
                    Clear Selection
                  </button>
                  <button className="btn btn-success w-full flex items-center justify-center gap-2" onClick={handleAssignDelivery}>
                    <CheckCircle size={18} /> Confirm & Assign Group
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPlanning;
