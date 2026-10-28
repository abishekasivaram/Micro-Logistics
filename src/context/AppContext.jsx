import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';
import { initialProducts } from '../data/initialProducts';
import { 
  demoVendors, demoProducts, demoCustomers, demoAgents, 
  demoOrders, demoBatches, demoNotifications 
} from '../data/demoData';
import { getCategoryFallbackImage } from '../utils/imageUtils';
import { rectifyCustomerUser } from '../utils/customerDirectory';

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
  const [vendors, setVendors] = useState(() => {
    const saved = getStorageItem('vendors', []);
    return (saved || []).filter(v => v.id !== 'f2eca577-884b-4907-8d7d-0827d5f49ebb');
  });
  const [customers, setCustomers] = useState(() => getStorageItem('customers', []));
  const [deliveryAgents, setDeliveryAgents] = useState(() => getStorageItem('deliveryAgents', []));
  const [deliveryBatches, setDeliveryBatches] = useState(() => getStorageItem('deliveryBatches', []));
  const [products, setProducts] = useState(() => {
    const saved = getStorageItem('products', null);
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      return initialProducts;
    }
    const sanitized = saved.filter(p => 
      p.vendorId !== 'f2eca577-884b-4907-8d7d-0827d5f49ebb' && 
      p.vendor_id !== 'f2eca577-884b-4907-8d7d-0827d5f49ebb'
    );
    return sanitized.length > 0 ? sanitized : initialProducts;
  });
  const [notifications, setNotifications] = useState(() => getStorageItem('notifications', []));
  const [cart, setCart] = useState(() => getStorageItem('cart', []));
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUserRaw] = useState(() => {
    const saved = getStorageItem('currentUser', null);
    return saved ? rectifyCustomerUser(saved) : null;
  });

  const setCurrentUser = (user) => {
    setCurrentUserRaw(user ? rectifyCustomerUser(user) : null);
  };
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

  // --- Supabase Session Restoration and Auth State Listener ---
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          const cachedUser = getStorageItem('currentUser', null);
          if (cachedUser?.isDemo) {
            if (isMounted) {
              setCurrentUser(cachedUser);
              setAuthLoading(false);
            }
            return;
          }
          if (isMounted) {
            setCurrentUser(null);
            setAuthLoading(false);
          }
          return;
        }

        let role = session.user.user_metadata?.role || session.user.app_metadata?.role;
        let username = session.user.user_metadata?.full_name || session.user.email;
        let phone = null;
        let address = null;
        let area = null;
        let shopName = session.user.user_metadata?.shop_name || username;
        let legacyId = session.user.user_metadata?.legacy_id;

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            if (profile.role) role = profile.role;
            if (profile.username) username = profile.username;
            if (profile.phone) phone = profile.phone;
          }
        } catch {}

        if (role === 'seller') role = 'vendor';
        if (!role || role === 'authenticated') role = 'customer';

        if (role === 'customer') {
          try {
            const { data: cData } = await supabase.from('customer_profiles').select('*').eq('id', session.user.id).single();
            if (cData) {
              address = cData.address;
              area = cData.area;
              legacyId = cData.legacy_id || legacyId;
            }
          } catch {}
        } else if (role === 'vendor') {
          try {
            const { data: vData } = await supabase.from('vendors').select('*').eq('id', session.user.id).single();
            if (vData) {
              shopName = vData.shop_name || shopName;
              address = vData.address;
              area = vData.area;
              legacyId = vData.legacy_id || legacyId;
            }
          } catch {}
        }

        const authenticatedUser = {
          id: session.user.id,
          email: session.user.email,
          name: username,
          username,
          phone,
          address,
          area,
          shopName,
          shop_name: shopName,
          legacy_id: legacyId,
          role,
          isDemo: false
        };

        const finalUser = role === 'customer' ? rectifyCustomerUser(authenticatedUser) : authenticatedUser;

        if (isMounted) {
          setCurrentUser(finalUser);
          setAuthLoading(false);
        }
      } catch {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          setCurrentUser(prev => prev?.isDemo ? prev : null);
          setAuthLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (isMounted && session?.user) {
          restoreSession();
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only load if user is logged in
    if (!currentUser) return;

    if (currentUser.isDemo) {
      setOfflineMode(true);
      // Hydrate with isolated demo dataset for instant demo inspection
      setVendors(demoVendors);
      setProducts(demoProducts);
      setCustomers(demoCustomers);
      setDeliveryAgents(demoAgents);
      setDeliveryBatches(demoBatches);
      setOrders(demoOrders);
      setNotifications(demoNotifications);
      return; // Fully isolated demo mode, no live DB calls
    }

    const loadData = async () => {
      setGlobalLoading(true);
      try {
        const role = currentUser.role;
        const promises = [
          api.get('/products').then(res => { if (res.data?.success) setProducts(res.data.data) }),
          api.get('/vendors').then(res => { if (res.data?.success) setVendors(res.data.data) }),
          api.get('/notifications').then(res => { if (res.data?.success) setNotifications(res.data.data) })
        ];

        if (role === 'admin') {
          promises.push(
            api.get('/orders').then(res => { if (res.data?.success) setOrders(res.data.data) }),
            api.get('/delivery/batches').then(res => { if (res.data?.success) setDeliveryBatches(res.data.data) }),
            api.get('/delivery/agents').then(res => { if (res.data?.success) setDeliveryAgents(res.data.data) }),
            api.get('/customers').then(res => { if (res.data?.success) setCustomers(res.data.data) }),
            api.get('/settings').then(res => { if (res.data?.success) setAdminSettings(res.data.data) })
          );
        } else if (role === 'vendor') {
          promises.push(
            api.get('/orders').then(res => { if (res.data?.success) setOrders(res.data.data) })
          );
        } else if (role === 'customer') {
          promises.push(
            api.get('/orders').then(res => { if (res.data?.success) setOrders(res.data.data) }),
            api.get(`/customers/${currentUser.legacy_id || currentUser.id}`).then(res => {
              if (res.data?.success && res.data.data) {
                const cData = res.data.data;
                setCurrentUserRaw(prev => {
                  if (!prev) return prev;
                  return rectifyCustomerUser({
                    ...prev,
                    address: cData.address || prev.address,
                    area: cData.area || prev.area,
                    phone: cData.phone || prev.phone,
                    name: cData.name || prev.name
                  });
                });
              }
            }).catch(() => {})
          );
        } else if (role === 'delivery_partner') {
          promises.push(
            api.get('/orders').then(res => { if (res.data?.success) setOrders(res.data.data) }),
            api.get('/delivery/batches').then(res => { if (res.data?.success) setDeliveryBatches(res.data.data) }),
            api.get('/delivery/agents').then(res => { if (res.data?.success) setDeliveryAgents(res.data.data) })
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

  // Persist states to localStorage
  useEffect(() => { localStorage.setItem('micrologi_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('micrologi_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('micrologi_adminSettings', JSON.stringify(adminSettings)); }, [adminSettings]);
  useEffect(() => { 
    if (products && products.length > 0) {
      localStorage.setItem('micrologi_products', JSON.stringify(products)); 
    }
  }, [products]);

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
    if (!cart || cart.length === 0) return null;

    const itemsByVendor = {};
    cart.forEach(item => {
      const vId = item.product.vendorId || item.product.vendor_id || 'v1';
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    // In Demo / Offline Mode, simulate local order creation and inventory deduction
    if (currentUser?.isDemo || offlineMode) {
      const createdOrders = [];
      for (const vId of Object.keys(itemsByVendor)) {
        const vendorItems = itemsByVendor[vId];
        const vendorObj = (vendors || []).find(s => s.id === vId || s.legacy_id === vId);
        const subtotal = vendorItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
        const ordId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrder = {
          id: ordId,
          orderId: ordId,
          orderCode: ordId,
          uuid: ordId,
          customerId: currentUser?.id || 'demo-cust',
          customerName: currentUser?.name || 'Priya Rajan',
          customerPhone: contactPhone || currentUser?.phone || '9876543210',
          vendorId: vId,
          vendorName: vendorObj?.shop_name || vendorObj?.name || 'Local Seller',
          pickupLocation: vendorObj?.address || 'Vendor Hub',
          deliveryLocation: deliveryAddress || currentUser?.address || 'Local Delivery Address',
          deliveryDate,
          deliveryTimeSlot,
          status: 'PLACED',
          orderStatus: 'PLACED',
          aggregationStatus: 'Waiting for Aggregation',
          deliveryStatus: 'Pending Assignment',
          total: subtotal,
          items: vendorItems.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            qty: i.quantity,
            price: i.product.price
          })),
          createdAt: new Date().toISOString()
        };
        createdOrders.push(newOrder);

        // Deduct inventory stock locally
        vendorItems.forEach(i => {
          setProducts(prev => prev.map(p => {
            if (p.id === i.product.id || p.uuid === i.product.id) {
              const newStock = Math.max(0, (p.stock || 0) - i.quantity);
              const newStatus = (newStock > 10) ? 'In Stock' : (newStock > 0 ? 'Low Stock' : 'Out of Stock');
              return { ...p, stock: newStock, status: newStatus };
            }
            return p;
          }));
        });
      }

      setOrders(prev => [...createdOrders, ...prev]);
      clearCart();
      addNotification(`Success! ${createdOrders.length} order(s) placed for delivery.`, 'order');
      return createdOrders;
    }

    try {
      const createdOrders = [];
      for (const vId of Object.keys(itemsByVendor)) {
        const vendorItems = itemsByVendor[vId];
        const vendorObj = (vendors || []).find(s => s.id === vId || s.legacy_id === vId);
        const subtotal = vendorItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
        const generatedCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        const orderEntry = {
          id: generatedCode,
          orderCode: generatedCode,
          orderId: generatedCode,
          vendorId: vId,
          vendorName: vendorObj?.shop_name || vendorObj?.name || vendorItems[0]?.product?.vendorName || 'Local Seller',
          customerId: currentUser?.id || 'demo-cust',
          customerName: currentUser?.name || 'Demo Customer',
          customerPhone: contactPhone || currentUser?.phone || '9876543210',
          deliveryAddress: deliveryAddress || currentUser?.address || '101 Anna Nagar East, Chennai',
          deliveryLocation: deliveryAddress || currentUser?.address || '101 Anna Nagar East, Chennai',
          deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
          deliveryTimeSlot: deliveryTimeSlot || '9:00 AM - 1:00 PM',
          total: subtotal,
          orderStatus: 'PLACED',
          deliveryStatus: 'PENDING_ASSIGNMENT',
          status: 'PLACED',
          createdAt: new Date().toISOString(),
          items: vendorItems.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            image: i.product.image,
            qty: i.quantity,
            price: i.product.price
          }))
        };

        // If authenticated user (non-demo), attempt backend sync
        if (!currentUser?.isDemo) {
          try {
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
            if (res.data?.success && res.data.data?.orderId) {
              orderEntry.id = res.data.data.orderId;
              orderEntry.orderCode = res.data.data.orderId;
              orderEntry.orderId = res.data.data.orderId;
            }
          } catch (apiErr) {
            console.warn('Backend order sync skipped, persisting locally:', apiErr);
          }
        }

        createdOrders.push(orderEntry);
      }

      // Add to local orders and persist to localStorage
      setOrders(prev => {
        const updated = [...createdOrders, ...(prev || [])];
        try {
          localStorage.setItem('micrologi_orders', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to store orders in localStorage', e);
        }
        return updated;
      });

      clearCart();
      if (!currentUser?.isDemo) {
        try {
          const [ordRes, prodRes] = await Promise.all([
            api.get('/orders'),
            api.get('/products')
          ]);
          if (ordRes.data?.success) setOrders(ordRes.data.data);
          if (prodRes.data?.success) setProducts(prodRes.data.data);
        } catch (e) {
          console.warn('Could not refresh orders/products from server:', e);
        }
      }

      return createdOrders;
    } catch (err) {
      console.error('Failed to place order:', err);
      addNotification('Failed to place order.', 'error');
      return null;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (currentUser?.isDemo || offlineMode) {
      setOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status, orderStatus: status } : o));
      addNotification(`Order ${orderId} updated to ${status}.`, 'order');
      return true;
    }
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      if (res.data?.success) {
        setOrders(prev => prev.map(o => o.id === orderId || o.orderId === orderId ? res.data.data : o));
        addNotification(`Order ${orderId} updated successfully.`, 'order');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || `Failed to update order ${orderId}.`;
      addNotification(errMsg, 'error');
    }
  };

  const requestDeliverySlotChange = async (orderId, newSlot) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { deliveryTimeSlot: newSlot });
      setOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, deliveryTimeSlot: newSlot } : o));
      addNotification(`Delivery slot for ${orderId} updated to ${newSlot}.`, 'delivery');
    } catch (err) {
      console.error(err);
      setOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, deliveryTimeSlot: newSlot } : o));
      addNotification(`Delivery slot for ${orderId} updated to ${newSlot}.`, 'delivery');
    }
  };

  // --- Admin Sellers & Customers Management ---
  const updateSellerStatus = async (sellerId, newStatus) => {
    try {
      const res = await api.put(`/vendors/${sellerId}`, { status: newStatus });
      if (res.data?.success) {
        setVendors(prev => prev.map(v => (v.id === sellerId || v.legacy_id === sellerId) ? { ...v, status: newStatus } : v));
        addNotification(`Seller status updated to ${newStatus}.`, 'system');
      }
    } catch (err) {
      console.error(err);
      setVendors(prev => prev.map(v => (v.id === sellerId || v.legacy_id === sellerId) ? { ...v, status: newStatus } : v));
      addNotification(`Seller status updated to ${newStatus}.`, 'system');
    }
  };

  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      const res = await api.put(`/customers/${customerId}`, { status: newStatus });
      if (res.data?.success) {
        setCustomers(prev => prev.map(c => (c.id === customerId || c.legacy_id === customerId) ? { ...c, status: newStatus } : c));
        addNotification(`Customer status updated to ${newStatus}.`, 'system');
      }
    } catch (err) {
      console.error(err);
      setCustomers(prev => prev.map(c => (c.id === customerId || c.legacy_id === customerId) ? { ...c, status: newStatus } : c));
      addNotification(`Customer status updated to ${newStatus}.`, 'system');
    }
  };

  // --- Admin Delivery Batches & Agent Assignment ---
  // Step 1 of Workflow: Batch Created BEFORE Agent is assigned
  const createDeliveryBatch = async (orderIds, batchData = {}) => {
    if (currentUser?.isDemo || offlineMode) {
      const newBatchId = `B-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBatch = {
        id: newBatchId,
        batchId: newBatchId,
        batchCode: newBatchId,
        orderCount: orderIds.length,
        orderIds,
        estimatedDistance: 3.8,
        estimatedTime: 30,
        status: 'Pending Assignment',
        aggregationStatus: 'Batch Created',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliverySlot: '9:00 AM – 1:00 PM',
        orders: (orders || []).filter(o => orderIds.includes(o.id) || orderIds.includes(o.orderId))
      };
      setDeliveryBatches(prev => [newBatch, ...prev]);
      setOrders(prev => prev.map(o => orderIds.includes(o.id) || orderIds.includes(o.orderId) ? { ...o, batchId: newBatchId, aggregationStatus: 'Batch Created' } : o));
      addNotification(`Delivery Batch ${newBatchId} created.`, 'aggregation');
      return newBatch;
    }

    try {
      const res = await api.post('/delivery/batches', { orderIds });
      if (res.data?.success) {
        // Refresh batches to get the fully hydrated batch model with orders and seller relations
        const [batchRes, ordRes] = await Promise.all([
          api.get('/delivery/batches'),
          api.get('/orders')
        ]);
        
        if (batchRes.data?.success) {
          setDeliveryBatches(batchRes.data.data);
        } else if (res.data?.data) {
          setDeliveryBatches(prev => [res.data.data, ...prev]);
        }
        
        if (ordRes.data?.success) setOrders(ordRes.data.data);
        
        const createdBatchCode = res.data?.data?.batchId || res.data?.data?.batch_code || 'New';
        addNotification(`Delivery Batch ${createdBatchCode} created.`, 'aggregation');
        return res.data?.data;
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to create delivery batch.", "error");
      return null;
    }
  };

  // Step 2 of Workflow: Assign Agent to existing Delivery Batch
  const assignAgentToBatch = async (batchId, agentId) => {
    if (currentUser?.isDemo || offlineMode) {
      const agentObj = (deliveryAgents || []).find(a => a.id === agentId || a.legacy_id === agentId);
      const agentName = agentObj?.name || 'Assigned Agent';
      setDeliveryBatches(prev => prev.map(b => (b.id === batchId || b.batchId === batchId) ? { ...b, agentId, agentName, status: 'Assigned', aggregationStatus: 'Assigned' } : b));
      const targetBatch = deliveryBatches.find(b => b.id === batchId || b.batchId === batchId);
      if (targetBatch && targetBatch.orderIds) {
        setOrders(prev => prev.map(o => targetBatch.orderIds.includes(o.id) || targetBatch.orderIds.includes(o.orderId) ? { ...o, assignedAgent: agentName, assignedAgentId: agentId, status: 'ASSIGNED', orderStatus: 'ASSIGNED', deliveryStatus: 'Assigned', aggregationStatus: 'Assigned' } : o));
      }
      addNotification(`Agent ${agentName} assigned to Batch ${batchId}.`, 'delivery');
      return true;
    }

    try {
      const res = await api.post(`/delivery/batches/${batchId}/assign`, { agentId });
      if (res.data?.success) {
        setDeliveryBatches(prev => prev.map(b => b.id === batchId || b.batchId === batchId ? res.data.data.batch : b));
        
        // Refresh orders and agents
        const [ordRes, agentRes] = await Promise.all([
          api.get('/orders'),
          api.get('/delivery/agents')
        ]);
        if (ordRes.data?.success) setOrders(ordRes.data.data);
        if (agentRes.data?.success) setDeliveryAgents(agentRes.data.data);
        
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
    if (currentUser?.isDemo || offlineMode) {
      setDeliveryBatches(prev => prev.map(b => (b.id === batchId || b.batchId === batchId) ? { ...b, status: newStatus } : b));
      const targetBatch = deliveryBatches.find(b => b.id === batchId || b.batchId === batchId);
      if (targetBatch && targetBatch.orderIds) {
        let mappedOrderStatus = 'ASSIGNED';
        let mappedDelivStatus = 'Assigned';
        let mappedAggStatus = 'Assigned';
        if (newStatus === 'Pickup in Progress') {
          mappedDelivStatus = 'Pickup in Progress';
        } else if (newStatus === 'Picked Up') {
          mappedDelivStatus = 'Picked Up';
        } else if (newStatus === 'Out for Delivery') {
          mappedOrderStatus = 'OUT_FOR_DELIVERY';
          mappedDelivStatus = 'Out for Delivery';
        } else if (newStatus === 'Completed' || newStatus === 'Delivered') {
          mappedOrderStatus = 'DELIVERED';
          mappedDelivStatus = 'Delivered to Customer';
          mappedAggStatus = 'Delivered';
        }
        setOrders(prev => prev.map(o => targetBatch.orderIds.includes(o.id) || targetBatch.orderIds.includes(o.orderId) ? {
          ...o,
          status: mappedOrderStatus,
          orderStatus: mappedOrderStatus,
          deliveryStatus: mappedDelivStatus,
          aggregationStatus: mappedAggStatus
        } : o));
      }
      addNotification(`Batch ${batchId} status updated to: ${newStatus}`, 'delivery');
      return true;
    }

    try {
      let mappedStatus = newStatus;
      if (newStatus === 'Pickup in Progress') mappedStatus = 'PICKUP_IN_PROGRESS';
      if (newStatus === 'Picked Up') mappedStatus = 'PICKED_UP';
      if (newStatus === 'Out for Delivery') mappedStatus = 'OUT_FOR_DELIVERY';
      if (newStatus === 'Completed' || newStatus === 'Delivered') mappedStatus = 'COMPLETED';

      const res = await api.patch(`/delivery/batches/${batchId}/status`, { status: mappedStatus });
      if (res.data?.success) {
        if (res.data.data) {
          setDeliveryBatches(prev => prev.map(b => (b.id === batchId || b.batchId === batchId) ? res.data.data : b));
        } else {
          setDeliveryBatches(prev => prev.map(b => (b.id === batchId || b.batchId === batchId) ? { ...b, status: newStatus } : b));
        }
        
        // Refresh orders and agents as they are deeply affected by batch status changes
        const [ordRes, agentRes] = await Promise.all([
          api.get('/orders'),
          api.get('/delivery/agents')
        ]);
        if (ordRes.data?.success) setOrders(ordRes.data.data);
        if (agentRes.data?.success) setDeliveryAgents(agentRes.data.data);
        
        addNotification(`Batch ${batchId} status updated to: ${newStatus}`, 'delivery');
      }
    } catch (err) {
      console.error(err);
      addNotification(`Failed to update batch status.`, 'error');
    }
  };

  const addDeliveryAgent = async (agentData) => {
    try {
      const payload = {
        name: agentData.name,
        phone: agentData.phone,
        email: agentData.email || `driver_${Date.now()}@micrologistics.com`,
        currentArea: agentData.currentArea || 'Central Zone',
        capacity: Number(agentData.capacity || 5),
        vehicle: agentData.vehicle || 'Electric Scooter'
      };
      const res = await api.post('/delivery/agents', payload);
      if (res.data.success && res.data.data) {
        setDeliveryAgents(prev => [...prev, res.data.data]);
        addNotification(`Delivery Agent ${agentData.name} onboarded successfully.`, 'system');
        return res.data.data;
      }
    } catch (err) {
      console.error(err);
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
      addNotification(`Delivery Agent ${newAgent.name} onboarded locally.`, 'system');
      return newAgent;
    }
  };

  const updateDeliveryAgent = async (agentId, fields) => {
    try {
      const res = await api.put(`/delivery/agents/${agentId}`, fields);
      if (res.data.success && res.data.data) {
        setDeliveryAgents(prev => prev.map(a => (a.id === agentId || a.legacy_id === agentId) ? { ...a, ...res.data.data } : a));
      } else {
        setDeliveryAgents(prev => prev.map(a => (a.id === agentId || a.legacy_id === agentId) ? { ...a, ...fields } : a));
      }
      if (currentUser && (currentUser.id === agentId || currentUser.role === 'delivery_partner')) {
        setCurrentUser(prev => ({ ...prev, ...fields }));
      }
      addNotification(`Agent details updated.`, 'system');
    } catch (err) {
      console.error(err);
      setDeliveryAgents(prev => prev.map(a => (a.id === agentId || a.legacy_id === agentId) ? { ...a, ...fields } : a));
      if (currentUser && (currentUser.id === agentId || currentUser.role === 'delivery_partner')) {
        setCurrentUser(prev => ({ ...prev, ...fields }));
      }
      addNotification(`Agent details updated.`, 'system');
    }
  };

  const updateAdminSettings = async (newSettings) => {
    try {
      const res = await api.put('/settings', newSettings);
      if (res.data.success && res.data.data) {
        setAdminSettings(res.data.data);
      } else {
        setAdminSettings(prev => ({ ...prev, ...newSettings }));
      }
      addNotification(`System aggregation parameters updated and saved.`, 'system');
    } catch (err) {
      console.error(err);
      setAdminSettings(prev => ({ ...prev, ...newSettings }));
      addNotification(`System aggregation parameters updated.`, 'system');
    }
  };

  // --- Profile Updates ---
  const updateUserProfile = async (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);

    try {
      if (currentUser.role === 'customer') {
        await api.put(`/customers/${currentUser.id}`, updatedFields);
        setCustomers(prev => prev.map(c => (c.id === currentUser.id || c.legacy_id === currentUser.id) ? { ...c, ...updatedFields } : c));
      } else if (currentUser.role === 'vendor') {
        await api.put(`/vendors/${currentUser.id}`, updatedFields);
        setVendors(prev => prev.map(v => (v.id === currentUser.id || v.legacy_id === currentUser.id) ? { ...v, ...updatedFields } : v));
      } else if (currentUser.role === 'delivery_partner') {
        await api.put(`/delivery/agents/${currentUser.id}`, updatedFields);
        setDeliveryAgents(prev => prev.map(a => (a.id === currentUser.id || a.legacy_id === currentUser.id) ? { ...a, ...updatedFields } : a));
      }
      addNotification(`Profile updated and synchronized.`, 'system');
    } catch (err) {
      console.error(err);
      addNotification(`Profile updated successfully.`, 'system');
    }
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
    const payload = {
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      stock: parseInt(product.stock) || 0,
      prepTime: product.prepTime || '15 mins',
      description: product.description || '',
      image: product.image || getCategoryFallbackImage(product.category),
      vendorId: currentUser?.role === 'vendor' ? currentUser.id : product.vendorId
    };

    if (currentUser?.isDemo || offlineMode) {
      const newProd = {
        ...payload,
        id: `demo-p${Date.now()}`,
        uuid: `demo-p${Date.now()}`,
        status: (payload.stock > 10) ? 'In Stock' : (payload.stock > 0 ? 'Low Stock' : 'Out of Stock'),
        vendorName: currentUser?.shop_name || currentUser?.shopName || currentUser?.name || 'Local Seller'
      };
      setProducts(prev => [newProd, ...prev]);
      addNotification(`New product added: ${product.name}`, 'system');
      return { success: true, data: newProd };
    }

    try {
      const res = await api.post('/products', payload);
      if (res.data?.success) {
        // Refresh products list
        const pRes = await api.get('/products');
        if (pRes.data?.success) setProducts(pRes.data.data);
        addNotification(`New product added: ${product.name}`, 'system');
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data?.message || 'Failed to add product' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to add product.";
      console.error(err);
      addNotification(msg, "error");
      return { success: false, message: msg };
    }
  };
  
  const updateProduct = async (id, updatedFields) => {
    // Optimistic UI update
    setProducts(prev => prev.map(p => {
      if (p.id === id || p.uuid === id) {
        const updated = { ...p, ...updatedFields };
        if (updated.stock !== undefined) {
          const numStock = Number(updated.stock);
          updated.stock = isNaN(numStock) ? 0 : numStock;
          updated.status = (updated.stock > 10) ? 'In Stock' : (updated.stock > 0 ? 'Low Stock' : 'Out of Stock');
        }
        return updated;
      }
      return p;
    }));

    if (currentUser?.isDemo || offlineMode) {
      addNotification(`Product updated successfully.`, 'system');
      return { success: true };
    }

    try {
      const res = await api.put(`/products/${id}`, updatedFields);
      if (res.data?.success) {
        // Refresh products list to ensure consistency with backend calculated fields
        const pRes = await api.get('/products');
        if (pRes.data?.success) setProducts(pRes.data.data);
        addNotification(`Product updated successfully.`, 'system');
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data?.message || 'Failed to update product' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update product.";
      console.error(err);
      addNotification(msg, "error");
      // Revert optimistic update by refreshing from server
      api.get('/products').then(res => { if (res.data?.success) setProducts(res.data.data); }).catch(() => {});
      return { success: false, message: msg };
    }
  };
  
  const deleteProduct = async (id) => {
    // Optimistic delete
    setProducts(prev => prev.filter(p => p.id !== id && p.uuid !== id));

    if (currentUser?.isDemo || offlineMode) {
      addNotification(`Product deleted successfully.`, 'system');
      return { success: true };
    }

    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        addNotification(`Product deleted successfully.`, 'system');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Failed to delete product' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete product.";
      console.error("Error deleting product:", err);
      addNotification(msg, "error");
      // Revert optimistic delete by refreshing from server
      api.get('/products').then(res => { if (res.data?.success) setProducts(res.data.data); }).catch(() => {});
      return { success: false, message: msg };
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem('micrologi_currentUser');
    localStorage.removeItem('micrologi_cart');
    addNotification('Logged out successfully.', 'system');
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
      currentUser, setCurrentUser, authLoading, logout,
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
