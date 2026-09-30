import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';

// Layouts
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthSessionWatcher } from './components/common/AuthSessionWatcher';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// User Portal Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { ServicesCatalogPage } from './pages/user/ServicesCatalogPage';
import { CreateRequestWizardPage } from './pages/user/CreateRequestWizardPage';
import { RequestTrackingPage } from './pages/user/RequestTrackingPage';
import { RequestHistoryPage } from './pages/user/RequestHistoryPage';
import { AddressBookPage } from './pages/user/AddressBookPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminWorkerReviewsPage } from './pages/admin/AdminWorkerReviewsPage';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthSessionWatcher />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes inside User Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<UserDashboardPage />} />
            <Route path="/services" element={<ServicesCatalogPage />} />
            <Route path="/request/new" element={<CreateRequestWizardPage />} />
            <Route path="/request/:id" element={<RequestTrackingPage />} />
            <Route path="/history" element={<RequestHistoryPage />} />
            <Route path="/addresses" element={<AddressBookPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Routes inside Admin Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="reviews" element={<AdminWorkerReviewsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

