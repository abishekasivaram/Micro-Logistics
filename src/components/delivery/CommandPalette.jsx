import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, Package, Store, Navigation, Truck, 
  FileText, Bell, User, HelpCircle, Moon, Sun, PhoneCall, Check, ArrowRight
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import './CommandPalette.css';

const COMMAND_ITEMS = [
  { id: 'nav-dash', title: 'Dashboard', category: 'Navigation', path: '/delivery', icon: LayoutDashboard },
  { id: 'nav-deliv', title: 'My Deliveries', category: 'Navigation', path: '/delivery/deliveries', icon: Package },
  { id: 'nav-pickup', title: 'Pickup Routine', category: 'Navigation', path: '/delivery/pickup', icon: Store },
  { id: 'nav-route', title: 'Delivery Route & Map', category: 'Navigation', path: '/delivery/route', icon: Navigation },
  { id: 'nav-status', title: 'Update Delivery Status', category: 'Navigation', path: '/delivery/status', icon: Truck },
  { id: 'nav-hist', title: 'Delivery History', category: 'Navigation', path: '/delivery/history', icon: FileText },
  { id: 'nav-notif', title: 'Notifications Center', category: 'Navigation', path: '/delivery/notifications', icon: Bell },
  { id: 'nav-prof', title: 'Fleet Profile & Vehicle', category: 'Navigation', path: '/delivery/profile', icon: User },
  { id: 'nav-help', title: 'Help & Dispatch Support', category: 'Navigation', path: '/delivery/help', icon: HelpCircle },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, updateAgentAvailability, orders, setSelectedOrderForDrawer } = useDelivery();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable items
  const dynamicActionItems = [
    {
      id: 'act-avail',
      title: 'Set Status: Available (Ready for Batches)',
      category: 'Actions',
      icon: Check,
      action: () => updateAgentAvailability('Available')
    },
    {
      id: 'act-break',
      title: 'Set Status: On Break',
      category: 'Actions',
      icon: Check,
      action: () => updateAgentAvailability('On Break')
    },
    {
      id: 'act-theme',
      title: `Toggle Theme (Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode)`,
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },
    {
      id: 'act-call',
      title: 'Call Central Dispatch Hotline (1800-DELIVERY)',
      category: 'Support',
      icon: PhoneCall,
      action: () => { window.location.href = 'tel:+918000000000'; }
    }
  ];

  // Include active orders in search
  const orderItems = (orders || []).map(o => ({
    id: `ord-${o.id}`,
    title: `Order ${o.orderCode || o.id} • ${o.customerName} (${o.status})`,
    category: 'Active Orders',
    icon: Package,
    action: () => {
      setSelectedOrderForDrawer(o);
      navigate('/delivery/deliveries');
    }
  }));

  const allItems = [...COMMAND_ITEMS, ...dynamicActionItems, ...orderItems];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 10)
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item) => {
    onClose();
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Menu">
      <div className="cmd-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="cmd-search-header">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-search-input"
            placeholder="Type a command, page, order ID, or customer..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="cmd-esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        <div className="cmd-list">
          {filteredItems.length === 0 ? (
            <div className="cmd-empty">No results found for "{query}"</div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="cmd-item-info">
                    <span className="cmd-item-title">{item.title}</span>
                    <span className="cmd-item-category">{item.category}</span>
                  </div>
                  <ArrowRight size={14} className="cmd-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="cmd-footer">
          <div className="cmd-hint">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
