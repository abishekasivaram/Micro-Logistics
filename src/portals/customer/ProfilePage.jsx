import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  User, Save, Lock, CheckCircle, CheckCircle2,
  Heart, Trash2, ShoppingCart, Search, Store, Star, 
  Sparkles, Check, Zap, RefreshCw, ShoppingBag,
  MapPin, Building, Phone, Mail, Clock, Eye, EyeOff,
  ShieldCheck, ArrowRight, Copy, Bell, Award, Package,
  Sliders, Plus, ChevronRight, Compass
} from 'lucide-react';
import { getProductImage } from '../../utils/imageUtils';
import { getCustomerProfileByIdentifier, rectifyCustomerUser } from '../../utils/customerDirectory';
import './ProfilePage.css';
import './CustomerProfilePage.css';
import './CustomerWishlist.css';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80'
];

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

const INITIAL_SAVED_ADDRESSES = [
  {
    id: 'addr-home',
    label: 'Home',
    recipientName: 'Priya Rajan',
    phone: '+91 98765 43210',
    address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
    landmark: 'Opposite Roundtana Park',
    area: 'Anna Nagar East',
    isDefault: true
  },
  {
    id: 'addr-work',
    label: 'Work / Office',
    recipientName: 'Priya Rajan (Work)',
    phone: '+91 98765 43210',
    address: 'Module 4, Ascendas Tech Park, CSIR Road, Taramani, Chennai - 600113',
    landmark: 'Phase 2 Building, 4th Floor',
    area: 'Taramani / OMR',
    isDefault: false
  },
  {
    id: 'addr-family',
    label: 'Family / Parents',
    recipientName: 'Sivakumar R',
    phone: '+91 98401 23456',
    address: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
    landmark: 'Near Mandaveli Post Office',
    area: 'Mandaveli',
    isDefault: false
  }
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateUserProfile, addToCart, addNotification, orders = [] } = useAppContext();

  const tabParam = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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

  // Saved Addresses State scoped per customer
  const custKey = currentUser?.legacy_id || currentUser?.username || currentUser?.email || 'c1';
  const activeProfile = useMemo(() => getCustomerProfileByIdentifier(custKey), [custKey]);

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(`micrologi_customer_addresses_${custKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return activeProfile?.savedAddresses || INITIAL_SAVED_ADDRESSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`micrologi_customer_addresses_${custKey}`, JSON.stringify(savedAddresses));
    } catch (e) {
      console.error(e);
    }
  }, [savedAddresses, custKey]);

  // Delivery Preferences State
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('micrologi_customer_preferences');
      return saved ? JSON.parse(saved) : {
        ecoDelivery: true,
        timeSlot: 'evening',
        whatsappAlerts: true,
        smsAlerts: true,
        contactless: true
      };
    } catch {
      return {
        ecoDelivery: true,
        timeSlot: 'evening',
        whatsappAlerts: true,
        smsAlerts: true,
        contactless: true
      };
    }
  });

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('micrologi_customer_preferences', JSON.stringify(preferences));
      if (addNotification) {
        addNotification('Delivery & AI aggregation preferences updated successfully.', 'system');
      }
      setSuccessMsg('Delivery preferences saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
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
      return 0;
    });
  }, [wishlistItems, selectedCategory, searchQuery, sortBy]);

  // Customer Statistics Computation
  const customerOrders = useMemo(() => {
    return orders.filter(o => 
      o.customerId === currentUser?.id || 
      o.customerId === currentUser?.legacy_id || 
      o.customerName === currentUser?.name
    );
  }, [orders, currentUser]);

  const totalOrdersCount = customerOrders.length > 0 ? customerOrders.length : 6;
  const activeOrdersCount = customerOrders.filter(o => 
    ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(o.status || o.orderStatus)
  ).length || 1;

  const totalWishlistValue = useMemo(() => {
    return wishlistItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [wishlistItems]);

  const uniqueSellersCount = useMemo(() => {
    const set = new Set(wishlistItems.map(item => item.vendorName || item.vendorId || 'Store'));
    return set.size;
  }, [wishlistItems]);

  // Form State
  const [formData, setFormData] = useState(() => {
    const key = currentUser?.legacy_id || currentUser?.username || currentUser?.email;
    const profile = getCustomerProfileByIdentifier(key);
    return {
      name: currentUser?.name || profile.name,
      username: currentUser?.username || currentUser?.legacy_id || profile.username,
      email: currentUser?.email || profile.email,
      phone: currentUser?.phone || profile.phone,
      address: currentUser?.address || profile.address,
      area: currentUser?.area || profile.area,
      avatar: currentUser?.avatar || profile.avatar
    };
  });

  // Re-sync form data and saved addresses whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      const key = currentUser.legacy_id || currentUser.username || currentUser.email;
      const profile = getCustomerProfileByIdentifier(key);
      setFormData({
        name: currentUser.name || profile.name,
        username: currentUser.username || currentUser.legacy_id || profile.username,
        email: currentUser.email || profile.email,
        phone: currentUser.phone || profile.phone,
        address: currentUser.address || profile.address,
        area: currentUser.area || profile.area,
        avatar: currentUser.avatar || profile.avatar
      });

      try {
        const saved = localStorage.getItem(`micrologi_customer_addresses_${key}`);
        if (saved) {
          setSavedAddresses(JSON.parse(saved));
        } else {
          setSavedAddresses(profile.savedAddresses);
        }
      } catch {
        setSavedAddresses(profile.savedAddresses);
      }
    }
  }, [currentUser]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    updateUserProfile(formData);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('Profile details updated successfully across MicroLogi!');
      setTimeout(() => setSuccessMsg(''), 3500);
    }, 400);
  };

  const handleSetDefaultAddress = (addr) => {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === addr.id
    })));
    setFormData(prev => ({
      ...prev,
      address: addr.address,
      area: addr.area
    }));
    updateUserProfile({ address: addr.address, area: addr.area });
    setSuccessMsg(`"${addr.label}" set as your default delivery address.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setErrorMsg('Please enter your current password.');
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
    <div className="page-container customer-profile-page">
      {successMsg && (
        <div className="profile-toast success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="profile-toast danger">
          <ShieldCheck size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          WISHLIST VIEW: Dedicated Full-Width View
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
                Saved favorites from your neighborhood Chennai grocers & bakers, ready for one-click express delivery.
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
              <p>Explore your neighborhood Chennai sellers to save your favorite fresh produce, snacks, and dairy!</p>
              <div className="empty-actions-row">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => navigate('/browse-sellers')}
                >
                  Explore Local Stores
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={handleRestoreSamples}
                >
                  Load Sample Items
                </button>
              </div>
            </div>
          ) : (
            <div className="wishlist-cards-grid">
              {filteredWishlist.map((item) => (
                <div key={item.id} className="wishlist-product-card">
                  <div className="wishlist-card-media">
                    <img 
                      src={getProductImage(item)} 
                      alt={item.name} 
                      className="wishlist-prod-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                    <button 
                      type="button"
                      className="btn-wishlist-delete"
                      onClick={() => handleRemoveWishlist(item.id, item.name)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                    {item.tag && (
                      <span className="wishlist-prod-badge">{item.tag}</span>
                    )}
                  </div>

                  <div className="wishlist-card-body">
                    <div className="wishlist-vendor-row">
                      <div className="wishlist-vendor-pill">
                        <Store size={12} />
                        <span>{item.vendorName || 'Local Seller'}</span>
                      </div>
                      <span className="wishlist-distance-tag">{item.vendorDistance || '1.5 km'}</span>
                    </div>

                    <h3 className="wishlist-prod-title">{item.name}</h3>

                    <div className="wishlist-rating-row">
                      <div className="wishlist-stars-pill">
                        <Star size={12} fill="#eab308" color="#eab308" />
                        <span>{item.rating || 4.8}</span>
                      </div>
                      <span className="wishlist-reviews-text">({item.reviewsCount || 120} reviews)</span>
                    </div>

                    <div className="wishlist-price-action-row">
                      <div className="wishlist-price-box">
                        <span className="wishlist-currency">₹</span>
                        <span className="wishlist-amount">{Number(item.price).toFixed(2)}</span>
                        {item.originalPrice && (
                          <span className="wishlist-orig-price">₹{Number(item.originalPrice).toFixed(2)}</span>
                        )}
                      </div>

                      <button 
                        type="button"
                        className={`btn-wishlist-cart ${addedItemsMap[item.id] ? 'added' : ''}`}
                        onClick={() => handleAddToCartFromWishlist(item)}
                        title="Add to cart"
                      >
                        {addedItemsMap[item.id] ? (
                          <>
                            <Check size={14} /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            PROFILE & ACCOUNT SETTINGS MAIN VIEW
           ========================================================================= */
        <>
          {/* Header Title & Subtitle */}
          <div className="profile-page-header">
            <div>
              <div className="profile-header-chip">
                <User size={13} /> Shopper Control Center
              </div>
              <h1 className="profile-main-heading">User Profile & Account Hub</h1>
              <p className="profile-main-sub">
                Manage your verified personal details, saved delivery addresses, eco-clustering preferences, and security.
              </p>
            </div>
          </div>

          {/* ─── Customer Operational Telemetry Ribbon ─────────────────── */}
          <div className="customer-telemetry-ribbon">
            <div className="customer-telemetry-card">
              <div className="cust-telemetry-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <Package size={20} />
              </div>
              <div>
                <span className="cust-telemetry-lbl">Total Orders Placed</span>
                <div className="cust-telemetry-val">{totalOrdersCount} Orders</div>
                <span className="cust-telemetry-sub">Express Neighborhood Delivery</span>
              </div>
            </div>

            <div 
              className="customer-telemetry-card interactive"
              onClick={() => navigate('/track-delivery')}
              title="Click to track live dispatches"
            >
              <div className="cust-telemetry-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="cust-telemetry-lbl">Active Dispatches</span>
                  <span className="live-pulse-dot" />
                </div>
                <div className="cust-telemetry-val" style={{ color: '#059669' }}>{activeOrdersCount} In Transit</div>
                <span className="cust-telemetry-sub link-text">Track Live GPS Corridor &rarr;</span>
              </div>
            </div>

            <div className="customer-telemetry-card">
              <div className="cust-telemetry-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Award size={20} />
              </div>
              <div>
                <span className="cust-telemetry-lbl">MicroLogi Rewards</span>
                <div className="cust-telemetry-val">480 Coins</div>
                <span className="cust-telemetry-sub">Gold Tier Member · Save ₹50</span>
              </div>
            </div>

            <div className="customer-telemetry-card">
              <div className="cust-telemetry-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <MapPin size={20} />
              </div>
              <div>
                <span className="cust-telemetry-lbl">Neighborhood Cluster</span>
                <div className="cust-telemetry-val">{formData.area || 'Anna Nagar East'}</div>
                <span className="cust-telemetry-sub">Sub-25 min AI Hub Zone</span>
              </div>
            </div>
          </div>

          {/* ─── Profile Grid: Left Identity Sidebar + Right Settings Views ─── */}
          <div className="profile-grid-container">
            {/* Left Column: Shopper Identity Card */}
            <div className="profile-card avatar-card">
              <div className="avatar-hero-banner" />

              <div className="avatar-preview-wrap">
                <img 
                  src={formData.avatar} 
                  alt={formData.name} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250'; }}
                />
                <button 
                  type="button" 
                  className="avatar-change-btn"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  title="Change avatar photo"
                >
                  <Sparkles size={13} />
                </button>
              </div>

              {/* Avatar Preset Quick Swatches */}
              {showAvatarPicker && (
                <div className="avatar-picker-popover">
                  <span className="popover-title">Choose Photo Preset</span>
                  <div className="avatar-swatches-grid">
                    {AVATAR_PRESETS.map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`avatar-swatch-item ${formData.avatar === pUrl ? 'selected' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, avatar: pUrl });
                          setShowAvatarPicker(false);
                        }}
                      >
                        <img src={pUrl} alt={`Preset ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="profile-user-fullname">{formData.name}</h2>
              
              <div className="user-handle-chip-row">
                <span className="user-handle-pill">@{formData.username || 'priyarajan'}</span>
                <button 
                  type="button"
                  className="btn-copy-handle"
                  onClick={() => handleCopy(`@${formData.username || 'priyarajan'}`, 'handle')}
                  title="Copy username"
                >
                  {copiedKey === 'handle' ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                </button>
              </div>

              <div className="profile-role-badge">
                <CheckCircle2 size={13} /> Verified Customer · Tier 1
              </div>

              <div className="profile-locality-snippet">
                <MapPin size={13} color="var(--primary)" />
                <span>{formData.address}</span>
              </div>

              {/* Perks / Loyalty Strip */}
              <div className="profile-loyalty-mini-card">
                <div className="loyalty-icon-box">
                  <Zap size={14} color="#4f46e5" />
                </div>
                <div>
                  <div className="loyalty-title">Green Delivery Active</div>
                  <div className="loyalty-sub">Consolidated local dispatches save packaging & trips.</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="cust-profile-tabs-nav">
                <button 
                  type="button"
                  className={`cust-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => handleTabChange('details')}
                >
                  <User size={16} /> 
                  <span>Personal Details</span>
                  <ChevronRight size={14} className="tab-arrow" />
                </button>

                <button 
                  type="button"
                  className={`cust-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => handleTabChange('addresses')}
                >
                  <MapPin size={16} /> 
                  <span>Saved Addresses & Hubs</span>
                  <ChevronRight size={14} className="tab-arrow" />
                </button>

                <button 
                  type="button"
                  className={`cust-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => handleTabChange('preferences')}
                >
                  <Sliders size={16} /> 
                  <span>Delivery Preferences</span>
                  <ChevronRight size={14} className="tab-arrow" />
                </button>

                <button 
                  type="button"
                  className={`cust-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => handleTabChange('password')}
                >
                  <Lock size={16} /> 
                  <span>Password & Security</span>
                  <ChevronRight size={14} className="tab-arrow" />
                </button>

                <button 
                  type="button"
                  className={`cust-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => handleTabChange('wishlist')}
                >
                  <Heart size={16} /> 
                  <span>My Wishlist</span>
                  <span className="tab-count-badge">{wishlistItems.length}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Settings Tab Views */}
            <div className="profile-card form-card">
              {/* ─── TAB 1: Personal Details ─────────────────────────────── */}
              {activeTab === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="profile-form">
                  <div className="form-card-header">
                    <div>
                      <h3 className="form-section-title">Personal Account Information</h3>
                      <p className="form-section-sub">
                        Update your identity, direct contact channels, and primary delivery locality.
                      </p>
                    </div>
                    <span className="profile-status-pill green">
                      ● Active Account
                    </span>
                  </div>

                  <div className="profile-form-grid">
                    <div className="form-group">
                      <label htmlFor="customer-profile-name">
                        Full Name <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <User size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-name"
                          type="text" 
                          className="form-control has-icon" 
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Priya Rajan"
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-username">
                        Username Handle <span className="req-star">*</span>
                      </label>
                      <div className="input-with-prefix">
                        <span className="input-prefix-tag">@</span>
                        <input 
                          id="customer-profile-username"
                          type="text" 
                          className="form-control has-prefix" 
                          value={formData.username}
                          onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                          placeholder="priyarajan"
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-email">
                        Email Address <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Mail size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-email"
                          type="email" 
                          className="form-control has-icon" 
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="customer@example.com"
                          required 
                        />
                      </div>
                      <span className="field-hint-text">Used for order receipts, OTP verification, and dispatch alerts.</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-phone">
                        Phone Number <span className="req-star">*</span>
                      </label>
                      <div className="input-with-prefix">
                        <span className="input-prefix-tag">+91</span>
                        <input 
                          id="customer-profile-phone"
                          type="tel" 
                          className="form-control has-prefix" 
                          value={formData.phone.replace('+91', '').trim()}
                          onChange={e => setFormData({ ...formData, phone: e.target.value.trim() })}
                          placeholder="98765 43210"
                          required 
                        />
                      </div>
                      <span className="field-hint-text">Riders will call this number upon arriving at your gate.</span>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="customer-profile-address">
                        Primary Delivery Address <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <MapPin size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-address"
                          type="text" 
                          className="form-control has-icon" 
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          placeholder="House/Flat number, Street name, Locality, Chennai Pincode"
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-area">
                        City / Area Hub <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Building size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-area"
                          type="text" 
                          className="form-control has-icon" 
                          value={formData.area}
                          onChange={e => setFormData({ ...formData, area: e.target.value })}
                          placeholder="e.g. Anna Nagar East"
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-avatar">Avatar Photo URL</label>
                      <div className="input-with-icon">
                        <Sparkles size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-avatar"
                          type="url" 
                          className="form-control has-icon" 
                          value={formData.avatar}
                          onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-submit-row">
                    <button 
                      type="submit" 
                      className="btn-save-profile"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw size={16} className="spin-icon" /> Saving Profile...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Profile Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ─── TAB 2: Saved Delivery Addresses ─────────────────────── */}
              {activeTab === 'addresses' && (
                <div className="profile-tab-pane">
                  <div className="form-card-header">
                    <div>
                      <h3 className="form-section-title">Saved Delivery Destinations</h3>
                      <p className="form-section-sub">
                        Pre-configured addresses coordinated with micro-logistics riders for fast dropoff.
                      </p>
                    </div>
                  </div>

                  <div className="saved-addresses-list">
                    {savedAddresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`saved-address-card ${addr.isDefault ? 'is-default' : ''}`}
                      >
                        <div className="addr-card-top">
                          <div className="addr-label-group">
                            <MapPin size={16} color="var(--primary)" />
                            <span className="addr-label-title">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="addr-default-badge">● Default Address</span>
                            )}
                          </div>

                          <div className="addr-actions-group">
                            {!addr.isDefault && (
                              <button 
                                type="button" 
                                className="btn-set-default"
                                onClick={() => handleSetDefaultAddress(addr)}
                                title="Make this your primary delivery address"
                              >
                                Set as Default
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="btn-addr-copy"
                              onClick={() => handleCopy(addr.address, addr.id)}
                              title="Copy address"
                            >
                              {copiedKey === addr.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>

                        <div className="addr-main-text">{addr.address}</div>
                        <div className="addr-meta-row">
                          <span>Recipient: <strong>{addr.recipientName}</strong></span>
                          <span>•</span>
                          <span>Phone: <strong>{addr.phone}</strong></span>
                          {addr.landmark && (
                            <>
                              <span>•</span>
                              <span>Landmark: {addr.landmark}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="address-quick-notice">
                    <Compass size={16} color="#4f46e5" />
                    <span>
                      Addresses within central Chennai zones are clustered automatically by our AI routing engine for faster sub-30 minute delivery.
                    </span>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: Delivery Preferences ─────────────────────────── */}
              {activeTab === 'preferences' && (
                <div className="profile-tab-pane">
                  <div className="form-card-header">
                    <div>
                      <h3 className="form-section-title">Micro-Logistics & Delivery Settings</h3>
                      <p className="form-section-sub">
                        Tailor your order intake, delivery time slots, and smart batching preferences.
                      </p>
                    </div>
                  </div>

                  <div className="pref-section-group">
                    <h4 className="pref-group-title">AI Spatial Bundling & Eco-Pooling</h4>
                    
                    <div className="pref-toggle-card">
                      <div className="pref-toggle-info">
                        <div className="pref-toggle-header">
                          <span className="pref-toggle-name">Consolidated Green Delivery</span>
                          <span className="pref-badge-rec">Recommended</span>
                        </div>
                        <p className="pref-toggle-desc">
                          Allow AI to bundle items ordered from complementary neighborhood grocers and bakers onto a single courier run. Reduces packaging waste and road traffic.
                        </p>
                      </div>
                      <button 
                        type="button" 
                        className={`toggle-switch-btn ${preferences.ecoDelivery ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, ecoDelivery: !preferences.ecoDelivery })}
                      >
                        <span className="toggle-switch-handle" />
                      </button>
                    </div>
                  </div>

                  <div className="pref-section-group">
                    <h4 className="pref-group-title">Preferred Delivery Window Slot</h4>
                    <div className="time-slots-grid">
                      {[
                        { id: 'morning', label: 'Morning Dispatch', time: '08:00 AM – 11:30 AM', desc: 'Fresh morning dairy & breakfast bakery' },
                        { id: 'midday', label: 'Mid-Day Delivery', time: '12:00 PM – 03:30 PM', desc: 'Pantry staples & lunch groceries' },
                        { id: 'evening', label: 'Evening Return', time: '04:30 PM – 08:30 PM', desc: 'Dinner cooking staples & vegetables' },
                        { id: 'instant', label: 'Hyperlocal Express', time: 'Instant (<30 Mins)', desc: 'Immediate direct courier priority' }
                      ].map(slot => (
                        <div 
                          key={slot.id}
                          className={`time-slot-card ${preferences.timeSlot === slot.id ? 'selected' : ''}`}
                          onClick={() => setPreferences({ ...preferences, timeSlot: slot.id })}
                        >
                          <div className="slot-card-top">
                            <span className="slot-label">{slot.label}</span>
                            {preferences.timeSlot === slot.id && (
                              <CheckCircle2 size={16} color="var(--primary)" />
                            )}
                          </div>
                          <div className="slot-time">{slot.time}</div>
                          <div className="slot-desc">{slot.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pref-section-group">
                    <h4 className="pref-group-title">Notification Channels & Handover</h4>
                    
                    <div className="pref-toggles-stack">
                      <div className="pref-toggle-card mini">
                        <div className="pref-toggle-info">
                          <span className="pref-toggle-name">WhatsApp Live Order Tracking</span>
                          <p className="pref-toggle-desc">Receive real-time courier GPS tracking link and OTP on WhatsApp.</p>
                        </div>
                        <button 
                          type="button" 
                          className={`toggle-switch-btn ${preferences.whatsappAlerts ? 'active' : ''}`}
                          onClick={() => setPreferences({ ...preferences, whatsappAlerts: !preferences.whatsappAlerts })}
                        >
                          <span className="toggle-switch-handle" />
                        </button>
                      </div>

                      <div className="pref-toggle-card mini">
                        <div className="pref-toggle-info">
                          <span className="pref-toggle-name">SMS Rider Proximity Alerts</span>
                          <p className="pref-toggle-desc">SMS notification when courier is within 500 meters of your building gate.</p>
                        </div>
                        <button 
                          type="button" 
                          className={`toggle-switch-btn ${preferences.smsAlerts ? 'active' : ''}`}
                          onClick={() => setPreferences({ ...preferences, smsAlerts: !preferences.smsAlerts })}
                        >
                          <span className="toggle-switch-handle" />
                        </button>
                      </div>

                      <div className="pref-toggle-card mini">
                        <div className="pref-toggle-info">
                          <span className="pref-toggle-name">Contactless Doorstep Drop</span>
                          <p className="pref-toggle-desc">Rider will place parcels in front of your doorway and take a photo confirmation.</p>
                        </div>
                        <button 
                          type="button" 
                          className={`toggle-switch-btn ${preferences.contactless ? 'active' : ''}`}
                          onClick={() => setPreferences({ ...preferences, contactless: !preferences.contactless })}
                        >
                          <span className="toggle-switch-handle" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-submit-row">
                    <button 
                      type="button" 
                      className="btn-save-profile"
                      onClick={handleSavePreferences}
                    >
                      <Save size={16} /> Save Delivery Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 4: Password & Security ──────────────────────────── */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="profile-form">
                  <div className="form-card-header">
                    <div>
                      <h3 className="form-section-title">Change Password & Security</h3>
                      <p className="form-section-sub">
                        Ensure your account is protected with a strong, secure passphrase.
                      </p>
                    </div>
                  </div>

                  <div className="profile-form-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '520px' }}>
                    <div className="form-group">
                      <label htmlFor="customer-profile-curr-pass">
                        Current Password <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Lock size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-curr-pass"
                          type={showPassword.current ? 'text' : 'password'} 
                          className="form-control has-icon has-trailing-action" 
                          placeholder="Enter current password"
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required 
                        />
                        <button 
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        >
                          {showPassword.current ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <span className="field-hint-text">Enter your existing account password to confirm changes.</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-new-pass">
                        New Password <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Lock size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-new-pass"
                          type={showPassword.new ? 'text' : 'password'} 
                          className="form-control has-icon has-trailing-action" 
                          placeholder="Minimum 6 characters"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required 
                        />
                        <button 
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        >
                          {showPassword.new ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer-profile-conf-pass">
                        Confirm New Password <span className="req-star">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Lock size={16} className="input-lead-icon" />
                        <input 
                          id="customer-profile-conf-pass"
                          type={showPassword.confirm ? 'text' : 'password'} 
                          className="form-control has-icon has-trailing-action" 
                          placeholder="Re-enter new password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required 
                        />
                        <button 
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        >
                          {showPassword.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="security-status-card">
                    <ShieldCheck size={20} color="#059669" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        Two-Factor Authentication Active
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Critical actions and high-value orders are confirmed via SMS OTP to +91 {formData.phone.slice(-4) || '43210'}.
                      </div>
                    </div>
                  </div>

                  <div className="form-submit-row">
                    <button type="submit" className="btn-save-profile">
                      <Lock size={16} /> Update Password
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
