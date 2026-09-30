import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkerAuthProvider } from './context/WorkerAuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { WorkerLayout } from './components/layout/WorkerLayout';

// Auth Pages
import { WorkerLoginPage } from './pages/auth/WorkerLoginPage';
import { WorkerRegisterPage } from './pages/auth/WorkerRegisterPage';

// Operations Pages
import { AvailableJobsPage } from './pages/jobs/AvailableJobsPage';
import { ActiveJobPage } from './pages/jobs/ActiveJobPage';
import { JobHistoryPage } from './pages/history/JobHistoryPage';
import { WorkerDashboardPage } from './pages/dashboard/WorkerDashboardPage';
import { WorkerProfilePage } from './pages/profile/WorkerProfilePage';

export const App: React.FC = () => {
  return (
    <WorkerAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<WorkerLoginPage />} />
          <Route path="/register" element={<WorkerRegisterPage />} />

          {/* Protected Worker Operations Routes */}
          <Route
            element={
              <ProtectedRoute>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dispatch" replace />} />
            <Route path="/dispatch" element={<AvailableJobsPage />} />
            <Route path="/mission" element={<ActiveJobPage />} />
            <Route path="/history" element={<JobHistoryPage />} />
            <Route path="/dashboard" element={<WorkerDashboardPage />} />
            <Route path="/profile" element={<WorkerProfilePage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dispatch" replace />} />
        </Routes>
      </BrowserRouter>
    </WorkerAuthProvider>
  );
};

export default App;

