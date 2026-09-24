import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingFallback from './components/common/LoadingFallback';
import OfflineBanner from './components/common/OfflineBanner';

// Public Pages (Static imports for instant initial paint)
import LandingPage from './auth/LandingPage';
import LoginPage from './auth/LoginPage';
import CustomerRegisterPage from './auth/CustomerRegisterPage';
import SellerRegisterPage from './auth/SellerRegisterPage';
import NotFoundPage from './components/common/NotFoundPage';

// Customer Pages (Lazy loaded chunks)
const CustomerDashboard = lazy(() => import('./portals/customer/CustomerDashboard'));
const BrowseSellersPage = lazy(() => import('./portals/customer/BrowseSellersPage'));
const CartPage = lazy(() => import('./portals/customer/CartPage'));
const CheckoutPage = lazy(() => import('./portals/customer/CheckoutPage'));
const TrackDeliveryPage = lazy(() => import('./portals/customer/TrackDeliveryPage'));
const DeliverySchedulePage = lazy(() => import('./portals/customer/DeliverySchedulePage'));
const ProfilePage = lazy(() => import('./portals/customer/ProfilePage'));
const OrdersPage = lazy(() => import('./portals/customer/OrdersPage'));
const NotificationsPage = lazy(() => import('./portals/customer/NotificationsPage'));
const SettingsPage = lazy(() => import('./portals/customer/SettingsPage'));
const HelpPage = lazy(() => import('./portals/customer/HelpPage'));

// Seller / Vendor Pages (Lazy loaded chunks)
const DashboardOverview = lazy(() => import('./portals/seller/DashboardOverview'));
const ProductsPage = lazy(() => import('./portals/seller/ProductsPage'));
const InventoryPage = lazy(() => import('./portals/seller/InventoryPage'));
const CustomersPage = lazy(() => import('./portals/seller/CustomersPage'));
const DeliveriesPage = lazy(() => import('./portals/seller/DeliveriesPage'));
const SellerAnalyticsPage = lazy(() => import('./portals/seller/SellerAnalyticsPage'));
const BusinessProfilePage = lazy(() => import('./portals/seller/BusinessProfilePage'));

// Admin Dedicated Pages (Lazy loaded chunks)
const AdminDashboard = lazy(() => import('./portals/admin/AdminDashboard'));
const AdminSellersPage = lazy(() => import('./portals/admin/AdminSellersPage'));
const AdminCustomersPage = lazy(() => import('./portals/admin/AdminCustomersPage'));
const AdminCentralOrdersPage = lazy(() => import('./portals/admin/AdminCentralOrdersPage'));
const OrderAggregationPage = lazy(() => import('./portals/admin/OrderAggregationPage'));
const DeliveryManagementPage = lazy(() => import('./portals/admin/DeliveryManagementPage'));
const DeliveryAgentsPage = lazy(() => import('./portals/admin/DeliveryAgentsPage'));
const AdminRoutesPage = lazy(() => import('./portals/admin/AdminRoutesPage'));
const AdminNotificationsPage = lazy(() => import('./portals/admin/AdminNotificationsPage'));
const AdminAnalyticsPage = lazy(() => import('./portals/admin/AdminAnalyticsPage'));
const AdminReportsPage = lazy(() => import('./portals/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./portals/admin/AdminSettingsPage'));

// Delivery Partner Pages (Lazy loaded chunks)
const DeliveryDashboard = lazy(() => import('./portals/delivery/DeliveryDashboard'));
const MyDeliveriesPage = lazy(() => import('./portals/delivery/MyDeliveriesPage'));
const PickupPage = lazy(() => import('./portals/delivery/PickupPage'));
const RoutePage = lazy(() => import('./portals/delivery/RoutePage'));
const DeliveryStatusPage = lazy(() => import('./portals/delivery/DeliveryStatusPage'));
const DeliveryHistoryPage = lazy(() => import('./portals/delivery/DeliveryHistoryPage'));
const NotificationsPageDelivery = lazy(() => import('./portals/delivery/NotificationsPage'));
const DeliveryProfilePage = lazy(() => import('./portals/delivery/DeliveryProfilePage'));
const DeliveryHelpPage = lazy(() => import('./portals/delivery/HelpSupportPage'));

import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <OfflineBanner />
        <Router>
          <div className="app-container">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register-customer" element={<CustomerRegisterPage />} />
                <Route path="/register-seller" element={<SellerRegisterPage />} />

                {/* Legacy / Direct Route Aliases */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><CustomerDashboard /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/browse-sellers" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><BrowseSellersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor']}>
                    <DashboardLayout><ProductsPage /></DashboardLayout>
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
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><TrackDeliveryPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery-schedule" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><DeliverySchedulePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor']}>
                    <DashboardLayout><OrdersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><InventoryPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><CustomersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/deliveries" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                    <DashboardLayout><DeliveriesPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin', 'delivery_partner']}>
                    <DashboardLayout><NotificationsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin', 'delivery_partner']}>
                    <DashboardLayout><ProfilePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor']}>
                    <DashboardLayout><SettingsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor']}>
                    <DashboardLayout><HelpPage /></DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Customer Dedicated Portal Routes */}
                <Route path="/customer-dashboard" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><CustomerDashboard /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/browse-sellers" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><BrowseSellersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/cart" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><CartPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/checkout" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><CheckoutPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/track-delivery" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><TrackDeliveryPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/delivery-schedule" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><DeliverySchedulePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/orders" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><OrdersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/profile" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><ProfilePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/notifications" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><NotificationsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/settings" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><SettingsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/customer/help" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout><HelpPage /></DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Seller / Vendor Dedicated Portal Routes */}
                <Route path="/vendor-dashboard" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><DashboardOverview /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/products" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><ProductsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/inventory" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><InventoryPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/orders" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><OrdersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/customers" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><CustomersPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/deliveries" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><DeliveriesPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/analytics" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><SellerAnalyticsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/business-profile" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><BusinessProfilePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/seller/notifications" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <DashboardLayout><NotificationsPage /></DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Admin Dedicated Portal Routes */}
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
                <Route path="/order-aggregation" element={<Navigate to="/admin/order-aggregation" replace />} />
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

                {/* Delivery Partner Dedicated Portal Routes */}
                <Route path="/delivery-dashboard" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><DeliveryDashboard /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/deliveries" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><MyDeliveriesPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/pickup" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><PickupPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/route" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><RoutePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/status" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><DeliveryStatusPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/history" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><DeliveryHistoryPage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/notifications" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><NotificationsPageDelivery /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/profile" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><DeliveryProfilePage /></DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/delivery/help" element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DashboardLayout><DeliveryHelpPage /></DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Catch-All Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
