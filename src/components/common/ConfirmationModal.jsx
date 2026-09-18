import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, LogOut, Ban, PowerOff, X } from 'lucide-react';
import './ConfirmationModal.css';

/**
 * Enterprise Confirmation & Warning Modal
 * Professional UI for critical actions: Logout, Suspend, Set Offline, etc.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  subjectName = '',
  subjectInfo = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  badgeText = 'CRITICAL ACTION',
  icon: CustomIcon = null,
  isLoading = false
}) => {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('admin-modal-open');
    } else {
      document.body.classList.remove('admin-modal-open');
    }
    return () => document.body.classList.remove('admin-modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  // Render appropriate default icon if no custom icon passed
  const renderIcon = () => {
    if (CustomIcon) return <CustomIcon size={22} />;
    if (variant === 'danger') return <Ban size={22} />;
    if (variant === 'warning') return <AlertTriangle size={22} />;
    return <AlertCircle size={22} />;
  };

  return createPortal(
    <div 
      className="confirm-modal-backdrop" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="confirm-modal-title"
    >
      <div 
        className="confirm-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Ribbon */}
        <div className={`confirm-modal-ribbon variant-${variant}`} />

        {/* Header */}
        <div className="confirm-modal-header">
          <div className="confirm-icon-and-badge">
            <div className={`confirm-icon-squircle variant-${variant}`}>
              {renderIcon()}
            </div>
            {badgeText && (
              <span className={`confirm-badge-tag variant-${variant}`}>
                {badgeText}
              </span>
            )}
          </div>

          <button 
            type="button" 
            className="confirm-close-btn" 
            onClick={onClose} 
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="confirm-modal-body">
          <h3 id="confirm-modal-title" className="confirm-modal-title">
            {title}
          </h3>
          <p className="confirm-modal-message">
            {message}
          </p>

          {/* Optional Subject Info Box (e.g. Agent/Seller/Customer Name) */}
          {subjectName && (
            <div className={`confirm-subject-callout variant-${variant}`}>
              <div style={{ flex: 1 }}>
                <div className="confirm-subject-text">{subjectName}</div>
                {subjectInfo && (
                  <div className="confirm-subject-subtext">{subjectInfo}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="confirm-modal-footer">
          <button 
            type="button" 
            className="confirm-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          
          <button 
            type="button" 
            className={`confirm-btn-action variant-${variant}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
