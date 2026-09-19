import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Plus, Edit2, Trash2, ShoppingCart, Clock, Store, Eye, Check, X, Filter, Heart } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import './ProductsPage.css';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, vendors, currentUser, addToCart, addProduct, updateProduct, deleteProduct } = useAppContext();

  const isCustomer = currentUser?.role === 'customer';
  const initialVendorId = location.state?.vendorId || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState(initialVendorId);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Quantities state per product for customer view
  const [quantities, setQuantities] = useState({});

  // Product Add/Edit Modal state for seller/vendor
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Dairy',
    price: '',
    stock: '',
    prepTime: '15 mins',
    description: '',
    image: ''
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showProductModal) {
        setShowProductModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProductModal]);

  const handleQtyChange = (productId, delta) => {
    const currentQty = quantities[productId] || 1;
    const newQty = Math.max(1, currentQty + delta);
    setQuantities({ ...quantities, [productId]: newQty });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Dairy',
      price: '',
      stock: '20',
      prepTime: '15 mins',
      description: '',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80'
    });
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      prepTime: product.prepTime || '15 mins',
      description: product.description || '',
      image: product.image || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        prepTime: productForm.prepTime,
        description: productForm.description,
        image: productForm.image
      });
    } else {
      addProduct({
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        prepTime: productForm.prepTime,
        description: productForm.description,
        image: productForm.image
      });
    }
    setShowProductModal(false);
  };

  // Filter products list
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = selectedVendorFilter === 'all' || product.vendorId === selectedVendorFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || product.category === selectedCategoryFilter;
    const matchesSellerUser = !isCustomer && currentUser?.role === 'vendor' ? product.vendorId === currentUser.id : true;

    return matchesSearch && matchesVendor && matchesCategory && matchesSellerUser;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>{isCustomer ? 'Browse Local Products' : 'Product Inventory Management'}</h2>
          <p>{isCustomer ? 'Select fresh items from neighborhood sellers and add to cart.' : 'Manage your store catalog, stock quantities, and availability.'}</p>
        </div>
        {!isCustomer && (
          <button className="btn btn-primary flex items-center gap-2" onClick={openAddModal}>
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {/* Controls / Filter Bar */}
      <div className="products-controls-bar">
        <div className="search-box-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchTerm}
            aria-label="Search products by name or category"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group-row">
          {isCustomer && (
            <select 
              aria-label="Filter products by local seller"
              value={selectedVendorFilter} 
              onChange={e => setSelectedVendorFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Local Sellers</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}

          <select 
            aria-label="Filter products by category"
            value={selectedCategoryFilter} 
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Dairy">Dairy</option>
            <option value="Bakery">Bakery</option>
            <option value="Grains">Grains & Pulses</option>
            <option value="Vegetables">Vegetables & Fruits</option>
            <option value="Oil & Ghee">Oil & Ghee</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Electronics">Electronics</option>
          </select>
        </div>
      </div>

      {/* CUSTOMER VIEW: Product Cards Grid */}
      {isCustomer ? (
        <div className="customer-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', padding: '16px 0' }}>
          {filteredProducts.length === 0 ? (
            <div className="no-products-box full-width">
              <Store size={48} className="text-secondary" />
              <h3>No Products Found</h3>
              <p>Try clearing filters or searching another keyword.</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              const qty = quantities[product.id] || 1;
              const isAvailable = product.stock > 0;

              return (
                <div key={product.id} className="customer-product-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div className="wishlist-btn-overlay" style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', zIndex: 2 }}>
                    <Heart size={16} />
                  </div>
                  
                  <div className="product-img-box" style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {!isAvailable && (
                       <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: 'white', fontSize: '12px', textAlign: 'center', padding: '4px' }}>
                         Out of Stock
                       </div>
                    )}
                  </div>

                  <div className="product-info-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{product.name}</h4>
                    <div className="product-seller-text" style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                      <Store size={14} />
                      <span>{vendor?.name || product.vendorName || 'Local Seller'}</span>
                    </div>

                    <div className="product-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '12px' }}>
                      <span className="price" style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>₹{product.price.toFixed(2)}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {product.prepTime || '15 mins'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button style={{ padding: '6px 10px', background: '#f8fafc', border: 'none', cursor: 'pointer' }} onClick={() => handleQtyChange(product.id, -1)} disabled={!isAvailable}>-</button>
                        <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: '500' }}>{qty}</span>
                        <button style={{ padding: '6px 10px', background: '#f8fafc', border: 'none', cursor: 'pointer' }} onClick={() => handleQtyChange(product.id, 1)} disabled={!isAvailable}>+</button>
                      </div>
                      <button 
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '8px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                        onClick={() => handleAddToCart(product)}
                        disabled={!isAvailable}
                      >
                        <ShoppingCart size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* SELLER / VENDOR VIEW: Product Management Table */
        <div className="table-container card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Qty</th>
                <th>Prep Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr><td colSpan="7" className="empty-state">No products found in store catalog. Click "Add New Product" to create one.</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <span className="font-medium" style={{ display: 'block' }}>{product.name}</span>
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>ID: {product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="font-medium">₹{product.price.toFixed(2)}</td>
                    <td>
                      <input 
                        type="number" 
                        value={product.stock}
                        aria-label={`Stock count for ${product.name}`}
                        style={{ width: '70px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        onChange={(e) => updateProduct(product.id, { 
                          stock: parseInt(e.target.value) || 0
                        })}
                      />
                    </td>
                    <td>{product.prepTime || '15 mins'}</td>
                    <td>
                      <span className={`badge badge-${product.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="icon-btn-small" onClick={() => openEditModal(product)} title="Edit Product">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn-small text-danger" onClick={() => deleteProduct(product.id)} title="Delete Product">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Seller Add/Edit Modal */}
      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
          <div 
            className="product-modal-card" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="product-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="product-modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={() => setShowProductModal(false)} aria-label="Close modal"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="product-modal-form">
              <div className="form-group">
                <label htmlFor="prod-name">Product Name *</label>
                <input 
                  type="text" 
                  id="prod-name"
                  className="form-control" 
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-cat">Category *</label>
                <select 
                  id="prod-cat"
                  className="form-control"
                  value={productForm.category}
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Grains">Grains & Pulses</option>
                  <option value="Vegetables">Vegetables & Fruits</option>
                  <option value="Oil & Ghee">Oil & Ghee</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prod-price">Price (₹) *</label>
                <input 
                  type="number" 
                  id="prod-price"
                  step="0.01" 
                  className="form-control" 
                  value={productForm.price}
                  onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-stock">Stock Quantity *</label>
                <input 
                  type="number" 
                  id="prod-stock"
                  className="form-control" 
                  value={productForm.stock}
                  onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-prep">Preparation Time</label>
                <input 
                  type="text" 
                  id="prod-prep"
                  className="form-control" 
                  placeholder="15 mins"
                  value={productForm.prepTime}
                  onChange={e => setProductForm({ ...productForm, prepTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-img">Image URL</label>
                <input 
                  type="url" 
                  id="prod-img"
                  className="form-control" 
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="prod-desc">Description</label>
                <textarea 
                  id="prod-desc"
                  className="form-control"
                  rows="2"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-footer full-width">
                <button type="button" className="btn btn-outline" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

