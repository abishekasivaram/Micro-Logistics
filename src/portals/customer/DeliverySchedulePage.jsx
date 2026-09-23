import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { deliverySlots } from '../../utils/deliveryConstants';
import { Calendar, Clock, MapPin, Store, Edit2, CheckCircle, Info, X, Sparkles } from 'lucide-react';
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
    <div className="customer-schedule-page page-container">
      <div className="schedule-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Delivery Schedule & Windows</h2>
          <p>View upcoming scheduled deliveries and request time slot adjustments.</p>
        </div>
      </div>

      {showConfirmationToast && (
        <div className="schedule-toast">
          <CheckCircle size={20} />
          <span>Delivery slot change request submitted successfully!</span>
        </div>
      )}

      <div className="schedule-container">
        {upcomingOrders.length === 0 ? (
          <div className="empty-schedule-card">
            <Calendar size={56} color="#94a3b8" style={{ opacity: 0.5 }} />
            <h3>No Upcoming Scheduled Deliveries</h3>
            <p>Your delivered orders are completed. Place a new order to schedule a delivery window.</p>
          </div>
        ) : (
          <div className="schedule-list">
            {upcomingOrders.map(order => (
              <div key={order.id} className="schedule-item-card">
                <div className="schedule-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="schedule-icon-wrap">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>Order {order.id || order.orderId}</h3>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={14} /> {order.vendorName || 'Local Seller'}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={order.orderStatus || order.status} />
                </div>

                <div className="schedule-card-middle">
                  <div className="s-detail">
                    <Calendar size={20} color="#64748b" />
                    <div>
                      <span className="s-label">Scheduled Date</span>
                      <strong>{order.deliveryDate || new Date(order.date).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  <div className="s-detail">
                    <Clock size={20} color="#64748b" />
                    <div>
                      <span className="s-label">Time Window</span>
                      <strong style={{ color: '#4f46e5' }}>{order.deliveryTimeSlot || '9:00 AM – 1:00 PM'}</strong>
                    </div>
                  </div>

                  <div className="s-detail">
                    <MapPin size={20} color="#64748b" />
                    <div>
                      <span className="s-label">Delivery Destination</span>
                      <span>{order.deliveryLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-card-bottom">
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} /> Slot changes allowed up to seller packaging completion.
                  </span>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '14px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setSlotChangeOrder(order);
                      setSelectedNewSlot(order.deliveryTimeSlot || deliverySlots[0]);
                    }}
                  >
                    <Edit2 size={16} /> Request Slot Change
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {slotChangeOrder && (
        <div
          className="modal-backdrop"
          onClick={() => setSlotChangeOrder(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-modal-title"
        >
          <div className="slot-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: 0, border: 'none', marginBottom: '24px' }}>
              <h3 id="reschedule-modal-title" style={{ fontSize: '20px', margin: 0, color: '#0f172a' }}>Request Slot Change</h3>
              <button className="close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} aria-label="Close dialog" onClick={() => setSlotChangeOrder(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRequestChangeSubmit} className="slot-modal-body">
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                Modifying delivery window for Order <strong style={{ color: '#0f172a' }}>{slotChangeOrder.id || slotChangeOrder.orderId}</strong> from <strong style={{ color: '#0f172a' }}>{slotChangeOrder.vendorName}</strong>.
              </p>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label htmlFor="reschedule-slot-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Select New Time Window *</label>
                <select
                  id="reschedule-slot-select"
                  className="form-control"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                  value={selectedNewSlot}
                  onChange={e => setSelectedNewSlot(e.target.value)}
                >
                  {deliverySlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="aggregation-info-note">
                <Sparkles size={20} />
                <span>The system will adjust the smart delivery grouping route to seamlessly align with your updated slot window.</span>
              </div>

              <div className="modal-footer" style={{ marginTop: '24px', padding: 0, background: 'none', border: 'none', display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => setSlotChangeOrder(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>Confirm New Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySchedulePage;
