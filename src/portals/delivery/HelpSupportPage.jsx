import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, Search, PhoneCall, MessageSquare, AlertCircle, 
  Send, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2, Clock, X, Paperclip 
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { FAQ_ITEMS } from '../../lib/deliveryData';
import PageHeader from '../../components/delivery/PageHeader';
import './HelpSupportPage.css';

const HelpSupportPage = () => {
  const { addToast } = useDelivery();

  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [showChatModal, setShowChatModal] = useState(false);

  // Form State
  const [issueCategory, setIssueCategory] = useState('Route Issue');
  const [relatedId, setRelatedId] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Chat simulator state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'dispatch', text: 'Hello David! Central Dispatch Control Tower here. How can we support your current route?', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const toggleFaq = (key) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter FAQs
  const filteredFaqCategories = useMemo(() => {
    if (!faqSearch.trim()) return FAQ_ITEMS;
    const query = faqSearch.toLowerCase();

    return FAQ_ITEMS.map(cat => ({
      ...cat,
      questions: cat.questions.filter(q =>
        q.q.toLowerCase().includes(query) || q.a.toLowerCase().includes(query)
      )
    })).filter(cat => cat.questions.length > 0);
  }, [faqSearch]);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubmitted(true);
      addToast(`Support ticket submitted (${priority} priority). Dispatch notified.`, 'success');
      setTimeout(() => {
        setTicketSubmitted(false);
        setDescription('');
        setRelatedId('');
      }, 3500);
    }, 600);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'agent', text: chatInput, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'dispatch', text: 'Acknowledged, David. Checking live GPS and traffic telemetry for your current stop. Stand by.', time: 'Just now' }
      ]);
    }, 1000);
  };

  return (
    <div className="dl-help-page">
      <PageHeader
        breadcrumbs={['Support', 'Assistance']}
        title="Help & Dispatch Support"
        subtitle="Emergency dispatch hotline, real-time agent chat, and incident reporting"
      />

      {/* Emergency Dispatch Contact Strip */}
      <div className="dl-card dispatch-hotline-card">
        <div className="hotline-text-block">
          <div className="hotline-badge">
            <span className="dl-live-dot" /> 24/7 ACTIVE DISPATCH MONITORING
          </div>
          <h2 className="hotline-title dl-heading">Emergency Dispatch Command Line</h2>
          <p className="hotline-desc">
            For vehicle breakdowns, customer conflicts, or immediate address reroutes during active deliveries.
          </p>
        </div>

        <div className="hotline-buttons-row">
          <a href="tel:+918000000000" className="dl-btn dl-btn-primary hotline-call-btn">
            <PhoneCall size={18} />
            <span>Call Dispatch (1800-DELIVERY)</span>
          </a>

          <button
            type="button"
            className="dl-btn dl-btn-secondary hotline-chat-btn"
            onClick={() => setShowChatModal(true)}
          >
            <MessageSquare size={18} />
            <span>Live Dispatch Chat</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: FAQ Accordion on Left, Ticket Report Form on Right */}
      <div className="help-grid-layout">
        {/* Left Column: FAQ Search & Accordion */}
        <div className="help-faqs-col">
          <div className="dl-card faqs-card">
            <div className="faqs-card-header">
              <div className="faqs-title-box">
                <HelpCircle size={18} className="text-primary" />
                <h3 className="faqs-heading dl-heading">Frequently Asked Questions</h3>
              </div>

              {/* FAQ Search */}
              <div className="faq-search-box">
                <Search size={15} className="faq-search-icon" />
                <input
                  type="text"
                  placeholder="Search questions or keywords..."
                  value={faqSearch}
                  onChange={e => setFaqSearch(e.target.value)}
                  className="faq-search-input"
                />
              </div>
            </div>

            {/* Accordion Categories */}
            <div className="faqs-accordion-list">
              {filteredFaqCategories.length === 0 ? (
                <div className="faqs-empty">No matching FAQ topics found.</div>
              ) : (
                filteredFaqCategories.map(cat => (
                  <div key={cat.category} className="faq-category-group">
                    <span className="faq-category-name">{cat.category}</span>
                    <div className="faq-questions-stack">
                      {cat.questions.map(q => {
                        const isExpanded = expandedFaqs[q.q];
                        return (
                          <div 
                            key={q.q} 
                            className={`faq-accordion-item ${isExpanded ? 'is-open' : ''}`}
                            onClick={() => toggleFaq(q.q)}
                          >
                            <div className="faq-question-row">
                              <span className="faq-q-text">{q.q}</span>
                              <span className="faq-toggle-icon">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </span>
                            </div>
                            {isExpanded && (
                              <div className="faq-answer-block">
                                <p>{q.a}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Report an Issue Form */}
        <div className="help-form-col">
          <div className="dl-card report-ticket-card">
            <div className="ticket-card-header">
              <AlertCircle size={18} className="text-warning" />
              <h3 className="ticket-heading dl-heading">Report an Issue to Dispatch</h3>
            </div>

            {ticketSubmitted ? (
              <div className="ticket-success-feedback">
                <CheckCircle2 size={44} className="text-success mb-2" />
                <h4 className="dl-heading font-bold text-lg">Ticket Submitted!</h4>
                <p className="text-sm text-secondary">
                  Your incident has been logged. Dispatch will coordinate with you via phone or in-app chat.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="ticket-form">
                <div className="form-group-item">
                  <label className="field-label" htmlFor="ticket-category">Issue Category</label>
                  <select
                    id="ticket-category"
                    className="dl-form-input"
                    value={issueCategory}
                    onChange={e => setIssueCategory(e.target.value)}
                  >
                    <option value="Route Issue">Route / GPS / Map Inaccuracy</option>
                    <option value="Customer Not Available">Customer Unavailable at Stop</option>
                    <option value="Seller Pickup Issue">Seller Merchant Hub Delay</option>
                    <option value="Package Issue">Damaged or Missing Package</option>
                    <option value="Vehicle Breakdown">Vehicle Breakdown / Battery Flat</option>
                    <option value="Payment Discrepancy">COD Payment Collection Issue</option>
                    <option value="Other">Other Operational Issue</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label className="field-label" htmlFor="ticket-related-id">Related Order / Batch ID (Optional)</label>
                  <input
                    id="ticket-related-id"
                    type="text"
                    placeholder="e.g. ORD-8093 or BATCH-4082"
                    className="dl-form-input"
                    value={relatedId}
                    onChange={e => setRelatedId(e.target.value)}
                  />
                </div>

                <div className="form-group-item">
                  <label className="field-label">Incident Priority</label>
                  <div className="priority-pills-row">
                    {['NORMAL', 'URGENT', 'EMERGENCY'].map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-pill ${priority === p ? `selected-${p.toLowerCase()}` : ''}`}
                        onClick={() => setPriority(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-item">
                  <label className="field-label" htmlFor="ticket-description">Description of Issue</label>
                  <textarea
                    id="ticket-description"
                    rows={4}
                    placeholder="Please explain the situation, steps already taken, and how dispatch can assist..."
                    className="dl-form-input"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="dl-btn dl-btn-primary w-full submit-ticket-btn"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Sending Ticket...' : 'Submit Incident Ticket'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Live Dispatch Chat Modal */}
      {showChatModal && (
        <div className="chat-modal-backdrop" onClick={() => setShowChatModal(false)}>
          <div className="chat-modal-card" onClick={e => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div className="chat-agent-info">
                <div className="dispatch-live-avatar">
                  <ShieldCheck size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="chat-title dl-heading">Central Dispatch Desk</h4>
                  <span className="chat-status"><span className="dl-live-dot" /> Online • Average reply 30s</span>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowChatModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages-scroll">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'agent' ? 'is-agent' : 'is-dispatch'}`}>
                  <div className="chat-bubble">
                    <p className="bubble-text">{msg.text}</p>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="chat-input-bar">
              <input
                type="text"
                placeholder="Message dispatch..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="chat-text-input"
              />
              <button type="submit" className="dl-btn dl-btn-primary chat-send-btn" aria-label="Send message">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupportPage;
