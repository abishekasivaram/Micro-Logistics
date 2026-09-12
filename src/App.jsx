import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import SellerRegisterPage from './pages/SellerRegisterPage';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import BrowseSellersPage from './pages/BrowseSellersPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackDeliveryPage from './pages/TrackDeliveryPage';
import DeliverySchedulePage from './pages/DeliverySchedulePage';
import ProfilePage from './pages/ProfilePage';

// Seller / Vendor Pages
import DashboardOverview from './pages/DashboardOverview';
import SellerAnalyticsPage from './pages/SellerAnalyticsPage';
import BusinessProfilePage from './pages/BusinessProfilePage';

// Common / Shared Pages
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import DeliveriesPage from './pages/DeliveriesPage';
import MapPlanning from './pages/MapPlanning'; // Order Aggregation
import CustomersPage from './pages/CustomersPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AdminDashboard from './pages/AdminDashboard';

import './styles/global.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-customer" element={<CustomerRegisterPage />} />
            <Route path="/register-seller" element={<SellerRegisterPage />} />

            {/* Customer Routes */}
            <Route path="/customer-dashboard" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout><CustomerDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/browse-sellers" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout><BrowseSellersPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout><CartPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout><CheckoutPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/track-delivery" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><TrackDeliveryPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/delivery-schedule" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><DeliverySchedulePage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><ProfilePage /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Seller Routes */}
            <Route path="/vendor-dashboard" element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <DashboardLayout><DashboardOverview /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <DashboardLayout><DashboardOverview /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller-analytics" element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <DashboardLayout><SellerAnalyticsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/business-profile" element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <DashboardLayout><BusinessProfilePage /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Shared / Role-aware Routes */}
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><OrdersPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><ProductsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <DashboardLayout><InventoryPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/deliveries" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><DeliveriesPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/order-aggregation" element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <DashboardLayout><MapPlanning /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <DashboardLayout><CustomersPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><NotificationsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><SettingsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <DashboardLayout><HelpPage /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

