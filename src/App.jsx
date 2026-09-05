import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Dashboard Pages
import DashboardOverview from './pages/DashboardOverview';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import DeliveriesPage from './pages/DeliveriesPage';
import MapPlanning from './pages/MapPlanning'; // Order Aggregation
import CustomersPage from './pages/CustomersPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

import './styles/global.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes wrapped in Dashboard Layout */}
            <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
            <Route path="/orders" element={<DashboardLayout><OrdersPage /></DashboardLayout>} />
            <Route path="/products" element={<DashboardLayout><ProductsPage /></DashboardLayout>} />
            <Route path="/inventory" element={<DashboardLayout><InventoryPage /></DashboardLayout>} />
            <Route path="/deliveries" element={<DashboardLayout><DeliveriesPage /></DashboardLayout>} />
            <Route path="/order-aggregation" element={<DashboardLayout><MapPlanning /></DashboardLayout>} />
            <Route path="/customers" element={<DashboardLayout><CustomersPage /></DashboardLayout>} />
            <Route path="/notifications" element={<DashboardLayout><NotificationsPage /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
            <Route path="/help" element={<DashboardLayout><HelpPage /></DashboardLayout>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
