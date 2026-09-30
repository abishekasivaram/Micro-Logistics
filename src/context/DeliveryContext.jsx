import React, { createContext, useContext, useState, useEffect } from 'react';
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
      name: currentUser?.name || INITIAL_DELIVERY_AGENT.name,
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

  // 4. Active Batch & Orders
  const [hasBatch, setHasBatch] = useState(true); // Toggleable for empty-state preview
  const [activeBatch, setActiveBatch] = useState(INITIAL_ACTIVE_BATCH);
  const [orders, setOrders] = useState(INITIAL_ACTIVE_BATCH.orders);
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

  // 6. Toasts System (with Undo support)
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', undoAction = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, message, type, undoAction };
    setToasts(prev => [...prev.slice(-3), newToast]); // keep max 4 toasts

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 7. Order Status Update Workflow (with optimistic UI and Undo)
  const [previousStates, setPreviousStates] = useState({});

  const updateOrderStatus = (orderId, newStatus, details = {}) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const previousStatus = targetOrder.status;
    setPreviousStates(prev => ({ ...prev, [orderId]: previousStatus }));

    // Optimistically update
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          deliveredAt: newStatus === 'DELIVERED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : o.deliveredAt,
          otpVerified: details.otpVerified || o.otpVerified,
          failureReason: details.failureReason || o.failureReason,
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
        title: `Order ${newStatus.replace(/_/g, ' ')} (${orderId})`,
        desc: details.failureReason ? `Reason: ${details.failureReason}` : `Updated to ${newStatus} for ${targetOrder.customerName}`,
        type: newStatus === 'DELIVERED' ? 'success' : newStatus === 'FAILED' ? 'danger' : 'info',
        badge: newStatus === 'DELIVERED' ? 'Delivered' : newStatus === 'FAILED' ? 'Failed' : 'Status'
      },
      ...prev
    ]);

    // Provide Toast with Undo button
    addToast(
      `Order ${orderId} marked as ${newStatus.replace(/_/g, ' ')}`,
      newStatus === 'DELIVERED' ? 'success' : newStatus === 'FAILED' ? 'danger' : 'info',
      () => {
        // Undo action
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: previousStatus } : o));
        addToast(`Reverted order ${orderId} to ${previousStatus}`, 'neutral');
      }
    );
  };

  // 8. Order Drawer
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);

  // 9. Command Palette
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
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
        setHasBatch,
        activeBatch,
        setActiveBatch,
        orders,
        setOrders,
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
