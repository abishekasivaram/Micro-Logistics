import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, ShoppingBag, Truck, CheckCircle, Clock, Package, Navigation, Store, Eye, Heart, MapPin, Star, Apple, Milk, Coffee, Monitor } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { orders, vendors, products, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const customerId = currentUser?.id || 'c1';
  const customerOrders = orders.filter(o => o.customerId === customerId || o.customerName === currentUser?.name);
  
  // Dummy categories array
  const categories = [
    { name: 'Grocery', icon: <Package size={24} /> },
    { name: 'Fruits & Veg', icon: <Apple size={24} /> },
    { name: 'Dairy', icon: <Milk size={24} /> },
    { name: 'Bakery', icon: <Coffee size={24} /> },
    { name: 'Electronics', icon: <Monitor size={24} /> }
  ];

  return (
    <div className="page-container customer-dashboard">
      
      {/* Hero Section */}
      <div className="customer-hero">
        <h1>Shop Local. Get It Faster.</h1>
        <p>Discover products from nearby sellers and get your orders coordinated through one smart local delivery network.</p>
        <div className="customer-search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search products, sellers or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/products');
            }}
          />
        </div>
      </div>

      {/* Delivery Address Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.75rem', color: '#475569', fontSize: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <MapPin size={18} color="#4f46e5" />
        <span><strong>Delivering to:</strong> {currentUser?.address || '101 Anna Nagar East, Chennai'}</span>
      </div>

      {/* Categories Grid */}
      <div className="section-title-row">
        <h3>Explore Categories</h3>
      </div>
      <div className="customer-categories-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className="customer-category-card" onClick={() => navigate('/products')}>
            <div className="category-icon-wrap">
              {cat.icon}
            </div>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Local Sellers Near You */}
      <div className="section-title-row">
        <h3>Local Sellers Near You</h3>
        <button className="btn-link" style={{ color: '#4f46e5', fontWeight: '600' }} onClick={() => navigate('/browse-sellers')}>
          View All Sellers →
        </button>
      </div>
      <div className="customer-sellers-grid">
        {vendors.slice(0, 3).map(vendor => (
          <div key={vendor.id} className="customer-seller-card">
            <div className="seller-card-header">
              <img src={vendor.logo} alt={vendor.name} />
              <div>
                <h4>{vendor.name}</h4>
                <span className="category">{vendor.category}</span>
              </div>
            </div>
            <div className="seller-card-stats">
              <div className="stat-item">
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <span>{vendor.rating}</span>
              </div>
              <div className="stat-item">
                <MapPin size={14} />
                <span>{(Math.random() * 3 + 1).toFixed(1)} km</span>
              </div>
              <div className="stat-item">
                <Truck size={14} />
                <span>{vendor.prepTime || '30-45 min'}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full" onClick={() => navigate('/products', { state: { vendorId: vendor.id } })}>
              View Store
            </button>
          </div>
        ))}
      </div>

      {/* Popular Products Near You */}
      <div className="section-title-row">
        <h3>Popular Near You</h3>
        <button className="btn-link" style={{ color: '#4f46e5', fontWeight: '600' }} onClick={() => navigate('/products')}>
          View All Products →
        </button>
      </div>
      <div className="customer-product-grid">
        {products.slice(0, 4).map((product, idx) => {
          const seller = vendors.find(v => v.id === product.vendorId) || { name: 'Local Store' };
          return (
            <div key={product.id || idx} className="customer-product-card">
              <div className="wishlist-btn-overlay">
                <Heart size={16} />
              </div>
              <div className="product-img-box">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info-box">
                <h4>{product.name}</h4>
                <div className="product-seller-text">
                  <Store size={14} />
                  <span>{seller.name} • {(Math.random() * 3 + 1).toFixed(1)} km</span>
                </div>
                <div className="product-price-row">
                  <span className="price">₹{product.price.toFixed(2)}</span>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => navigate('/products')}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Timeline Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default CustomerDashboard;
