import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, ShoppingBag, Truck, CheckCircle, Clock, Package, Navigation, 
  Store, Eye, Heart, MapPin, Star, Apple, Milk, Coffee, ArrowRight, 
  Plus, Minus, Sparkles, ShieldCheck, Flame, X, Check, Layers, ChevronRight,
  TrendingUp, Compass, ShoppingCart
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import { getVendorLogo, handleVendorLogoError, getProductImage, handleProductImageError } from '../../utils/imageUtils';
import { getCustomerProfileByIdentifier } from '../../utils/customerDirectory';
import './CustomerDashboard.css';

const CHENNAI_NEIGHBORHOODS = [
  { name: 'Anna Nagar East', fullAddress: '101 Anna Nagar East, Chennai 600102', eta: '15-20 min' },
  { name: 'Nungambakkam', fullAddress: '24 Khader Nawaz Khan Rd, Nungambakkam, Chennai 600006', eta: '18-25 min' },
  { name: 'T. Nagar', fullAddress: '88 Usman Road, T. Nagar, Chennai 600017', eta: '15-22 min' },
  { name: 'Adyar', fullAddress: '15 Gandhi Nagar 1st Main Rd, Adyar, Chennai 600020', eta: '20-25 min' },
  { name: 'Velachery', fullAddress: '42 100 Feet Bypass Rd, Velachery, Chennai 600042', eta: '20-30 min' },
  { name: 'Kilpauk', fullAddress: '12 Ormes Road, Kilpauk, Chennai 600010', eta: '15-20 min' }
];

const POPULAR_SEARCH_TAGS = [
  'Fresh Cow Milk',
  'Aashirvaad Atta',
  'Farm Tomatoes',
  'Sourdough Loaf',
  'Paneer',
  'Organic Apples',
  'Nandini Ghee'
];

