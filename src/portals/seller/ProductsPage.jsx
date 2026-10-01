import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Plus, Edit2, Trash2, ShoppingCart, Clock, Store, 
  Eye, Check, X, Filter, Image as ImageIcon, ChevronRight,
  Package, LayoutGrid, List, AlertTriangle, ArrowUpDown, Sparkles
} from 'lucide-react';
import './ProductsPage.css';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products = [], currentUser, addToCart, addProduct, updateProduct, deleteProduct } = useAppContext();

  const isCustomer = currentUser?.role === 'customer';
  const initialVendorFilter = location.state?.vendorId || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All'); // 'All', 'Good', 'Low', 'Out'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Customer view quantities
  const [quantities, setQuantities] = useState({});

  // Drawer Add/Edit Modal
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Dairy',
    price: '',
    stock: '20',
    prepTime: '15 mins',
    description: '',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    status: 'Active'
  });

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Close modal on Escape and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showDrawer) {
        setShowDrawer(false);
      }
    };
    if (showDrawer) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDrawer]);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';

  // Filter products scoped to seller if in seller mode
  const scopedProducts = products.filter(p => {
    if (isCustomer) return true;
    if (currentUser?.role === 'admin') return true;
    return p.vendorId === sellerId || p.vendorId === 'v1';
  });

  // Filtered list
  const filteredProducts = scopedProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (selectedStockFilter === 'Good') matchesStock = p.stock > 10;
    else if (selectedStockFilter === 'Low') matchesStock = p.stock > 0 && p.stock <= 10;
    else if (selectedStockFilter === 'Out') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Metrics
  const totalCount = scopedProducts.length;
  const inStockCount = scopedProducts.filter(p => p.stock > 10).length;
  const lowStockCount = scopedProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = scopedProducts.filter(p => p.stock === 0).length;

  const handleStockAdjust = (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    updateProduct(product.id, { stock: newStock });
  };

  const handleToggleStatus = (product) => {
    const newStatus = product.status === 'Active' ? 'Hidden' : 'Active';
    updateProduct(product.id, { status: newStatus });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Dairy',
      price: '',
      stock: '25',
      prepTime: '15 mins',
      description: '',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      status: 'Active'
    });
    setShowDrawer(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category || 'Dairy',
      price: product.price || '',
      stock: product.stock !== undefined ? product.stock : 20,
      prepTime: product.prepTime || '15 mins',
      description: product.description || '',
      image: product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      status: product.status || 'Active'
    });
    setShowDrawer(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock) || 0,
      prepTime: productForm.prepTime,
      description: productForm.description,
      image: productForm.image,
      status: productForm.status
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setShowDrawer(false);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(pid => pid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCustomerQtyChange = (productId, delta) => {
    const current = quantities[productId] || 1;
    setQuantities({ ...quantities, [productId]: Math.max(1, current + delta) });
  };

  return (
    <div className="products-page">
      {!isCustomer ? (
        // SELLER / MERCHANT VIEW
        <>
          {/* Header */}
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Catalog & Inventory</h1>
              <p className="page-subtitle">
                Manage your store offerings, real-time stock availability, and quick pricing.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="orders-action-btn primary" onClick={openAddModal}>
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="products-summary-strip">
            <button 
              className={`products-stat-pill ${selectedStockFilter === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedStockFilter('All')}
            >
              All SKUs <span className="products-stat-count">{totalCount}</span>
            </button>
            <button 
              className={`products-stat-pill ${selectedStockFilter === 'Good' ? 'active' : ''}`}
              onClick={() => setSelectedStockFilter('Good')}
            >
              Healthy Stock <span className="products-stat-count" style={{ color: '#059669' }}>{inStockCount}</span>
            </button>
            <button 
              className={`products-stat-pill ${selectedStockFilter === 'Low' ? 'active' : ''}`}
              onClick={() => setSelectedStockFilter('Low')}
            >
              Low Stock (&le;10) <span className="products-stat-count" style={{ color: '#d97706' }}>{lowStockCount}</span>
            </button>
            <button 
              className={`products-stat-pill ${selectedStockFilter === 'Out' ? 'active' : ''}`}
              onClick={() => setSelectedStockFilter('Out')}
            >
              Out of Stock <span className="products-stat-count" style={{ color: '#dc2626' }}>{outOfStockCount}</span>
            </button>
          </div>

          {/* Toolbar */}
          <div className="toolbar-card">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon-left" />
              <input 
                type="text" 
                placeholder="Search products by name or category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="toolbar-filters">
              <select 
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Grains">Grains & Pulses</option>
                <option value="Vegetables">Vegetables & Fruits</option>
                <option value="Snacks">Snacks & Beverages</option>
              </select>

              <div className="view-mode-toggle">
                <button 
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <List size={15} /> Table
                </button>
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Card Grid View"
                >
                  <LayoutGrid size={15} /> Grid
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Content */}
          {filteredProducts.length === 0 ? (
            <div className="orders-empty-state">
              <div className="orders-empty-icon">
                <Package size={28} />
              </div>
              <h3 className="orders-empty-title">No products found</h3>
              <p className="orders-empty-desc">
                {searchTerm ? `No catalog items matched "${searchTerm}".` : 'Get started by creating your first product in this category.'}
              </p>
              <button className="orders-action-btn primary" onClick={openAddModal}>
                <Plus size={15} /> Add New Item
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingRight: 0 }}>
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} 
                      />
                    </th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th>Stock Adjustment</th>
                    <th>Prep SLA</th>
                    <th>Store Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= 10;
                    const stockClass = isOutOfStock ? 'out' : isLowStock ? 'low' : 'good';
                    const displaySku = (product.id || '').slice(-6).toUpperCase();

                    return (
                      <tr key={product.id}>
                        <td style={{ paddingRight: 0 }}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(product.id)}
                            onChange={() => toggleSelect(product.id)}
                          />
                        </td>
                        <td>
                          <div className="product-cell">
                            <img 
                              src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} 
                              alt={product.name} 
                              className="product-thumb"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                            />
                            <div>
                              <div className="product-name">{product.name}</div>
                              <div className="product-sku">SKU: #{displaySku}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">{product.category || 'General'}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', fontFeatureSettings: '"tnum"' }}>
                          ₹{Number(product.price || 0).toFixed(2)}
                        </td>
                        <td>
                          <div className="stock-stepper-wrap">
                            <button 
                              className="stock-stepper-btn"
                              onClick={() => handleStockAdjust(product, -1)}
                              title="Decrease Stock"
                            >
                              -
                            </button>
                            <span className={`stock-badge-pill ${stockClass}`}>
                              {product.stock || 0}
                            </span>
                            <button 
                              className="stock-stepper-btn"
                              onClick={() => handleStockAdjust(product, 1)}
                              title="Increase Stock"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="prep-chip">
                            <Clock size={12} /> {product.prepTime || '15 mins'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`products-stat-pill ${product.status === 'Active' ? 'active' : ''}`}
                            style={{ padding: '3px 10px', fontSize: '11px' }}
                            onClick={() => handleToggleStatus(product)}
                          >
                            {product.status || 'Active'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button 
                              className="stock-stepper-btn"
                              onClick={() => openEditModal(product)}
                              title="Edit Product"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              className="stock-stepper-btn"
                              onClick={() => deleteProduct(product.id)}
                              title="Delete Product"
                            >
                              <Trash2 size={13} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="products-cards-grid">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= 10;
                const stockClass = isOutOfStock ? 'out' : isLowStock ? 'low' : 'good';

                return (
                  <div key={product.id} className="catalog-card">
                    <div className="catalog-card-image-wrap">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                        alt={product.name} 
                        className="catalog-card-img"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'; }}
                      />
                      <div className="catalog-card-status-overlay">
                        <span className={`stock-badge-pill ${stockClass}`}>
                          {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                      </div>
                      <div className="catalog-card-price-overlay">
                        ₹{Number(product.price || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="catalog-card-body">
                      <span className="category-badge" style={{ alignSelf: 'flex-start' }}>
                        {product.category || 'General'}
                      </span>
                      <h3 className="catalog-card-title">{product.name}</h3>

                      <div className="catalog-card-meta">
                        <span className="prep-chip">
                          <Clock size={12} /> {product.prepTime || '15 mins'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Status: <strong>{product.status || 'Active'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="catalog-card-footer">
                      <div className="stock-stepper-wrap">
                        <button className="stock-stepper-btn" onClick={() => handleStockAdjust(product, -1)}>-</button>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>{product.stock || 0}</span>
                        <button className="stock-stepper-btn" onClick={() => handleStockAdjust(product, 1)}>+</button>
                      </div>

                      <button 
                        className="orders-action-btn"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => openEditModal(product)}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Enterprise Centered Popup Modal with Frosted Glass Blur (Portaled to Body) */}
          {showDrawer && createPortal(
            <div 
              className="product-popup-backdrop" 
              onClick={() => setShowDrawer(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-popup-title"
            >
              <div className="product-popup-dialog" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="product-popup-header">
                  <div className="product-popup-header-info">
                    <div className="product-popup-icon-badge">
                      <Package size={22} />
                    </div>
                    <div>
                      <h3 id="product-popup-title" className="product-popup-title">
                        {editingProduct ? 'Edit Catalog Product' : 'Add New Store Product'}
                      </h3>
                      <p className="product-popup-subtitle">
                        {editingProduct ? 'Update live SKU details, real-time stock units, and pricing.' : 'Publish a new product item to your local customer catalog.'}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="product-popup-close-btn" 
                    onClick={() => setShowDrawer(false)} 
                    title="Close Dialog"
                    aria-label="Close Dialog"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body Form */}
                <div className="product-popup-body">
                  <form id="product-form" onSubmit={handleSaveProduct} className="product-popup-form">
                    <div className="form-group-full">
                      <label className="product-field-label">
                        Product Name <span className="req-star">*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        className="product-field-input"
                        placeholder="e.g., Organic Whole Farm Milk 500ml" 
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group-full">
                        <label className="product-field-label">Category</label>
                        <select 
                          className="product-field-select"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        >
                          <option value="Dairy">Dairy</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Grains">Grains & Pulses</option>
                          <option value="Vegetables">Vegetables & Fruits</option>
                          <option value="Snacks">Snacks & Beverages</option>
                        </select>
                      </div>

                      <div className="form-group-full">
                        <label className="product-field-label">
                          Price (INR ₹) <span className="req-star">*</span>
                        </label>
                        <div className="input-prefix-wrapper">
                          <span className="input-currency-prefix">₹</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            required 
                            className="product-field-input has-prefix"
                            placeholder="48.00" 
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-grid-row">
                      <div className="form-group-full">
                        <label className="product-field-label">Initial Stock Units</label>
                        <input 
                          type="number" 
                          min="0"
                          className="product-field-input"
                          placeholder="25" 
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        />
                      </div>

                      <div className="form-group-full">
                        <label className="product-field-label">Prep Time Estimate</label>
                        <input 
                          type="text" 
                          className="product-field-input"
                          placeholder="e.g. 10 mins" 
                          value={productForm.prepTime}
                          onChange={(e) => setProductForm({ ...productForm, prepTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group-full">
                      <label className="product-field-label">Product Image URL</label>
                      <input 
                        type="url" 
                        className="product-field-input"
                        placeholder="https://images.unsplash.com/photo-..." 
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      />
                    </div>

                    {/* Image Live Preview */}
                    <div className="product-image-preview-box">
                      {productForm.image ? (
                        <div className="preview-image-container">
                          <img 
                            src={productForm.image} 
                            alt="Live Preview" 
                            className="preview-img"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'; }}
                          />
                          <span className="preview-badge">Live Image Preview</span>
                        </div>
                      ) : (
                        <div className="preview-placeholder">
                          <ImageIcon size={20} className="placeholder-icon" />
                          <span>Paste an image link above to preview photo instantly</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group-full">
                      <label className="product-field-label">Product Description</label>
                      <textarea 
                        className="product-field-textarea" 
                        rows={3}
                        placeholder="Fresh daily farm product sourced locally with premium packaging..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="product-popup-footer">
                  <button 
                    type="button" 
                    className="popup-btn-cancel"
                    onClick={() => setShowDrawer(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="product-form"
                    className="popup-btn-submit"
                  >
                    <Check size={16} />
                    <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      ) : (
        /* CUSTOMER EXPLORE VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Explore Fresh Local Products</h1>
              <p className="page-subtitle">Shop from certified local neighborhood merchants delivered together.</p>
            </div>
          </div>

          <div className="toolbar-card">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon-left" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="customer-catalog-grid">
            {filteredProducts.map(product => {
              const qty = quantities[product.id] || 1;
              return (
                <div key={product.id} className="customer-prod-card">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                    alt={product.name} 
                    className="customer-prod-img" 
                  />
                  <div className="customer-prod-info">
                    <span className="category-badge" style={{ alignSelf: 'flex-start' }}>{product.category}</span>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{product.name}</h3>
                    <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text)' }}>₹{product.price}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                      <div className="stock-stepper-wrap">
                        <button className="stock-stepper-btn" onClick={() => handleCustomerQtyChange(product.id, -1)}>-</button>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>{qty}</span>
                        <button className="stock-stepper-btn" onClick={() => handleCustomerQtyChange(product.id, 1)}>+</button>
                      </div>
                      <button 
                        className="customer-add-btn"
                        onClick={() => addToCart(product, qty)}
                      >
                        <ShoppingCart size={15} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
