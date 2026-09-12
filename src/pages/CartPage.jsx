import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Store, AlertCircle, Package } from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateCartQty, removeFromCart, clearCart } = useAppContext();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 30.00 : 0.00;
  const total = subtotal + deliveryFee;

  // Check unique sellers in cart
  const uniqueSellers = Array.from(new Set(cart.map(item => item.product.vendorName || 'Local Seller')));
  const isMultiSeller = uniqueSellers.length > 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Shopping Cart</h2>
          <p>Review items in your cart before choosing your delivery slot.</p>
        </div>
        {cart.length > 0 && (
          <button className="btn btn-outline text-danger" onClick={clearCart}>
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card">
          <ShoppingCart size={56} className="text-secondary" />
          <h3>Your cart is empty</h3>
          <p>Explore neighborhood sellers and add fresh items to your cart.</p>
          <button className="btn btn-primary btn-lg mt-2" onClick={() => navigate('/browse-sellers')}>
            Browse Sellers
          </button>
        </div>
      ) : (
        <div className="cart-content-grid">
          <div className="cart-items-column">
            
            {/* Multi-Seller Required Banner */}
            {isMultiSeller && (
              <div className="multi-seller-notice">
                <AlertCircle size={20} className="notice-icon" />
                <div>
                  <strong>Multi-Seller Notice:</strong>
                  <p>Products from different sellers may be processed as separate seller orders and coordinated for delivery where suitable.</p>
                </div>
              </div>
            )}

            <div className="cart-items-card">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product & Seller</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => {
                    const itemSubtotal = item.product.price * item.quantity;
                    return (
                      <tr key={item.product.id}>
                        <td>
                          <div className="cart-product-info">
                            <img src={item.product.image} alt={item.product.name} className="cart-prod-img" />
                            <div>
                              <strong className="cart-prod-name">{item.product.name}</strong>
                              <div className="cart-seller-tag">
                                <Store size={12} /> {item.product.vendorName || 'Local Seller'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <div className="cart-qty-control">
                            <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)}>+</button>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }} className="font-medium">
                          ₹{item.product.price.toFixed(2)}
                        </td>

                        <td style={{ textAlign: 'right' }} className="font-medium text-primary">
                          ₹{itemSubtotal.toFixed(2)}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="icon-btn-small text-danger" 
                            onClick={() => removeFromCart(item.product.id)}
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-actions-row">
              <button className="btn btn-outline flex items-center gap-2" onClick={() => navigate('/browse-sellers')}>
                <ArrowLeft size={16} /> Continue Shopping
              </button>
            </div>
          </div>

          {/* Cart Summary Side Column */}
          <div className="cart-summary-column">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Items ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Coordinated Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span className="total-price">₹{total.toFixed(2)}</span>
              </div>

              <p className="summary-footnote">
                Tax included. Delivery window & address will be selected on next step.
              </p>

              <button 
                className="btn btn-primary btn-lg w-full checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
