import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  orders as initialOrders, 
  vendors as initialVendors, 
  customers as initialCustomers, 
  deliveryAgents as initialDeliveryAgents,
  deliveryBatches as initialDeliveryBatches,
  products as initialProducts,
  initialNotifications,
  mockUsers,
  adminSettingsInitial
} from '../data/sampleData';

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
  const [orders, setOrders] = useState(() => getStorageItem('orders', initialOrders));
  const [vendors, setVendors] = useState(() => getStorageItem('vendors', initialVendors));
  const [customers, setCustomers] = useState(() => getStorageItem('customers', initialCustomers));
  const [deliveryAgents, setDeliveryAgents] = useState(() => getStorageItem('deliveryAgents', initialDeliveryAgents));
  const [deliveryBatches, setDeliveryBatches] = useState(() => getStorageItem('deliveryBatches', initialDeliveryBatches));
  const [products, setProducts] = useState(() => getStorageItem('products', initialProducts));
  const [notifications, setNotifications] = useState(() => getStorageItem('notifications', initialNotifications));
  const [cart, setCart] = useState(() => getStorageItem('cart', []));
  const [currentUser, setCurrentUser] = useState(() => getStorageItem('currentUser', mockUsers.find(u => u.role === 'customer')));
  const [adminSettings, setAdminSettings] = useState(() => getStorageItem('adminSettings', adminSettingsInitial));

  // Legacy alias for deliveryGroups
  const deliveryGroups = deliveryBatches;

  // Persist states to localStorage
  useEffect(() => { localStorage.setItem('micrologi_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('micrologi_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('micrologi_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('micrologi_deliveryAgents', JSON.stringify(deliveryAgents)); }, [deliveryAgents]);
  useEffect(() => { localStorage.setItem('micrologi_deliveryBatches', JSON.stringify(deliveryBatches)); }, [deliveryBatches]);
  useEffect(() => { localStorage.setItem('micrologi_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('micrologi_notifications', JSON.stringify(notifications)); }, [notifications]);
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
  const registerCustomer = (data) => {
    const newCustomer = {
      id: `c${Date.now()}`,
      name: data.fullName,
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
      area: data.cityArea || 'Local',
      status: 'Active',
      totalOrders: 0,
      activeOrders: 0,
      role: 'customer',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      lat: 13.0827,
      lng: 80.2707
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    setCurrentUser(newCustomer);
    addNotification(`Welcome ${newCustomer.name}! Customer account created successfully.`, 'system');
    return newCustomer;
  };

  const registerSeller = (data) => {
    const newSeller = {
      id: `v${Date.now()}`,
      name: data.businessName,
      ownerName: data.ownerName,
      username: data.username,
      email: data.email,
      phone: data.phone,
      category: data.category || 'Local Seller',
      rating: 5.0,
      prepTime: '15-30 mins',
      isOpen: true,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      operatingHours: data.operatingHours || '9:00 AM - 9:00 PM',
      address: data.businessAddress,
      area: data.cityArea || 'Local Area',
      role: 'vendor',
      logo: data.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
      description: data.description || 'Verified local seller in the Micro-Logistics Network.',
      lat: 13.0418,
      lng: 80.2341
    };

    setVendors(prev => [...prev, newSeller]);
    setCurrentUser(newSeller);
    addNotification(`Welcome ${newSeller.name}! Seller registration complete.`, 'system');
    return newSeller;
  };

  // --- Orders & Checkout ---
  const placeOrder = ({ deliveryAddress, contactPhone, deliveryDate, deliveryTimeSlot }) => {
    if (cart.length === 0) return null;

    const itemsByVendor = {};
    cart.forEach(item => {
      const vId = item.product.vendorId || 'v1';
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    const newOrdersCreated = [];

    Object.keys(itemsByVendor).forEach((vId) => {
      const vendorItems = itemsByVendor[vId];
      const vendor = vendors.find(v => v.id === vId) || { name: vendorItems[0]?.product?.vendorName || 'Local Seller', address: 'Seller Hub' };
      const orderTotal = vendorItems.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
      const generatedId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: generatedId,
        orderId: generatedId,
        customerId: currentUser?.id || 'c1',
        customerName: currentUser?.name || 'Customer',
        vendorId: vId,
        vendorName: vendor.name,
        items: vendorItems.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price
        })),
        total: orderTotal,
        orderStatus: 'PLACED',
        status: 'PLACED',
        deliveryStatus: 'Order Placed',
        aggregationStatus: 'Waiting for Aggregation',
        pickupLocation: vendor.address || 'Seller Hub',
        deliveryLocation: deliveryAddress || currentUser?.address || '101 Anna Nagar East, Chennai',
        deliveryDate: deliveryDate,
        deliveryTimeSlot: deliveryTimeSlot,
        date: new Date().toISOString(),
        batchId: null,
        deliveryGroupId: null,
        groupedWith: [],
        assignedAgent: null
      };

      newOrdersCreated.push(newOrder);
    });

    setOrders(prev => [...newOrdersCreated, ...prev]);
    clearCart();
    addNotification(`Success! ${newOrdersCreated.length} order(s) placed for delivery on ${deliveryDate} (${deliveryTimeSlot}).`, 'order');
    return newOrdersCreated;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.orderId === orderId) {
        let deliveryStatus = o.deliveryStatus;
        let aggregationStatus = o.aggregationStatus;

        if (status === 'CONFIRMED') {
          deliveryStatus = 'Order Confirmed by Seller';
        } else if (status === 'PREPARING') {
          deliveryStatus = 'Item Packaging in Progress';
        } else if (status === 'READY_FOR_DELIVERY') {
          deliveryStatus = 'Ready for Delivery';
          aggregationStatus = 'Waiting for Aggregation';
        } else if (status === 'ASSIGNED') {
          deliveryStatus = 'Assigned for Delivery';
          aggregationStatus = 'Assigned';
        } else if (status === 'OUT_FOR_DELIVERY') {
          deliveryStatus = 'Out for Delivery';
          aggregationStatus = 'Out for Delivery';
        } else if (status === 'DELIVERED') {
          deliveryStatus = 'Delivered to Customer';
          aggregationStatus = 'Delivered';
        } else if (status === 'CANCELLED') {
          deliveryStatus = 'Cancelled';
          aggregationStatus = 'Cancelled';
        }

        return { ...o, status, orderStatus: status, deliveryStatus, aggregationStatus };
      }
      return o;
    }));
    
    addNotification(`Order ${orderId} updated to status: ${status.replace(/_/g, ' ')}`, 'order');
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
  const createDeliveryBatch = (orderIds, batchData = {}) => {
    const generatedBatchId = `B-${Math.floor(1000 + Math.random() * 9000)}`;
    const batchOrders = orders.filter(o => orderIds.includes(o.id));
    
    const sellerIds = Array.from(new Set(batchOrders.map(o => o.vendorId || o.sellerId)));
    const sellerNames = Array.from(new Set(batchOrders.map(o => o.vendorName || o.sellerName)));
    const pickupLocations = Array.from(new Set(batchOrders.map(o => o.pickupLocation)));
    const deliveryLocations = batchOrders.map(o => o.deliveryLocation);

    const newBatch = {
      id: generatedBatchId,
      batchId: generatedBatchId,
      orderIds: orderIds,
      sellerIds: sellerIds,
      sellerNames: sellerNames,
      agentId: null,
      agentName: null,
      pickupLocations: pickupLocations,
      deliveryLocations: deliveryLocations,
      deliveryDate: batchOrders[0]?.deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot: batchOrders[0]?.deliveryTimeSlot || '9:00 AM – 1:00 PM',
      orderCount: orderIds.length,
      estimatedDistance: batchData.estimatedDistance || parseFloat((2.0 + orderIds.length * 1.5).toFixed(1)),
      estimatedTime: batchData.estimatedTime || (15 + orderIds.length * 10),
      status: 'Pending Assignment',
      aggregationStatus: 'Batch Created',
      compatibilityScore: batchData.compatibilityScore || 90,
      dateCreated: new Date().toISOString()
    };

    setDeliveryBatches(prev => [newBatch, ...prev]);

    // Update member orders
    setOrders(prev => prev.map(o => {
      if (orderIds.includes(o.id)) {
        return {
          ...o,
          batchId: generatedBatchId,
          deliveryGroupId: generatedBatchId,
          aggregationStatus: 'Batch Created',
          deliveryStatus: 'Delivery Batch Created'
        };
      }
      return o;
    }));

    addNotification(`Delivery Batch ${generatedBatchId} created. Ready for agent assignment.`, 'aggregation');
    return newBatch;
  };

  // Step 2 of Workflow: Assign Agent to existing Delivery Batch
  const assignAgentToBatch = (batchId, agentId) => {
    const agent = deliveryAgents.find(a => a.id === agentId);
    if (!agent) return false;

    setDeliveryBatches(prev => prev.map(b => {
      if (b.id === batchId || b.batchId === batchId) {
        return {
          ...b,
          agentId: agent.id,
          agentName: agent.name,
          status: 'Assigned',
          aggregationStatus: 'Assigned'
        };
      }
      return b;
    }));

    // Update constituent orders
    const targetBatch = deliveryBatches.find(b => b.id === batchId || b.batchId === batchId);
    const affectedOrderIds = targetBatch ? targetBatch.orderIds : [];

    setOrders(prev => prev.map(o => {
      if (affectedOrderIds.includes(o.id)) {
        return {
          ...o,
          assignedAgent: `${agent.name} (${agent.phone})`,
          status: 'ASSIGNED',
          orderStatus: 'ASSIGNED',
          deliveryStatus: 'Assigned for Delivery',
          aggregationStatus: 'Assigned'
        };
      }
      return o;
    }));

    // Update Agent state
    setDeliveryAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          status: 'On Delivery',
          availability: 'On Delivery',
          currentOrders: (a.currentOrders || 0) + affectedOrderIds.length
        };
      }
      return a;
    }));

    addNotification(`Agent ${agent.name} assigned to Batch ${batchId}.`, 'delivery');
    return true;
  };

  const updateBatchStatus = (batchId, newStatus) => {
    setDeliveryBatches(prev => prev.map(b => {
      if (b.id === batchId || b.batchId === batchId) {
        let aggStatus = b.aggregationStatus;
        if (newStatus === 'Assigned') aggStatus = 'Assigned';
        else if (newStatus === 'Pickup in Progress') aggStatus = 'Pickup in Progress';
        else if (newStatus === 'Out for Delivery') aggStatus = 'Out for Delivery';
        else if (newStatus === 'Completed' || newStatus === 'Delivered') aggStatus = 'Delivered';

        return { ...b, status: newStatus, aggregationStatus: aggStatus };
      }
      return b;
    }));

    const targetBatch = deliveryBatches.find(b => b.id === batchId || b.batchId === batchId);
    if (targetBatch) {
      setOrders(prev => prev.map(o => {
        if (targetBatch.orderIds.includes(o.id)) {
          let orderCode = o.status;
          let delText = o.deliveryStatus;
          let aggText = o.aggregationStatus;

          if (newStatus === 'Out for Delivery') {
            orderCode = 'OUT_FOR_DELIVERY';
            delText = 'Out for Delivery';
            aggText = 'Out for Delivery';
          } else if (newStatus === 'Completed' || newStatus === 'Delivered') {
            orderCode = 'DELIVERED';
            delText = 'Delivered to Customer';
            aggText = 'Delivered';
          }

          return { ...o, status: orderCode, orderStatus: orderCode, deliveryStatus: delText, aggregationStatus: aggText };
        }
        return o;
      }));

      // Free agent if completed
      if ((newStatus === 'Completed' || newStatus === 'Delivered') && targetBatch.agentId) {
        setDeliveryAgents(prev => prev.map(a => {
          if (a.id === targetBatch.agentId) {
            return { ...a, status: 'Available', availability: 'Available', currentOrders: Math.max(0, (a.currentOrders || 1) - targetBatch.orderCount) };
          }
          return a;
        }));
      }
    }

    addNotification(`Batch ${batchId} status updated to: ${newStatus}`, 'delivery');
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
    }
    addNotification(`Profile updated successfully.`, 'system');
  };

  const updateSellerProfile = (updatedVendorFields) => {
    if (!currentUser || currentUser.role !== 'vendor') return;
    const updatedUser = { ...currentUser, ...updatedVendorFields };
    setCurrentUser(updatedUser);
    setVendors(prev => prev.map(v => v.id === currentUser.id ? { ...v, ...updatedVendorFields } : v));
    addNotification(`Business profile updated successfully.`, 'system');
  };

  // --- Products CRUD ---
  const addProduct = (product) => {
    const newProduct = { 
      ...product, 
      id: `p${Date.now()}`,
      vendorId: currentUser?.role === 'vendor' ? currentUser.id : (product.vendorId || 'v1'),
      vendorName: currentUser?.role === 'vendor' ? currentUser.name : (product.vendorName || 'Local Seller'),
      status: (product.stock && Number(product.stock) > 0) ? 'In Stock' : 'Out of Stock'
    };
    setProducts(prev => [...prev, newProduct]);
    addNotification(`New product added: ${product.name}`, 'system');
  };
  
  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updatedFields };
        if (updated.stock !== undefined) {
          const numStock = Number(updated.stock);
          if (numStock > 10) updated.status = 'In Stock';
          else if (numStock > 0) updated.status = 'Low Stock';
          else updated.status = 'Out of Stock';
        }
        return updated;
      }
      return p;
    }));
  };
  
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
      adminSettings, updateAdminSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};
