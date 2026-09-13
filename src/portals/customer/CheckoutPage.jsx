import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { deliverySlots } from '../../data/sampleData';
import { Truck, Calendar, Clock, MapPin, Phone, ShieldCheck, CheckCircle, Info, ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Delivery Checkout</h2>
          <p>Configure delivery address & delivery slot for order aggregation.</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={() => navigate('/cart')}>
          <ArrowLeft size={16} /> Back to Cart
        </button>
      </div>

      {!placedOrders ? (
        <div>
          {cart.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', color: '#92400e', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={20} />
                <span>Your cart is currently empty. Please add items from local sellers before checking out.</span>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => navigate('/browse-sellers')}>
                Browse Sellers
              </button>
            </div>
          )}

          <div className="checkout-grid">
            <form onSubmit={handlePlaceOrderSubmit} className="checkout-form-column">
              
              {/* Delivery Address & Contact Section */}
              <div className="checkout-card">
                <h3 className="card-title"><MapPin size={20} className="text-primary" /> Delivery Destination</h3>
                
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
              <h3 className="card-title"><Calendar size={20} className="text-primary" /> Delivery Schedule & Window</h3>
              
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

              {/* Required Explanation Box */}
              <div className="aggregation-explanation-box">
                <Info size={20} className="info-icon" />
                <div>
                  <strong>Smart Order Aggregation Notice:</strong>
                  <p>
                    Overlapping delivery windows allow the logistics system to identify suitable orders for possible delivery grouping.
                    For example, a 7:00 AM – 11:00 AM slot and a 9:00 AM – 1:00 PM slot share a 2-hour overlap window, allowing nearby seller pickups to be grouped efficiently for driver dispatch.
                  </p>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full submit-order-btn"
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? 'Processing Order...' : `Place Order (₹${total.toFixed(2)})`}
            </button>
          </form>

          {/* Cart Summary Side Column */}
          <div className="checkout-summary-column">
            <div className="checkout-card">
              <h3 className="card-title">Order Items Summary</h3>
              <div className="checkout-items-list">
                {cart.map(item => (
                  <div key={item.product.id} className="checkout-item">
                    <img src={item.product.image} alt={item.product.name} />
                    <div className="item-info">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-seller">{item.product.vendorName}</span>
                      <span className="item-qty font-medium">Qty: {item.quantity} × ₹{item.product.price.toFixed(2)}</span>
                    </div>
                    <span className="item-total font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="checkout-totals">
                <div className="c-row"><span>Items Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="c-row"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                <div className="c-row total-c-row"><span>Total Payable</span><span>₹{total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Order Placed Success Confirmation Modal/Screen */
        <div className="order-success-card">
          <div className="success-icon-wrap">
            <CheckCircle size={56} className="text-success" />
          </div>
          <h2>Order Successfully Placed!</h2>
          <p>Your order has been recorded in the Smart Micro-Logistics Management network.</p>

          <div className="placed-orders-box">
            <h4>Created Mock Orders ({placedOrders.length}):</h4>
            {placedOrders.map(ord => (
              <div key={ord.id} className="placed-ord-item">
                <div>
                  <strong>{ord.id}</strong> — Seller: {ord.vendorName}
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📅 {ord.deliveryDate} ({ord.deliveryTimeSlot}) | 📍 {ord.deliveryLocation}
                  </div>
                </div>
                <span className="font-medium text-primary">₹{ord.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="success-actions-row">
            <button className="btn btn-outline flex items-center gap-2" onClick={() => navigate('/orders')}>
              View My Orders
            </button>
            <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/track-delivery')}>
              Track Delivery <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
