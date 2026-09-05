import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Layers, MapPin, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">
          <h1>MicroLogi</h1>
        </div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login" className="btn btn-outline">Log In</Link>
          <Link to="/login" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Smarter Local Orders.<br/>Better Deliveries.</h1>
            <p>Manage orders, vendors, inventory and deliveries from one centralized micro-logistics platform.</p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={20} />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">Explore Platform</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">
               <div className="floating-card card-1">
                 <Package size={24} color="var(--color-primary)" />
                 <span>Order Received</span>
               </div>
               <div className="floating-card card-2">
                 <MapPin size={24} color="var(--color-warning)" />
                 <span>Route Optimized</span>
               </div>
               <div className="floating-card card-3">
                 <Truck size={24} color="var(--color-success)" />
                 <span>Out for Delivery</span>
               </div>
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <h2>Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Package size={24} /></div>
              <h3>Centralized Order Management</h3>
              <p>View and manage all incoming orders across multiple local vendors.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Layers size={24} /></div>
              <h3>Smart Order Aggregation</h3>
              <p>Group nearby orders into logical delivery runs to save time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Truck size={24} /></div>
              <h3>Delivery Assignment</h3>
              <p>Assign drivers, track statuses, and manage the delivery lifecycle.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><MapPin size={24} /></div>
              <h3>Location-Based Planning</h3>
              <p>Plan routes and delivery groups visually using our interactive map.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="workflow-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Orders</h4>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Aggregation</h4>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Inventory Check</h4>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Assignment</h4>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">5</div>
              <h4>Delivery</h4>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="landing-footer">
        <p>&copy; 2026 MicroLogi Network. College Project Demonstration.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
