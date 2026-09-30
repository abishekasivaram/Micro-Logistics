import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Store, Palette, MapPin, Users, CreditCard, UploadCloud, CheckCircle } from 'lucide-react';
import './BusinessProfilePage.css';

const BusinessProfilePage = () => {
  const { currentUser, updateSellerProfile } = useAppContext();

  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({
    businessName: currentUser?.shopName || currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    currency: 'INR (₹)',
    logo: currentUser?.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    brandColor: '#4F46E5',
    description: currentUser?.description || 'We deliver the freshest groceries in RS Puram.',
    address: currentUser?.address || '123 Market St, RS Puram'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSellerProfile({
      shopName: formData.businessName,
      email: formData.email,
      phone: formData.phone,
      description: formData.description,
      address: formData.address,
      logo: formData.logo
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const hasChanges = true; // In a real app, compare with initial state

  return (
    <div className="business-profile-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your store profile, branding, and preferences.</p>
        </div>
      </div>

      {isSaved && (
        <div style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '13px', marginBottom: '16px' }}>
          <CheckCircle size={16} /> Changes saved successfully
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-nav">
          <div className={`nav-item ${activeTab === 'General' ? 'active' : ''}`} onClick={() => setActiveTab('General')}><Store size={18} /> General</div>
          <div className={`nav-item ${activeTab === 'Branding' ? 'active' : ''}`} onClick={() => setActiveTab('Branding')}><Palette size={18} /> Branding</div>
          <div className={`nav-item ${activeTab === 'Locations' ? 'active' : ''}`} onClick={() => setActiveTab('Locations')}><MapPin size={18} /> Locations</div>
          <div className={`nav-item ${activeTab === 'Team' ? 'active' : ''}`} onClick={() => setActiveTab('Team')}><Users size={18} /> Team</div>
          <div className={`nav-item ${activeTab === 'Payouts' ? 'active' : ''}`} onClick={() => setActiveTab('Payouts')}><CreditCard size={18} /> Payouts</div>
        </div>

        <div className="profile-content">
          {activeTab === 'General' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">Store Details</h3>
                <p className="settings-card-desc">Basic information about your business.</p>
              </div>
              <div className="settings-card-body">
                <div className="form-grid-2">
                  <div className="setting-group">
                    <label className="setting-label">Store Name</label>
                    <input type="text" className="setting-input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    <div className="setting-help">This name will appear on customer receipts and tracking links.</div>
                  </div>
                  <div className="setting-group">
                    <label className="setting-label">Store Currency</label>
                    <select className="setting-input" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} disabled>
                      <option>INR (₹)</option>
                    </select>
                    <div className="setting-help">Currency is locked to your region.</div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="setting-group">
                    <label className="setting-label">Support Email</label>
                    <input type="email" className="setting-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="setting-group">
                    <label className="setting-label">Support Phone</label>
                    <input type="tel" className="setting-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Branding' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">Brand Assets</h3>
                <p className="settings-card-desc">Customize how your store appears to customers.</p>
              </div>
              <div className="settings-card-body">
                <div className="setting-group">
                  <label className="setting-label">Store Logo</label>
                  <div className="logo-upload-area">
                    <div className="logo-preview">
                      {formData.logo ? <img src={formData.logo} alt="Store logo" /> : <Store size={24} className="text-muted" />}
                    </div>
                    <div>
                      <button className="upload-btn"><UploadCloud size={16} /> Upload image</button>
                      <div className="setting-help" style={{ marginTop: '8px' }}>Recommended size: 512x512px. PNG or JPG under 2MB.</div>
                    </div>
                  </div>
                </div>

                <div className="setting-group" style={{ marginTop: '16px' }}>
                  <label className="setting-label">Brand Color</label>
                  <div className="color-picker-group">
                    <div className="color-preview" style={{ background: formData.brandColor }}></div>
                    <input type="text" className="setting-input" style={{ width: '120px', fontFamily: 'var(--font-mono)' }} value={formData.brandColor} onChange={e => setFormData({...formData, brandColor: e.target.value})} />
                  </div>
                  <div className="setting-help">Used for buttons and highlights on your storefront.</div>
                </div>

                <div className="setting-group" style={{ marginTop: '16px' }}>
                  <label className="setting-label">Store Description</label>
                  <textarea className="setting-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  <div className="setting-help">A brief description of your store and what you sell.</div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'Locations' || activeTab === 'Team' || activeTab === 'Payouts') && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">{activeTab}</h3>
                <p className="settings-card-desc">Configure {activeTab.toLowerCase()} settings.</p>
              </div>
              <div className="settings-card-body" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>This section is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="sticky-save-bar">
          <button className="btn btn-outline" style={{ background: 'transparent', border: 'none' }} onClick={() => {}}>Discard changes</button>
          <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
        </div>
      )}
    </div>
  );
};

export default BusinessProfilePage;
