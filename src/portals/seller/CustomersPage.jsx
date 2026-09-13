import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Mail, Phone } from 'lucide-react';
import '../customer/OrdersPage.css';

const CustomersPage = () => {
  const { customers, orders } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedCustomers = customers.map(customer => {
    const customerOrders = orders.filter(o => o.customerId === customer.id);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...customer,
      orderCount: customerOrders.length,
      totalSpent
    };
  });

  const filteredCustomers = enrichedCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Manage customer profiles and order history.</p>
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            aria-label="Search customers by name or phone"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Address</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">No customers found.</td></tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td className="font-medium">{customer.name}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-sm"><Phone size={14} /> {customer.phone}</span>
                      <span className="flex items-center gap-1 text-sm text-secondary"><Mail size={14} /> {customer.name.split(' ')[0].toLowerCase()}@example.com</span>
                    </div>
                  </td>
                  <td>{customer.address}</td>
                  <td>{customer.orderCount}</td>
                  <td className="font-medium">₹{customer.totalSpent.toFixed(2)}</td>
                  <td><span className="badge badge-instock">Active</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersPage;
