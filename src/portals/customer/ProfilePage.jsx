import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Mail, Phone, MapPin, Save, Lock, Camera, CheckCircle, Heart, Trash2, ShoppingCart } from 'lucide-react';
import './ProfilePage.css';
import './CustomerProfilePage.css';

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAppContext();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'password'

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Priya Rajan',
    username: currentUser?.username || 'priyarajan',
    email: currentUser?.email || 'priya@example.com',
    phone: currentUser?.phone || '9876543210',
    address: currentUser?.address || '101 Anna Nagar East, Chennai',
    area: currentUser?.area || 'Anna Nagar',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setSuccessMsg('Profile details updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const expectedCurrentPassword = currentUser?.password || 'password123';
    if (passwordForm.currentPassword !== expectedCurrentPassword) {
      setErrorMsg('Current password is incorrect.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setErrorMsg('');
    updateUserProfile({ password: passwordForm.newPassword });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccessMsg('Password updated successfully! Next login will require your new password.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>User Profile & Settings</h2>
          <p>Manage your account personal details, delivery preferences, and security.</p>
        </div>
      </div>

      {successMsg && (
        <div className="profile-toast success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="profile-toast danger">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="profile-grid-container">
        
        {/* Left Side: Avatar Card */}
        <div className="profile-card avatar-card">
          <div className="avatar-preview-wrap">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" />
            ) : (
              <User size={48} />
            )}
          </div>
          <h3>{currentUser?.name || 'User'}</h3>
          <span className="profile-role-badge">{currentUser?.role === 'vendor' ? 'Seller Account' : 'Customer Account'}</span>
          <p className="profile-address-snippet">{formData.address}</p>

          <div className="profile-tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <User size={16} /> Edit Profile Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock size={16} /> Change Password
            </button>
            {currentUser?.role === 'customer' && (
              <button 
                className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={16} /> My Wishlist
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Form View */}
        <div className="profile-card form-card">
          {activeTab === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="profile-form">
              <h3 className="form-section-title">Personal Information</h3>

              <div className="profile-form-grid">
                <div className="form-group">
                  <label htmlFor="customer-profile-name">Full Name *</label>
                  <input 
                    id="customer-profile-name"
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-username">Username *</label>
                  <input 
                    id="customer-profile-username"
                    type="text" 
                    className="form-control" 
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-email">Email Address *</label>
                  <input 
                    id="customer-profile-email"
                    type="email" 
                    className="form-control" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-phone">Phone Number *</label>
                  <input 
                    id="customer-profile-phone"
                    type="tel" 
                    className="form-control" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="customer-profile-address">Default Delivery Address *</label>
                  <input 
                    id="customer-profile-address"
                    type="text" 
                    className="form-control" 
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-area">City / Area Hub *</label>
                  <input 
                    id="customer-profile-area"
                    type="text" 
                    className="form-control" 
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-avatar">Avatar / Image URL</label>
                  <input 
                    id="customer-profile-avatar"
                    type="url" 
                    className="form-control" 
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save size={18} /> Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <h3 className="form-section-title">Change Password</h3>

              <div className="profile-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label htmlFor="customer-profile-curr-pass">Current Password *</label>
                  <input 
                    id="customer-profile-curr-pass"
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-new-pass">New Password *</label>
                  <input 
                    id="customer-profile-new-pass"
                    type="password" 
                    className="form-control" 
                    placeholder="Minimum 6 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-profile-conf-pass">Confirm New Password *</label>
                  <input 
                    id="customer-profile-conf-pass"
                    type="password" 
                    className="form-control" 
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Lock size={18} /> Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'wishlist' && (
            <div className="customer-wishlist-view">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} fill="#ef4444" color="#ef4444" /> My Wishlist
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '-12px 0 16px 0' }}>Saved items from your favorite local sellers.</p>
              
              <div className="customer-wishlist-grid">
                {/* Mock Visual Wishlist Items */}
                <div className="wishlist-mock-card">
                  <div className="wishlist-img-box">
                    <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=200" alt="Fresh Apples" />
                    <button className="remove-wishlist-btn" title="Remove"><Trash2 size={16} /></button>
                  </div>
                  <div className="wishlist-info">
                    <h4>Fresh Apples (1kg)</h4>
                    <span className="price">₹120.00</span>
                    <button className="wishlist-action-btn"><ShoppingCart size={14} /> Add to Cart</button>
                  </div>
                </div>

                <div className="wishlist-mock-card">
                  <div className="wishlist-img-box">
                    <img src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&q=80&w=200" alt="Whole Wheat Bread" />
                    <button className="remove-wishlist-btn" title="Remove"><Trash2 size={16} /></button>
                  </div>
                  <div className="wishlist-info">
                    <h4>Whole Wheat Bread</h4>
                    <span className="price">₹45.00</span>
                    <button className="wishlist-action-btn"><ShoppingCart size={14} /> Add to Cart</button>
                  </div>
                </div>

                <div className="wishlist-mock-card">
                  <div className="wishlist-img-box">
                    <img src="https://images.unsplash.com/photo-1587049352847-8d4e8941554a?auto=format&fit=crop&q=80&w=200" alt="Organic Milk" />
                    <button className="remove-wishlist-btn" title="Remove"><Trash2 size={16} /></button>
                  </div>
                  <div className="wishlist-info">
                    <h4>Organic Milk (1L)</h4>
                    <span className="price">₹65.00</span>
                    <button className="wishlist-action-btn"><ShoppingCart size={14} /> Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
