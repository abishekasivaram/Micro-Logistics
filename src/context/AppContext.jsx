import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [deliveryPersonnel, setDeliveryPersonnel] = useState(() => getStorageItem('deliveryPersonnel', initialDeliveryPersonnel));
  const [deliveryGroups, setDeliveryGroups] = useState(() => getStorageItem('deliveryGroups', initialDeliveryGroups));
  const [products, setProducts] = useState(() => getStorageItem('products', initialProducts));
  const [notifications, setNotifications] = useState(() => getStorageItem('notifications', initialNotifications));
  const [cart, setCart] = useState(() => getStorageItem('cart', []));
  const [currentUser, setCurrentUser] = useState(() => getStorageItem('currentUser', mockUsers.find(u => u.role === 'customer')));

  // Persist states to localStorage
  useEffect(() => { localStorage.setItem('micrologi_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('micrologi_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('micrologi_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('micrologi_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('micrologi_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('micrologi_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('micrologi_currentUser', JSON.stringify(currentUser)); }, [currentUser]);

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

    // Group items by vendorId so each seller gets a structured order
    const itemsByVendor = {};
    cart.forEach(item => {
      const vId = item.product.vendorId || 'v1';
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    const newOrdersCreated = [];

    Object.keys(itemsByVendor).forEach((vId, idx) => {
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
        deliveryStatus: 'Pending Vendor Confirmation',
        aggregationStatus: 'Waiting for Aggregation',
        pickupLocation: vendor.address || 'Seller Hub',
        deliveryLocation: deliveryAddress || currentUser?.address || '101 Anna Nagar East, Chennai',
        deliveryDate: deliveryDate,
        deliveryTimeSlot: deliveryTimeSlot,
        date: new Date().toISOString(),
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
          deliveryStatus = 'Ready for Aggregation';
          aggregationStatus = 'Ready for Aggregation';
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
    
    setDeliveryGroups(prev => [...prev, newGroup]);
    setOrders(prev => prev.map(o => orderIds.includes(o.id) ? { ...o, deliveryGroupId: newGroupId, status: personnelId ? 'ASSIGNED' : 'READY_FOR_DELIVERY', orderStatus: personnelId ? 'ASSIGNED' : 'READY_FOR_DELIVERY', aggregationStatus: 'Grouped' } : o));
    
    if (personnelId) {
       setDeliveryPersonnel(prev => prev.map(dp => dp.id === personnelId ? { ...dp, status: 'On Delivery' } : dp));
    }

    addNotification(`Delivery Group ${newGroupId} created.`, 'delivery');
  };
  
  const updateDeliveryGroupStatus = (groupId, status) => {
    setDeliveryGroups(prev => prev.map(g => g.id === groupId ? { ...g, status } : g));
    
    if (status === 'DELIVERED') {
      const group = deliveryGroups.find(g => g.id === groupId);
      if (group) {
        setOrders(prev => prev.map(o => group.orderIds.includes(o.id) ? { ...o, status: 'DELIVERED', orderStatus: 'DELIVERED', deliveryStatus: 'Delivered', aggregationStatus: 'Delivered' } : o));
        if (group.personnelId) {
            setDeliveryPersonnel(prev => prev.map(dp => dp.id === group.personnelId ? { ...dp, status: 'Available' } : dp));
        }
        addNotification(`Delivery Group ${groupId} has been delivered.`, 'delivery');
      }
    }
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
      vendors, setVendors,
      customers, setCustomers,
      deliveryPersonnel, setDeliveryPersonnel,
      deliveryGroups, createDeliveryGroup, updateDeliveryGroupStatus,
      products, addProduct, updateProduct, deleteProduct,
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      currentUser, setCurrentUser,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      registerCustomer, registerSeller, placeOrder,
      updateUserProfile, updateSellerProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

