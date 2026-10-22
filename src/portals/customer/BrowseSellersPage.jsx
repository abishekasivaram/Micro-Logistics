import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Store, MapPin, Clock, Star, Filter, Package, 
  ArrowRight, Sparkles, CheckCircle2, ShoppingBag, X, 
  Check, Store as StoreIcon, ShieldCheck
} from 'lucide-react';
import { getVendorLogo, handleVendorLogoError, normalizeCategory, CATEGORY_THEMES } from '../../utils/imageUtils';
import './BrowseSellersPage.css';

const CATEGORIES = [
  'All Categories',
  'Grocery',
  'Dairy',
  'Bakery',
  'Fruits & Veg',
  'Pharmacy'
];

const LOCATIONS = [
  'All Locations',
  'Velachery',
  'Gopalapuram',
  'Guindy',
  'T. Nagar',
  'Adyar',
  'Anna Nagar',
  'Mylapore'
];

const CATEGORY_GRADIENTS = {
  dairy: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
  bakery: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
  'fruits & veg': 'linear-gradient(135deg, #15803d 0%, #4ade80 100%)',
  groceries: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
  grocery: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
  pharmacy: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
  general: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)'
};

const CATEGORY_DESCRIPTIONS = {
  dairy: 'Fresh farm milk, curd, malai paneer, and chilled dairy essentials.',
  bakery: 'Oven-baked whole wheat breads, artisanal pastries, and tea-time snacks.',
  'fruits & veg': 'Farm-fresh organic fruits, vegetables, and leafy greens.',
  groceries: 'Daily staples, premium basmati rice, cooking oils, and spices.',
  grocery: 'Quality daily groceries, packaged grains, salts, and kitchen staples.',
  pharmacy: 'Trusted healthcare products, first-aid antiseptics, and daily wellness.',
  general: 'Neighborhood convenience goods, daily essentials, and quick delivery.'
};

