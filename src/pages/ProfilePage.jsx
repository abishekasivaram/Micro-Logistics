import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Mail, Phone, MapPin, Save, Lock, Camera, CheckCircle } from 'lucide-react';
import './ProfilePage.css';

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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setErrorMsg('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccessMsg('Password updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
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
          </div>
        </div>

        {/* Right Side: Form View */}
        <div className="profile-card form-card">
          {activeTab === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="profile-form">
              <h3 className="form-section-title">Personal Information</h3>

              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Username *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group full-width">
                  <label>Default Delivery Address *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>City / Area Hub *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Avatar / Image URL</label>
                  <input 
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
          ) : (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <h3 className="form-section-title">Change Password</h3>

              <div className="profile-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Current Password *</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>New Password *</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Minimum 6 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input 
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
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
