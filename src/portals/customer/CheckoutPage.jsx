import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { deliverySlots } from '../../utils/deliveryConstants';
import { Truck, Calendar, Clock, MapPin, Phone, ShieldCheck, CheckCircle, Info, ArrowLeft, ArrowRight, Store, Sparkles } from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, currentUser, placeOrder } = useAppContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '101 Anna Nagar East, Chennai');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '9876543210');
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(deliverySlots[1]); // 9:00 AM - 1:00 PM

  const [placedOrders, setPlacedOrders] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 30.00 : 0.00;
  const total = subtotal + deliveryFee;

  // Check unique sellers in cart for UI
  const uniqueSellers = Array.from(new Set(cart.map(item => item.product.vendorName || 'Local Seller')));
  const isMultiSeller = uniqueSellers.length > 1;

  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    if (!deliveryAddress || !contactPhone || !deliveryDate || !selectedTimeSlot) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const created = placeOrder({
        deliveryAddress,
        contactPhone,
        deliveryDate,
        deliveryTimeSlot: selectedTimeSlot
      });
      setIsSubmitting(false);
      setPlacedOrders(created);
    }, 600);
  };

  return (
    <div className="customer-checkout-page page-container">
      <div className="checkout-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Checkout</h2>
          <p>Configure delivery address & window to complete your local purchase.</p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }} onClick={() => navigate('/cart')}>
          <ArrowLeft size={16} /> Back to Cart
        </button>
      </div>

      {!placedOrders ? (
        <div>
          {cart.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', color: '#92400e', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={20} />
                <span>Your cart is empty. Please add items from local sellers before checking out.</span>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/browse-sellers')}>
                Browse Sellers
              </button>
            </div>
          )}

          <div className="checkout-grid">
            <form onSubmit={handlePlaceOrderSubmit} className="checkout-form-column">
              
              {/* Delivery Address & Contact Section */}
              <div className="checkout-card">
                <h3 className="card-title"><MapPin size={20} color="#4f46e5" /> Delivery Destination</h3>
                
                <div className="form-group">
                  <label htmlFor="chk-address">Delivery Address *</label>
                  <input 
                    type="text" 
                    id="chk-address"
                    className="form-control" 
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-phone">Contact Number *</label>
                  <input 
                    type="tel" 
                    id="chk-phone"
                    className="form-control" 
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {/* Delivery Date & Time Window Selector */}
              <div className="checkout-card">
                <h3 className="card-title"><Calendar size={20} color="#4f46e5" /> Delivery Schedule</h3>
                
                <div className="form-group">
                  <label htmlFor="chk-delivery-date">Select Delivery Date *</label>
                  <input 
                    type="date" 
                    id="chk-delivery-date"
                    className="form-control" 
                    min={todayStr}
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Select Preferred Delivery Window *</label>
                  <div className="slots-grid">
                    {deliverySlots.map(slot => (
                      <div 
                        key={slot}
                        className={`slot-card ${selectedTimeSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        <Clock size={16} />
                        <span>{slot}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isMultiSeller && (
                  <div className="aggregation-explanation-box">
                    <Sparkles size={20} className="info-icon" />
                    <div>
                      <strong>Smart Grouped Delivery Route</strong>
                      <p>Because you are ordering from multiple sellers, choosing wider delivery windows allows our system to perfectly group your items for a single drop-off.</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '16px', fontSize: '18px', fontWeight: '700', borderRadius: '12px' }}
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? 'Processing Order...' : `Place Order (₹${total.toFixed(2)})`}
              </button>
            </form>

            {/* Cart Summary Side Column */}
            <div className="checkout-summary-column">
              <h3 className="card-title" style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 20px 0', fontWeight: '700' }}>Order Summary</h3>
              
              <div className="checkout-items-list">
                {cart.map(item => (
                  <div key={item.product.id} className="checkout-item">
                    <img src={item.product.image} alt={item.product.name} />
                    <div className="item-info">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-seller"><Store size={12} style={{display:'inline', marginRight: '4px'}}/>{item.product.vendorName}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="item-total">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" style={{ height: '1px', background: '#e2e8f0', margin: '20px 0' }}></div>

              <div className="checkout-totals">
                <div className="c-row"><span>Items Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="c-row"><span>Delivery Fee {isMultiSeller && <Sparkles size={12} color="#4f46e5" />}</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                <div className="c-row total-c-row"><span>Total Payable</span><span>₹{total.toFixed(2)}</span></div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '12px', background: '#dcfce7', padding: '12px', borderRadius: '8px' }}>
                <ShieldCheck size={16} /> Secure Checkout & Verification
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Order Placed Success Confirmation */
        <div className="order-success-card">
          <div className="success-icon-wrap">
            <CheckCircle size={48} color="#16a34a" />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p>Your local items will be processed and routed through our smart logistics network.</p>

          <div className="placed-orders-box">
            <h4>Generated Orders ({placedOrders.length}):</h4>
            {placedOrders.map(ord => (
              <div key={ord.id} className="placed-ord-item">
                <div>
                  <strong>{ord.id}</strong> — <Store size={12} style={{display:'inline'}}/> {ord.vendorName}
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                    📅 {ord.deliveryDate} ({ord.deliveryTimeSlot})
                  </div>
                </div>
                <span style={{ fontWeight: '600', color: '#4f46e5' }}>₹{ord.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="success-actions-row">
            <button className="btn btn-outline" style={{ background: 'white' }} onClick={() => navigate('/orders')}>
              View My Orders
            </button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/track-delivery')}>
              Track Delivery <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
