import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import './OrdersPage.css'; // Reusing table styles

const ProductsPage = () => {
  const { products, vendors, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Very basic mock add form logic
  const handleAddMock = () => {
    const newProduct = {
      name: `New Product ${Math.floor(Math.random() * 100)}`,
      category: 'General',
      price: 10.0,
      stock: 50,
      vendorId: 'v1',
      status: 'In Stock'
    };
    addProduct(newProduct);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage your product catalog across vendors.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary flex items-center gap-2" onClick={handleAddMock}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search products..." 
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
              <th>Category</th>
              <th>Vendor</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No products found.</td></tr>
            ) : (
              filteredProducts.map(product => {
                const vendorName = vendors.find(v => v.id === product.vendorId)?.name || 'Unknown';
                return (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td>{product.category}</td>
                    <td>{vendorName}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <input 
                        type="number" 
                        value={product.stock}
                        style={{width: '60px', padding: '4px'}}
                        onChange={(e) => updateProduct(product.id, { 
                          stock: parseInt(e.target.value),
                          status: parseInt(e.target.value) > 10 ? 'In Stock' : parseInt(e.target.value) > 0 ? 'Low Stock' : 'Out of Stock' 
                        })}
                      />
                    </td>
                    <td>
                      <span className={`badge badge-${product.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="icon-btn-small"><Edit2 size={16} /></button>
                        <button className="icon-btn-small text-danger" onClick={() => deleteProduct(product.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsPage;
