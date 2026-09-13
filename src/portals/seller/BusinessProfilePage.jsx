import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Store, User, Mail, Phone, MapPin, Clock, Save, CheckCircle, Image as ImageIcon } from 'lucide-react';
import '../customer/ProfilePage.css';

const BusinessProfilePage = () => {
  const { currentUser, updateSellerProfile } = useAppContext();

  const [formData, setFormData] = useState({
    businessName: currentUser?.shopName || currentUser?.name || '',
    ownerName: currentUser?.ownerName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    category: currentUser?.category || 'Local Grocery Store',
    businessAddress: currentUser?.address || '',
    operatingHours: currentUser?.operatingHours || '',
    description: currentUser?.description || '',
    logo: currentUser?.logo || ''
  });

  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSellerProfile({
      name: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      category: formData.category,
      address: formData.businessAddress,
      operatingHours: formData.operatingHours,
      description: formData.description,
      logo: formData.logo
    });

    setSuccessMsg('Seller business profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Seller Business Profile</h2>
          <p>Update store branding, operating hours, contact information, and pickup address.</p>
        </div>
      </div>

      {successMsg && (
        <div className="profile-toast success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="profile-grid-container">
        
        {/* Left Side: Store Preview Card */}
        <div className="profile-card avatar-card">
          <div className="avatar-preview-wrap" style={{ borderRadius: '16px', width: '110px', height: '110px' }}>
            <img src={formData.logo} alt="Store Logo" />
          </div>
          <h3>{formData.businessName}</h3>
          <span className="profile-role-badge">{formData.category}</span>
          <p className="profile-address-snippet">{formData.businessAddress}</p>

          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', width: '100%', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <div><strong>Owner:</strong> {formData.ownerName}</div>
            <div><strong>Hours:</strong> {formData.operatingHours}</div>
            <div><strong>Contact:</strong> {formData.phone}</div>
          </div>
        </div>

        {/* Right Side: Edit Store Form */}
        <div className="profile-card form-card">
          <form onSubmit={handleSubmit} className="profile-form">
            <h3 className="form-section-title">Store Details & Branding</h3>

            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="bprof-bizname">Business / Store Name *</label>
                <input 
                  type="text" 
                  id="bprof-bizname"
                  className="form-control" 
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="bprof-ownername">Owner / Manager Name *</label>
                <input 
                  type="text" 
                  id="bprof-ownername"
                  className="form-control" 
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="bprof-category">Business Category *</label>
                <select 
                  id="bprof-category"
                  className="form-control"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Local Grocery Store">Local Grocery Store</option>
                  <option value="Fresh Fruits & Vegetables">Fresh Fruits & Vegetables</option>
                  <option value="Bakery">Bakery & Confectionery</option>
                  <option value="Pharmacy">Pharmacy & Healthcare</option>
                  <option value="Electronics Store">Electronics & Accessories</option>
                  <option value="Clothing Store">Apparel & Textiles</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bprof-hours">Operating Hours</label>
                <input 
                  type="text" 
                  id="bprof-hours"
                  className="form-control" 
                  value={formData.operatingHours}
                  onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bprof-phone">Contact Phone *</label>
                <input 
                  type="tel" 
                  id="bprof-phone"
                  className="form-control" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="bprof-email">Business Email *</label>
                <input 
                  type="email" 
                  id="bprof-email"
                  className="form-control" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="bprof-address">Pickup Location Address *</label>
                <input 
                  type="text" 
                  id="bprof-address"
                  className="form-control" 
                  value={formData.businessAddress}
                  onChange={e => setFormData({ ...formData, businessAddress: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="bprof-logo">Store Logo URL</label>
                <input 
                  type="url" 
                  id="bprof-logo"
                  className="form-control" 
                  value={formData.logo}
                  onChange={e => setFormData({ ...formData, logo: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="bprof-desc">Store Description</label>
                <textarea 
                  id="bprof-desc"
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn btn-primary flex items-center gap-2">
                <Save size={18} /> Update Business Profile
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default BusinessProfilePage;
