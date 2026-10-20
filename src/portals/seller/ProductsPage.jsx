import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Plus, Edit2, Trash2, ShoppingCart, Clock, Store, 
  Eye, Check, X, Filter, Image as ImageIcon, ChevronRight,
  Package, LayoutGrid, List, AlertTriangle, ArrowUpDown, Sparkles,
  Apple, Milk, Coffee, Monitor, Heart, RotateCcw
} from 'lucide-react';
import './ProductsPage.css';

export const CUSTOMER_CATEGORIES = [
  { id: 'All', name: 'All Products', icon: LayoutGrid },
  { id: 'Grocery', name: 'Grocery', icon: Package },
  { id: 'Fruits & Veg', name: 'Fruits & Veg', icon: Apple },
  { id: 'Dairy', name: 'Dairy', icon: Milk },
  { id: 'Bakery', name: 'Bakery', icon: Coffee },
  { id: 'Electronics', name: 'Electronics', icon: Monitor },
  { id: 'Pharmacy', name: 'Pharmacy', icon: Heart }
];

export const matchesCategoryFilter = (productCategory, filterCategory) => {
  if (!filterCategory || filterCategory === 'All') return true;
  if (!productCategory) return false;

  const prod = productCategory.toLowerCase().trim();
  const filter = filterCategory.toLowerCase().trim();

  if (prod === filter) return true;

  if (filter === 'grocery') {
    return (
      prod.includes('grocer') ||
      prod.includes('grain') ||
      prod.includes('oil') ||
      prod.includes('ghee') ||
      prod.includes('rice') ||
      prod.includes('pulse') ||
      prod.includes('dal') ||
      prod.includes('flour') ||
      prod.includes('spice') ||
      prod.includes('staple') ||
      prod.includes('snack')
    );
  }

  if (filter === 'fruits & veg' || filter === 'fruits' || filter === 'vegetables' || filter === 'produce') {
    return (
      prod.includes('fruit') ||
      prod.includes('veg') ||
      prod.includes('produce') ||
      prod.includes('tomato') ||
      prod.includes('onion') ||
      prod.includes('potato')
    );
  }

  if (filter === 'dairy') {
    return (
      prod.includes('dairy') ||
      prod.includes('milk') ||
      prod.includes('cheese') ||
      prod.includes('butter') ||
      prod.includes('curd') ||
      prod.includes('paneer') ||
      prod.includes('yogurt')
    );
  }

  if (filter === 'bakery') {
    return (
      prod.includes('baker') ||
      prod.includes('bread') ||
      prod.includes('croissant') ||
      prod.includes('cake') ||
      prod.includes('bun') ||
      prod.includes('pastry') ||
      prod.includes('cookie')
    );
  }

  if (filter === 'electronics') {
    return (
      prod.includes('electr') ||
      prod.includes('tech') ||
      prod.includes('gadget') ||
      prod.includes('mobile') ||
      prod.includes('power') ||
      prod.includes('phone') ||
      prod.includes('device')
    );
  }

  if (filter === 'pharmacy' || filter === 'healthcare') {
    return (
      prod.includes('pharm') ||
      prod.includes('health') ||
      prod.includes('med') ||
      prod.includes('tablet') ||
      prod.includes('wellness')
    );
  }

  return prod.includes(filter) || filter.includes(prod);
};

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products = [], currentUser, addToCart, addProduct, updateProduct, deleteProduct } = useAppContext();

  const isCustomer = currentUser?.role === 'customer';
  const initialVendorFilter = searchParams.get('vendorId') || location.state?.vendorId || 'all';
  const initialCategory = searchParams.get('category') || location.state?.category || 'All';
  const initialSearch = searchParams.get('search') || location.state?.search || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [vendorFilter, setVendorFilter] = useState(initialVendorFilter);
  const [selectedStockFilter, setSelectedStockFilter] = useState('All'); // 'All', 'Good', 'Low', 'Out'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Sync state when location or search parameters change
  useEffect(() => {
    const cat = searchParams.get('category') || location.state?.category;
    if (cat) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get('search') || location.state?.search;
    if (q !== undefined && q !== null) {
      setSearchTerm(q);
    }
    const v = searchParams.get('vendorId') || location.state?.vendorId;
    if (v) {
      setVendorFilter(v);
    }
  }, [location.search, location.state]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const newParams = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== 'All') {
      newParams.set('category', categoryId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setVendorFilter('all');
    setSearchParams({});
  };
  
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

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;
  const sellerLegacyId = currentUser?.legacy_id || null;

  // Filter products scoped to seller if in seller mode
  const scopedProducts = products.filter(p => {
    if (isCustomer) {
      if (vendorFilter && vendorFilter !== 'all') {
        return p.vendorId === vendorFilter || p.vendor?.id === vendorFilter;
      }
      return true;
    }
    if (currentUser?.role === 'admin') return true;
    if (!sellerId && !sellerLegacyId) return false;
    return (sellerId && (p.vendorId === sellerId || p.vendor_id === sellerId)) ||
           (sellerLegacyId && (p.vendorId === sellerLegacyId || p.vendor_id === sellerLegacyId));
  });

  // Filtered list
  const filteredProducts = scopedProducts.filter(p => {
    const searchLower = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !searchLower ||
                          (p.name || '').toLowerCase().includes(searchLower) ||
                          (p.category || '').toLowerCase().includes(searchLower) ||
                          (p.description || '').toLowerCase().includes(searchLower);
                          
    const matchesCategory = matchesCategoryFilter(p.category, selectedCategory);
    
    let matchesStock = true;
    if (selectedStockFilter === 'Good') matchesStock = p.stock > 10;
    else if (selectedStockFilter === 'Low') matchesStock = p.stock > 0 && p.stock <= 10;
    else if (selectedStockFilter === 'Out') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate counts for categories in customer explore view
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'All') return scopedProducts.length;
    return scopedProducts.filter(p => matchesCategoryFilter(p.category, categoryId)).length;
  };

  // Extra categories created dynamically by vendors
  const extraCategories = Array.from(new Set(
    scopedProducts
      .map(p => p.category)
      .filter(Boolean)
      .filter(cat => !CUSTOMER_CATEGORIES.slice(1).some(c => matchesCategoryFilter(cat, c.id)))
  ));

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
      name: product.name || '',
      category: product.category || 'Dairy',
      price: product.price !== undefined ? String(product.price) : '',
      stock: product.stock !== undefined ? String(product.stock) : '20',
      prepTime: product.prepTime || '15 mins',
      description: product.description || '',
      image: product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      status: product.status || 'Active'
    });
    setShowDrawer(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.name.trim()) {
      alert('Product name is required.');
      return;
    }
    const price = parseFloat(productForm.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than zero.');
      return;
    }
    const stock = parseInt(productForm.stock, 10);
    if (isNaN(stock) || stock < 0) {
      alert('Stock quantity cannot be negative.');
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: price,
      stock: stock,
      prepTime: productForm.prepTime || '15 mins',
      description: productForm.description || '',
      image: productForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      status: productForm.status || 'Active'
    };

    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, payload);
    } else {
      res = await addProduct(payload);
    }

    if (res && res.success === false) {
      alert(res.message || 'Operation failed');
    } else {
      setShowDrawer(false);
    }
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
            <div className="search-input-wrap" style={{ position: 'relative', flex: 1 }}>
              <Search size={16} className="search-icon-left" />
              <input 
                type="text" 
                placeholder="Search products by name, category, or description..." 
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => handleSearchChange('')}
                  title="Clear search"
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {vendorFilter && vendorFilter !== 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>
                <Store size={14} />
                <span>Seller: {scopedProducts[0]?.vendorName || 'Selected Seller'}</span>
                <button 
                  onClick={() => {
                    setVendorFilter('all');
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('vendorId');
                    setSearchParams(newParams);
                  }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4338ca', display: 'flex', alignItems: 'center', padding: '0 2px' }}
                  title="Show all sellers"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="customer-categories-strip">
            {CUSTOMER_CATEGORIES.map(cat => {
              const count = getCategoryCount(cat.id);
              const isActive = selectedCategory === cat.id || (cat.id === 'All' && (!selectedCategory || selectedCategory === 'All'));
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`customer-category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <IconComponent size={16} />
                  <span>{cat.name}</span>
                  <span className="pill-count">{count}</span>
                </button>
              );
            })}
            {extraCategories.map(catName => {
              const count = getCategoryCount(catName);
              const isActive = selectedCategory === catName;
              return (
                <button
                  key={catName}
                  className={`customer-category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(catName)}
                >
                  <Package size={16} />
                  <span>{catName}</span>
                  <span className="pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Status Bar */}
          {(selectedCategory !== 'All' || searchTerm) && (
            <div className="customer-filter-banner">
              <span>
                Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'All' && <> in <strong>{selectedCategory}</strong></>}
                {searchTerm && <> matching "<strong>{searchTerm}</strong>"</>}
              </span>
              <button 
                className="btn-link" 
                onClick={handleClearFilters}
                style={{ color: '#4f46e5', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={13} /> Reset Filter
              </button>
            </div>
          )}

          {/* Products Catalog Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="customer-empty-catalog">
              <div className="empty-icon-circle">
                <Package size={36} color="#6366f1" />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                No products found
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', maxWidth: '400px' }}>
                {selectedCategory !== 'All' 
                  ? `There are currently no items available in the "${selectedCategory}" category.`
                  : `No products matched your search query "${searchTerm}".`}
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleClearFilters}
                style={{ marginTop: '8px' }}
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="customer-catalog-grid">
              {filteredProducts.map(product => {
                const qty = quantities[product.id] || 1;
                return (
                  <div key={product.id} className="customer-prod-card">
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                        alt={product.name} 
                        className="customer-prod-img" 
                      />
                      <span className="customer-category-tag">
                        {product.category}
                      </span>
                    </div>
                    <div className="customer-prod-info">
                      <div className="customer-prod-seller">
                        <Store size={13} />
                        <span>{product.vendorName || product.vendor?.shop_name || 'Local Seller'}</span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text)' }}>{product.name}</h3>
                      {product.description && (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.description}
                        </p>
                      )}
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: 'auto', paddingTop: '4px' }}>
                        ₹{Number(product.price).toFixed(2)}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
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
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
