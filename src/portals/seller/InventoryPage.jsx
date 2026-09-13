import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, AlertTriangle, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import '../customer/OrdersPage.css';

const InventoryPage = () => {
  const { products, vendors, updateProduct, currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const lowStockThreshold = 10;
  
  const isVendor = currentUser?.role === 'vendor';
  const scopedProducts = isVendor 
    ? products.filter(p => p.vendorId === currentUser.id)
    : products;

  const totalProducts = scopedProducts.length;
  const lowStockProducts = scopedProducts.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
  const outOfStockProducts = scopedProducts.filter(p => p.stock === 0).length;
  const healthyStock = totalProducts - lowStockProducts - outOfStockProducts;

  const filteredProducts = scopedProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStockAdjust = (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    updateProduct(productId, { stock: newStock });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>{isVendor ? 'Store Inventory Management' : 'Central Network Inventory'}</h2>
          <p>{isVendor ? 'Monitor stock quantities and make instant adjustments for your store catalog.' : 'Track stock levels and product availability across all registered local merchants.'}</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div className="kpi-card" style={{ padding: 'var(--spacing-4)' }}>
          <div className="kpi-icon bg-success text-surface"><CheckCircle size={20} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Healthy Stock</span>
            <span className="kpi-value" style={{ fontSize: 'var(--font-size-xl)' }}>{healthyStock}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 'var(--spacing-4)' }}>
          <div className="kpi-icon bg-warning text-surface"><AlertTriangle size={20} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Low Stock (&le; 10)</span>
            <span className="kpi-value" style={{ fontSize: 'var(--font-size-xl)' }}>{lowStockProducts}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 'var(--spacing-4)' }}>
          <div className="kpi-icon bg-danger text-surface" style={{ backgroundColor: 'var(--color-danger)' }}><AlertCircle size={20} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Out of Stock</span>
            <span className="kpi-value" style={{ fontSize: 'var(--font-size-xl)' }}>{outOfStockProducts}</span>
          </div>
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search inventory by product name or category..." 
            aria-label="Search inventory by product name or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              {!isVendor && <th>Vendor / Store</th>}
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isVendor ? 5 : 6} className="empty-state" style={{ textAlign: 'center', padding: '32px' }}>
                  No inventory items match your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const vendorName = vendors.find(v => v.id === product.vendorId)?.name || 'Unknown';
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold;

                return (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    {!isVendor && <td>{vendorName}</td>}
                    <td><span className="badge badge-secondary">{product.category || 'General'}</span></td>
                    <td>
                      <strong style={{ color: isOutOfStock ? '#dc2626' : (isLowStock ? '#d97706' : '#16a34a') }}>
                        {product.stock}
                      </strong> units
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline" 
                          onClick={() => handleStockAdjust(product.id, product.stock, -1)}
                          disabled={product.stock <= 0}
                          title="Decrease stock by 1"
                          aria-label={`Decrease stock for ${product.name}`}
                          style={{ padding: '4px 8px' }}
                        >
                          <Minus size={14} />
                        </button>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline" 
                          onClick={() => handleStockAdjust(product.id, product.stock, 1)}
                          title="Increase stock by 1"
                          aria-label={`Increase stock for ${product.name}`}
                          style={{ padding: '4px 8px' }}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleStockAdjust(product.id, product.stock, 10)}
                          title="Add 10 units"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
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
