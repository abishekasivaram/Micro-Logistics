import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RotateCcw } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import './ToastContainer.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useDelivery();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon-svg text-success" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-svg text-warning" />;
      case 'danger':
        return <AlertCircle size={18} className="toast-icon-svg text-danger" />;
      default:
        return <Info size={18} className="toast-icon-svg text-info" />;
    }
  };

  return (
    <div className="dl-toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`dl-toast toast-${toast.type || 'info'}`}>
          <div className="toast-content-row">
            {getIcon(toast.type)}
            <span className="toast-message">{toast.message}</span>
          </div>

          <div className="toast-actions-row">
            {toast.undoAction && (
              <button
                type="button"
                className="toast-undo-btn"
                onClick={() => {
                  toast.undoAction();
                  removeToast(toast.id);
                }}
              >
                <RotateCcw size={13} />
                <span>Undo</span>
              </button>
            )}
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
