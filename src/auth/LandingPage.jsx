import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, Layers, MapPin, ArrowRight, Store, Shield, User, ShoppingBag, Compass } from 'lucide-react';
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
            <div className="hero-image-placeholder">
              <div className="floating-card card-1">
                <Store size={22} color="var(--color-primary)" />
                <div>
                  <strong>Local Sellers</strong>
                  <span style={{ fontSize: '11px', color: '#666' }}>T. Nagar & Adyar</span>
                </div>
              </div>
              <div className="floating-card card-2">
                <Layers size={22} color="var(--color-warning)" />
                <div>
                  <strong>Smart Aggregation</strong>
                  <span style={{ fontSize: '11px', color: '#666' }}>3 Orders Grouped</span>
                </div>
              </div>
              <div className="floating-card card-3">
                <Truck size={22} color="var(--color-success)" />
                <div>
                  <strong>Out for Delivery</strong>
                  <span style={{ fontSize: '11px', color: '#666' }}>Agent DA014 Assigned</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section id="features" className="features-section">
          <div className="section-header">
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
          <div className="section-header">
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
          <div className="section-header">
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

