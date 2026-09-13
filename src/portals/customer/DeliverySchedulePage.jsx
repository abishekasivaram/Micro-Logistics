import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { deliverySlots } from '../../data/sampleData';
import { Calendar, Clock, MapPin, Store, Edit2, CheckCircle, Info, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import './DeliverySchedulePage.css';

const DeliverySchedulePage = () => {
  const { orders, currentUser, requestDeliverySlotChange } = useAppContext();

  const customerOrders = orders.filter(o => o.customerId === currentUser?.id || o.customerName === currentUser?.name || currentUser?.role === 'admin' || currentUser?.role === 'vendor');
  const upcomingOrders = customerOrders.filter(o => (o.orderStatus || o.status) !== 'DELIVERED' && (o.orderStatus || o.status) !== 'CANCELLED');

  const [slotChangeOrder, setSlotChangeOrder] = useState(null);
  const [selectedNewSlot, setSelectedNewSlot] = useState(deliverySlots[0]);
  const [showConfirmationToast, setShowConfirmationToast] = useState(false);

  const handleRequestChangeSubmit = (e) => {
    e.preventDefault();
    if (!slotChangeOrder) return;

    requestDeliverySlotChange(slotChangeOrder.id || slotChangeOrder.orderId, selectedNewSlot);
    setSlotChangeOrder(null);
    setShowConfirmationToast(true);
    setTimeout(() => setShowConfirmationToast(false), 4000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Delivery Schedule & Windows</h2>
          <p>View upcoming scheduled delivery runs and request time slot adjustments.</p>
        </div>
      </div>

      {showConfirmationToast && (
        <div className="schedule-toast">
          <CheckCircle size={18} />
          <span>Delivery slot change request submitted successfully!</span>
        </div>
      )}

      <div className="schedule-container">
        {upcomingOrders.length === 0 ? (
          <div className="empty-schedule-card card">
            <Calendar size={48} className="text-secondary" />
            <h3>No Upcoming Scheduled Deliveries</h3>
            <p>Your delivered orders are completed. Place a new order to schedule a delivery window.</p>
          </div>
        ) : (
          <div className="schedule-list">
            {upcomingOrders.map(order => (
              <div key={order.id} className="schedule-item-card">
                <div className="schedule-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="schedule-icon-wrap">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>Order {order.id || order.orderId}</h3>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        <Store size={12} /> {order.vendorName || 'Local Seller'}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={order.orderStatus || order.status} />
                </div>

                <div className="schedule-card-middle">
                  <div className="s-detail">
                    <Calendar size={16} className="text-secondary" />
                    <div>
                      <span className="s-label">Scheduled Date</span>
                      <strong>{order.deliveryDate || new Date(order.date).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  <div className="s-detail">
                    <Clock size={16} className="text-secondary" />
                    <div>
                      <span className="s-label">Time Window</span>
                      <strong className="text-primary">{order.deliveryTimeSlot || '9:00 AM – 1:00 PM'}</strong>
                    </div>
                  </div>

                  <div className="s-detail">
                    <MapPin size={16} className="text-secondary" />
                    <div>
                      <span className="s-label">Delivery Hub</span>
                      <span>{order.deliveryLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-card-bottom">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    * Slot changes allowed up to seller packaging completion.
                  </span>
                  <button 
                    className="btn btn-outline flex items-center gap-1"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => {
                      setSlotChangeOrder(order);
                      setSelectedNewSlot(order.deliveryTimeSlot || deliverySlots[0]);
                    }}
                  >
                    <Edit2 size={14} /> Request Slot Change
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mock Slot Change Modal */}
      {slotChangeOrder && (
        <div 
          className="modal-backdrop" 
          onClick={() => setSlotChangeOrder(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-modal-title"
        >
          <div className="slot-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="reschedule-modal-title">Request Delivery Slot Change</h3>
              <button className="close-btn" aria-label="Close dialog" onClick={() => setSlotChangeOrder(null)}><X size={20} /></button>
            </div>

            <form onSubmit={handleRequestChangeSubmit} className="slot-modal-body">
              <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
                Modifying delivery window for Order <strong>{slotChangeOrder.id || slotChangeOrder.orderId}</strong> from <strong>{slotChangeOrder.vendorName}</strong>.
              </p>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label htmlFor="reschedule-slot-select">Select New Time Window *</label>
                <select 
                  id="reschedule-slot-select"
                  className="form-control"
                  value={selectedNewSlot}
                  onChange={e => setSelectedNewSlot(e.target.value)}
                >
                  {deliverySlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="aggregation-info-note">
                <Info size={16} />
                <span>The system will adjust the delivery run grouping to align with your updated slot window.</span>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px', padding: 0, background: 'none', border: 'none' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSlotChangeOrder(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm New Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySchedulePage;
