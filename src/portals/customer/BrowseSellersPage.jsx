import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Store, MapPin, Clock, Star, Filter, Package } from 'lucide-react';
import './BrowseSellersPage.css';

const CATEGORIES = [
  'All Categories',
  'Local Grocery Store',
  'Fresh Fruits & Vegetables',
  'Bakery',
  'Pharmacy',
  'Electronics Store'
];

const LOCATIONS = [
  'All Locations',
  'T. Nagar',
  'Adyar',
  'Velachery',
  'Mylapore',
  'Anna Nagar',
  'Triplicane'
];

const BrowseSellersPage = () => {
  const { vendors, products } = useAppContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [openOnly, setOpenOnly] = useState(false);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      products.some(p => p.vendorId === vendor.id && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All Categories' || vendor.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All Locations' || vendor.area === selectedLocation || vendor.address.includes(selectedLocation);
    const matchesOpen = !openOnly || vendor.isOpen;

    return matchesSearch && matchesCategory && matchesLocation && matchesOpen;
  });

  return (
    <div className="customer-browse-sellers page-container">
      <div className="sellers-header">
        <h2>Local Sellers</h2>
        <p>Discover trusted neighborhood stores participating in smart delivery coordination.</p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="customer-sellers-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search sellers or products (e.g. Rice, Milk, Bakery)..." 
            value={searchTerm}
            aria-label="Search sellers or products"
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <Filter size={16} color="#64748b" />
            <select 
              value={selectedCategory} 
              aria-label="Filter by business category"
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <MapPin size={16} color="#64748b" />
            <select 
              value={selectedLocation} 
              aria-label="Filter by neighborhood location"
              onChange={e => setSelectedLocation(e.target.value)}
            >
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <label htmlFor="chk-openonly" className="open-filter-checkbox">
            <input 
              type="checkbox" 
              id="chk-openonly"
              checked={openOnly} 
              onChange={e => setOpenOnly(e.target.checked)} 
            />
            <span>Open Now Only</span>
          </label>
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="customer-sellers-grid">
        {filteredVendors.length === 0 ? (
          <div className="no-results-card full-width" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <Store size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#1e293b' }}>No Sellers Found</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          filteredVendors.map(seller => {
            const sellerProducts = products.filter(p => p.vendorId === seller.id);

            return (
              <div key={seller.id} className="customer-seller-card">
                <div className="seller-card-header">
                  <img src={seller.logo} alt={seller.name} />
                  <div>
                    <h3>{seller.name}</h3>
                    <span className="category">{seller.category}</span>
                    <div className={`seller-status ${seller.isOpen ? 'open' : 'closed'}`}>
                      <span className="seller-status-dot"></span>
                      {seller.isOpen ? 'Open Now' : 'Closed'}
                    </div>
                  </div>
                </div>

                <div className="seller-card-body">
                  <p>{seller.description}</p>

                  <div className="seller-card-stats">
                    <div className="stat-item">
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span><strong>{seller.rating}</strong></span>
                    </div>
                    <div className="stat-item">
                      <MapPin size={14} />
                      <span>{seller.distance || (((seller.id?.toString().charCodeAt(0) || 5) * 5 % 28) / 10 + 1.1).toFixed(1)} km</span>
                    </div>
                    <div className="stat-item">
                      <Clock size={14} />
                      <span>{seller.prepTime}</span>
                    </div>
                  </div>

                  <div className="seller-popular-items">
                    <span><Package size={12} /> Popular items</span>
                    <div className="popular-tags">
                      {sellerProducts.slice(0, 3).map(p => (
                        <span key={p.id} className="tag">{p.name}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="seller-card-footer">
                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => navigate('/products', { state: { vendorId: seller.id } })}
                  >
                    View Store
                  </button>
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
