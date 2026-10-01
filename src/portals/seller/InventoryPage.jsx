import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, AlertTriangle, CheckCircle, AlertCircle, Plus, Minus, 
  Package, Boxes, TrendingUp, RefreshCw, Sparkles, DollarSign 
} from 'lucide-react';
import './InventoryPage.css';

const InventoryPage = () => {
  const { products = [], vendors = [], updateProduct, currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');

  const lowStockThreshold = 10;
  const isVendor = currentUser?.role === 'vendor';
  const sellerId = isVendor ? currentUser.id : 'v1';

  const scopedProducts = products.filter(p => {
    if (currentUser?.role === 'admin') return true;
    return p.vendorId === sellerId || p.vendorId === 'v1';
  });

  const totalProducts = scopedProducts.length;
  const lowStockProducts = scopedProducts.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
  const outOfStockProducts = scopedProducts.filter(p => p.stock === 0).length;
  const healthyStock = totalProducts - lowStockProducts - outOfStockProducts;
  
  // Total Valuation
  const totalValuation = scopedProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

  const filteredProducts = scopedProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterMode === 'HEALTHY') return p.stock > lowStockThreshold;
    if (filterMode === 'LOW') return p.stock > 0 && p.stock <= lowStockThreshold;
    if (filterMode === 'OUT') return p.stock === 0;
    return true;
  });

  const handleStockAdjust = (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    updateProduct(productId, { stock: newStock });
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
      </div>

      {/* KPI Ribbon */}
      <div className="inventory-kpi-grid">
        <div className="inventory-kpi-card" onClick={() => setFilterMode('ALL')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Package size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>ALL ITEMS</span>
          </div>
          <div className="inv-kpi-val">{totalProducts}</div>
          <div className="inv-kpi-label">Total Tracked SKUs</div>
        </div>

        <div className="inventory-kpi-card" onClick={() => setFilterMode('HEALTHY')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>OPTIMAL</span>
          </div>
          <div className="inv-kpi-val">{healthyStock}</div>
          <div className="inv-kpi-label">Healthy Stock (&gt; 10)</div>
        </div>

        <div className="inventory-kpi-card" onClick={() => setFilterMode('LOW')}>
          <div className="inv-kpi-header">
            <div className="inv-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#d97706' }}>REORDER</span>
          </div>
          <div className="inv-kpi-val">{lowStockProducts}</div>
          <div className="inv-kpi-label">Low Stock Warning</div>
        </div>

        <div className="inventory-kpi-card" onClick={() => setFilterMode('OUT')}>
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
            placeholder="Search inventory items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <button 
            className={`products-stat-pill ${filterMode === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterMode('ALL')}
          >
            All
          </button>
          <button 
            className={`products-stat-pill ${filterMode === 'LOW' ? 'active' : ''}`}
            onClick={() => setFilterMode('LOW')}
          >
            Low Stock Only
          </button>
          <button 
            className={`products-stat-pill ${filterMode === 'OUT' ? 'active' : ''}`}
            onClick={() => setFilterMode('OUT')}
          >
            Out of Stock Only
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
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No inventory products match this search filter.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold;
                const stockColor = isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#059669';
                const fillPercent = Math.min(100, Math.max(5, (product.stock / 30) * 100));
                const itemVal = (product.price || 0) * (product.stock || 0);

                return (
                  <tr key={product.id}>
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
                          <div className="product-sku">SKU: #{product.id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category || 'General'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: stockColor, fontSize: '13px' }}>
                          {product.stock} units {isOutOfStock ? '(Stockout)' : isLowStock ? '(Low)' : ''}
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
                          onClick={() => handleStockAdjust(product.id, product.stock, -1)}
                          title="Reduce 1"
                        >
                          <Minus size={12} />
                        </button>
                        <button 
                          className="stock-stepper-btn"
                          onClick={() => handleStockAdjust(product.id, product.stock, 1)}
                          title="Add 1"
                        >
                          <Plus size={12} />
                        </button>
                        <button 
                          className="quick-restock-btn"
                          onClick={() => handleStockAdjust(product.id, product.stock, 10)}
                          title="Restock +10 units"
                        >
                          +10
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
    </div>
  );
};

export default InventoryPage;
