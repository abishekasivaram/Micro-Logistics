import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './auth/LandingPage';
import LoginPage from './auth/LoginPage';
import CustomerRegisterPage from './auth/CustomerRegisterPage';
import SellerRegisterPage from './auth/SellerRegisterPage';

// Customer Pages
import CustomerDashboard from './portals/customer/CustomerDashboard';
import BrowseSellersPage from './portals/customer/BrowseSellersPage';
import CartPage from './portals/customer/CartPage';
import CheckoutPage from './portals/customer/CheckoutPage';
import TrackDeliveryPage from './portals/customer/TrackDeliveryPage';
import DeliverySchedulePage from './portals/customer/DeliverySchedulePage';
import ProfilePage from './portals/customer/ProfilePage';

// Seller / Vendor Pages
import DashboardOverview from './portals/seller/DashboardOverview';
import SellerAnalyticsPage from './portals/seller/SellerAnalyticsPage';
import BusinessProfilePage from './portals/seller/BusinessProfilePage';

// Admin Dedicated Pages (Stage 2)
import AdminDashboard from './portals/admin/AdminDashboard';
import AdminSellersPage from './portals/admin/AdminSellersPage';
import AdminCustomersPage from './portals/admin/AdminCustomersPage';
import AdminCentralOrdersPage from './portals/admin/AdminCentralOrdersPage';
import OrderAggregationPage from './portals/admin/OrderAggregationPage';
import DeliveryManagementPage from './portals/admin/DeliveryManagementPage';
import DeliveryAgentsPage from './portals/admin/DeliveryAgentsPage';
import AdminRoutesPage from './portals/admin/AdminRoutesPage';
import AdminNotificationsPage from './portals/admin/AdminNotificationsPage';
import AdminAnalyticsPage from './portals/admin/AdminAnalyticsPage';
import AdminReportsPage from './portals/admin/AdminReportsPage';
import AdminSettingsPage from './portals/admin/AdminSettingsPage';

// Common / Shared Pages (Stage 1 Preservation)
import OrdersPage from './portals/customer/OrdersPage';
import ProductsPage from './portals/seller/ProductsPage';
import InventoryPage from './portals/seller/InventoryPage';
import DeliveriesPage from './portals/seller/DeliveriesPage';
import MapPlanning from './portals/admin/MapPlanning';
import CustomersPage from './portals/seller/CustomersPage';
import NotificationsPage from './portals/customer/NotificationsPage';
import SettingsPage from './portals/customer/SettingsPage';
import HelpPage from './portals/customer/HelpPage';

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

            {/* Admin Dedicated Routes (Stage 2) */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/sellers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminSellersPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminCustomersPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminCentralOrdersPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/order-aggregation" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><OrderAggregationPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/delivery-management" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><DeliveryManagementPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/delivery-agents" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><DeliveryAgentsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/routes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminRoutesPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminNotificationsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminAnalyticsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminReportsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminSettingsPage /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Shared / Role-aware Routes (Stage 1 Preservation) */}
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
