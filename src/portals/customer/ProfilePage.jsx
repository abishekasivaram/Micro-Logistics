import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { User, Mail, Phone, MapPin, Save, Lock, Camera, CheckCircle, Heart, Trash2, ShoppingCart } from 'lucide-react';
import './ProfilePage.css';
import './CustomerProfilePage.css';

const DEFAULT_WISHLIST = [
  {
    id: 'p_fv4',
    name: 'Crisp Shimla Royal Gala Apples (4 Pcs)',
    category: 'Fruits & Veg',
    price: 180.00,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v3',
    vendorName: 'Kovai Fresh Mart'
  },
  {
    id: 'p_b3',
    name: '100% Whole Wheat Multi-Grain Bread (400g)',
    category: 'Bakery',
    price: 50.00,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v4',
    vendorName: 'Royal Bakery & Sweets'
  },
  {
    id: 'p_d6',
    name: 'Nandini Pure Golden Cow Ghee (500ml Jar)',
    category: 'Dairy',
    price: 330.00,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v2',
    vendorName: 'Sri Lakshmi Organics'
  },
  {
    id: 'p_e2',
    name: 'Active Noise Cancelling TWS Earbuds (BT 5.3)',
    category: 'Electronics',
    price: 1999.00,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v6',
    vendorName: 'City Tech & Electronics'
  }
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateUserProfile, addToCart, addNotification } = useAppContext();

  const tabParam = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(tabParam);

  // Sync tab with URL query parameter
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    } else if (!currentTab && activeTab !== 'details') {
      setActiveTab('details');
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'details') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabName });
    }
  };

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('micrologi_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(item => item && typeof item === 'object' && item.name);
          if (valid.length > 0) return valid;
        }
      }
      return DEFAULT_WISHLIST;
    } catch {
      return DEFAULT_WISHLIST;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('micrologi_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlistItems]);

  const handleRemoveWishlist = (itemId, itemName) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    if (addNotification) {
      addNotification(`Removed "${itemName || 'Item'}" from wishlist.`, 'system');
    }
  };

  const handleAddToCartFromWishlist = (item) => {
    if (addToCart) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        vendorId: item.vendorId || 'v1',
        vendorName: item.vendorName || 'Local Seller'
      }, 1);
      if (addNotification) {
        addNotification(`Added "${item.name}" to cart.`, 'cart');
      }
    }
  };

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
              onClick={() => handleTabChange('details')}
            >
              <User size={16} /> Edit Profile Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => handleTabChange('password')}
            >
              <Lock size={16} /> Change Password
            </button>
            {(!currentUser || currentUser?.role !== 'vendor') && (
              <button 
                className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => handleTabChange('wishlist')}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Heart size={20} fill="#ef4444" color="#ef4444" /> My Wishlist ({wishlistItems.length})
                </h3>
                {wishlistItems.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => {
                      setWishlistItems([]);
                      if (addNotification) addNotification('Cleared your wishlist.', 'system');
                    }}
                    style={{ fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>Saved items from your favorite local sellers.</p>
              
              {wishlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '14px', border: '1.5px dashed #e2e8f0' }}>
                  <Heart size={44} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontWeight: '700' }}>Your wishlist is empty</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Explore products and save your favorite items for later.</p>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => navigate('/products')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '13.5px' }}
                  >
                    <ShoppingCart size={15} /> Explore Products
                  </button>
                </div>
              ) : (
                <div className="customer-wishlist-grid">
                  {wishlistItems.map((item, idx) => (
                    <div key={item.id || `wish-${idx}`} className="wishlist-mock-card">
                      <div className="wishlist-img-box">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                          alt={item.name || 'Wishlist item'}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                          }}
                        />
                        <button 
                          type="button"
                          className="remove-wishlist-btn" 
                          title="Remove item"
                          onClick={() => handleRemoveWishlist(item.id, item.name)}
                        >
                          <Trash2 size={16} />
                        </button>
                        {item.category && (
                          <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', color: '#4f46e5', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(79,70,229,0.1)' }}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="wishlist-info">
                        <h4>{item.name || 'Unnamed Product'}</h4>
                        {item.vendorName && (
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{item.vendorName}</span>
                        )}
                        <span className="price">₹{Number(item.price || 0).toFixed(2)}</span>
                        <button 
                          type="button"
                          className="wishlist-action-btn"
                          onClick={() => handleAddToCartFromWishlist(item)}
                        >
                          <ShoppingCart size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
