import React from 'react';
import { HelpCircle, Clock, PackageCheck, ShieldCheck, Mail, Phone, MessageSquare } from 'lucide-react';
import './OrdersPage.css';

const HelpPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Help & Customer Support</h2>
          <p>Find quick answers about hyper-local orders, scheduled batch delivery, and order tracking.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--spacing-6)', maxWidth: '800px' }}>
        <h3 className="mb-4 text-lg font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} className="text-primary" /> Frequently Asked Questions
        </h3>

        <div className="flex flex-col gap-5 mt-4">
          <div className="border-b pb-4">
            <h4 className="font-medium" style={{ fontSize: '15px' }}>How does coordinated multi-seller delivery work?</h4>
            <p className="text-secondary text-sm mt-1 leading-relaxed">
              When you order products from different neighborhood shops (e.g. fresh groceries and bakery items) for the same delivery window, our automated micro-logistics engine groups them into a single consolidated batch. One delivery partner picks up all items and delivers them to your doorstep in one trip, reducing delivery fees and traffic congestion.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-medium" style={{ fontSize: '15px' }}>How do I track my delivery and receive my order?</h4>
            <p className="text-secondary text-sm mt-1 leading-relaxed">
              Open the <strong>Track Delivery</strong> page to view real-time route progress and driver details. When the delivery partner arrives, share your secure 4-digit Delivery OTP (visible on your order card and sent via SMS) to complete the handoff.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-medium" style={{ fontSize: '15px' }}>Can I reschedule my delivery time window?</h4>
            <p className="text-secondary text-sm mt-1 leading-relaxed">
              Yes! Visit <strong>Delivery Schedule</strong> to view your active delivery slots. As long as your order is in <em>Placed</em> or <em>Confirmed</em> status (before it is packed and dispatched), you can shift your delivery to another available slot.
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-medium" style={{ fontSize: '15px' }}>What happens if a product is out of stock?</h4>
            <p className="text-secondary text-sm mt-1 leading-relaxed">
              Neighborhood sellers update stock in real time. If a merchant runs out of an item before preparation, the item is promptly refunded to your original payment method, and the remaining items in your aggregated batch proceed without delay.
            </p>
          </div>

          <div className="pt-2">
            <h4 className="font-medium mb-3" style={{ fontSize: '15px' }}>Need Additional Assistance?</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>
                  <Mail size={16} className="text-primary" /> Support Email
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '4px' }}>support@micrologistics.local</span>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>
                  <Phone size={16} className="text-primary" /> Helpline
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '4px' }}>+91 1800-425-MICRO (Toll Free)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
