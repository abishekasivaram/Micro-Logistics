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
    // Match search in seller name, category, or products sold
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Browse Local Sellers</h2>
          <p>Discover trusted neighborhood stores participating in smart delivery coordination.</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="sellers-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search sellers or products (e.g. Rice, Milk, Bakery)..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <MapPin size={16} className="filter-icon" />
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <label className="open-filter-checkbox">
            <input 
              type="checkbox" 
              checked={openOnly} 
              onChange={e => setOpenOnly(e.target.checked)} 
            />
            <span>Open Now Only</span>
          </label>
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="sellers-grid">
        {filteredVendors.length === 0 ? (
          <div className="no-results-card full-width">
            <Store size={48} className="text-secondary" />
            <h3>No Sellers Found</h3>
            <p>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          filteredVendors.map(seller => {
            const sellerProducts = products.filter(p => p.vendorId === seller.id);

            return (
              <div key={seller.id} className="seller-card">
                <div className="seller-card-header">
                  <img src={seller.logo} alt={seller.name} className="seller-logo" />
                  <div className="seller-status-badge">
                    <span className={`status-dot ${seller.isOpen ? 'open' : 'closed'}`}></span>
                    <span>{seller.isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </div>

                <div className="seller-card-body">
                  <h3 className="seller-name">{seller.name}</h3>
                  <span className="seller-category">{seller.category}</span>
                  <p className="seller-desc">{seller.description}</p>

                  <div className="seller-meta-info">
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>Prep: <strong>{seller.prepTime}</strong></span>
                    </div>
                    <div className="meta-item">
                      <Star size={14} className="star-icon" />
                      <span><strong>{seller.rating}</strong> (Mock reviews)</span>
                    </div>
                  </div>

                  <div className="seller-location">
                    <MapPin size={14} className="text-secondary" />
                    <span>{seller.address}</span>
                  </div>

                  <div className="seller-products-preview">
                    <span className="preview-label"><Package size={12} /> Popular items:</span>
                    <div className="preview-tags">
                      {sellerProducts.slice(0, 3).map(p => (
                        <span key={p.id} className="item-tag">{p.name}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="seller-card-footer">
                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => navigate('/products', { state: { vendorId: seller.id } })}
                  >
                    View Products & Order
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