const BrowseSellersPage = () => {
  const { vendors, products } = useAppContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [openOnly, setOpenOnly] = useState(false);

  const getCleanVendorName = (name) => {
    if (!name) return 'Neighborhood Store';
    return name;
  };

  const filteredVendors = vendors.filter(vendor => {
    const cleanName = getCleanVendorName(vendor.name || vendor.shopName);
    const searchLower = searchTerm.trim().toLowerCase();
    
    const matchesSearch = !searchLower ||
      cleanName.toLowerCase().includes(searchLower) ||
      (vendor.name && vendor.name.toLowerCase().includes(searchLower)) ||
      (vendor.category && vendor.category.toLowerCase().includes(searchLower)) ||
      (vendor.area && vendor.area.toLowerCase().includes(searchLower)) ||
      products.some(p => (p.vendorId === vendor.id || p.vendor_id === vendor.id) && p.name.toLowerCase().includes(searchLower));

    let matchesCategory = true;
    if (selectedCategory !== 'All Categories') {
      const vCat = (vendor.category || '').toLowerCase();
      const sCat = selectedCategory.toLowerCase();
      if (sCat.includes('groc')) {
        matchesCategory = vCat.includes('groc') || vCat.includes('general');
      } else if (sCat.includes('fruit') || sCat.includes('veg')) {
        matchesCategory = vCat.includes('fruit') || vCat.includes('veg') || vCat.includes('produce');
      } else {
        matchesCategory = vCat.includes(sCat) || sCat.includes(vCat);
      }
    }

    const matchesLocation = selectedLocation === 'All Locations' || 
      (vendor.area && vendor.area.toLowerCase().includes(selectedLocation.toLowerCase())) ||
      (vendor.address && vendor.address.toLowerCase().includes(selectedLocation.toLowerCase()));

    const matchesOpen = !openOnly || vendor.isOpen;

    return matchesSearch && matchesCategory && matchesLocation && matchesOpen;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setOpenOnly(false);
  };

  const openCount = vendors.filter(v => v.isOpen).length;

  return (
    <div className="customer-browse-sellers page-container">
      {/* Hero Banner Header */}
      <div className="sellers-page-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>Certified Neighborhood Network</span>
          </div>
          <h1>Browse Local Sellers</h1>
          <p>
            Connect directly with verified local merchants in your area. Combine multi-store orders with coordinated delivery aggregation.
          </p>
        </div>

        <div className="hero-metrics-pill-group">
          <div className="hero-metric-chip">
            <span className="metric-number">{vendors.length}</span>
            <span className="metric-label">Local Stores</span>
          </div>
          <div className="hero-metric-divider" />
          <div className="hero-metric-chip">
            <span className="metric-number text-success">{openCount}</span>
            <span className="metric-label">Open Now</span>
          </div>
          <div className="hero-metric-divider" />
          <div className="hero-metric-chip">
            <span className="metric-number text-primary">{products.length}</span>
            <span className="metric-label">Catalog Items</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Control Panel */}
      <div className="sellers-filter-card">
        <div className="filter-top-bar">
          <div className="search-box-group">
            <Search size={18} className="search-icon-adornment" />
            <input 
              type="text" 
              placeholder="Search stores, categories, or items (Basmati Rice, Milk, Paneer)..." 
              value={searchTerm}
              aria-label="Search local sellers or products"
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="clear-search-btn" 
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="dropdowns-group">
            <div className="custom-select-box">
              <Filter size={15} className="select-icon" />
              <select 
                value={selectedCategory} 
                aria-label="Filter by category"
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="custom-select-box">
              <MapPin size={15} className="select-icon" />
              <select 
                value={selectedLocation} 
                aria-label="Filter by neighborhood"
                onChange={e => setSelectedLocation(e.target.value)}
              >
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <label className={`toggle-pill-switch ${openOnly ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={openOnly} 
                onChange={e => setOpenOnly(e.target.checked)} 
              />
              <span className="status-live-dot" />
              <span>Open Now</span>
            </label>
          </div>
        </div>

        {/* Quick Filter Category Chips */}
        <div className="category-quick-pills">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`quick-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Strip */}
      <div className="sellers-results-strip">
        <div className="results-count-text">
          Showing <strong>{filteredVendors.length}</strong> {filteredVendors.length === 1 ? 'store' : 'stores'} near you
        </div>

        {(searchTerm || selectedCategory !== 'All Categories' || selectedLocation !== 'All Locations' || openOnly) && (
          <button type="button" className="reset-filter-link" onClick={handleResetFilters}>
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Sellers Grid */}
      <div className="customer-sellers-grid">
        {filteredVendors.length === 0 ? (
          <div className="sellers-empty-state">
            <div className="empty-state-icon-bubble">
              <StoreIcon size={36} />
            </div>
            <h3>No matching sellers found</h3>
            <p>We couldn't find any neighborhood sellers matching your current search or filters.</p>
            <button type="button" className="btn btn-outline" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredVendors.map(seller => {
            const cleanName = getCleanVendorName(seller.name || seller.shopName);
            const sellerProducts = products.filter(p => 
              p.vendorId === seller.id || 
              p.vendor_id === seller.id ||
              p.vendorId === seller.legacy_id ||
              p.vendor_id === seller.legacy_id ||
              p.vendorName === seller.name ||
              p.vendorName === seller.shopName
            );

            const normCat = normalizeCategory(seller.category);
            const bannerGradient = CATEGORY_GRADIENTS[normCat] || CATEGORY_GRADIENTS.general;
            const categoryDesc = seller.description || CATEGORY_DESCRIPTIONS[normCat] || CATEGORY_DESCRIPTIONS.general;
            const displayRating = (seller.rating && seller.rating > 0) ? Number(seller.rating).toFixed(1) : '4.8';
            const displayDistance = seller.distance || (((seller.id?.toString().charCodeAt(0) || 5) * 5 % 28) / 10 + 1.1).toFixed(1);
            const displayPrepTime = seller.prepTime || '15-25 mins';
            const locationArea = seller.area || seller.address?.split(',')[0] || 'Chennai Central';

            return (
              <div key={seller.id} className="customer-seller-card">
                {/* Decorative Top Accent Banner */}
                <div className="card-top-banner" style={{ background: bannerGradient }}>
                  <div className="banner-category-tag">
                    {seller.category || 'Local Store'}
                  </div>
                  <div className={`banner-status-pill ${seller.isOpen ? 'open' : 'closed'}`}>
                    <span className="banner-status-dot" />
                    <span>{seller.isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </div>

                <div className="seller-card-inner">
                  {/* Avatar & Title Row */}
                  <div className="seller-profile-row">
                    <div className="seller-logo-container">
                      <img 
                        src={getVendorLogo(seller)} 
                        alt={cleanName} 
                        onError={(e) => handleVendorLogoError(e, cleanName, seller.category)}
                      />
                    </div>
                    <div className="seller-identity">
                      <h3 title={cleanName}>{cleanName}</h3>
                      <div className="seller-location-subtitle">
                        <MapPin size={13} className="loc-icon" />
                        <span>{locationArea}</span>
                      </div>
                    </div>
                  </div>

                  {/* Store Bio / Description */}
                  <p className="seller-description-text">
                    {categoryDesc}
                  </p>

                  {/* Core Metrics Strip */}
                  <div className="seller-metrics-row">
                    <div className="metric-cell" title="Customer Rating">
                      <Star size={14} className="star-icon" fill="#f59e0b" color="#f59e0b" />
                      <span className="metric-val">{displayRating}</span>
                      <span className="metric-sub">(120+)</span>
                    </div>

                    <div className="metric-cell-divider" />

                    <div className="metric-cell" title="Delivery Distance">
                      <MapPin size={14} className="metric-icon" />
                      <span className="metric-val">{displayDistance} km</span>
                    </div>

                    <div className="metric-cell-divider" />

                    <div className="metric-cell" title="Standard Preparation Time">
                      <Clock size={14} className="metric-icon" />
                      <span className="metric-val">{displayPrepTime}</span>
                    </div>
                  </div>

                  {/* Showcase Products or Highlight */}
                  <div className="seller-popular-section">
                    <div className="popular-section-header">
                      <ShoppingBag size={13} />
                      <span>{sellerProducts.length > 0 ? 'Featured Products' : 'Store Specialties'}</span>
                    </div>

                    <div className="popular-items-tags">
                      {sellerProducts.length > 0 ? (
                        sellerProducts.slice(0, 3).map(p => (
                          <span key={p.id} className="popular-product-chip" title={p.name}>
                            <span className="chip-name">{p.name}</span>
                            <span className="chip-price">₹{p.price}</span>
                          </span>
                        ))
                      ) : (
                        <span className="popular-product-chip empty-chip">
                          <Sparkles size={12} color="#4f46e5" />
                          <span>Full in-store catalog ready for ordering</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="seller-card-footer">
                    <button 
                      type="button"
                      className="btn-store-action"
                      onClick={() => navigate('/products', { state: { vendorId: seller.id } })}
                    >
                      <span>Explore Store Products</span>
                      <ArrowRight size={16} className="btn-arrow" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BrowseSellersPage;
