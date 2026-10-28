import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const { currentUser, setCurrentUser } = useAppContext();

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
      name: currentUser?.name || currentUser?.full_name || INITIAL_DELIVERY_AGENT.name,
      phone: currentUser?.phone || INITIAL_DELIVERY_AGENT.phone,
      availability: currentUser?.availability || 'Available'
    };
  });

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

  // 5. Active Batch & Orders
  const [hasBatch, setHasBatch] = useState(true);
  const [activeBatch, setActiveBatch] = useState(INITIAL_ACTIVE_BATCH);
  const [orders, setOrders] = useState(INITIAL_ACTIVE_BATCH.orders);
  const [timeline, setTimeline] = useState(INITIAL_TODAY_TIMELINE);
  const [historyOrders, setHistoryOrders] = useState(INITIAL_HISTORICAL_ORDERS);

  // 6. Notifications
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // 7. Toasts System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', undoAction = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, message, type, undoAction };
    setToasts(prev => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 8. Fetch Real Backend Delivery Data
  const refreshDeliveryData = useCallback(async () => {
    // If running in demo mode without real authentication, use demo fixtures
    if (currentUser?.isDemo) {
      setActiveBatch(INITIAL_ACTIVE_BATCH);
      setOrders(INITIAL_ACTIVE_BATCH.orders || []);
      setHasBatch(true);
      setHistoryOrders(INITIAL_HISTORICAL_ORDERS);
      return;
    }

    try {
      setIsLoading(true);
      setDeliveryError(null);

      // Fetch assigned batches for the authenticated delivery agent
      const res = await api.get('/delivery/batches');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const batchList = res.data.data;
        // Locate first active non-completed batch
        const active = batchList.find(b => b.rawStatus !== 'COMPLETED' && b.status !== 'Completed') || null;

        if (active) {
          setActiveBatch(active);
          setOrders(active.orders || []);
          setHasBatch(true);
        } else {
          setActiveBatch(null);
          setOrders([]);
          setHasBatch(false);
        }

        // Completed batches become historical orders
        const completedBatches = batchList.filter(b => b.rawStatus === 'COMPLETED' || b.status === 'Completed');
        const historical = completedBatches.flatMap(b => b.orders || []);
        if (historical.length > 0) {
          setHistoryOrders(historical);
        }
      }

      // Refresh agent profile details from backend if agent ID is known
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
        } catch (agErr) {
          // Agent details fetch warning ignored if endpoint restricted
        }
      }
    } catch (err) {
      console.warn('Failed to fetch real delivery data, falling back to cached state:', err);
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

  // 12. Command Palette
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

