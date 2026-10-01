import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  HelpCircle, Search, PhoneCall, Phone, Mail, MessageSquare, 
  Clock, ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp, 
  Sparkles, ExternalLink, ChevronDown, ChevronUp, Truck, 
  CreditCard, PackageCheck, Send, Copy, Check, FileText, 
  Activity, LifeBuoy, Radio, ArrowRight, ThumbsUp, ThumbsDown, 
  X, AlertCircle, ShoppingBag, Store, UserCheck
} from 'lucide-react';
import './HelpPage.css';

/* ─── Premium Sparkline (Matching Analytics Benchmark) ───────────────────── */
const HelpSparkline = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 84;
  const height = 30;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const gradId = `help-grad-${color.replace('#', '')}`;

  return (
    <svg className="help-sparkline-svg" viewBox={`0 0 ${width} ${height}`} width="84" height="30">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={`0,${height} ${points} ${width},${height}`} />
      <polyline fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const HelpPage = () => {
  const { currentUser, addNotification } = useAppContext();

  // Role perspective defaults to vendor if currentUser is vendor
  const isVendor = currentUser?.role === 'vendor';
  const [perspective, setPerspective] = useState(isVendor ? 'vendor' : 'customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState('faq-v1');
  const [copiedKey, setCopiedKey] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    category: 'courier_delay',
    priority: 'high',
    orderId: '',
    subject: '',
    description: ''
  });

  // Feedback upvote/downvote tracker
  const [feedbackState, setFeedbackState] = useState({
    'faq-v1': { up: 42, down: 1, userVote: null },
    'faq-v2': { up: 68, down: 2, userVote: null },
    'faq-v3': { up: 95, down: 0, userVote: null },
    'faq-v4': { up: 31, down: 0, userVote: null },
    'faq-v5': { up: 54, down: 3, userVote: null },
    'faq-v6': { up: 27, down: 1, userVote: null },
    'faq-c1': { up: 112, down: 4, userVote: null },
    'faq-c2': { up: 88, down: 2, userVote: null },
    'faq-c3': { up: 63, down: 3, userVote: null },
    'faq-c4': { up: 49, down: 1, userVote: null },
  });

  // Merchant Specific Knowledge Base
  const merchantFaqs = useMemo(() => [
    {
      id: 'faq-v1',
      category: 'dispatch',
      categoryLabel: 'Courier & Dispatch',
      title: 'How does automated multi-seller batch dispatch work for my shop?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            When customers order goods from your shop alongside items from nearby merchants (e.g. your dairy products bundled with a bakery next door), our central algorithm groups them into an <strong>Aggregated Batch Route</strong>.
          </p>
          <div className="faq-highlight-box">
            <strong>Key Benefit:</strong> A single certified delivery partner visits your storefront to pick up all scheduled orders in one go, drastically minimizing store interruption and eliminating courier congestion.
          </div>
          <p>
            You receive an automated arrival alert <strong>8 minutes</strong> before the driver arrives. Ensure all order items are sealed with their respective order slips.
          </p>
        </>
      )
    },
    {
      id: 'faq-v2',
      category: 'dispatch',
      categoryLabel: 'Fleet Escalation',
      title: 'What should I do if a assigned courier partner is delayed past the pickup window?',
      readTime: '3 min read',
      content: (
        <>
          <p>
            Our control tower actively monitors driver GPS coordinates in real time. If a courier encounters traffic or vehicle breakdown:
          </p>
          <ol style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: '1.7' }}>
            <li>Our system automatically triggers a <strong>Tier-1 Fleet Reroute</strong> within 6 minutes of detected delay.</li>
            <li>A backup standby courier in your immediate sector is assigned automatically.</li>
            <li>You can directly call the <strong>Dispatch Desk (+91 1800-425-MICRO)</strong> with your Batch ID for priority manual override.</li>
          </ol>
          <div className="faq-highlight-box">
            Your store's On-Time SLA metric is automatically protected and will not be penalized for driver-side delays.
          </div>
        </>
      )
    },
    {
      id: 'faq-v3',
      category: 'payouts',
      categoryLabel: 'Settlements & Banking',
      title: 'How and when are store payouts and net bank settlements disbursed?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            Merchant payouts are calculated automatically on a weekly cycle (every Monday at 00:00 IST) and deposited straight into your verified bank account via automated IMPS/NEFT transfer:
          </p>
          <div className="faq-highlight-box">
            <strong>Payout Calculation:</strong> Gross Merchandise Value (GMV) − 12% Platform Logistics Commission = <strong>88% Net Merchant Disbursal</strong>.
          </div>
          <p>
            Download your GST-compliant settlement summary invoices anytime under the <em>Business Profile &gt; Bank Settlements</em> tab.
          </p>
        </>
      )
    },
    {
      id: 'faq-v4',
      category: 'stock',
      categoryLabel: 'Inventory & Stockouts',
      title: 'How do I handle an item suddenly running out of stock during an active order?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            If a customer orders an item that was depleted on your physical retail shelves before inventory sync:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: '1.7' }}>
            <li>Open <strong>Orders</strong> &gt; Select the specific Order &gt; Click <em>"Mark Item Stockout"</em>.</li>
            <li>The system will refund that specific item to the customer's wallet instantly while keeping the remaining batch items active.</li>
            <li>Immediately toggle the item stock to <code>0</code> on your <strong>Products</strong> page to prevent subsequent orders.</li>
          </ul>
        </>
      )
    },
    {
      id: 'faq-v5',
      category: 'orders',
      categoryLabel: 'Preparation SLA',
      title: 'How is the 15-Minute Preparation SLA measured and enforced?',
      readTime: '1 min read',
      content: (
        <>
          <p>
            The preparation timer initiates the second an order is confirmed on your seller dashboard.
          </p>
          <p>
            When packed, click <strong>"Ready for Pickup"</strong> to notify the incoming courier. Maintaining an average preparation time under 15 minutes unlocks <em>Prime Merchant Tier</em> with preferential algorithmic placement on customer store listings.
          </p>
        </>
      )
    },
    {
      id: 'faq-v6',
      category: 'disputes',
      categoryLabel: 'Damaged & Returns',
      title: 'What is the compensation policy for rejected or damaged batch deliveries?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            If a delivery fails due to customer unavailability or courier handling transit damage:
          </p>
          <div className="faq-highlight-box">
            Perishable grocery goods are guaranteed under the <strong>MicroLogi Merchant Shield Program</strong>. If goods cannot be redelivered within 45 minutes, your shop receives 100% reimbursement of the item's wholesale value.
          </div>
          <p>
            File a dispute within 24 hours using the <em>"Submit Priority Ticket"</em> form with the Batch/Order photo.
          </p>
        </>
      )
    }
  ], []);

  // Customer Knowledge Base
  const customerFaqs = useMemo(() => [
    {
      id: 'faq-c1',
      category: 'dispatch',
      categoryLabel: 'Batching',
      title: 'How does coordinated multi-seller delivery work?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            When you purchase items from different neighborhood stores (such as fresh dairy from Kannan Dept Store and bread from artisan bakers) in the same checkout, our engine aggregates them into a single consolidated delivery route.
          </p>
          <div className="faq-highlight-box">
            One single courier collects all your items and brings them straight to your doorstep, saving you multiple delivery charges.
          </div>
        </>
      )
    },
    {
      id: 'faq-c2',
      category: 'orders',
      categoryLabel: 'Live Tracking',
      title: 'How do I track my delivery and receive my order safely?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            Visit the <strong>Track Delivery</strong> page on your dashboard to watch your driver's real-time transit location on the map.
          </p>
          <p>
            Upon courier arrival, provide your secure <strong>4-digit Delivery OTP</strong> (visible on your order card and SMS) to verify delivery completion.
          </p>
        </>
      )
    },
    {
      id: 'faq-c3',
      category: 'orders',
      categoryLabel: 'Scheduling',
      title: 'Can I reschedule my delivery time window?',
      readTime: '1 min read',
      content: (
        <>
          <p>
            Yes! As long as your order is in <em>Confirmed</em> or <em>Preparing</em> status, visit <strong>Delivery Schedule</strong> to shift your package to any available upcoming time slot.
          </p>
        </>
      )
    },
    {
      id: 'faq-c4',
      category: 'stock',
      categoryLabel: 'Refunds',
      title: 'What happens if a neighborhood store runs out of an ordered item?',
      readTime: '2 min read',
      content: (
        <>
          <p>
            If a merchant runs out of stock before preparation, the item cost is refunded immediately back to your original payment method, and the rest of your order proceeds on schedule without disruption.
          </p>
        </>
      )
    }
  ], []);

  // Active FAQ list based on perspective
  const currentFaqs = perspective === 'vendor' ? merchantFaqs : customerFaqs;

  // Filtered FAQs based on category & search
  const filteredFaqs = useMemo(() => {
    return currentFaqs.filter(faq => {
      const matchCat = selectedCategory === 'all' || faq.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = faq.title.toLowerCase().includes(q);
      const catMatch = faq.categoryLabel.toLowerCase().includes(q);
      return titleMatch || catMatch;
    });
  }, [currentFaqs, selectedCategory, searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    showToast(`Copied "${text}" to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleVote = (faqId, type) => {
    setFeedbackState(prev => {
      const curr = prev[faqId] || { up: 10, down: 0, userVote: null };
      if (curr.userVote === type) return prev; // already voted

      const newUp = type === 'up' ? curr.up + 1 : curr.userVote === 'up' ? curr.up - 1 : curr.up;
      const newDown = type === 'down' ? curr.down + 1 : curr.userVote === 'down' ? curr.down - 1 : curr.down;

      return {
        ...prev,
        [faqId]: {
          up: newUp,
          down: newDown,
          userVote: type
        }
      };
    });
    showToast('Thank you for your feedback!');
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      showToast('Please fill in both the subject and description.');
      return;
    }

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setIsTicketModalOpen(false);
    
    // Add real notification to AppContext if available
    if (addNotification) {
      addNotification({
        id: `notif-${Date.now()}`,
        title: `Support Ticket Created #${ticketId}`,
        message: `Your priority request regarding "${ticketForm.subject}" has been assigned to a Senior Logistics Specialist.`,
        type: 'system',
        date: new Date().toISOString(),
        isRead: false
      });
    }

    showToast(`Support Ticket #${ticketId} submitted. A specialist will respond within 4 minutes.`);
    setTicketForm({
      category: 'courier_delay',
      priority: 'high',
      orderId: '',
      subject: '',
      description: ''
    });
  };

  const categoryList = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'dispatch', label: 'Courier & Fleet Dispatch', icon: Truck },
    { id: 'orders', label: 'Order SLAs & Packing', icon: PackageCheck },
    { id: 'payouts', label: 'Settlements & Banking', icon: CreditCard },
    { id: 'stock', label: 'Inventory & Stockouts', icon: Store },
    { id: 'disputes', label: 'Disputes & Shield Claims', icon: ShieldCheck }
  ];

  return (
    <div className="help-page-container">
      {/* ─── Toast Feedback ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="notif-toast-banner" style={{
          position: 'fixed',
          top: '24px',
          right: '28px',
          zIndex: 10000,
          background: '#0f172a',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          border: '1px solid #334155'
        }}>
          <CheckCircle2 size={16} className="text-success" style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Hero Header Banner (100% Full Width) ────────────────── */}
      <div className="help-hero-banner">
        <div className="help-hero-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="help-status-badge">
              <span className="help-status-dot" />
              <span>LIVE OPERATIONS DESK • ONLINE (AVG SLA &lt; 3 MINS)</span>
            </div>

            {/* Role Perspective Switcher */}
            <div className="help-role-switcher">
              <button 
                type="button"
                className={`role-switch-btn ${perspective === 'vendor' ? 'active' : ''}`}
                onClick={() => setPerspective('vendor')}
              >
                <Store size={14} />
                <span>Merchant Support</span>
              </button>
              <button 
                type="button"
                className={`role-switch-btn ${perspective === 'customer' ? 'active' : ''}`}
                onClick={() => setPerspective('customer')}
              >
                <UserCheck size={14} />
                <span>Customer Guide</span>
              </button>
            </div>
          </div>

          <h1 className="help-hero-title">
            {perspective === 'vendor' ? 'Help & Merchant Operations Concierge' : 'Help & Customer Delivery Support'}
          </h1>
          <p className="help-hero-subtitle">
            {perspective === 'vendor' 
              ? 'Instant dispatch escalation, batch routing guidelines, automated bank payout inquiries, and priority merchant assistance.'
              : 'Find quick answers about coordinated hyper-local batch delivery, real-time OTP tracking, and order policies.'}
          </p>
        </div>

        <div className="help-hero-actions">
          <button 
            type="button"
            className="btn-ticket-primary"
            onClick={() => setIsTicketModalOpen(true)}
          >
            <Send size={15} />
            <span>Submit Priority Ticket</span>
          </button>

          <button 
            type="button"
            className="btn-hotline-secondary"
            onClick={() => copyToClipboard('+91 1800-425-MICRO', 'hero-hotline')}
          >
            <PhoneCall size={15} style={{ color: '#4f46e5' }} />
            <span>{copiedKey === 'hero-hotline' ? 'Number Copied!' : 'Hotline: 1800-425-MICRO'}</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Sleek KPI Metric Cards (Matching User's Analytics Reference) ─── */}
      <div className="help-kpi-grid">
        {/* KPI 1 */}
        <div className="help-kpi-card">
          <div className="help-kpi-header">
            <span className="help-kpi-title">Support Response SLA</span>
            <div className="help-kpi-sparkline">
              <HelpSparkline data={[5.2, 4.8, 3.9, 3.1, 2.7, 2.5, 2.4]} color="#10b981" />
            </div>
          </div>
          <div>
            <div className="help-kpi-val">2.4 mins</div>
            <div className="help-kpi-subtext">Median first response time</div>
          </div>
          <div className="help-kpi-footer">
            <span className="help-delta-badge positive">
              <TrendingUp size={12} /> +98.2%
            </span>
            <span className="help-delta-label">on-time dispatch resolution</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="help-kpi-card">
          <div className="help-kpi-header">
            <span className="help-kpi-title">Resolution Rate</span>
            <div className="help-kpi-sparkline">
              <HelpSparkline data={[94.5, 96.0, 95.8, 97.2, 98.4, 99.1, 99.4]} color="#4f46e5" />
            </div>
          </div>
          <div>
            <div className="help-kpi-val">99.4%</div>
            <div className="help-kpi-subtext">487 cases closed this month</div>
          </div>
          <div className="help-kpi-footer">
            <span className="help-delta-badge info">
              <Sparkles size={12} /> Same-Day
            </span>
            <span className="help-delta-label">average ticket turnaround</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="help-kpi-card">
          <div className="help-kpi-header">
            <span className="help-kpi-title">Batch Fleet Protection</span>
            <div className="help-kpi-sparkline">
              <HelpSparkline data={[100, 100, 100, 100, 100, 100, 100]} color="#0284c7" />
            </div>
          </div>
          <div>
            <div className="help-kpi-val">100%</div>
            <div className="help-kpi-subtext">Automated courier reroute guarantee</div>
          </div>
          <div className="help-kpi-footer">
            <span className="help-delta-badge positive">
              <CheckCircle2 size={12} /> Active
            </span>
            <span className="help-delta-label">Zero lost batch consignments</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="help-kpi-card">
          <div className="help-kpi-header">
            <span className="help-kpi-title">Merchant Trust Rating</span>
            <div className="help-kpi-sparkline">
              <HelpSparkline data={[4.65, 4.72, 4.80, 4.86, 4.90, 4.93, 4.95]} color="#8b5cf6" />
            </div>
          </div>
          <div>
            <div className="help-kpi-val">4.95 / 5.0</div>
            <div className="help-kpi-subtext">Based on 1,240 verified vendor ratings</div>
          </div>
          <div className="help-kpi-footer">
            <span className="help-delta-badge purple">
              ★ Top Tier
            </span>
            <span className="help-delta-label">MicroLogi certified merchant standard</span>
          </div>
        </div>
      </div>

      {/* ─── Search & Category Filter Card ──────────────────────────── */}
      <div className="help-search-filter-card">
        <div className="help-search-input-box">
          <Search size={18} style={{ color: '#6366f1' }} />
          <input 
            type="text" 
            placeholder={perspective === 'vendor' 
              ? "Search solutions by keyword (e.g., 'courier delay', 'bank settlement', 'packing SLA', 'out of stock')..." 
              : "Search customer help questions (e.g., 'tracking', 'OTP', 'multi-seller batch')..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="help-clear-search" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="help-filter-chips">
          {categoryList.map(cat => {
            const Icon = cat.icon;
            const count = cat.id === 'all' 
              ? currentFaqs.length 
              : currentFaqs.filter(f => f.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                className={`help-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
                <span className="help-chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Two-Column Main Content Section ────────────────────────── */}
      <div className="help-main-grid">
        {/* Left Column: Interactive FAQs */}
        <div className="help-faq-column">
          <div className="faq-section-header">
            <h2 className="faq-section-title">
              <LifeBuoy size={20} style={{ color: '#4f46e5' }} />
              <span>Frequently Asked Operational Solutions</span>
            </h2>
            <span className="faq-results-counter">
              Showing {filteredFaqs.length} of {currentFaqs.length} solutions
            </span>
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="help-kpi-card" style={{ textAlign: 'center', padding: '40px 20px', alignItems: 'center' }}>
                <Search size={36} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.1rem' }}>No matching solutions found</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', maxWidth: '420px' }}>
                  We couldn't find an answer for "{searchQuery}". Try a different keyword or submit a direct ticket to our operations team.
                </p>
                <button 
                  type="button" 
                  className="btn-ticket-primary" 
                  style={{ marginTop: '16px' }}
                  onClick={() => setIsTicketModalOpen(true)}
                >
                  <Send size={15} />
                  <span>Submit Ticket for "{searchQuery}"</span>
                </button>
              </div>
            ) : (
              filteredFaqs.map(faq => {
                const isOpen = openFaqId === faq.id;
                const feedback = feedbackState[faq.id] || { up: 10, down: 0, userVote: null };

                return (
                  <div key={faq.id} className={`faq-card ${isOpen ? 'open' : ''}`}>
                    <div 
                      className="faq-card-header"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    >
                      <div className="faq-header-left">
                        <div className={`faq-cat-icon ${faq.category}`}>
                          {faq.category === 'dispatch' && <Truck size={18} />}
                          {faq.category === 'orders' && <PackageCheck size={18} />}
                          {faq.category === 'payouts' && <CreditCard size={18} />}
                          {faq.category === 'stock' && <Store size={18} />}
                          {faq.category === 'disputes' && <ShieldCheck size={18} />}
                        </div>
                        <div className="faq-question-meta">
                          <h3 className="faq-question-text">{faq.title}</h3>
                          <div className="faq-tag-row">
                            <span className="faq-category-tag">{faq.categoryLabel}</span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span className="faq-read-time">{faq.readTime}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronDown size={18} className="faq-chevron" />
                    </div>

                    {isOpen && (
                      <div className="faq-card-body">
                        {faq.content}

                        <div className="faq-feedback-row">
                          <span>Was this explanation helpful for your store?</span>
                          <div className="feedback-buttons">
                            <button
                              type="button"
                              className={`btn-feedback ${feedback.userVote === 'up' ? 'active' : ''}`}
                              onClick={() => handleVote(faq.id, 'up')}
                            >
                              <ThumbsUp size={13} />
                              <span>Helpful ({feedback.up})</span>
                            </button>
                            <button
                              type="button"
                              className={`btn-feedback ${feedback.userVote === 'down' ? 'active' : ''}`}
                              onClick={() => handleVote(faq.id, 'down')}
                            >
                              <ThumbsDown size={13} />
                              <span>({feedback.down})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Desk & Hotlines */}
        <div className="help-side-column">
          {/* Direct Hotlines Card */}
          <div className="help-contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon">
                <Radio size={20} />
              </div>
              <div>
                <h3 className="contact-card-title">Live Operations Hotlines</h3>
                <p className="contact-card-subtitle">Direct, unthrottled escalation channels</p>
              </div>
            </div>

            <div className="contact-channels-list">
              {/* Channel 1 */}
              <div className="contact-channel-item">
                <div className="channel-info">
                  <div className="channel-name">
                    <Phone size={14} style={{ color: '#4f46e5' }} />
                    <span>Emergency Courier Radio</span>
                  </div>
                  <span className="channel-val">+91 1800-425-MICRO</span>
                  <span className="channel-badge">24/7 Dedicated Line</span>
                </div>
                <button
                  type="button"
                  className="btn-channel-copy"
                  title="Copy Phone Number"
                  onClick={() => copyToClipboard('+91 1800-425-MICRO', 'phone')}
                >
                  {copiedKey === 'phone' ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                </button>
              </div>

              {/* Channel 2 */}
              <div className="contact-channel-item">
                <div className="channel-info">
                  <div className="channel-name">
                    <Mail size={14} style={{ color: '#0284c7' }} />
                    <span>Merchant Operations Desk</span>
                  </div>
                  <span className="channel-val">merchant-desk@micrologi.in</span>
                  <span className="channel-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    &lt; 15 min SLA Response
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-channel-copy"
                  title="Copy Email"
                  onClick={() => copyToClipboard('merchant-desk@micrologi.in', 'email')}
                >
                  {copiedKey === 'email' ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                </button>
              </div>

              {/* Channel 3 */}
              <div className="contact-channel-item">
                <div className="channel-info">
                  <div className="channel-name">
                    <MessageSquare size={14} style={{ color: '#059669' }} />
                    <span>Live WhatsApp Dispatch</span>
                  </div>
                  <span className="channel-val">+91 98400-DISPATCH</span>
                  <span className="channel-badge">Online Now</span>
                </div>
                <button
                  type="button"
                  className="btn-channel-copy"
                  title="Copy WhatsApp"
                  onClick={() => copyToClipboard('+91 98400-DISPATCH', 'whatsapp')}
                >
                  {copiedKey === 'whatsapp' ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time System Telemetry Status Card */}
          <div className="help-health-card">
            <div className="health-header">
              <span className="health-title">
                <Activity size={16} style={{ color: '#10b981' }} />
                <span>MicroLogi Core Telemetry</span>
              </span>
              <span className="health-badge-all-green">
                <span className="help-status-dot" style={{ width: '6px', height: '6px' }} />
                <span>99.98% Uptime</span>
              </span>
            </div>

            <div className="health-services-list">
              <div className="health-service-row">
                <span>Multi-Seller Batching Engine</span>
                <span className="service-status-pill">
                  <span className="service-dot" /> Operational (14ms)
                </span>
              </div>
              <div className="health-service-row">
                <span>Fleet Geolocation Tracking</span>
                <span className="service-status-pill">
                  <span className="service-dot" /> Operational
                </span>
              </div>
              <div className="health-service-row">
                <span>Direct Bank Settlement API</span>
                <span className="service-status-pill">
                  <span className="service-dot" /> Operational
                </span>
              </div>
              <div className="health-service-row">
                <span>SMS OTP Delivery Gateway</span>
                <span className="service-status-pill">
                  <span className="service-dot" /> Operational
                </span>
              </div>
            </div>
          </div>

          {/* Quick Merchant Documentation Guides */}
          <div className="help-resources-card">
            <span className="resources-title">Merchant Standard Operating Protocols</span>
            <div className="resources-list">
              <a 
                className="resource-link-item"
                onClick={(e) => { e.preventDefault(); showToast('Downloading SOP-Batch-Packaging-Guide-v3.pdf...'); }}
              >
                <span>📦 Batch Packaging Guidelines (PDF)</span>
                <ExternalLink size={14} />
              </a>
              <a 
                className="resource-link-item"
                onClick={(e) => { e.preventDefault(); showToast('Downloading Settlement-Payout-Policy-2026.pdf...'); }}
              >
                <span>💳 Banking Settlement Protocol (PDF)</span>
                <ExternalLink size={14} />
              </a>
              <a 
                className="resource-link-item"
                onClick={(e) => { e.preventDefault(); showToast('Opening Merchant Protection Terms...'); }}
              >
                <span>🛡️ MicroLogi Merchant Protection Shield</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Interactive Priority Ticket Modal ──────────────────────── */}
      {isTicketModalOpen && (
        <div className="ticket-modal-backdrop" onClick={() => setIsTicketModalOpen(false)}>
          <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-modal-header">
              <h3 className="ticket-header-title">
                <Send size={18} style={{ color: '#4f46e5' }} />
                <span>Submit Priority Merchant Ticket</span>
              </h3>
              <button 
                type="button" 
                className="ticket-close-btn"
                onClick={() => setIsTicketModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="ticket-form">
              <div className="ticket-form-row">
                <div className="ticket-form-group">
                  <label>Issue Category</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  >
                    <option value="courier_delay">Courier Delay / No-Show</option>
                    <option value="payout_query">Bank Payout / Settlement Query</option>
                    <option value="damaged_goods">Damaged Goods / Shield Claim</option>
                    <option value="catalog_sync">Catalog / Barcode Sync Issue</option>
                    <option value="general">Other Technical Support</option>
                  </select>
                </div>

                <div className="ticket-form-group">
                  <label>Related Order ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. #ORD-6158"
                    value={ticketForm.orderId}
                    onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                  />
                </div>
              </div>

              <div className="ticket-form-group">
                <label>Priority Level</label>
                <div className="ticket-priority-selector">
                  <button
                    type="button"
                    className={`priority-pill-btn normal ${ticketForm.priority === 'normal' ? 'selected' : ''}`}
                    onClick={() => setTicketForm({ ...ticketForm, priority: 'normal' })}
                  >
                    Normal (within 1 hr)
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn high ${ticketForm.priority === 'high' ? 'selected' : ''}`}
                    onClick={() => setTicketForm({ ...ticketForm, priority: 'high' })}
                  >
                    High (&lt; 15 mins)
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn critical ${ticketForm.priority === 'critical' ? 'selected' : ''}`}
                    onClick={() => setTicketForm({ ...ticketForm, priority: 'critical' })}
                  >
                    Critical (&lt; 4 mins)
                  </button>
                </div>
              </div>

              <div className="ticket-form-group">
                <label>Subject Summary</label>
                <input 
                  type="text" 
                  placeholder="e.g., Courier for Batch #B-8841 has not arrived after 20 mins"
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                />
              </div>

              <div className="ticket-form-group">
                <label>Detailed Description</label>
                <textarea 
                  rows={4} 
                  placeholder="Provide any relevant details, batch ID, customer name, or urgency details so the duty dispatcher can take immediate corrective action..."
                  required
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
              </div>

              <div className="ticket-modal-footer" style={{ margin: '0 -26px -24px', padding: '16px 26px' }}>
                <button 
                  type="button" 
                  className="btn-ticket-cancel"
                  onClick={() => setIsTicketModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-ticket-submit"
                >
                  <Send size={15} />
                  <span>Send Ticket to Dispatch Desk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
