import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/hooks/useAuth';
import { EventPhaseProvider } from './shared/hooks/useEventPhase';

import { LandingPage } from './participant/pages/LandingPage';
import { LoginPage } from './participant/pages/LoginPage';
import { DashboardPage } from './participant/pages/DashboardPage';
import { ProfilePage } from './participant/pages/ProfilePage';
import { Round1TaskPage } from './participant/pages/Round1TaskPage';
import { Round2CaptaincyPage } from './participant/pages/Round2CaptaincyPage';

// Simple route guard for participant screens
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            <Route path="/login" element={<LoginPage />} />
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

            {/* Catch-all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventPhaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
