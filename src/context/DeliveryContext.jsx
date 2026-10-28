import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAppContext } from './AppContext';
import {
  INITIAL_DELIVERY_AGENT,
  INITIAL_DASHBOARD_STATS,
  INITIAL_ACTIVE_BATCH,
  INITIAL_TODAY_TIMELINE,
  INITIAL_SHIFT_SUMMARY,
  INITIAL_HISTORICAL_ORDERS,
  INITIAL_NOTIFICATIONS
} from '../lib/deliveryData';

const DeliveryContext = createContext();

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

export const DeliveryProvider = ({ children }) => {
  const { 
    currentUser, setCurrentUser, 
    deliveryBatches = [], orders: allAppOrders = [], 
    updateOrderStatus: appUpdateOrderStatus, 
    updateBatchStatus: appUpdateBatchStatus,
    respondToBatchAssignment: appRespondToBatchAssignment,
    verifyDeliveryOtp: appVerifyDeliveryOtp,
    vendors = []
  } = useAppContext();

  // 1. Theme State (Light / Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('micrologi_theme');
      if (saved) return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('micrologi_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toasts System
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (message, type = 'success', undoAction = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, message, type, undoAction };
    setToasts(prev => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  // 2. Agent Profile & Availability
  const [agentProfile, setAgentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('micrologi_agent_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      ...INITIAL_DELIVERY_AGENT,
      name: currentUser?.name || INITIAL_DELIVERY_AGENT.name,
      phone: currentUser?.phone || INITIAL_DELIVERY_AGENT.phone,
      availability: currentUser?.availability || 'Available'
    };
  });

  useEffect(() => {
    if (currentUser?.name) {
      setAgentProfile(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        agentId: currentUser.legacy_id || currentUser.id || prev.agentId,
        availability: currentUser.availability || prev.availability
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('micrologi_agent_profile', JSON.stringify(agentProfile));
    } catch (e) {
      console.error(e);
    }
  }, [agentProfile]);

  const updateAgentAvailability = (newStatus) => {
    setAgentProfile(prev => ({ ...prev, availability: newStatus }));
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, availability: newStatus }));
    }
    addToast(`Availability updated to "${newStatus}"`, 'info');
  };

  const updateProfileFields = (fields) => {
    setAgentProfile(prev => ({ ...prev, ...fields }));
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, ...fields }));
    }
    addToast('Profile changes saved successfully', 'success');
  };

  // 3. Online / Fleet Dispatch Connection Status
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // 4. Live Active Batch & Orders Resolution
  const [simulationMode, setSimulationMode] = useState(false);

  // Find assigned active batch for this courier from AppContext
  const liveAssignedBatch = useMemo(() => {
    if (currentUser?.isDemo) return null;
    const userId = currentUser?.id;
    const legacyId = currentUser?.legacy_id;
    
    // Search in deliveryBatches where agentId matches this driver and status is not COMPLETED
    const found = deliveryBatches.find(b => {
      const isAssigned = (b.agentId === userId || b.agentId === legacyId || b.agent_id === userId);
      const isNotDone = (b.status !== 'COMPLETED' && b.status !== 'Completed');
      return isAssigned && isNotDone;
    });

    if (found) return found;

    // If admin view, return first active batch
    if (currentUser?.role === 'admin') {
      return deliveryBatches.find(b => b.status !== 'COMPLETED' && b.status !== 'Completed') || null;
    }

    return null;
  }, [deliveryBatches, currentUser]);

  const hasLiveBatch = !!liveAssignedBatch;
  const hasBatch = simulationMode ? true : hasLiveBatch;

  // Resolve orders belonging to the active batch
  const liveBatchOrders = useMemo(() => {
    if (!liveAssignedBatch) return [];

    const batchCode = liveAssignedBatch.batchCode || liveAssignedBatch.batchId || liveAssignedBatch.id;
    const batchDbId = liveAssignedBatch.id;
    const orderIds = liveAssignedBatch.orderIds || [];

    const matched = allAppOrders.filter(o => {
      if (batchDbId && (o.batch_id === batchDbId || o.batchId === batchDbId)) return true;
      if (batchCode && (o.batchId === batchCode || o.batch_id === batchCode)) return true;
      if (orderIds.includes(o.id) || orderIds.includes(o.orderId) || orderIds.includes(o.orderCode)) return true;
      return false;
    });

    return matched.map(o => {
      const orderSt = (o.order_status || o.orderStatus || o.status || 'PLACED').toUpperCase();
      const delivSt = (o.delivery_status || o.deliveryStatus || '').toUpperCase();
      
      let mappedUiStatus = 'ASSIGNED';
      if (orderSt === 'DELIVERED') mappedUiStatus = 'DELIVERED';
      else if (orderSt === 'OUT_FOR_DELIVERY') mappedUiStatus = 'OUT_FOR_DELIVERY';
      else if (delivSt === 'PICKED_UP' || delivSt.includes('PICKED')) mappedUiStatus = 'PICKED_UP';
      else mappedUiStatus = 'ASSIGNED';

      const vendorHandoverConfirmed = (
        delivSt === 'PICKED_UP' || 
        delivSt.includes('PICKED') || 
        orderSt === 'OUT_FOR_DELIVERY' || 
        orderSt === 'DELIVERED'
      );

      return {
        id: o.id || o.orderCode || o.orderId,
        orderCode: o.orderCode || o.id || o.orderId,
        status: mappedUiStatus,
        rawOrderStatus: orderSt,
        rawDeliveryStatus: delivSt,
        vendorHandoverConfirmed,
        customerName: o.customerName || o.customer?.profile?.username || 'Customer',
        customerPhone: o.customerPhone || o.customer?.profile?.phone || '+91 98402 33441',
        address: o.deliveryLocation || o.deliveryAddress || 'Chennai',
        pickupLocation: o.pickupLocation || o.pickup_location || 'Merchant Hub, Chennai',
        vendorName: o.vendorName || o.vendor?.shop_name || 'Partner Merchant',
        vendorId: o.vendorId || o.vendor_id,
        items: o.items || [],
        total: Number(o.total || 0),
        codAmount: o.paymentMethod === 'COD' ? Number(o.total || 0) : 0,
        timeSlot: o.deliveryTimeSlot || o.deliverySlot || '9:00 AM – 1:00 PM',
        notes: o.notes || 'Please verify 4-digit PIN with recipient'
      };
    });
  }, [liveAssignedBatch, allAppOrders]);

  // Derive dynamic hubs from live batch orders
  const liveHubs = useMemo(() => {
    if (liveBatchOrders.length === 0) return [];

    const hubsMap = {};
    liveBatchOrders.forEach(ord => {
      const vKey = ord.vendorName || 'Merchant Store';
      if (!hubsMap[vKey]) {
        hubsMap[vKey] = {
          id: `hub-${vKey.replace(/\s+/g, '-').toLowerCase()}`,
          name: vKey,
          address: ord.pickupLocation || 'Commercial Complex, Chennai',
          phone: ord.vendorPhone || '+91 98401 22334',
          contact: ord.vendorPhone || '+91 98401 22334',
          barcode: `HUB-${Math.abs(vKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 90000 + 10000)}`,
          parcels: 0,
          orders: [],
          itemsList: [],
          status: 'PENDING'
        };
      }
      hubsMap[vKey].parcels += 1;
      hubsMap[vKey].orders.push(ord);
      const orderItems = (ord.items && ord.items.length > 0)
        ? ord.items.map(it => ({
            id: `${ord.id}-${it.productId || it.name || Math.random()}`,
            name: `${it.name || 'Item'} (x${it.qty || 1})`,
            orderId: ord.orderCode || ord.id
          }))
        : [{
            id: `${ord.id}-pkg`,
            name: `Parcel Cargo (${ord.orderCode || ord.id})`,
            orderId: ord.orderCode || ord.id
          }];
      hubsMap[vKey].itemsList.push(...orderItems);
    });

    return Object.values(hubsMap).map(hub => {
      const allOrdersHandedOver = hub.orders.every(o => o.vendorHandoverConfirmed);
      const allOrdersInTransitOrDelivered = hub.orders.every(o => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status));
      
      let hubStatus = 'PENDING';
      if (allOrdersInTransitOrDelivered) hubStatus = 'COLLECTED';
      else if (allOrdersHandedOver) hubStatus = 'READY_FOR_COLLECTION';

      return {
        ...hub,
        allOrdersHandedOver,
        status: hubStatus
      };
    });
  }, [liveBatchOrders]);

  // Active batch object exposed to delivery portal
  const activeBatch = useMemo(() => {
    if (!hasLiveBatch && (currentUser?.isDemo || simulationMode)) {
      return INITIAL_ACTIVE_BATCH;
    }
    if (!liveAssignedBatch) return null;

    const bCode = liveAssignedBatch.batchCode || liveAssignedBatch.batchId || liveAssignedBatch.id;
    const rawBatchStatus = (liveAssignedBatch.status || 'ASSIGNED').toUpperCase();

    // Map DB status to UI status
    let uiStatus = 'ASSIGNED';
    if (rawBatchStatus === 'PICKUP_IN_PROGRESS') uiStatus = 'PICKUP_IN_PROGRESS';
    else if (rawBatchStatus === 'OUT_FOR_DELIVERY') uiStatus = 'OUT_FOR_DELIVERY';
    else if (rawBatchStatus === 'COMPLETED') uiStatus = 'COMPLETED';

    return {
      id: liveAssignedBatch.id,
      batchId: bCode,
      status: uiStatus,
      rawStatus: rawBatchStatus,
      zone: liveAssignedBatch.deliverySlot || 'Chennai Central Zone',
      orders: liveBatchOrders,
      hubs: liveHubs,
      totalOrders: liveBatchOrders.length,
      totalDistanceKm: liveAssignedBatch.estimatedDistance || 4.2,
      estimatedTimeMins: liveAssignedBatch.estimatedTime || 35,
      deliverySlot: liveAssignedBatch.deliverySlot || '9:00 AM – 1:00 PM',
      deliveryDate: liveAssignedBatch.deliveryDate || new Date().toISOString().split('T')[0]
    };
  }, [hasLiveBatch, simulationMode, currentUser, liveAssignedBatch, liveBatchOrders, liveHubs]);

  const orders = activeBatch?.orders || (simulationMode ? INITIAL_ACTIVE_BATCH.orders : []);
  const [timeline, setTimeline] = useState(INITIAL_TODAY_TIMELINE);
  const [historyOrders, setHistoryOrders] = useState(INITIAL_HISTORICAL_ORDERS);

  // 5. Notifications
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('All notifications marked as read', 'info');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast('Notification removed', 'neutral');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast('Cleared all notifications', 'neutral');
  };

  // 6. Toasts System (declared at top)

  // 7. Workflow Actions (Accept / Reject Batch, Pickup, OTP Verification)
  const acceptBatch = async (batchId) => {
    const targetId = batchId || activeBatch?.batchId || activeBatch?.id;
    if (!targetId) return;

    if (appRespondToBatchAssignment) {
      const res = await appRespondToBatchAssignment(targetId, 'ACCEPT');
      if (res?.success) {
        addToast(`Batch ${targetId} accepted! Proceed to merchant pickups.`, 'success');
      }
    } else if (appUpdateBatchStatus) {
      await appUpdateBatchStatus(targetId, 'Pickup in Progress');
      addToast(`Batch ${targetId} accepted! Proceed to merchant pickups.`, 'success');
    }
  };

  const rejectBatch = async (batchId) => {
    const targetId = batchId || activeBatch?.batchId || activeBatch?.id;
    if (!targetId) return;

    if (appRespondToBatchAssignment) {
      const res = await appRespondToBatchAssignment(targetId, 'REJECT');
      if (res?.success) {
        addToast(`Assignment declined. Batch safely routed to next available courier.`, 'info');
      }
    }
  };

  const verifyOtp = async (orderId, otp) => {
    if (!appVerifyDeliveryOtp) {
      addToast('Verification service unavailable', 'danger');
      return { success: false, message: 'Service unavailable' };
    }

    const res = await appVerifyDeliveryOtp(orderId, otp);
    if (res?.success) {
      addToast(`Order ${orderId} OTP verified successfully! Marked as Delivered.`, 'success');
      return { success: true };
    } else {
      addToast(res?.message || 'Invalid OTP code. Please re-check with customer.', 'danger');
      return { success: false, message: res?.message || 'Invalid OTP' };
    }
  };

  const updateOrderStatus = async (orderId, newStatus, details = {}) => {
    const targetOrder = orders.find(o => o.id === orderId || o.orderCode === orderId);
    if (!targetOrder) return;

    if (newStatus === 'OUT_FOR_DELIVERY') {
      if (!targetOrder.vendorHandoverConfirmed) {
        addToast(`Cannot start transit: Vendor handover has not been confirmed for ${targetOrder.orderCode || orderId} yet.`, 'danger');
        return false;
      }
    }

    if (newStatus === 'DELIVERED') {
      if (!details.otp) {
        addToast(`Delivery completion strictly requires 4-digit customer OTP verification.`, 'danger');
        return false;
      }
      return verifyOtp(orderId, details.otp);
    }

    if (appUpdateOrderStatus) {
      await appUpdateOrderStatus(targetOrder.id || orderId, newStatus);
      addToast(`Order ${targetOrder.orderCode || orderId} marked as ${newStatus.replace(/_/g, ' ')}`, 'info');
      return true;
    }
  };


  // 8. Order Drawer & Command Palette
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DeliveryContext.Provider
      value={{
        theme,
        toggleTheme,
        agentProfile,
        updateAgentAvailability,
        updateProfileFields,
        isLiveConnected,
        setIsLiveConnected,
        hasBatch,
        setHasBatch: (val) => setSimulationMode(typeof val === 'function' ? val(simulationMode) : val),
        activeBatch,
        orders,
        timeline,
        setTimeline,
        historyOrders,
        setHistoryOrders,
        stats: INITIAL_DASHBOARD_STATS,
        shiftSummary: INITIAL_SHIFT_SUMMARY,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        updateOrderStatus,
        acceptBatch,
        rejectBatch,
        verifyOtp,
        selectedOrderForDrawer,
        setSelectedOrderForDrawer,
        isCmdOpen,
        setIsCmdOpen
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};