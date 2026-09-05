import React, { createContext, useContext, useState } from 'react';
import { 
  orders as initialOrders, 
  vendors as initialVendors, 
  customers as initialCustomers, 
  deliveryPersonnel as initialDeliveryPersonnel,
  deliveryGroups as initialDeliveryGroups 
} from '../data/sampleData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [vendors, setVendors] = useState(initialVendors);
  const [customers, setCustomers] = useState(initialCustomers);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState(initialDeliveryPersonnel);
  const [deliveryGroups, setDeliveryGroups] = useState(initialDeliveryGroups);

  // Products wasn't in initial sampleData, let's create some
  const [products, setProducts] = useState([
    { id: 'p1', name: 'Fresh Milk 1L', category: 'Dairy', price: 4.5, stock: 15, vendorId: 'v1', status: 'In Stock' },
    { id: 'p2', name: 'Whole Wheat Bread', category: 'Bakery', price: 2.0, stock: 5, vendorId: 'v1', status: 'Low Stock' },
    { id: 'p3', name: 'Basmati Rice 5kg', category: 'Grains', price: 15.0, stock: 20, vendorId: 'v2', status: 'In Stock' },
    { id: 'p4', name: 'Potato Chips', category: 'Snacks', price: 3.0, stock: 0, vendorId: 'v2', status: 'Out of Stock' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to MicroLogi!', type: 'system', date: new Date().toISOString() }
  ]);

  // Methods for interactions
  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const createDeliveryGroup = (orderIds, personnelId) => {
    const newGroupId = `DG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create new group
    const newGroup = {
      id: newGroupId,
      orderIds: orderIds,
      personnelId: personnelId,
      status: 'Assigned',
      date: new Date().toISOString()
    };
    
    setDeliveryGroups([...deliveryGroups, newGroup]);
    
    // Update orders with the group ID
    setOrders(orders.map(o => orderIds.includes(o.id) ? { ...o, deliveryGroupId: newGroupId, status: 'Assigned' } : o));
    
    // Update personnel status if assigned
    if (personnelId) {
       setDeliveryPersonnel(deliveryPersonnel.map(dp => dp.id === personnelId ? { ...dp, status: 'On Delivery' } : dp));
    }

    setNotifications([{ id: Date.now(), message: `Delivery Group ${newGroupId} created.`, type: 'delivery', date: new Date().toISOString() }, ...notifications]);
  };
  
  const updateDeliveryGroupStatus = (groupId, status) => {
    setDeliveryGroups(deliveryGroups.map(g => g.id === groupId ? { ...g, status } : g));
    
    // Propagate status to orders if needed (e.g. if delivered, mark orders as delivered)
    if (status === 'Delivered') {
      const group = deliveryGroups.find(g => g.id === groupId);
      if (group) {
        setOrders(orders.map(o => group.orderIds.includes(o.id) ? { ...o, status: 'Delivered' } : o));
        
        // Free up the driver
        if(group.personnelId) {
            setDeliveryPersonnel(deliveryPersonnel.map(dp => dp.id === group.personnelId ? { ...dp, status: 'Available' } : dp));
        }
      }
    }
  };

  // Product CRUD
  const addProduct = (product) => setProducts([...products, { ...product, id: `p${Date.now()}` }]);
  const updateProduct = (id, updated) => setProducts(products.map(p => p.id === id ? { ...p, ...updated } : p));
  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));

  return (
    <AppContext.Provider value={{
      orders, setOrders, updateOrderStatus,
      vendors,
      customers,
      deliveryPersonnel, setDeliveryPersonnel,
      deliveryGroups, createDeliveryGroup, updateDeliveryGroupStatus,
      products, addProduct, updateProduct, deleteProduct,
      notifications
    }}>
      {children}
    </AppContext.Provider>
  );
};
