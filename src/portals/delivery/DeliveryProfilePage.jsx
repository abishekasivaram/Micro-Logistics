import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Phone, MapPin, Truck, CheckCircle, Save } from 'lucide-react';

const DeliveryProfilePage = () => {
  const { currentUser, updateDeliveryAgent } = useAppContext();
  
  // Local state for edits
  const [availability, setAvailability] = useState(currentUser?.availability || 'Available');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [currentArea, setCurrentArea] = useState(currentUser?.currentArea || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // In a real app we would call updateUserProfile or updateDeliveryAgent
    // Note: To completely integrate with Admin page we need to update the deliveryAgents array
    updateDeliveryAgent(currentUser.id, {
      availability,
      phone,
      currentArea
    });
    
    // Also update currentUser context
    // In our context structure, updateDeliveryAgent doesn't immediately update currentUser, 
    // but the next login would. So for UX:
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2>Profile & Availability</h2>
        <p className="text-secondary">Manage your delivery partner settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} className="text-primary" /> Personal Information
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '2rem', color: '#adb5bd' 
            }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{currentUser?.name}</h4>
              <p className="text-secondary" style={{ margin: 0 }}>ID: {currentUser?.id}</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="del-phone" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Phone Number</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', padding: '8px 12px' }}>
              <Phone size={16} className="text-secondary" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                id="del-phone"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="del-area" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Service Area</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', padding: '8px 12px' }}>
              <MapPin size={16} className="text-secondary" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                id="del-area"
                value={currentArea} 
                onChange={(e) => setCurrentArea(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="del-vehicle" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Vehicle Information</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '4px', padding: '8px 12px', color: '#495057' }}>
              <Truck size={16} className="text-secondary" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                id="del-vehicle"
                value={currentUser?.vehicle || 'N/A'} 
                readOnly
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#495057' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px', display: 'block' }}>Contact admin to change vehicle details.</span>
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3 style={{ marginBottom: '20px' }}>Current Status</h3>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Set Availability</label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="avail-available" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: `1px solid ${availability === 'Available' ? '#28a745' : '#dee2e6'}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: availability === 'Available' ? '#f0fff4' : 'transparent' }}>
                <input 
                  id="avail-available"
                  type="radio" 
                  name="availability" 
                  value="Available"
                  checked={availability === 'Available'}
                  onChange={(e) => setAvailability(e.target.value)}
                />
                <div>
                  <strong style={{ display: 'block' }}>Available</strong>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Ready to receive new batches</span>
                </div>
              </label>
              
              <label htmlFor="avail-ondelivery" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: `1px solid ${availability === 'On Delivery' ? '#007bff' : '#dee2e6'}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: availability === 'On Delivery' ? '#e6f2ff' : 'transparent' }}>
                <input 
                  id="avail-ondelivery"
                  type="radio" 
                  name="availability" 
                  value="On Delivery"
                  checked={availability === 'On Delivery'}
                  onChange={(e) => setAvailability(e.target.value)}
                />
                <div>
                  <strong style={{ display: 'block' }}>On Delivery</strong>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Currently handling an assigned batch</span>
                </div>
              </label>
              
              <label htmlFor="avail-offline" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: `1px solid ${availability === 'Offline' ? '#6c757d' : '#dee2e6'}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: availability === 'Offline' ? '#f8f9fa' : 'transparent' }}>
                <input 
                  id="avail-offline"
                  type="radio" 
                  name="availability" 
                  value="Offline"
                  checked={availability === 'Offline'}
                  onChange={(e) => setAvailability(e.target.value)}
                />
                <div>
                  <strong style={{ display: 'block' }}>Offline</strong>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Not accepting new batches</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            className="btn btn-primary w-full"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
            {isSaved ? 'Saved Successfully' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfilePage;
