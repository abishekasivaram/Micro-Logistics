import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Store, Sparkles, MapPin, Truck, Home } from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateCartQty, removeFromCart, clearCart } = useAppContext();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 30.00 : 0.00;
  const total = subtotal + deliveryFee;

  // Group items by seller for visual presentation
  const groupedCart = cart.reduce((acc, item) => {
    const seller = item.product.vendorName || 'Local Seller';
    if (!acc[seller]) acc[seller] = [];
    acc[seller].push(item);
    return acc;
  }, {});

  const uniqueSellers = Object.keys(groupedCart);
  const isMultiSeller = uniqueSellers.length > 1;

  return (
    <div className="customer-cart-page page-container">
      <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Smart Cart</h2>
          <p>Review items from local sellers before choosing your delivery slot.</p>
        </div>
        {cart.length > 0 && (
          <button className="btn btn-outline text-danger" onClick={clearCart}>
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card" style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <ShoppingCart size={56} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#1e293b' }}>Your cart is empty</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Explore neighborhood sellers and add fresh items to your cart.</p>
          <button className="btn btn-primary" onClick={() => navigate('/browse-sellers')}>
            Browse Local Sellers
          </button>
        </div>
      ) : (
        <div className="cart-content-grid">
          <div className="cart-items-column">
            
            {/* Multi-Seller Smart Delivery Frontend Visual */}
            {isMultiSeller && (
              <div className="smart-delivery-banner">
                <h4><Sparkles size={18} /> Smart Aggregated Delivery Active</h4>
                <p style={{ fontSize: '13px', color: '#4338ca', marginBottom: '24px', lineHeight: '1.5' }}>
                  You've selected items from multiple sellers. Our network will automatically coordinate the pickup route to deliver everything together in a single drop-off!
                </p>
                <div className="smart-route-visual">
                  {uniqueSellers.map((seller, index) => (
                    <div key={index} className="route-node">
                      <Store size={18} />
                      <span className="route-node-label">{seller.substring(0, 12)}{seller.length > 12 ? '...' : ''}</span>
                    </div>
                  ))}
                  <div className="route-node customer">
                    <Home size={18} />
                    <span className="route-node-label">You</span>
                  </div>
                </div>
                <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '8px', color: '#4f46e5', fontSize: '12px', fontWeight: '500' }}>
                   <Truck size={14} /> One Agent • One Delivery • Saved Emissions
                </div>
              </div>
            )}

            {/* Grouped Cart Items */}
            {Object.entries(groupedCart).map(([sellerName, items]) => (
              <div key={sellerName} className="cart-seller-group">
                <div className="seller-group-header">
                  <Store size={18} color="#4f46e5" /> {sellerName}
                </div>
                <div>
                  {items.map(item => {
                    const itemSubtotal = item.product.price * item.quantity;
                    return (
                      <div key={item.product.id} className="cart-item-row">
                        <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                        
                        <div className="cart-item-details">
                          <h4>{item.product.name}</h4>
                          <span className="cart-item-price">₹{item.product.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="cart-qty-control">
                          <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)}>+</button>
                        </div>
                        
                        <div style={{ width: '80px', textAlign: 'right', fontWeight: '600', color: '#4f46e5' }}>
                          ₹{itemSubtotal.toFixed(2)}
                        </div>
                        
                        <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} title="Remove Item">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }} onClick={() => navigate('/browse-sellers')}>
                <ArrowLeft size={16} /> Continue Shopping
              </button>
            </div>
          </div>

          {/* Cart Summary Side Column */}
          <div className="cart-summary-column">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Items ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Delivery Fee {isMultiSeller && <Sparkles size={12} color="#4f46e5" />}</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span className="total-price">₹{total.toFixed(2)}</span>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', margin: '20px 0', lineHeight: '1.5' }}>
              Tax included. You will select your delivery window & address on the next step.
            </p>

            <button 
              className="btn btn-primary w-full"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', fontSize: '16px' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