const CustomerDashboard = () => {
  const { 
    orders, vendors, products, currentUser, setCurrentUser, 
    cart, addToCart, updateCartQty, removeFromCart, addNotification 
  } = useAppContext();
  const navigate = useNavigate();

  const customerProfile = useMemo(() => {
    return getCustomerProfileByIdentifier(currentUser?.legacy_id || currentUser?.username || currentUser?.email);
  }, [currentUser]);

  const activeDeliveryAddress = currentUser?.address || customerProfile.address;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState('');
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('micrologi_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(parsed.map(item => item.id));
      }
      return new Set();
    } catch {
      return new Set();
    }
  });

  // Dynamic Page Title
  useEffect(() => {
    document.title = "MicroLogi Marketplace | Shop Local, Delivered Fast";
  }, []);

  // Listen for external wishlist changes
  useEffect(() => {
    const handleWishlistChange = () => {
      try {
        const saved = localStorage.getItem('micrologi_wishlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          setWishlistIds(new Set(parsed.map(item => item.id)));
        } else {
          setWishlistIds(new Set());
        }
      } catch {
        setWishlistIds(new Set());
      }
    };
    window.addEventListener('storage', handleWishlistChange);
    window.addEventListener('wishlist-updated', handleWishlistChange);
    return () => {
      window.removeEventListener('storage', handleWishlistChange);
      window.removeEventListener('wishlist-updated', handleWishlistChange);
    };
  }, []);

  const customerId = currentUser?.id || null;
  const customerOrders = orders.filter(o => o.customerId === customerId || o.customerName === currentUser?.name);

  // Active Live Order Check
  const activeOrder = useMemo(() => {
    return customerOrders.find(o => 
      ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit'].includes(o.status?.toLowerCase())
    );
  }, [customerOrders]);

  // Categories matching active local stores
  const categories = [
    { 
      name: 'All', 
      label: 'All Products', 
      icon: <Layers size={22} />, 
      color: '#4f46e5', 
      bg: '#eef2ff',
      tag: `${products.length}+ Items` 
    },
    { 
      name: 'Grocery', 
      label: 'Grocery & Staples', 
      icon: <Package size={22} />, 
      color: '#059669', 
      bg: '#ecfdf5',
      tag: 'Daily Essentials' 
    },
    { 
      name: 'Fruits & Veg', 
      label: 'Fruits & Veg', 
      icon: <Apple size={22} />, 
      color: '#16a34a', 
      bg: '#f0fdf4',
      tag: 'Farm Fresh Daily' 
    },
    { 
      name: 'Dairy', 
      label: 'Dairy & Eggs', 
      icon: <Milk size={22} />, 
      color: '#0284c7', 
      bg: '#f0f9ff',
      tag: 'Chilled & Pure' 
    },
    { 
      name: 'Bakery', 
      label: 'Bakery & Breads', 
      icon: <Coffee size={22} />, 
      color: '#d97706', 
      bg: '#fffbeb',
      tag: 'Oven Fresh' 
    }
  ];

  // Quick Cart Totals
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + (Number(item.product?.price || 0) * item.quantity), 0);
  const distinctStoresInCart = new Set(cart.map(item => item.product?.vendorId || item.product?.vendorName)).size;

  // Toggle Wishlist handler
  const handleToggleWishlist = (product) => {
    try {
      const saved = localStorage.getItem('micrologi_wishlist');
      let currentList = saved ? JSON.parse(saved) : [];
      const exists = currentList.some(item => item.id === product.id);

      let updatedList;
      if (exists) {
        updatedList = currentList.filter(item => item.id !== product.id);
        if (addNotification) addNotification(`Removed "${product.name}" from wishlist.`, 'system');
      } else {
        const vendor = vendors.find(v => v.id === product.vendorId) || {};
        updatedList = [...currentList, {
          ...product,
          vendorName: vendor.name || product.vendorName || 'Local Merchant',
          addedAt: new Date().toISOString()
        }];
        if (addNotification) addNotification(`Saved "${product.name}" to your wishlist!`, 'system');
      }

      localStorage.setItem('micrologi_wishlist', JSON.stringify(updatedList));
      setWishlistIds(new Set(updatedList.map(item => item.id)));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (e) {
      console.error("Wishlist toggle error", e);
    }
  };

  // Search Submission
  const handleSearchSubmit = (term) => {
    const query = (term || searchTerm).trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`, { 
        state: { search: query } 
      });
    } else {
      navigate('/products');
    }
  };

  // Handle Address Selection
  const handleSelectAddress = (newAddress) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, address: newAddress };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('micrologi_currentUser', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setShowAddressModal(false);
    if (addNotification) addNotification(`Delivery address updated to ${newAddress}`, 'system');
  };

  return (
    <div className="page-container customer-dashboard-website">
      
      {/* 1. TOP HYPERLOCAL DELIVERY STATUS & LOCATION BAR */}
      <div className="hyperlocal-locator-bar">
        <div className="locator-left">
          <div className="locator-pin-icon-wrap">
            <MapPin size={18} className="locator-pin-svg" />
          </div>
          <div className="locator-address-info">
            <span className="locator-deliver-label">Delivering to</span>
            <div className="locator-address-text">
              <strong>{activeDeliveryAddress}</strong>
              <button 
                className="btn-change-address" 
                onClick={() => setShowAddressModal(true)}
                title="Change delivery address"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div className="locator-right">
          <div className="delivery-speed-pill">
            <span className="speed-dot-live" />
            <Clock size={14} />
            <span>Avg. Delivery: <strong>15-25 min</strong></span>
          </div>
          <div className="fleet-status-pill">
            <ShieldCheck size={14} color="#059669" />
            <span>4 Courier Partners Online</span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE LIVE ORDER TRACKER (Displayed when active order exists) */}
      {activeOrder && (
        <div className="live-order-tracker-card" onClick={() => navigate('/track-delivery')}>
          <div className="live-order-left">
            <div className="live-order-pulse-badge">
              <Truck size={18} className="live-truck-icon" />
              <span className="pulse-ring" />
            </div>
            <div className="live-order-details">
              <div className="live-order-title-row">
                <span className="live-order-status-badge">ORDER IN PROGRESS</span>
                <span className="live-order-id">#{activeOrder.id}</span>
                <span className="live-order-vendor">• {activeOrder.vendorName || 'Neighborhood Store'}</span>
              </div>
              <p className="live-order-subtitle">
                Your order is currently <strong>{activeOrder.status?.replace(/_/g, ' ')}</strong>. Estimated arrival in <strong>15-20 mins</strong>.
              </p>
            </div>
          </div>
          <div className="live-order-right">
            <span className="live-track-btn">
              Track Live Map <ArrowRight size={15} />
            </span>
          </div>
        </div>
      )}

      {/* 3. HERO SHOWCASE WITH MESH GRADIENT & INTERACTIVE SEARCH */}
      <div className="customer-website-hero">
        <div className="hero-mesh-glow" />
        
        <div className="hero-content-wrapper">
          <div className="hero-announcement-chip">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Chennai's Smart Local Delivery Network</span>
          </div>

          <h1 className="hero-main-title">
            Shop Local. <span className="hero-title-highlight">Delivered in Minutes.</span>
          </h1>

          <p className="hero-subtext">
            Discover fresh produce, dairy, bakery delights & everyday pantry essentials from top neighborhood stores — coordinated into one smart, consolidated delivery.
          </p>

          {/* Interactive Search Bar */}
          <div className="hero-search-box-large">
            <Search className="hero-search-icon" size={20} />
            <input 
              type="text" 
              className="hero-search-input"
              placeholder="Search farm fresh milk, sourdough bread, vegetables, stores..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm('')} title="Clear search">
                <X size={16} />
              </button>
            )}
            <button className="hero-search-submit-btn" onClick={() => handleSearchSubmit()}>
              Search
            </button>
          </div>

          {/* Trending Searches Pills */}
          <div className="hero-trending-tags">
            <span className="trending-title"><Flame size={14} color="#f97316" /> Trending:</span>
            <div className="trending-chips-wrap">
              {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                <button 
                  key={idx} 
                  className="trending-chip"
                  onClick={() => {
                    setSearchTerm(tag);
                    handleSearchSubmit(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Value Props Bar */}
          <div className="hero-feature-perks-bar">
            <div className="hero-perk-item">
              <div className="perk-icon-wrap"><Clock size={16} /></div>
              <div className="perk-text">
                <strong>15-25 Min Speed</strong>
                <span>Direct neighborhood dispatch</span>
              </div>
            </div>
            <div className="hero-perk-item">
              <div className="perk-icon-wrap"><Layers size={16} /></div>
              <div className="perk-text">
                <strong>Smart Aggregation</strong>
                <span>Combine multiple stores</span>
              </div>
            </div>
            <div className="hero-perk-item">
              <div className="perk-icon-wrap"><ShieldCheck size={16} /></div>
              <div className="perk-text">
                <strong>Zero Duplicate Fees</strong>
                <span>Single batch delivery charge</span>
              </div>
            </div>
            <div className="hero-perk-item">
              <div className="perk-icon-wrap"><Store size={16} /></div>
              <div className="perk-text">
                <strong>Verified Merchants</strong>
                <span>100% genuine local stores</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SMART MULTI-STORE AGGREGATION USP BANNER */}
      <div className="smart-aggregation-perk-banner">
        <div className="aggregation-banner-icon">
          <Sparkles size={24} color="#4f46e5" />
        </div>
        <div className="aggregation-banner-text">
          <h4>Order from Multiple Stores in One Go</h4>
          <p>
            Add fresh milk from <strong>Fresh Dairy & Bakes</strong> and organic apples from <strong>Organic Farm Harvest</strong>. 
            Our smart delivery algorithm automatically dispatches one rider to pick up both, saving you up to <strong>₹50 in delivery fees</strong>!
          </p>
        </div>
        <button 
          className="aggregation-cta-btn" 
          onClick={() => navigate('/browse-sellers')}
        >
          Explore Stores →
        </button>
      </div>

      {/* 5. EXPLORE CATEGORIES (Vibrant Tiles) */}
      <section className="dashboard-section categories-section">
        <div className="section-header-modern">
          <div>
            <h3 className="section-title">Explore Categories</h3>
            <p className="section-subtitle">Curated essentials from neighborhood markets</p>
          </div>
          <button 
            className="section-link-btn"
            onClick={() => navigate('/products?category=All', { state: { category: 'All' } })}
          >
            All Categories <ChevronRight size={16} />
          </button>
        </div>

        <div className="category-cards-grid">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="modern-category-card" 
              style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`, { 
                state: { category: cat.name } 
              })}
            >
              <div className="cat-icon-container">
                {cat.icon}
              </div>
              <div className="cat-text-container">
                <span className="cat-name">{cat.label}</span>
                <span className="cat-tag-pill">{cat.tag}</span>
              </div>
              <div className="cat-arrow-indicator">
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. VERIFIED LOCAL SELLERS NEAR YOU */}
      <section className="dashboard-section sellers-section">
        <div className="section-header-modern">
          <div>
            <h3 className="section-title">Verified Local Sellers</h3>
            <p className="section-subtitle">Support local neighborhood merchants within 3 km</p>
          </div>
          <button 
            className="section-link-btn" 
            onClick={() => navigate('/browse-sellers')}
          >
            View All Stores ({vendors.length}) <ChevronRight size={16} />
          </button>
        </div>

        <div className="modern-sellers-grid">
          {vendors.map(vendor => {
            const distance = vendor.distance || (((vendor.id?.toString().charCodeAt(0) || 7) * 3 % 25) / 10 + 1.2).toFixed(1);
            const prepTime = vendor.prepTime || '15-25 min';
            const vendorSampleProducts = products.filter(p => p.vendorId === vendor.id).slice(0, 3);

            return (
              <div key={vendor.id} className="modern-seller-card">
                <div className="seller-card-top-banner">
                  <span className="seller-status-live-tag">● OPEN NOW</span>
                  <span className="seller-category-pill">{vendor.category}</span>
                </div>

                <div className="seller-profile-row">
                  <div className="seller-avatar-wrap">
                    <img 
                      src={getVendorLogo(vendor)} 
                      alt={vendor.name} 
                      onError={(e) => handleVendorLogoError(e, vendor.name, vendor.category)}
                    />
                  </div>
                  <div className="seller-title-group">
                    <h4 className="seller-name">{vendor.name}</h4>
                    <div className="seller-badges-row">
                      <div className="seller-rating-badge">
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <span>{vendor.rating || 4.8}</span>
                        <span className="rating-count">(120+)</span>
                      </div>
                      <span className="bullet-separator">•</span>
                      <span className="seller-location-text">
                        <MapPin size={12} /> {distance} km away
                      </span>
                    </div>
                  </div>
                </div>

                <div className="seller-perks-strip">
                  <div className="seller-perk">
                    <Truck size={13} />
                    <span>{prepTime} delivery</span>
                  </div>
                  <div className="seller-perk">
                    <CheckCircle size={13} color="#059669" />
                    <span>Verified Merchant</span>
                  </div>
                </div>

                {/* Sample items preview */}
                {vendorSampleProducts.length > 0 && (
                  <div className="seller-sample-items-preview">
                    <span className="sample-label">Top items:</span>
                    <div className="sample-pills-list">
                      {vendorSampleProducts.map(sp => (
                        <span key={sp.id} className="sample-item-pill">
                          {sp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  className="seller-explore-btn" 
                  onClick={() => navigate('/products', { state: { vendorId: vendor.id } })}
                >
                  <span>Explore Store Products</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FRESH STORE PRODUCTS NEAR YOU */}
      <section className="dashboard-section products-section">
        <div className="section-header-modern">
          <div>
            <h3 className="section-title">Popular Store Products</h3>
            <p className="section-subtitle">Daily essentials ready for immediate dispatch</p>
          </div>
          <button 
            className="section-link-btn" 
            onClick={() => navigate('/products?category=All', { state: { category: 'All' } })}
          >
            View All Products ({products.length}) <ChevronRight size={16} />
          </button>
        </div>

        <div className="modern-product-grid">
          {products.slice(0, 8).map((product, idx) => {
            const seller = vendors.find(v => v.id === product.vendorId || v.legacy_id === product.vendorId) || { 
              name: product.vendorName || 'Neighborhood Store' 
            };
            const distance = seller.distance || (((seller.id?.toString().charCodeAt(0) || 7) * 3 % 25) / 10 + 1.2).toFixed(1);
            
            // Check if product is in cart
            const cartItem = cart.find(item => item.product.id === product.id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isWishlisted = wishlistIds.has(product.id);

            return (
              <div key={product.id || idx} className="modern-ecommerce-product-card">
                {/* Wishlist Button */}
                <button 
                  className={`product-wishlist-toggle-btn ${isWishlisted ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  aria-label="Toggle Wishlist"
                >
                  <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#64748b"} />
                </button>

                {/* Fresh / Popular badge */}
                <div className="product-fresh-badge">
                  <span className="fresh-dot" />
                  <span>{idx % 3 === 0 ? 'Fresh Today' : idx % 2 === 0 ? 'Best Seller' : 'Popular'}</span>
                </div>

                {/* Image Container */}
                <div 
                  className="product-card-image-box"
                  onClick={() => navigate('/products', { state: { search: product.name } })}
                >
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    loading="lazy"
                    onError={(e) => handleProductImageError(e, product.category, product.name)}
                  />
                </div>

                {/* Info Container */}
                <div className="product-card-body">
                  <div className="product-merchant-tag">
                    <Store size={12} />
                    <span>{seller.name || product.vendorName || 'Local Store'} • {distance} km</span>
                  </div>

                  <h4 
                    className="product-name"
                    onClick={() => navigate('/products', { state: { search: product.name } })}
                  >
                    {product.name}
                  </h4>

                  <span className="product-unit-text">
                    {product.unit || '1 unit'}
                  </span>

                  <div className="product-bottom-row">
                    <div className="product-price-block">
                      <span className="product-currency">₹</span>
                      <span className="product-price-val">{Number(product.price || 0).toFixed(0)}</span>
                      {product.price > 40 && (
                        <span className="product-mrp-strike">
                          ₹{(Number(product.price) * 1.15).toFixed(0)}
                        </span>
                      )}
                    </div>

                    {/* Interactive Add to Cart or Stepper */}
                    {inCartQty > 0 ? (
                      <div className="product-cart-stepper">
                        <button 
                          className="stepper-btn minus" 
                          onClick={() => updateCartQty(product.id, inCartQty - 1)}
                          title="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="stepper-qty">{inCartQty}</span>
                        <button 
                          className="stepper-btn plus" 
                          onClick={() => updateCartQty(product.id, inCartQty + 1)}
                          title="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="product-add-cart-btn"
                        onClick={() => addToCart(product, 1)}
                      >
                        <Plus size={14} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FLOATING QUICK-CART CHECKOUT BAR */}
      {cart.length > 0 && (
        <div className="floating-quick-cart-bar">
          <div className="quick-cart-left">
            <div className="quick-cart-icon-wrap">
              <ShoppingCart size={20} />
              <span className="quick-cart-badge">{totalCartItems}</span>
            </div>
            <div className="quick-cart-summary">
              <span className="quick-cart-count">
                {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} from {distinctStoresInCart} {distinctStoresInCart === 1 ? 'store' : 'stores'}
              </span>
              <span className="quick-cart-total">Total: ₹{totalCartPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="quick-cart-center">
            <div className="aggregation-tag-pill">
              <Sparkles size={13} />
              <span>Smart Combined Delivery (Saved ₹35)</span>
            </div>
          </div>

          <div className="quick-cart-right">
            <button className="quick-cart-checkout-btn" onClick={() => navigate('/cart')}>
              <span>View Cart & Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 9. ADDRESS SELECTOR MODAL */}
      {showAddressModal && (
        <div className="modal-overlay-custom" onClick={() => setShowAddressModal(false)}>
          <div className="address-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="address-modal-header">
              <div className="address-title-group">
                <MapPin size={20} color="#4f46e5" />
                <h4>Select Delivery Location</h4>
              </div>
              <button className="address-modal-close" onClick={() => setShowAddressModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="address-modal-subtitle">
              Choose your neighborhood in Chennai for accurate 15-25 minute delivery and local seller matching.
            </p>

            <div className="neighborhoods-preset-list">
              {CHENNAI_NEIGHBORHOODS.map((loc, idx) => {
                const isSelected = currentUser?.address?.includes(loc.name);
                return (
                  <div 
                    key={idx} 
                    className={`neighborhood-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectAddress(loc.fullAddress)}
                  >
                    <div className="neighborhood-info">
                      <strong>{loc.name}</strong>
                      <span className="full-addr">{loc.fullAddress}</span>
                    </div>
                    <div className="neighborhood-badge">
                      <Clock size={12} />
                      <span>{loc.eta}</span>
                      {isSelected && <Check size={14} color="#059669" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="custom-address-input-group">
              <label>Or enter a custom address</label>
              <div className="custom-input-row">
                <input 
                  type="text" 
                  placeholder="e.g. 55 Harrington Road, Chetpet, Chennai" 
                  value={customAddressInput}
                  onChange={(e) => setCustomAddressInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customAddressInput.trim()) {
                      handleSelectAddress(customAddressInput.trim());
                    }
                  }}
                />
                <button 
                  className="btn-apply-custom-addr"
                  disabled={!customAddressInput.trim()}
                  onClick={() => handleSelectAddress(customAddressInput.trim())}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Order Details Timeline Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default CustomerDashboard;
