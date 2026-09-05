import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import './OrdersPage.css'; // Reusing generic table styles

const InventoryPage = () => {
  const { products, vendors, updateProduct } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const lowStockThreshold = 10;
  
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const healthyStock = totalProducts - lowStockProducts - outOfStockProducts;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p>Track stock levels and availability across all vendors.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div className="kpi-card" style={{ padding: 'var(--spacing-4)' }}>
          <div className="kpi-icon bg-success text-surface"><CheckCircle size={20} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Healthy Stock</span>
            <span className="kpi-value" style={{fontSize: 'var(--font-size-xl)'}}>{healthyStock}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 'var(--spacing-4)' }}>
          <div className="kpi-icon bg-warning text-surface"><AlertTriangle size={20} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Low Stock</span>
            <span className="kpi-value" style={{fontSize: 'var(--font-size-xl)'}}>{lowStockProducts}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 'var(--spacing-4)' }}>
          <div className="kpi-icon bg-danger text-surface" style={{backgroundColor: 'var(--color-danger)'}}><AlertCircle size={20} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Out of Stock</span>
            <span className="kpi-value" style={{fontSize: 'var(--font-size-xl)'}}>{outOfStockProducts}</span>
          </div>
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
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
              <th>Vendor</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const vendorName = vendors.find(v => v.id === product.vendorId)?.name || 'Unknown';
              return (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>{vendorName}</td>
                  <td>
                    <strong>{product.stock}</strong> units
                  </td>
                  <td>
                    <span className={`badge badge-${product.status.replace(/\s+/g, '').toLowerCase()}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="text-secondary">Just now</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
