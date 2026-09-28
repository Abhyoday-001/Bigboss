import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/hooks/useAuth';
import { EventPhaseProvider } from './shared/hooks/useEventPhase';

import { LandingPage } from './participant/pages/LandingPage';
import { LoginPage } from './participant/pages/LoginPage';
import { DashboardPage } from './participant/pages/DashboardPage';
import { ProfilePage } from './participant/pages/ProfilePage';
import { Round1TaskPage } from './participant/pages/Round1TaskPage';
import { Round2CaptaincyPage } from './participant/pages/Round2CaptaincyPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
// @ts-ignore
import { RoundToolsContainer } from './admin/rounds/RoundToolsContainer';

// Route guard for participant screens
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Route guard for Admin dashboard
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  if (role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventPhaseProvider>
          <Routes>
            {/* Participant Routes (Aryan & Anjishth) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/round-1"
              element={
                <ProtectedRoute>
                  <Round1TaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/round-2-captaincy"
              element={
                <ProtectedRoute>
                  <Round2CaptaincyPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes (Dilraj & Spoorthi) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/rounds"
              element={
                <AdminProtectedRoute>
                  <RoundToolsContainer />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />

            {/* Catch-all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventPhaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
