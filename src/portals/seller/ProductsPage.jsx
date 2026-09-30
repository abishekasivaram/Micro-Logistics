import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Plus, Edit2, Trash2, ShoppingCart, Clock, Store, 
  Eye, Check, X, Filter, Heart, Copy, MoreVertical, Image as ImageIcon,
  ChevronDown, ArrowUpRight
} from 'lucide-react';
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
    image: '',
    status: 'Active'
  });

  // Table selection state
  const [selectedProductIds, setSelectedProductIds] = useState([]);

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
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
      status: 'Active'
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
      image: product.image || '',
      status: product.status || 'Active'
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
        image: productForm.image,
        status: productForm.status
      });
    } else {
      addProduct({
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        prepTime: productForm.prepTime,
        description: productForm.description,
        image: productForm.image,
        status: productForm.status
      });
    }
    setShowProductModal(false);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const toggleSelect = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
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

  const totalProds = filteredProducts.length;
  const inStockProds = filteredProducts.filter(p => p.stock > 10).length;
  const lowStockProds = filteredProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockProds = filteredProducts.filter(p => p.stock === 0).length;

  return (
    <div className="products-page">
      {!isCustomer ? (
        // SELLER VIEW
        <>
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Products</h1>
              <p className="page-subtitle">Manage your catalog, inventory, and pricing.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary">Import CSV</button>
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} /> Add product
              </button>
            </div>
          </div>

          <div className="summary-strip">
            <div className="stat-pill active">
              Total products <span className="stat-pill-count">{totalProds}</span>
            </div>
            <div className="stat-pill">
              In stock <span className="stat-pill-count" style={{ color: 'var(--success)' }}>{inStockProds}</span>
            </div>
            <div className="stat-pill">
              Low stock <span className="stat-pill-count" style={{ color: 'var(--warning)' }}>{lowStockProds}</span>
            </div>
            <div className="stat-pill">
              Out of stock <span className="stat-pill-count" style={{ color: 'var(--danger)' }}>{outOfStockProds}</span>
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
            <div className="toolbar-filters">
              <select 
                className="form-select"
                value={selectedCategoryFilter} 
                onChange={e => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="All">Category: All</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Grains">Grains & Pulses</option>
                <option value="Vegetables">Vegetables & Fruits</option>
              </select>
              <select className="form-select">
                <option>Status: All</option>
                <option>Active</option>
                <option>Hidden</option>
              </select>
              <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', padding: '2px' }}>
                <button style={{ padding: '6px 12px', background: 'var(--surface)', borderRadius: '4px', boxShadow: 'var(--shadow-card)', border: 'none' }}>Table</button>
                <button style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: 'none' }}>Grid</button>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            {filteredProducts.length === 0 ? (
              <div className="catalog-empty-state">
                <div className="catalog-empty-icon">
                  <Package size={32} />
                </div>
                <h3 className="catalog-empty-title">Your catalog is empty</h3>
                <p className="catalog-empty-desc">Start adding products to your store to receive orders from customers in your area.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={openAddModal}>Add your first product</button>
                  <button className="btn btn-secondary">Import from CSV</button>
                </div>
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingRight: 0 }}>
                      <input type="checkbox" onChange={toggleSelectAll} checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0} />
                    </th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th>Stock Qty</th>
                    <th>Prep Time</th>
                    <th>Status</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td style={{ paddingRight: 0 }}>
                        <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelect(product.id)} />
                      </td>
                      <td>
                        <div className="product-cell">
                          <img src={product.image} alt={product.name} className="product-thumb" />
                          <div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-sku">SKU: {product.id.split('-').pop().toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '500', fontFeatureSettings: '"tnum"' }}>
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td>
                        <div className="stock-bar-container">
                          <div className="stock-bar">
                            <div className={`stock-fill ${product.stock > 10 ? 'good' : product.stock > 0 ? 'low' : 'out'}`} style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}></div>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: product.stock === 0 ? 'var(--danger)' : 'var(--text)' }}>
                            {product.stock} {product.stock === 0 ? '(Out)' : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="prep-chip"><Clock size={12} /> {product.prepTime || '15m'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '32px', height: '18px' }}>
                            <input type="checkbox" checked={product.status === 'Active'} onChange={() => updateProduct(product.id, { status: product.status === 'Active' ? 'Hidden' : 'Active' })} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: product.status === 'Active' ? 'var(--success)' : 'var(--border-strong)', transition: '.2s', borderRadius: '34px' }}>
                              <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: product.status === 'Active' ? '16px' : '2px', bottom: '2px', backgroundColor: 'white', transition: '.2s', borderRadius: '50%' }}></span>
                            </span>
                          </label>
                          <span style={{ fontSize: '12px', color: product.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>{product.status}</span>
                        </div>
                      </td>
                      <td>
                        <div className="dropdown-container">
                          <button className="kebab-menu"><MoreVertical size={16} /></button>
                          {/* Add dropdown logic if needed, for now clicking row could open edit */}
                          <button className="kebab-menu" onClick={() => openEditModal(product)}><Edit2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {filteredProducts.length > 0 && (
              <div className="table-footer">
                <div>Showing {filteredProducts.length} products</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Rows per page: </span>
                  <select className="form-select" style={{ height: '28px', padding: '0 8px' }}>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Action Bar */}
          {selectedProductIds.length > 0 && (
            <div className="bulk-action-bar">
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{selectedProductIds.length} selected</div>
              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div className="bulk-actions-group">
                <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', cursor: 'pointer' }}>Change category</button>
                <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', cursor: 'pointer' }}>Hide</button>
                <button style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
              </div>
              <button onClick={() => setSelectedProductIds([])} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', marginLeft: 'auto' }}><X size={16} /></button>
            </div>
          )}

          {/* Right Drawer for Add/Edit */}
          {showProductModal && (
            <div className="drawer-overlay" onClick={() => setShowProductModal(false)}>
              <div className="drawer-content" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                  <h3 className="drawer-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                  <button className="kebab-menu" onClick={() => setShowProductModal(false)}><X size={20}/></button>
                </div>
                <div className="drawer-body">
                  <form id="product-form" onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="image-dropzone">
                      <ImageIcon size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--primary)' }}>Click to upload image</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SVG, PNG, JPG or GIF (max. 5MB)</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Product Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        required 
                        placeholder="e.g. Organic Bananas"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Category</label>
                        <select 
                          className="form-control"
                          value={productForm.category}
                          onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                        >
                          <option value="Dairy">Dairy</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Grains">Grains & Pulses</option>
                          <option value="Vegetables">Vegetables & Fruits</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Status</label>
                        <select 
                          className="form-control"
                          value={productForm.status}
                          onChange={e => setProductForm({ ...productForm, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Hidden">Hidden</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          className="form-control" 
                          value={productForm.price}
                          onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                          required 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Stock Qty</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={productForm.stock}
                          onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                          required 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Prep Time</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={productForm.prepTime}
                          onChange={e => setProductForm({ ...productForm, prepTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Description</label>
                      <textarea 
                        className="form-control"
                        rows="4"
                        style={{ height: 'auto', padding: '12px' }}
                        value={productForm.description}
                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </form>
                </div>
                <div className="drawer-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" form="product-form" className="btn btn-primary">Save product</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // CUSTOMER VIEW (Legacy preserved)
        <div style={{ padding: '0 32px' }}>
          <h2>Browse Local Products</h2>
          <div className="customer-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', padding: '16px 0' }}>
            {filteredProducts.map(product => {
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
                  </div>
                  <div className="product-info-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{product.name}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>Add</button>
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
