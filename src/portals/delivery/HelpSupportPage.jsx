import React, { useState } from 'react';
import { HelpCircle, Send, PhoneCall } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const HelpSupportPage = () => {
  const { addNotification } = useAppContext();
  const [issueType, setIssueType] = useState('Route Issue');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    addNotification(`Support ticket created: ${issueType} - Admin has been notified.`, 'system');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
      setOrderId('');
      setIssueType('Route Issue');
    }, 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2>Help & Support</h2>
        <p className="text-secondary">Get assistance with your deliveries</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} className="text-primary" /> Report an Issue
          </h3>
          
          {isSubmitted ? (
            <div className="text-center text-success" style={{ padding: '40px 20px' }}>
              <Send size={40} className="mx-auto mb-3" />
              <h4>Ticket Submitted!</h4>
              <p>Our support team will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Issue Type</label>
                <select 
                  className="form-control" 
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                >
                  <option value="Route Issue">Route / Map Issue</option>
                  <option value="Customer Not Available">Customer Not Available</option>
                  <option value="Seller Pickup Issue">Seller Pickup Issue</option>
                  <option value="Package Issue">Package Damaged/Missing</option>
                  <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Related Order / Batch ID (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g., ORD-1021 or B-1002"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="Please describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} /> Submit Ticket
              </button>
            </form>
          )}
        </div>

        <div className="card" style={{ alignSelf: 'flex-start', background: '#f8f9fa' }}>
          <h3 style={{ marginBottom: '15px' }}>Emergency Contact</h3>
          <p style={{ marginBottom: '20px', color: '#555' }}>
            For urgent issues on active deliveries, please call the admin dispatch center directly.
          </p>
          
          <a href="tel:+918000000000" className="btn btn-outline w-full text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', fontWeight: 'bold' }}>
            <PhoneCall size={20} /> Call Dispatch (1800-DELIVERY)
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
