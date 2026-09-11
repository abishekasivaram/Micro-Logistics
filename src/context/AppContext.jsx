import React, { createContext, useContext, useState } from 'react';
import { 
  orders as initialOrders, 
  vendors as initialVendors, 
  customers as initialCustomers, 
  deliveryPersonnel as initialDeliveryPersonnel,
  deliveryGroups as initialDeliveryGroups,
  products as initialProducts,
  initialNotifications,
  mockUsers
} from '../data/sampleData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [vendors, setVendors] = useState(initialVendors);
  const [customers, setCustomers] = useState(initialCustomers);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState(initialDeliveryPersonnel);
  const [deliveryGroups, setDeliveryGroups] = useState(initialDeliveryGroups);
  const [products, setProducts] = useState(initialProducts);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [currentUser, setCurrentUser] = useState(mockUsers.find(u => u.role === 'vendor'));
  // --- Orders CRUD ---
  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    
    // Auto-generate notification for status change
    addNotification(`Order ${orderId} status changed to ${status}`, 'order');
  };

  // --- Delivery Groups CRUD ---
  const createDeliveryGroup = (orderIds, personnelId) => {
    const newGroupId = `DG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newGroup = {
      id: newGroupId,
      orderIds: orderIds,
      personnelId: personnelId,
      status: personnelId ? 'ASSIGNED' : 'READY',
      date: new Date().toISOString()
    };
    
    setDeliveryGroups([...deliveryGroups, newGroup]);
    
    setOrders(orders.map(o => orderIds.includes(o.id) ? { ...o, deliveryGroupId: newGroupId, status: personnelId ? 'ASSIGNED' : 'READY_FOR_DELIVERY' } : o));
    
    if (personnelId) {
       setDeliveryPersonnel(deliveryPersonnel.map(dp => dp.id === personnelId ? { ...dp, status: 'On Delivery' } : dp));
    }

    addNotification(`Delivery Group ${newGroupId} created.`, 'delivery');
  };
  
  const updateDeliveryGroupStatus = (groupId, status) => {
    setDeliveryGroups(deliveryGroups.map(g => g.id === groupId ? { ...g, status } : g));
    
    if (status === 'DELIVERED') {
      const group = deliveryGroups.find(g => g.id === groupId);
      if (group) {
        setOrders(orders.map(o => group.orderIds.includes(o.id) ? { ...o, status: 'DELIVERED' } : o));
        if(group.personnelId) {
            setDeliveryPersonnel(deliveryPersonnel.map(dp => dp.id === group.personnelId ? { ...dp, status: 'Available' } : dp));
        }
        addNotification(`Delivery Group ${groupId} has been delivered.`, 'delivery');
      }
    }
  };

  // --- Products & Inventory CRUD ---
  const addProduct = (product) => {
    const newProduct = { ...product, id: `p${Date.now()}` };
    setProducts([...products, newProduct]);
    addNotification(`New product added: ${product.name}`, 'system');
  };
  
  const updateProduct = (id, updatedFields) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updatedFields };
        // Auto-calculate status based on stock
        if (updated.stock !== undefined) {
          if (updated.stock > 10) updated.status = 'In Stock';
          else if (updated.stock > 0) updated.status = 'Low Stock';
          else updated.status = 'Out of Stock';
        }
        return updated;
      }
      return p;
    }));
  };
  
  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    addNotification(`Product deleted.`, 'system');
  };

  // --- Notifications CRUD ---
  const addNotification = (message, type = 'system') => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      isRead: false,
      date: new Date().toISOString()
    };
    setNotifications([newNotif, ...notifications]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider value={{
      orders, setOrders, updateOrderStatus,
      vendors,
      customers,
      deliveryPersonnel, setDeliveryPersonnel,
      deliveryGroups, createDeliveryGroup, updateDeliveryGroupStatus,
      products, addProduct, updateProduct, deleteProduct,
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      currentUser, setCurrentUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
