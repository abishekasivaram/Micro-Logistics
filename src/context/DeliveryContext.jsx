import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import api from '../services/api';
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
    const agentUname = currentUser?.username || currentUser?.legacy_id || 'da1';
    const agentDisplay = currentUser?.name || `${agentUname.toUpperCase()} (Fleet Captain)`;
    try {
      const saved = localStorage.getItem('micrologi_agent_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!currentUser || parsed.agentId === agentUname || parsed.username === agentUname) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      ...INITIAL_DELIVERY_AGENT,
      id: agentUname,
      agentId: agentUname,
      agentCode: `#FL-${agentUname.toUpperCase()}`,
      username: agentUname,
      name: agentDisplay,
      phone: currentUser?.phone || INITIAL_DELIVERY_AGENT.phone,
      availability: currentUser?.availability || 'Available'
    };
  });

  useEffect(() => {
    if (currentUser) {
      const agentUname = currentUser.username || currentUser.legacy_id || currentUser.id?.slice(0, 4) || 'da1';
      const agentDisplay = currentUser.name || `${agentUname.toUpperCase()} (Fleet Captain)`;
      setAgentProfile(prev => ({
        ...prev,
        id: agentUname,
        agentId: agentUname,
        agentCode: `#FL-${agentUname.toUpperCase()}`,
        username: agentUname,
        name: agentDisplay,
        phone: currentUser.phone || prev.phone,
        availability: currentUser.availability || prev.availability || 'Available'
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

  // 3. Online / Fleet Dispatch Connection Status
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // 4. Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState(null);

  // 5. Live Active Batch & Orders Resolution
  const [simulationMode, setSimulationMode] = useState(false);
  const [overrideActiveBatch, setActiveBatch] = useState(null);
  const [overrideOrders, setOrders] = useState(null);
  const [hasBatchOverride, setHasBatch] = useState(null);
  const [timeline, setTimeline] = useState(INITIAL_TODAY_TIMELINE);
  const [historyOrders, setHistoryOrders] = useState(INITIAL_HISTORICAL_ORDERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const liveAssignedBatch = useMemo(() => {
    if (currentUser?.isDemo) return null;

    const userId = currentUser?.id;
    const legacyId = currentUser?.legacy_id;
    const username = currentUser?.username;
    
    // Search in deliveryBatches where agentId or agentName matches this driver and status is not COMPLETED
    const found = deliveryBatches.find(b => {
      const isAssigned = (
        b.agentId === userId || 
        b.agentId === legacyId || 
        b.agent_id === userId ||
        (username && (b.agentName === username || b.agentId === username))
      );
      const isNotDone = (b.status !== 'COMPLETED' && b.status !== 'Completed');
      return isAssigned && isNotDone;
    });

    if (found) return found;

    if (currentUser?.role === 'admin') {
      return deliveryBatches.find(
        b => b.status !== 'COMPLETED' && b.status !== 'Completed'
      ) || null;
    }

    return null;
  }, [deliveryBatches, currentUser]);

  const hasLiveBatch = !!liveAssignedBatch;
   

  const liveBatchOrders = useMemo(() => {
    if (!liveAssignedBatch) return [];

    const batchCode =
      liveAssignedBatch.batchCode ||
      liveAssignedBatch.batchId ||
      liveAssignedBatch.id;

    const batchDbId = liveAssignedBatch.id;
    const orderIds = liveAssignedBatch.orderIds || [];

    const matched = allAppOrders.filter(o => {
      if (batchDbId && (o.batch_id === batchDbId || o.batchId === batchDbId)) {
        return true;
      }

      if (batchCode && (o.batchId === batchCode || o.batch_id === batchCode)) {
        return true;
      }

      return (
        orderIds.includes(o.id) ||
        orderIds.includes(o.orderId) ||
        orderIds.includes(o.orderCode)
      );
    });

    return matched.map(o => {
      const orderSt = (
        o.order_status || o.orderStatus || o.status || 'PLACED'
      ).toUpperCase();

      const delivSt = (
        o.delivery_status || o.deliveryStatus || ''
      ).toUpperCase();

      let mappedUiStatus = 'ASSIGNED';

      if (orderSt === 'DELIVERED') {
        mappedUiStatus = 'DELIVERED';
      } else if (orderSt === 'OUT_FOR_DELIVERY') {
        mappedUiStatus = 'OUT_FOR_DELIVERY';
      } else if (delivSt === 'PICKED_UP' || delivSt.includes('PICKED')) {
        mappedUiStatus = 'PICKED_UP';
      }

      const vendorHandoverConfirmed =
        delivSt === 'PICKED_UP' ||
        delivSt.includes('PICKED') ||
        orderSt === 'OUT_FOR_DELIVERY' ||
        orderSt === 'DELIVERED';

      return {
        id: o.id || o.orderCode || o.orderId,
        orderCode: o.orderCode || o.id || o.orderId,
        status: mappedUiStatus,
        rawOrderStatus: orderSt,
        rawDeliveryStatus: delivSt,
        vendorHandoverConfirmed,
        customerName:
          o.customerName || o.customer?.profile?.username || 'Customer',
        customerPhone:
          o.customerPhone || o.customer?.profile?.phone || '+91 98402 33441',
        address: o.deliveryLocation || o.deliveryAddress || 'Chennai',
        pickupLocation:
          o.pickupLocation || o.pickup_location || 'Merchant Hub, Chennai',
        vendorName: o.vendorName || o.vendor?.shop_name || 'Partner Merchant',
        vendorId: o.vendorId || o.vendor_id,
        items: o.items || [],
        total: Number(o.total || 0),
        codAmount:
          o.paymentMethod === 'COD' ? Number(o.total || 0) : 0,
        timeSlot: o.deliveryTimeSlot || o.deliverySlot || '9:00 AM – 1:00 PM',
        notes: o.notes || 'Please verify 4-digit PIN with recipient'
      };
    });
  }, [liveAssignedBatch, allAppOrders]);

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
          barcode: `HUB-${Math.abs(
            vKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 90000 + 10000
          )}`,
          parcels: 0,
          orders: [],
          itemsList: [],
          status: 'PENDING'
        };
      }

      hubsMap[vKey].parcels += 1;
      hubsMap[vKey].orders.push(ord);

      const orderItems = ord.items?.length
        ? ord.items.map(it => ({
            id: `${ord.id}-${it.productId || it.name || 'item'}`,
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
      const allOrdersHandedOver =
        hub.orders.every(o => o.vendorHandoverConfirmed);

      const allOrdersInTransitOrDelivered =
        hub.orders.every(o =>
          ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status)
        );

      let hubStatus = 'PENDING';

      if (allOrdersInTransitOrDelivered) {
        hubStatus = 'COLLECTED';
      } else if (allOrdersHandedOver) {
        hubStatus = 'READY_FOR_COLLECTION';
      }

      return {
        ...hub,
        allOrdersHandedOver,
        status: hubStatus
      };
    });
  }, [liveBatchOrders]);

   
  const hasBatch = hasBatchOverride !== null ? hasBatchOverride : (simulationMode ? true : hasLiveBatch);

  // Active batch object exposed to delivery portal
  const activeBatch = useMemo(() => {
    if (overrideActiveBatch) return overrideActiveBatch;
    if (!hasLiveBatch && (currentUser?.isDemo || simulationMode)) {
      return INITIAL_ACTIVE_BATCH;
    }
    if (!liveAssignedBatch) return null;

    const bCode = liveAssignedBatch.batchCode || liveAssignedBatch.batchId || liveAssignedBatch.id;
    const rawBatchStatus = String(liveAssignedBatch.rawStatus || liveAssignedBatch.status || 'ASSIGNED')
      .toUpperCase()
      .replace(/[\s\-]+/g, '_');

    // Map DB status to UI status
    let uiStatus = 'ASSIGNED';
    if (rawBatchStatus === 'PICKUP_IN_PROGRESS' || rawBatchStatus === 'PICKED_UP') {
      uiStatus = 'PICKUP_IN_PROGRESS';
    } else if (rawBatchStatus === 'OUT_FOR_DELIVERY') {
      uiStatus = 'OUT_FOR_DELIVERY';
    } else if (rawBatchStatus === 'COMPLETED' || rawBatchStatus === 'DELIVERED') {
      uiStatus = 'COMPLETED';
    } else if (rawBatchStatus === 'PENDING_ASSIGNMENT') {
      uiStatus = 'PENDING_ASSIGNMENT';
    } else {
      uiStatus = 'ASSIGNED';
    }

    // Auto-advance if all orders in batch are already in transit or delivered
    if (liveBatchOrders.length > 0) {
      const allDelivered = liveBatchOrders.every(o => o.status === 'DELIVERED');
      const allOutOrDelivered = liveBatchOrders.every(o => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status));
      if (allDelivered) {
        uiStatus = 'COMPLETED';
      } else if (allOutOrDelivered && uiStatus === 'ASSIGNED') {
        uiStatus = 'OUT_FOR_DELIVERY';
      }
    }

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

  const orders = overrideOrders || activeBatch?.orders || (simulationMode ? INITIAL_ACTIVE_BATCH.orders : []);

  // 8. Fetch Real Backend Delivery Data
  const refreshDeliveryData = useCallback(async () => {
    if (currentUser?.isDemo) {
      setHistoryOrders(INITIAL_HISTORICAL_ORDERS);
      return;
    }

    try {
      setIsLoading(true);
      setDeliveryError(null);

      const res = await api.get('/delivery/batches');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const completedBatches = res.data.data.filter(
          b => b.rawStatus === 'COMPLETED' || b.status === 'Completed'
        );
        const historical = completedBatches.flatMap(b => b.orders || []);
        if (historical.length > 0) {
          setHistoryOrders(historical);
        }
      }

      const agentId = currentUser?.id;
      if (agentId) {
        try {
          const agentRes = await api.get(`/delivery/agents/${agentId}`);
          if (agentRes.data?.success && agentRes.data.data) {
            setAgentProfile(prev => ({
              ...prev,
              ...agentRes.data.data,
              name: agentRes.data.data.name || prev.name,
              phone: agentRes.data.data.phone || prev.phone,
              availability: agentRes.data.data.availability || prev.availability
            }));
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to fetch real delivery data:', err);
      setDeliveryError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshDeliveryData();
  }, [refreshDeliveryData]);

  // Update Agent Availability with backend synchronization
  const updateAgentAvailability = async (newStatus) => {
    setAgentProfile(prev => ({ ...prev, availability: newStatus }));
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, availability: newStatus }));
    }

    if (!currentUser?.isDemo && currentUser?.id) {
      try {
        await api.put(`/delivery/agents/${currentUser.id}`, { availability: newStatus });
      } catch (err) {
        console.warn('Agent availability remote sync failed:', err);
      }
    }

    addToast(`Availability updated to "${newStatus}"`, 'info');
  };

  const updateProfileFields = async (fields) => {
    setAgentProfile(prev => ({ ...prev, ...fields }));
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, ...fields }));
    }

    if (!currentUser?.isDemo && currentUser?.id) {
      try {
        await api.put(`/delivery/agents/${currentUser.id}`, fields);
      } catch (err) {
        console.warn('Agent profile remote sync failed:', err);
      }
    }

    addToast('Profile changes saved successfully', 'success');
  };

  // 9. Update Batch Status (e.g. PICKUP_IN_PROGRESS, OUT_FOR_DELIVERY)
  const updateBatchStatus = async (newStatus) => {
    if (!activeBatch) return;

    if (!currentUser?.isDemo) {
      try {
        const batchTargetId = activeBatch.uuid || activeBatch.id;
        const res = await api.patch(`/delivery/batches/${batchTargetId}/status`, { status: newStatus });
        addToast(`Batch status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
        await refreshDeliveryData();
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to update batch status';
        addToast(msg, 'danger');
        throw new Error(msg);
      }
    } else {
      setActiveBatch(prev => ({ ...prev, rawStatus: newStatus, status: newStatus }));
      addToast(`Batch status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
    }
  };

  // 10. Order Status Update Workflow (with strict OTP verification for DELIVERED)
  const [previousStates, setPreviousStates] = useState({});

  const updateOrderStatus = async (orderId, newStatus, details = {}) => {
    const targetOrder = (orders || []).find(o => o.id === orderId || o.uuid === orderId || o.orderCode === orderId);
    if (!targetOrder) {
      throw new Error(`Order ${orderId} not found in active batch`);
    }

    const previousStatus = targetOrder.status;
    setPreviousStates(prev => ({ ...prev, [orderId]: previousStatus }));
    if (
  newStatus === 'OUT_FOR_DELIVERY' &&
  !targetOrder.vendorHandoverConfirmed
) {
  const handoverError = new Error(
    `Cannot start transit: Vendor handover has not been confirmed for ${targetOrder.orderCode || orderId} yet.`
  );
  addToast(handoverError.message, 'danger');
  throw handoverError;
}

    // Rule: Delivery verification strictly requires valid customer OTP
    if (newStatus === 'DELIVERED') {
      const cleanOtp = String(details.otp || '').trim();
      if (cleanOtp.length !== 4) {
        const otpErr = new Error('Valid 4-digit customer doorstep OTP is strictly required.');
        addToast(otpErr.message, 'danger');
        throw otpErr;
      }

      if (!currentUser?.isDemo) {
        try {
          const res = await api.post('/delivery/verify-otp', {
            orderId: targetOrder.uuid || targetOrder.id || orderId,
            otp: cleanOtp
          });

          // Optimistically update order to delivered
          setOrders(prev => prev.map(o => {
            if (o.id === orderId || o.uuid === orderId || o.orderCode === orderId) {
              return {
                ...o,
                status: 'DELIVERED',
                rawDeliveryStatus: 'DELIVERED',
                deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                otpVerified: true,
                podNotes: details.notes || o.podNotes
              };
            }
            return o;
          }));

          // Add to timeline
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setTimeline(prev => [
            {
              id: `t-${Date.now()}`,
              time: nowTime,
              title: `Order DELIVERED (${orderId})`,
              desc: `OTP verified at doorstep for ${targetOrder.customerName}`,
              type: 'success',
              badge: 'Delivered'
            },
            ...prev
          ]);

          addToast(`Order ${orderId} verified and delivered!`, 'success');

          // Refresh batches and courier status from server
          await refreshDeliveryData();
          return res.data;
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || 'OTP verification failed';
          addToast(errMsg, 'danger');
          throw new Error(errMsg);
        }
      }
    }

    // Non-delivered or Demo transitions
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.uuid === orderId || o.orderCode === orderId) {
        return {
          ...o,
          status: newStatus,
          deliveredAt: newStatus === 'DELIVERED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : o.deliveredAt,
          otpVerified: newStatus === 'DELIVERED' ? true : o.otpVerified,
          failureReason: details.failureReason || o.failureReason,
          podNotes: details.notes || o.podNotes
        };
      }
      return o;
    }));

    if (!currentUser?.isDemo && targetOrder.uuid) {
      try {
        await api.patch(`/orders/${targetOrder.uuid}/status`, { status: newStatus });
      } catch (err) {
        console.warn('Order status sync warning:', err?.message);
      }
    }

    // Add to timeline
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimeline(prev => [
      {
        id: `t-${Date.now()}`,
        time: nowTime,
        title: `Order ${newStatus.replace(/_/g, ' ')} (${orderId})`,
        desc: details.failureReason ? `Reason: ${details.failureReason}` : `Updated to ${newStatus} for ${targetOrder.customerName}`,
        type: newStatus === 'DELIVERED' ? 'success' : newStatus === 'FAILED' ? 'danger' : 'info',
        badge: newStatus === 'DELIVERED' ? 'Delivered' : newStatus === 'FAILED' ? 'Failed' : 'Status'
      },
      ...prev
    ]);

    addToast(
      `Order ${orderId} marked as ${newStatus.replace(/_/g, ' ')}`,
      newStatus === 'DELIVERED' ? 'success' : newStatus === 'FAILED' ? 'danger' : 'info'
    );
  };

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


  // 11. Order Drawer
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);

  // 12. Workflow Actions (Accept / Reject Batch, Pickup, OTP Verification)
  const acceptBatch = async (batchId) => {
    const targetId = batchId || activeBatch?.batchId || activeBatch?.id;
    if (!targetId) return;

    if (appRespondToBatchAssignment) {
      const res = await appRespondToBatchAssignment(targetId, 'ACCEPT');
      if (res?.success) {
        addToast(`Batch ${targetId} accepted! Proceed to merchant pickups.`, 'success');
      }
      return res;
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
        addToast('Assignment declined. Batch safely routed to next available courier.', 'info');
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
    }

    addToast(res?.message || 'Invalid OTP code. Please re-check with customer.', 'danger');
    return { success: false, message: res?.message || 'Invalid OTP' };
  };

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
        isLoading,
        deliveryError,
        hasBatch,
        setHasBatch,
        activeBatch,
        setActiveBatch,
        orders,
        setOrders,
        timeline,
        setTimeline,
        historyOrders,
        setHistoryOrders,
        refreshDeliveryData,
        updateBatchStatus,
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
