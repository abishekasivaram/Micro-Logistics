import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  User, Save, Lock, CheckCircle, 
  Heart, Trash2, ShoppingCart, Search, Store, Star, 
  Sparkles, Check, Zap, RefreshCw, ShoppingBag 
} from 'lucide-react';
import { getProductImage, handleProductImageError } from '../../utils/imageUtils';
import './ProfilePage.css';
import './CustomerProfilePage.css';
import './CustomerWishlist.css';

const DEFAULT_WISHLIST = [
  {
    id: 'p_fv4',
    name: 'Crisp Shimla Royal Gala Apples (4 Pcs)',
    category: 'Fruits & Veg',
    price: 180.00,
    originalPrice: 220.00,
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v3',
    vendorName: 'Kovai Fresh Mart',
    vendorDistance: '1.2 km',
    tag: 'Fresh Arrival',
    inStock: true,
    deliveryTime: '20-30 mins'
  },
  {
    id: 'p_b3',
    name: '100% Whole Wheat Multi-Grain Bread (400g)',
    category: 'Bakery',
    price: 50.00,
    originalPrice: 65.00,
    rating: 4.9,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v4',
    vendorName: 'Royal Bakery & Sweets',
    vendorDistance: '0.8 km',
    tag: 'Freshly Baked',
    inStock: true,
    deliveryTime: '15-25 mins'
  },
  {
    id: 'p_d6',
    name: 'Nandini Pure Golden Cow Ghee (500ml Jar)',
    category: 'Dairy',
    price: 330.00,
    originalPrice: 380.00,
    rating: 4.7,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v2',
    vendorName: 'Sri Lakshmi Organics',
    vendorDistance: '2.4 km',
    tag: 'Farm Pure',
    inStock: true,
    deliveryTime: '25-35 mins'
  },
  {
    id: 'p_e2',
    name: 'Active Noise Cancelling TWS Earbuds (BT 5.3)',
    category: 'Electronics',
    price: 1999.00,
    originalPrice: 2499.00,
    rating: 4.6,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    vendorId: 'v6',
    vendorName: 'City Tech & Electronics',
    vendorDistance: '3.1 km',
    tag: 'Best Seller',
    inStock: true,
    deliveryTime: '30-45 mins'
  }
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateUserProfile, addToCart, addNotification } = useAppContext();

  const tabParam = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(tabParam);

  // Wishlist Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [addedItemsMap, setAddedItemsMap] = useState({});

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
        image: getProductImage(item),
        vendorId: item.vendorId || 'v1',
        vendorName: item.vendorName || 'Local Seller'
      }, 1);

      setAddedItemsMap(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedItemsMap(prev => ({ ...prev, [item.id]: false }));
      }, 2000);

      if (addNotification) {
        addNotification(`Added "${item.name}" to cart.`, 'cart');
      }
    }
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: getProductImage(item),
        vendorId: item.vendorId || 'v1',
        vendorName: item.vendorName || 'Local Seller'
      }, 1);
    });
    if (addNotification) {
      addNotification(`Added all ${wishlistItems.length} wishlist items to cart!`, 'cart');
    }
  };

  const handleRestoreSamples = () => {
    setWishlistItems(DEFAULT_WISHLIST);
    if (addNotification) {
      addNotification('Restored sample wishlist items.', 'system');
    }
  };

  // Dynamic Wishlist Categories
  const categories = useMemo(() => {
    const set = new Set();
    wishlistItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [wishlistItems]);

  // Filtered & Sorted Wishlist Items
  const filteredWishlist = useMemo(() => {
    return wishlistItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'rating') return (Number(b.rating) || 4.5) - (Number(a.rating) || 4.5);
      return 0; // featured/default order
    });
  }, [wishlistItems, selectedCategory, searchQuery, sortBy]);

  // Wishlist Statistics
  const totalWishlistValue = useMemo(() => {
    return wishlistItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [wishlistItems]);

  const uniqueSellersCount = useMemo(() => {
    const set = new Set(wishlistItems.map(item => item.vendorName || item.vendorId || 'Store'));
    return set.size;
  }, [wishlistItems]);

  // User Profile Form State & Handlers (Completely Preserved)
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

      {/* =========================================================================
          WISHLIST VIEW: Dedicated, Full-Width, Attractive Modern Experience
         ========================================================================= */}
      {activeTab === 'wishlist' ? (
        <div className="wishlist-page-wrapper">
          {/* Header Banner */}
          <div className="wishlist-hero-header">
            <div className="wishlist-title-group">
              <h1>
                <Heart size={28} color="#ef4444" fill="#ef4444" />
                My Wishlist
                <span className="wishlist-count-badge">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</span>
              </h1>
              <p className="wishlist-hero-subtitle">
                Saved favorites from your favorite local sellers, ready for one-click ordering & express delivery.
              </p>
            </div>

            <div className="wishlist-header-actions">
              <button 
                type="button" 
                className="btn-profile-return"
                onClick={() => handleTabChange('details')}
                title="Go to Account Settings"
              >
                <User size={15} /> Account Settings
              </button>
            </div>
          </div>

          {/* Quick Stats Highlights */}
          <div className="wishlist-stats-banner">
            <div className="wishlist-stat-card">
              <div className="stat-icon-wrapper rose">
                <Heart size={22} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Total Saved</span>
                <span className="stat-value">{wishlistItems.length} Items</span>
              </div>
            </div>

            <div className="wishlist-stat-card">
              <div className="stat-icon-wrapper emerald">
                <ShoppingBag size={22} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Estimated Value</span>
                <span className="stat-value">₹{totalWishlistValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="wishlist-stat-card">
              <div className="stat-icon-wrapper indigo">
                <Store size={22} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Local Hubs</span>
                <span className="stat-value">{uniqueSellersCount} {uniqueSellersCount === 1 ? 'Seller' : 'Sellers'}</span>
              </div>
            </div>

            <div className="wishlist-stat-card">
              <div className="stat-icon-wrapper amber">
                <Zap size={22} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Dispatch Speed</span>
                <span className="stat-value">Under 35 Mins</span>
              </div>
            </div>
          </div>

          {/* Search, Filter & Bulk Actions Toolbar */}
          <div className="wishlist-toolbar">
            <div className="wishlist-toolbar-top">
              <div className="wishlist-search-box">
                <Search size={17} />
                <input 
                  type="text"
                  className="wishlist-search-input"
                  placeholder="Search wishlist items or sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select 
                  className="wishlist-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort wishlist items"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <div className="wishlist-batch-actions">
                  {wishlistItems.length > 0 && (
                    <>
                      <button 
                        type="button" 
                        className="btn-add-all-cart"
                        onClick={handleAddAllToCart}
                        title="Add all wishlist items into cart"
                      >
                        <ShoppingCart size={15} /> Move All to Cart
                      </button>

                      <button 
                        type="button" 
                        className="btn-clear-wishlist"
                        onClick={() => {
                          setWishlistItems([]);
                          if (addNotification) addNotification('Cleared your wishlist.', 'system');
                        }}
                        title="Clear entire wishlist"
                      >
                        <Trash2 size={15} /> Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="wishlist-category-pills">
                {categories.map((cat) => {
                  const count = cat === 'All' 
                    ? wishlistItems.length 
                    : wishlistItems.filter(i => i.category === cat).length;

                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span>{cat}</span>
                      <span className="category-pill-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wishlist Items Grid or Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="wishlist-empty-container">
              <div className="empty-icon-circle">
                <Heart size={36} />
              </div>
              <h3>Your wishlist is currently empty</h3>
              <p>
                Explore fresh local produce, artisan bakery goods, and everyday essentials from trusted neighborhood stores.
              </p>
              <div className="empty-state-actions">
                <button 
                  type="button" 
                  className="btn-explore-sellers"
                  onClick={() => navigate('/browse-sellers')}
                >
                  <Store size={16} /> Browse Local Sellers
                </button>
                <button 
                  type="button" 
                  className="btn-restore-samples"
                  onClick={handleRestoreSamples}
                >
                  <RefreshCw size={15} /> Restore Demo Items
                </button>
              </div>
            </div>
          ) : filteredWishlist.length === 0 ? (
            <div className="wishlist-empty-container" style={{ padding: '40px 20px' }}>
              <Search size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3>No matching items found</h3>
              <p>We couldn't find any saved items matching "{searchQuery}". Try clearing filters.</p>
              <button 
                type="button" 
                className="btn-restore-samples"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="wishlist-grid-redesigned">
              {filteredWishlist.map((item, idx) => {
                const isAdded = addedItemsMap[item.id];
                const originalPrice = item.originalPrice || Math.round(Number(item.price || 0) * 1.25);
                const rating = item.rating || 4.8;
                const reviewsCount = item.reviewsCount || 95;
                const tag = item.tag || (idx % 2 === 0 ? 'Top Pick' : 'Fresh Stock');
                const deliveryTime = item.deliveryTime || '20-30 mins';
                const vendorDistance = item.vendorDistance || '1.2 km';

                return (
                  <div key={item.id || `wish-${idx}`} className="wishlist-card-v2">
                    {/* Media Image Box */}
                    <div className="wishlist-card-media">
                      <img 
                        src={getProductImage(item)} 
                        alt={item.name || 'Wishlist item'}
                        loading="lazy"
                        onError={(e) => handleProductImageError(e, item.category, item.name)}
                      />
                      
                      {item.category && (
                        <span className="wishlist-badge-category">
                          {item.category}
                        </span>
                      )}

                      {tag && (
                        <span className="wishlist-tag-special">
                          <Sparkles size={11} /> {tag}
                        </span>
                      )}

                      <button 
                        type="button"
                        className="wishlist-btn-remove"
                        title="Remove from wishlist"
                        onClick={() => handleRemoveWishlist(item.id, item.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="wishlist-card-content">
                      {/* Vendor & Rating Row */}
                      <div className="wishlist-vendor-row">
                        <span className="wishlist-vendor-pill" title={item.vendorName || 'Local Seller'}>
                          <Store size={13} />
                          {item.vendorName || 'Local Seller'} • {vendorDistance}
                        </span>
                        <span className="wishlist-rating-chip" title={`${rating} stars (${reviewsCount} ratings)`}>
                          <Star size={12} />
                          {rating}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3 className="wishlist-item-title" title={item.name}>
                        {item.name || 'Local Store Product'}
                      </h3>

                      {/* Delivery & Stock Meta */}
                      <div className="wishlist-delivery-meta">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <span className="stock-indicator-dot" /> In Stock
                        </span>
                        <span className="delivery-eta-text">⚡ {deliveryTime}</span>
                      </div>

                      {/* Pricing Row */}
                      <div className="wishlist-pricing-row">
                        <span className="current-price">₹{Number(item.price || 0).toFixed(2)}</span>
                        {originalPrice > item.price && (
                          <>
                            <span className="original-price">₹{Number(originalPrice).toFixed(2)}</span>
                            <span className="discount-badge">
                              {Math.round(((originalPrice - item.price) / originalPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Add to Cart CTA */}
                      <button 
                        type="button"
                        className={`wishlist-btn-add-cart ${isAdded ? 'added-success' : ''}`}
                        onClick={() => handleAddToCartFromWishlist(item)}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} /> Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={15} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            ORIGINAL USER PROFILE & SETTINGS (100% UNTOUCHED & PRESERVED)
           ========================================================================= */
        <>
          <div className="page-header">
            <div>
              <h2>User Profile & Settings</h2>
              <p>Manage your account personal details, delivery preferences, and security.</p>
            </div>
          </div>

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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
