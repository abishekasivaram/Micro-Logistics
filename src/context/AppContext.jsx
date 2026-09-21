import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Helper for local storage persistence
const getStorageItem = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(`micrologi_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return defaultValue;
  }
};

export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => getStorageItem('orders', []));
  const [vendors, setVendors] = useState(() => getStorageItem('vendors', []));
  const [customers, setCustomers] = useState(() => getStorageItem('customers', []));
  const [deliveryAgents, setDeliveryAgents] = useState(() => getStorageItem('deliveryAgents', []));
  const [deliveryBatches, setDeliveryBatches] = useState(() => getStorageItem('deliveryBatches', []));
  const [products, setProducts] = useState(() => getStorageItem('products', []));
  const [notifications, setNotifications] = useState(() => getStorageItem('notifications', []));
  const [cart, setCart] = useState(() => getStorageItem('cart', []));
  const [currentUser, setCurrentUser] = useState(() => getStorageItem('currentUser', null));
  const [adminSettings, setAdminSettings] = useState(() => getStorageItem('adminSettings', {
    autoAssignWaitTime: 15,
    maxOrdersPerBatch: 5,
    maxBatchDistance: 3.5,
    agentTimeout: 30
  }));

  // Legacy alias for deliveryGroups
  const deliveryGroups = deliveryBatches;

  // --- Initial Data Loading via API ---
  const [globalLoading, setGlobalLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    // Only load if user is logged in
    if (!currentUser) return;

    const loadData = async () => {
      setGlobalLoading(true);
      try {
        const role = currentUser.role;
        const promises = [
          api.get('/products').then(res => { if (res.data.success) setProducts(res.data.data) }),
          api.get('/vendors').then(res => { if (res.data.success) setVendors(res.data.data) }),
          api.get('/notifications').then(res => { if (res.data.success) setNotifications(res.data.data) })
        ];

        if (role === 'admin') {
          promises.push(
            api.get('/orders').then(res => { if (res.data.success) setOrders(res.data.data) }),
            api.get('/delivery/batches').then(res => { if (res.data.success) setDeliveryBatches(res.data.data) }),
            api.get('/delivery/agents').then(res => { if (res.data.success) setDeliveryAgents(res.data.data) }),
            api.get('/customers').then(res => { if (res.data.success) setCustomers(res.data.data) }),
            api.get('/settings').then(res => { if (res.data.success) setAdminSettings(res.data.data) })
          );
        } else if (role === 'vendor') {
          promises.push(
            api.get('/orders').then(res => { if (res.data.success) setOrders(res.data.data) })
          );
        } else if (role === 'customer') {
          promises.push(
            api.get('/orders').then(res => { if (res.data.success) setOrders(res.data.data) })
          );
        } else if (role === 'delivery_partner') {
          promises.push(
            api.get('/orders').then(res => { if (res.data.success) setOrders(res.data.data) }),
            api.get('/delivery/batches').then(res => { if (res.data.success) setDeliveryBatches(res.data.data) }),
            api.get('/delivery/agents').then(res => { if (res.data.success) setDeliveryAgents(res.data.data) })
          );
        }

        await Promise.all(promises);
        setOfflineMode(false);
      } catch (err) {
        console.error("Failed to load API data.", err);
        setOfflineMode(true);
        addNotification("API Unreachable. Running in offline/demo mode.", "system");
      } finally {
        setGlobalLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Persist states to localStorage (Only non-API entities)
  useEffect(() => { localStorage.setItem('micrologi_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('micrologi_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('micrologi_adminSettings', JSON.stringify(adminSettings)); }, [adminSettings]);

  // --- Cart Management ---
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    addNotification(`Added ${product.name} to cart.`, 'system');
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- Registration Flows ---
  const registerCustomer = async (data) => {
    try {
      const payload = {
        name: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password || 'password123',
        phone: data.phone,
        address: data.address,
        area: data.cityArea || 'Local',
        role: 'customer'
      };
      
      const res = await api.post('/auth/signup', payload);
      if (res.data.success) {
        addNotification(`Welcome ${payload.name}! Customer account created successfully.`, 'system');
        return true;
      }
    } catch (err) {
      console.error(err);
      addNotification(err.response?.data?.message || "Failed to register customer account.", "error");
      return false;
    }
  };

  const registerSeller = async (data) => {
    try {
      const payload = {
        name: data.ownerName,
        shopName: data.businessName,
        username: data.username,
        email: data.email,
        password: data.password || 'password123',
        phone: data.phone,
        address: data.businessAddress,
        area: data.cityArea || 'Local Area',
        role: 'vendor'
      };
      
      const res = await api.post('/auth/signup', payload);
      if (res.data.success) {
        addNotification(`Welcome ${payload.shopName}! Seller registration complete.`, 'system');
        return true;
      }
    } catch (err) {
      console.error(err);
      addNotification(err.response?.data?.message || "Failed to register seller account.", "error");
      return false;
    }
  };

  // --- Orders & Checkout ---
  const placeOrder = async ({ deliveryAddress, contactPhone, deliveryDate, deliveryTimeSlot }) => {
    if (cart.length === 0) return null;

    const itemsByVendor = {};
    cart.forEach(item => {
      const vId = item.product.vendorId || 'v1';
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    try {
      const newOrdersCreated = [];
      for (const vId of Object.keys(itemsByVendor)) {
        const vendorItems = itemsByVendor[vId];
        const payload = {
          vendorId: vId,
          items: vendorItems.map(i => ({
            productId: i.product.id,
            qty: i.quantity,
            price: i.product.price
          })),
          deliveryLocation: deliveryAddress || currentUser?.address,
          deliveryDate,
          deliveryTimeSlot
        };
        
        const res = await api.post('/orders', payload);
        if (res.data.success) {
          newOrdersCreated.push(res.data.data.orderId);
        }
      }
      
      clearCart();
      addNotification(`Success! ${newOrdersCreated.length} order(s) placed for delivery.`, 'order');
      
      // Refresh orders
      const ordRes = await api.get('/orders');
      if (ordRes.data.success) setOrders(ordRes.data.data);
      
      return newOrdersCreated;
    } catch (err) {
      console.error(err);
      addNotification("Failed to place order via API.", "error");
      return null;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId || o.orderId === orderId ? res.data.data : o));
        addNotification(`Order ${orderId} updated successfully.`, 'order');
      }
    } catch (err) {
      console.error(err);
      addNotification(`Failed to update order ${orderId}.`, 'error');
    }
  };

  const requestDeliverySlotChange = (orderId, newSlot) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.orderId === orderId) {
        return { ...o, deliveryTimeSlot: newSlot };
      }
      return o;
    }));
    addNotification(`Delivery slot for ${orderId} updated to ${newSlot}.`, 'delivery');
  };

  // --- Admin Sellers & Customers Management ---
  const updateSellerStatus = (sellerId, newStatus) => {
    setVendors(prev => prev.map(v => v.id === sellerId ? { ...v, status: newStatus } : v));
    addNotification(`Seller status updated to ${newStatus}.`, 'system');
  };

  const updateCustomerStatus = (customerId, newStatus) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: newStatus } : c));
    addNotification(`Customer status updated to ${newStatus}.`, 'system');
  };

  // --- Admin Delivery Batches & Agent Assignment ---
  // Step 1 of Workflow: Batch Created BEFORE Agent is assigned
  const createDeliveryBatch = async (orderIds, batchData = {}) => {
    try {
      const res = await api.post('/delivery/batches', { orderIds });
      if (res.data.success) {
        const newBatch = res.data.data;
        setDeliveryBatches(prev => [newBatch, ...prev]);
        
        // Refresh orders since their batch assignment changed
        const ordRes = await api.get('/orders');
        if (ordRes.data.success) setOrders(ordRes.data.data);
        
        addNotification(`Delivery Batch ${newBatch.batchId} created.`, 'aggregation');
        return newBatch;
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to create delivery batch.", "error");
      return null;
    }
  };

  // Step 2 of Workflow: Assign Agent to existing Delivery Batch
  const assignAgentToBatch = async (batchId, agentId) => {
    try {
      const res = await api.post(`/delivery/batches/${batchId}/assign`, { agentId });
      if (res.data.success) {
        setDeliveryBatches(prev => prev.map(b => b.id === batchId || b.batchId === batchId ? res.data.data.batch : b));
        
        // Refresh orders and agents
        const [ordRes, agentRes] = await Promise.all([
          api.get('/orders'),
          api.get('/delivery/agents')
        ]);
        if (ordRes.data.success) setOrders(ordRes.data.data);
        if (agentRes.data.success) setDeliveryAgents(agentRes.data.data);
        
        addNotification(`Agent assigned to Batch ${batchId}.`, 'delivery');
        return true;
      }
    } catch (err) {
      console.error(err);
      addNotification(`Failed to assign agent to batch.`, 'error');
      return false;
    }
  };

  const updateBatchStatus = async (batchId, newStatus) => {
    try {
      // The backend expects specific enum values for batch status.
      // E.g. 'PICKUP_IN_PROGRESS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'
      let mappedStatus = newStatus;
      if (newStatus === 'Pickup in Progress') mappedStatus = 'PICKUP_IN_PROGRESS';
      if (newStatus === 'Picked Up') mappedStatus = 'PICKED_UP';
      if (newStatus === 'Out for Delivery') mappedStatus = 'OUT_FOR_DELIVERY';
      if (newStatus === 'Completed' || newStatus === 'Delivered') mappedStatus = 'COMPLETED';

      const res = await api.patch(`/delivery/batches/${batchId}/status`, { status: mappedStatus });
      if (res.data.success) {
        setDeliveryBatches(prev => prev.map(b => b.id === batchId || b.batchId === batchId ? res.data.data : b));
        
        // Refresh orders and agents as they are deeply affected by batch status changes
        const [ordRes, agentRes] = await Promise.all([
          api.get('/orders'),
          api.get('/delivery/agents')
        ]);
        if (ordRes.data.success) setOrders(ordRes.data.data);
        if (agentRes.data.success) setDeliveryAgents(agentRes.data.data);
        
        addNotification(`Batch ${batchId} status updated to: ${newStatus}`, 'delivery');
      }
    } catch (err) {
      console.error(err);
      addNotification(`Failed to update batch status.`, 'error');
    }
  };

  const addDeliveryAgent = (agentData) => {
    const newAgent = {
      id: `da${Date.now()}`,
      name: agentData.name,
      phone: agentData.phone,
      currentArea: agentData.currentArea || 'Central Zone',
      capacity: Number(agentData.capacity || 5),
      currentOrders: 0,
      availability: 'Available',
      status: 'Available',
      vehicle: agentData.vehicle || 'Electric Scooter',
      rating: 5.0
    };
    setDeliveryAgents(prev => [...prev, newAgent]);
    addNotification(`Delivery Agent ${newAgent.name} onboarded successfully.`, 'system');
  };

  const updateDeliveryAgent = (agentId, fields) => {
    setDeliveryAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...fields } : a));
    if (currentUser && (currentUser.id === agentId || currentUser.role === 'delivery_partner')) {
      setCurrentUser(prev => ({ ...prev, ...fields }));
    }
    addNotification(`Agent details updated.`, 'system');
  };

  const updateAdminSettings = (newSettings) => {
    setAdminSettings(prev => ({ ...prev, ...newSettings }));
    addNotification(`System aggregation parameters updated.`, 'system');
  };

  // --- Profile Updates ---
  const updateUserProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);

    if (currentUser.role === 'customer') {
      setCustomers(prev => prev.map(c => c.id === currentUser.id ? { ...c, ...updatedFields } : c));
    } else if (currentUser.role === 'vendor') {
      setVendors(prev => prev.map(v => v.id === currentUser.id ? { ...v, ...updatedFields } : v));
    } else if (currentUser.role === 'delivery_partner') {
      setDeliveryAgents(prev => prev.map(a => a.id === currentUser.id ? { ...a, ...updatedFields } : a));
    }
    addNotification(`Profile updated successfully.`, 'system');
  };

  const updateSellerProfile = async (updatedVendorFields) => {
    if (!currentUser || currentUser.role !== 'vendor') return;
    const patch = { ...updatedVendorFields };
    if (patch.name && !patch.shopName) patch.shopName = patch.name;
    else if (patch.shopName && !patch.name) patch.name = patch.shopName;
    
    try {
      // In Phase 2, vendors API is /api/v1/vendors/:id
      const res = await api.put(`/vendors/${currentUser.id}`, patch);
      if (res.data.success) {
        const updatedUser = { ...currentUser, ...patch };
        setCurrentUser(updatedUser);
        setVendors(prev => prev.map(v => v.id === currentUser.id ? { ...v, ...patch } : v));
        addNotification(`Business profile updated successfully.`, 'system');
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to update business profile.", "error");
    }
  };

  // --- Products CRUD ---
  const addProduct = async (product) => {
    try {
      const payload = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        prepTime: product.prepTime || '5 mins',
        vendorId: currentUser?.role === 'vendor' ? currentUser.id : (product.vendorId || 'v1')
      };
      
      const res = await api.post('/products', payload);
      if (res.data.success) {
        // Refresh products list
        const pRes = await api.get('/products');
        if (pRes.data.success) setProducts(pRes.data.data);
        addNotification(`New product added: ${product.name}`, 'system');
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to add product.", "error");
    }
  };
  
  const updateProduct = async (id, updatedFields) => {
    try {
      const res = await api.put(`/products/${id}`, updatedFields);
      if (res.data.success) {
        // Refresh products list to get calculated status based on stock
        const pRes = await api.get('/products');
        if (pRes.data.success) setProducts(pRes.data.data);
        addNotification(`Product updated successfully.`, 'system');
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to update product.", "error");
    }
  };
  
  const deleteProduct = async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        setProducts(prev => prev.filter(p => p.id !== id && p.uuid !== id));
        addNotification(`Product deleted successfully.`, 'system');
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      addNotification("Failed to delete product.", "error");
    }
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
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // --- Delivery Partner Helpers ---
  const getAgentBatches = (agentId) => {
    return deliveryBatches.filter(b => b.agentId === agentId);
  };

  const getAgentOrders = (agentId) => {
    const batches = getAgentBatches(agentId);
    const orderIds = batches.flatMap(b => b.orderIds);
    return orders.filter(o => orderIds.includes(o.id));
  };

  const confirmOrderPickup = (orderId) => {
    updateOrderStatus(orderId, 'PICKED_UP');
  };

  const confirmOrderDelivery = (orderId) => {
    updateOrderStatus(orderId, 'DELIVERED');
    // We should also check if the batch is complete and update it.
    // For simplicity, updateBatchStatus will be called by the component if needed.
  };

  return (
    <AppContext.Provider value={{
      orders, setOrders, updateOrderStatus, requestDeliverySlotChange,
      vendors, setVendors, updateSellerStatus,
      customers, setCustomers, updateCustomerStatus,
      deliveryAgents, setDeliveryAgents, addDeliveryAgent, updateDeliveryAgent,
      deliveryBatches, setDeliveryBatches, createDeliveryBatch, assignAgentToBatch, updateBatchStatus,
      deliveryGroups,
      products, addProduct, updateProduct, deleteProduct,
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      currentUser, setCurrentUser,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      registerCustomer, registerSeller, placeOrder,
      updateUserProfile, updateSellerProfile,
      adminSettings, updateAdminSettings,
      getAgentBatches, getAgentOrders, confirmOrderPickup, confirmOrderDelivery,
      globalLoading, offlineMode
    }}>
      {children}
    </AppContext.Provider>
  );
};
