import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Layers, 
  MapPin, 
  ArrowRight, 
  Store, 
  Shield, 
  User, 
  ShoppingBag, 
  Compass,
  Zap,
  Check,
  BarChart2,
  Users
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-wrapper">
            <Truck size={24} className="text-primary" />
          </div>
          <div>
            <h1>Smart Micro-Logistics</h1>
            <span className="logo-subtext">Management System</span>
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#roles">Portals</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login" className="btn btn-outline">Sign In</Link>
          <Link to="/register-customer" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <Compass size={16} />
              <span>Smart Local Fulfillment Network</span>
            </div>
            <h1>Smarter Local Orders.<br />Better Delivery Coordination.</h1>
            <p>
              An intelligent micro-logistics platform designed to connect neighborhood sellers with customers,
              grouping nearby deliveries into efficient, eco-friendly dispatch runs.
            </p>
            <div className="hero-actions">
              <Link to="/register-customer" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In to Account</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-network-canvas">
              {/* Soft ambient glow behind central hub */}
              <div className="network-ambient-glow" />

              {/* Concentric Radar Rings & Stepped Connector Lines */}
              <svg 
                className="hero-network-svg" 
                viewBox="0 0 540 460" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Radar Orbit Rings */}
                <circle cx="270" cy="230" r="205" stroke="#CBD5E1" strokeWidth="1" strokeOpacity="0.45" fill="none" />
                <circle cx="270" cy="230" r="140" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="5 5" strokeOpacity="0.55" fill="none" />
                <circle cx="270" cy="230" r="76" stroke="#E2E8F0" strokeWidth="1.2" fill="none" />

                {/* Orbit Accent Dot with Pulse Glow on Middle Ring (Angle ~225°) */}
                <circle cx="171" cy="329" r="9" stroke="#2563EB" strokeWidth="1.5" strokeOpacity="0.3" fill="#2563EB" fillOpacity="0.1" className="radar-ping" />
                <circle cx="171" cy="329" r="4" fill="#2563EB" />

                {/* Connector Line 1: Central Logo -> Top-Left Card */}
                <path 
                  d="M 270 188 V 82 H 210" 
                  stroke="#94A3B8" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                  fill="none" 
                  className="connector-path" 
                />

                {/* Connector Line 2: Center Stem -> Top-Right Card */}
                <path 
                  d="M 270 126 H 395 V 104" 
                  stroke="#94A3B8" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                  fill="none" 
                  className="connector-path" 
                />

                {/* Connector Line 3: Central Logo -> Bottom-Right Card */}
                <path 
                  d="M 270 272 V 356 H 318" 
                  stroke="#94A3B8" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                  fill="none" 
                  className="connector-path" 
                />
              </svg>

              {/* Central Logo Squircle Badge */}
              <div className="central-hub-wrapper">
                <div className="central-logo-box" title="Smart Micro-Logistics Engine">
                  <Truck size={38} color="#FFFFFF" strokeWidth={2.2} />
                </div>
              </div>

              {/* Floating Card 1 (Top-Left): Local Sellers */}
              <div className="network-card card-local-sellers">
                <div className="card-header-row">
                  <div className="card-icon-badge slate-badge">
                    <Users size={18} strokeWidth={2.2} />
                  </div>
                  <div className="card-titles">
                    <span className="card-main-title">Local Sellers</span>
                    <span className="card-subtitle">T. Nagar & Adyar</span>
                  </div>
                </div>
                <div className="card-body-row">
                  <div className="avatar-stack">
                    <span className="avatar-dot dot-slate" title="Organic Store" />
                    <span className="avatar-dot dot-blue" title="Daily Fresh Grocers" />
                    <span className="avatar-dot dot-navy" title="City Pharmacy" />
                  </div>
                  <span className="live-status-pill">
                    <span className="pulse-indicator" /> 18 Active
                  </span>
                </div>
              </div>

              {/* Floating Card 2 (Top-Right): Smart Aggregation */}
              <div className="network-card card-smart-aggregation">
                <div className="card-header-row">
                  <div className="card-icon-badge dark-badge">
                    <Zap size={18} strokeWidth={2.2} />
                  </div>
                  <div className="card-titles">
                    <span className="card-main-title">Smart Aggregation</span>
                    <span className="card-subtitle">3 Orders Grouped</span>
                  </div>
                  <div className="card-check-badge" title="Batch Confirmed">
                    <Check size={16} strokeWidth={3} className="check-icon" />
                  </div>
                </div>
                <div className="card-footer-tag">
                  <span className="metric-pill">✓ Clustered Run · -35% Fuel</span>
                </div>
              </div>

              {/* Floating Card 3 (Bottom-Right): Out for Delivery */}
              <div className="network-card card-out-for-delivery">
                <div className="card-header-row">
                  <div className="card-icon-badge slate-badge">
                    <BarChart2 size={18} strokeWidth={2.2} />
                  </div>
                  <div className="card-titles">
                    <span className="card-main-title">Out for Delivery</span>
                    <span className="card-subtitle">Agent DA014 Assigned</span>
                  </div>
                </div>
                <div className="card-chart-row">
                  <div className="mini-bars-chart" title="Live batch dispatch progress">
                    <div className="mini-bar bar-1" />
                    <div className="mini-bar bar-2" />
                    <div className="mini-bar bar-3" />
                    <div className="mini-bar bar-4" />
                    <div className="mini-bar bar-5 active" />
                  </div>
                  <div className="eta-badge">
                    <span className="eta-time">ETA 18m</span>
                    <span className="eta-rate">98% On-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section id="features" className="features-section">
          <div className="landing-section-header">
            <h2>Core Platform Features</h2>
            <p>Optimizing hyper-local commerce through localized order grouping and real-time tracking.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Store size={26} /></div>
              <h3>1. Local Seller Network</h3>
              <p>Discover neighborhood grocers, bakeries, organic stores, and pharmacies with transparent prep times and stock availability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Layers size={26} /></div>
              <h3>2. Smart Order Aggregation</h3>
              <p>Clustered order grouping algorithm aggregates orders in overlapping delivery windows to lower delivery fees and emissions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Truck size={26} /></div>
              <h3>3. Delivery Coordination</h3>
              <p>Streamlined dispatch hub for sellers and delivery partners to coordinate pickup windows and track delivery runs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><MapPin size={26} /></div>
              <h3>4. Real-Time Order Tracking</h3>
              <p>Visual map interface and live status timeline tracking your orders from seller confirmation to customer doorstep.</p>
            </div>
          </div>
        </section>

        {/* Portals / Entry Points */}
        <section id="roles" className="roles-section">
          <div className="landing-section-header">
            <h2>Role-Based Access Portals</h2>
            <p>Tailored dashboards optimized for every stakeholder in the micro-logistics ecosystem.</p>
          </div>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon customer-role-icon"><User size={28} /></div>
              <h3>Customer Portal</h3>
              <p>Browse local sellers, add products to cart, choose convenient delivery windows, and track orders in real time.</p>
              <div className="role-actions">
                <Link to="/login" state={{ role: 'customer' }} className="btn btn-primary w-full">Customer Login</Link>
                <Link to="/register-customer" className="btn btn-outline w-full mt-2">Register as Customer</Link>
              </div>
            </div>

            <div className="role-card">
              <div className="role-icon seller-role-icon"><Store size={28} /></div>
              <h3>Seller Portal</h3>
              <p>Manage product inventory, accept and prepare orders, view aggregation batch status, and track business revenue analytics.</p>
              <div className="role-actions">
                <Link to="/login" state={{ role: 'vendor' }} className="btn btn-primary w-full">Seller Login</Link>
                <Link to="/register-seller" className="btn btn-outline w-full mt-2">Register as Seller</Link>
              </div>
            </div>

            <div className="role-card">
              <div className="role-icon delivery-role-icon"><Truck size={28} /></div>
              <h3>Delivery Portal</h3>
              <p>Accept batch assignments, navigate multi-seller pickup hubs, track active routes, and verify doorstep delivery OTPs.</p>
              <div className="role-actions">
                <Link to="/login" state={{ role: 'delivery_partner' }} className="btn btn-primary w-full">Delivery Login</Link>
                <Link to="/delivery" className="btn btn-outline w-full mt-2">Delivery Dashboard</Link>
              </div>
            </div>

            <div className="role-card">
              <div className="role-icon admin-role-icon"><Shield size={28} /></div>
              <h3>Admin Portal</h3>
              <p>Centralized platform control panel for delivery personnel monitoring, system-wide order aggregation, and settings.</p>
              <div className="role-actions">
                <Link to="/login" state={{ role: 'admin' }} className="btn btn-dark w-full">Admin Login</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="landing-section-header">
            <h2>How Micro-Logistics Works</h2>
            <p>5 simple steps powering efficient hyper-local delivery.</p>
          </div>

          <div className="workflow-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Customer Order</h4>
              <span>Choose products & delivery slot</span>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Seller Prep</h4>
              <span>Seller accepts & packages items</span>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Smart Aggregation</h4>
              <span>Orders grouped by location & window</span>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Agent Dispatch</h4>
              <span>Optimized route assigned to driver</span>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">5</div>
              <h4>Live Delivery</h4>
              <span>Track progress on interactive map</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2026 Smart Micro-Logistics Management System. Academic Project Demonstration.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

