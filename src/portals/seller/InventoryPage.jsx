import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { 
  Search, AlertTriangle, CheckCircle, AlertCircle, Plus, Minus, 
  Package, Boxes, TrendingUp, RefreshCw, Sparkles, DollarSign, 
  Edit2, Trash2, X, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { getProductImage, getCategoryFallbackImage, handleProductImageError } from '../../utils/imageUtils';
import './InventoryPage.css';

const CATEGORIES = [
  'Grocery', 'Fruits & Veg', 'Dairy', 'Bakery', 'General'
];

const InventoryPage = () => {
  const { 
    products = [], 
    vendors = [], 
    updateProduct, 
    addProduct, 
    deleteProduct, 
    currentUser, 
    globalLoading 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dairy',
    price: '',
    stock: '',
    prepTime: '15 mins',
    description: '',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
  });

  // Direct Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);
  const [customStockValue, setCustomStockValue] = useState('');
  const [restockError, setRestockError] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const lowStockThreshold = 10;
  const isVendor = currentUser?.role === 'vendor';

  // Vendor resolution
  const currentVendor = (vendors || []).find(v => 
    v.id === currentUser?.id || 
    v.legacy_id === currentUser?.id || 
    v.legacy_id === currentUser?.username
  );
  const sellerId = currentVendor?.id || (isVendor ? currentUser.id : null);
  const sellerLegacyId = currentVendor?.legacy_id || (currentUser?.legacy_id || null);

  // Synchronized catalog: seller inventory displays the exact same products as customer dashboard
  const scopedProducts = products;

  const totalProducts = scopedProducts.length;
  const lowStockProducts = scopedProducts.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
  const outOfStockProducts = scopedProducts.filter(p => p.stock === 0).length;
  const healthyStock = totalProducts - lowStockProducts - outOfStockProducts;
  
  // Total Asset Valuation
  const totalValuation = scopedProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

  const filteredProducts = scopedProducts.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterMode === 'HEALTHY') return p.stock > lowStockThreshold;
    if (filterMode === 'LOW') return p.stock > 0 && p.stock <= lowStockThreshold;
    if (filterMode === 'OUT') return p.stock === 0;
    return true;
  });

  // Stock Adjustment via Stepper
  const handleStockAdjust = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    await updateProduct(productId, { stock: newStock });
  };

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Dairy',
      price: '',
      stock: '25',
      prepTime: '15 mins',
      description: '',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Dairy',
      price: product.price !== undefined ? String(product.price) : '',
      stock: product.stock !== undefined ? String(product.stock) : '0',
      prepTime: product.prepTime || '15 mins',
      description: product.description || '',
      image: product.image || getCategoryFallbackImage(product.category)
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Submit Add or Edit Product Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Strict Validation
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setFormError('Please enter a valid unit price greater than zero.');
      return;
    }

    const stock = parseInt(formData.stock, 10);
    if (isNaN(stock) || stock < 0) {
      setFormError('Stock quantity cannot be negative and must be a valid whole number.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: price,
      stock: stock,
      prepTime: formData.prepTime || '15 mins',
      description: formData.description.trim(),
      image: formData.image.trim() || getCategoryFallbackImage(formData.category),
      vendorId: sellerId || currentUser?.id
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, payload);
    } else {
      result = await addProduct(payload);
    }

    setIsSubmitting(false);

    if (result && result.success === false) {
      setFormError(result.message || 'Operation failed. Please try again.');
    } else {
      setIsFormModalOpen(false);
    }
  };

  // Direct Restock Modal
  const openRestockModal = (product) => {
    setTargetProduct(product);
    setCustomStockValue(String(product.stock || 0));
    setRestockError('');
    setIsRestockModalOpen(true);
  };

  const handleCustomRestockSubmit = async (e) => {
    e.preventDefault();
    setRestockError('');
    const val = parseInt(customStockValue, 10);
    if (isNaN(val) || val < 0) {
      setRestockError('Stock quantity cannot be negative.');
      return;
    }

    if (targetProduct) {
      await updateProduct(targetProduct.id, { stock: val });
    }
    setIsRestockModalOpen(false);
  };

  // Delete Action
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header-row">
        <div>
          <div className="orders-title-badge">
            <Boxes size={12} /> Stock & Warehousing
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            Store Inventory & Stock Telemetry
          </h1>
          <p className="page-subtitle">
            Live stock control, automated reorder thresholds, and inventory valuation for your storefront.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="inv-btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="inventory-kpi-grid">
        <div className={`inventory-kpi-card ${filterMode === 'ALL' ? 'active' : ''}`} onClick={() => setFilterMode('ALL')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Package size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>ALL ITEMS</span>
          </div>
          <div className="inv-kpi-val">{totalProducts}</div>
          <div className="inv-kpi-label">Total Tracked SKUs</div>
        </div>

        <div className={`inventory-kpi-card ${filterMode === 'HEALTHY' ? 'active' : ''}`} onClick={() => setFilterMode('HEALTHY')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>OPTIMAL</span>
          </div>
          <div className="inv-kpi-val">{healthyStock}</div>
          <div className="inv-kpi-label">Healthy Stock (&gt; 10)</div>
        </div>

        <div className={`inventory-kpi-card ${filterMode === 'LOW' ? 'active' : ''}`} onClick={() => setFilterMode('LOW')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#d97706' }}>REORDER</span>
          </div>
          <div className="inv-kpi-val">{lowStockProducts}</div>
          <div className="inv-kpi-label">Low Stock Warning</div>
        </div>

        <div className={`inventory-kpi-card ${filterMode === 'OUT' ? 'active' : ''}`} onClick={() => setFilterMode('OUT')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <AlertCircle size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>CRITICAL</span>
          </div>
          <div className="inv-kpi-val">{outOfStockProducts}</div>
          <div className="inv-kpi-label">Out of Stock Items</div>
        </div>

        <div className="inventory-kpi-card">
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <DollarSign size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#7e22ce' }}>VALUATION</span>
          </div>
          <div className="inv-kpi-val">₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="inv-kpi-label">Total Inventory Asset Value</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon-left" />
          <input 
            type="text" 
            placeholder="Search inventory items by name, category, SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <button 
            className={`products-stat-pill ${filterMode === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterMode('ALL')}
          >
            All ({totalProducts})
          </button>
          <button 
            className={`products-stat-pill ${filterMode === 'HEALTHY' ? 'active' : ''}`}
            onClick={() => setFilterMode('HEALTHY')}
          >
            Healthy ({healthyStock})
          </button>
          <button 
            className={`products-stat-pill ${filterMode === 'LOW' ? 'active' : ''}`}
            onClick={() => setFilterMode('LOW')}
          >
            Low Stock ({lowStockProducts})
          </button>
          <button 
            className={`products-stat-pill ${filterMode === 'OUT' ? 'active' : ''}`}
            onClick={() => setFilterMode('OUT')}
          >
            Out of Stock ({outOfStockProducts})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="inventory-table-card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item & SKU</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Unit Price</th>
              <th>Inventory Value</th>
              <th style={{ textAlign: 'right' }}>Quick Adjust</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {globalLoading ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px' }}>
                  <div className="inv-loading-row" style={{ marginBottom: '10px' }} />
                  <div className="inv-loading-row" style={{ width: '80%' }} />
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Boxes size={36} color="#94a3b8" />
                    <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text)' }}>
                      No inventory products match this search filter
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', maxWidth: '380px' }}>
                      Add items to your catalog to track real-time stock availability, reorder points, and automated fulfillment statuses.
                    </p>
                    <button className="inv-btn-primary" style={{ marginTop: '8px' }} onClick={openAddModal}>
                      <Plus size={15} /> Add First Product
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const stockNum = product.stock || 0;
                const isOutOfStock = stockNum === 0;
                const isLowStock = stockNum > 0 && stockNum <= lowStockThreshold;
                const stockColor = isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#059669';
                const fillPercent = Math.min(100, Math.max(5, (stockNum / 30) * 100));
                const itemVal = (product.price || 0) * stockNum;
                const skuCode = String(product.id || '').slice(-6).toUpperCase();

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img 
                          src={getProductImage(product)} 
                          alt={product.name} 
                          className="product-thumb" 
                          width={44}
                          height={44}
                          loading="lazy"
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '10px' }}
                          onError={(e) => handleProductImageError(e, product.category, product.name)}
                        />
                        <div>
                          <div className="product-name">{product.name}</div>
                          <div className="product-sku">SKU: #{skuCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category || 'General'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span 
                          style={{ fontWeight: '700', color: stockColor, fontSize: '13px', cursor: 'pointer' }}
                          onClick={() => openRestockModal(product)}
                          title="Click to set custom stock value"
                        >
                          {stockNum} units {isOutOfStock ? '(Stockout)' : isLowStock ? '(Low)' : ''}
                        </span>
                        <div className="stock-meter-bar">
                          <div 
                            className="stock-meter-fill"
                            style={{ width: `${fillPercent}%`, background: stockColor }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600', fontFeatureSettings: '"tnum"' }}>
                      ₹{Number(product.price || 0).toFixed(2)}
                    </td>
                    <td style={{ fontWeight: '700', fontFeatureSettings: '"tnum"' }}>
                      ₹{itemVal.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          className="stock-stepper-btn"
                          onClick={() => handleStockAdjust(product.id, stockNum, -1)}
                          title="Reduce 1 unit (Clamped at 0)"
                        >
                          <Minus size={12} />
                        </button>
                        <button 
                          className="stock-stepper-btn"
                          onClick={() => handleStockAdjust(product.id, stockNum, 1)}
                          title="Add 1 unit"
                        >
                          <Plus size={12} />
                        </button>
                        <button 
                          className="quick-restock-btn"
                          onClick={() => handleStockAdjust(product.id, stockNum, 10)}
                          title="Quick Restock +10 units"
                        >
                          +10
                        </button>
                        <button 
                          className="quick-restock-btn"
                          style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                          onClick={() => openRestockModal(product)}
                          title="Set custom stock quantity"
                        >
                          Set
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="inv-action-btn"
                          onClick={() => openEditModal(product)}
                          title="Edit product details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          className="inv-action-btn delete"
                          onClick={() => confirmDelete(product)}
                          title="Delete product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && createPortal(
        <div className="inv-modal-backdrop" onClick={() => !isSubmitting && setIsFormModalOpen(false)}>
          <div className="inv-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3 className="inv-modal-title">
                {editingProduct ? 'Edit Product & Stock' : 'Add New Inventory Product'}
              </h3>
              <button 
                type="button" 
                className="inv-modal-close" 
                onClick={() => !isSubmitting && setIsFormModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="inv-modal-body">
                {formError && (
                  <div className="inv-alert-error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="inv-form-group">
                  <label htmlFor="inv-prod-name">Product Name *</label>
                  <input 
                    id="inv-prod-name"
                    type="text" 
                    placeholder="e.g. Aavin Green Milk 500ml"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="inv-form-row">
                  <div className="inv-form-group">
                    <label htmlFor="inv-prod-cat">Category *</label>
                    <select 
                      id="inv-prod-cat"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="inv-form-group">
                    <label htmlFor="inv-prod-prep">Prep / Packing Time</label>
                    <input 
                      id="inv-prod-prep"
                      type="text" 
                      placeholder="e.g. 10 mins"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="inv-form-row">
                  <div className="inv-form-group">
                    <label htmlFor="inv-prod-price">Unit Price (₹) *</label>
                    <input 
                      id="inv-prod-price"
                      type="number" 
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 45.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="inv-form-group">
                    <label htmlFor="inv-prod-stock">Stock Units *</label>
                    <input 
                      id="inv-prod-stock"
                      type="number" 
                      min="0"
                      step="1"
                      placeholder="e.g. 20"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="inv-form-group">
                  <label htmlFor="inv-prod-img">Image URL</label>
                  <input 
                    id="inv-prod-img"
                    type="url" 
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="inv-form-group">
                  <label htmlFor="inv-prod-desc">Description</label>
                  <textarea 
                    id="inv-prod-desc"
                    rows="2"
                    placeholder="Short product overview..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="inv-modal-footer">
                <button 
                  type="button" 
                  className="orders-action-btn"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="inv-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Direct Custom Restock Modal */}
      {isRestockModalOpen && createPortal(
        <div className="inv-modal-backdrop" onClick={() => setIsRestockModalOpen(false)}>
          <div className="inv-modal-dialog" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3 className="inv-modal-title">Set Stock Quantity</h3>
              <button 
                type="button" 
                className="inv-modal-close" 
                onClick={() => setIsRestockModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCustomRestockSubmit}>
              <div className="inv-modal-body">
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                  Update stock quantity for <strong>{targetProduct?.name}</strong>:
                </p>

                {restockError && (
                  <div className="inv-alert-error">
                    <AlertCircle size={16} />
                    <span>{restockError}</span>
                  </div>
                )}

                <div className="inv-form-group">
                  <label htmlFor="inv-target-stock">Available Units (Cannot be negative) *</label>
                  <input 
                    id="inv-target-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={customStockValue}
                    onChange={(e) => setCustomStockValue(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="inv-modal-footer">
                <button 
                  type="button" 
                  className="orders-action-btn"
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="inv-btn-primary">
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Product?"
        message="Are you sure you want to remove this item from your catalog? Customers will no longer be able to purchase it."
        subjectName={productToDelete?.name || ''}
        subjectInfo={`SKU #${String(productToDelete?.id || '').slice(-6).toUpperCase()} • ₹${Number(productToDelete?.price || 0).toFixed(2)}`}
        confirmText="Delete Product"
        cancelText="Keep Product"
        variant="danger"
        badgeText="PERMANENT REMOVAL"
      />
    </div>
  );
};

export default InventoryPage;
