import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/hooks/useAuth';
import { EventPhaseProvider } from './shared/hooks/useEventPhase';

import { LandingPage } from './participant/pages/LandingPage';
import { DashboardPage } from './participant/pages/DashboardPage';
import { ProfilePage } from './participant/pages/ProfilePage';
import { Round1TaskPage } from './participant/pages/Round1TaskPage';
import { Round2CaptaincyPage } from './participant/pages/Round2CaptaincyPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
// @ts-ignore
import { RoundToolsContainer } from './admin/rounds/RoundToolsContainer';

// Anjishth's Participant Panel Modules & Contracts
import { EventProvider, useEventContext } from './contracts/EventContext';
import { AuthProvider as ContractsAuthProvider } from './contracts/AuthContext';
import { Shell } from './components/Shell';
import { EventPhase as ContractEventPhase } from './contracts/types';
import { SecretMission } from './modules/SecretMission/SecretMission';
import { NominationStatus } from './modules/NominationStatus/NominationStatus';
import { ImmunityChallenge } from './modules/ImmunityChallenge/ImmunityChallenge';
import { Voting } from './modules/Voting/Voting';
import { EvictionReveal } from './modules/Eviction/EvictionReveal';
import { Round4Features } from './modules/Round4Features/Round4Features';
import { Round4Submission } from './modules/Round4Submission/Round4Submission';
import { FinalResults } from './modules/FinalResults/FinalResults';

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

// Shell wrapper for Anjishth's standalone participant modules
const ParticipantModuleShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ContractsAuthProvider>
      <EventProvider>
        <Shell>
          {children}
        </Shell>
      </EventProvider>
    </ContractsAuthProvider>
  );
};

// Active module switcher for the live participant flow
const ActiveParticipantModule: React.FC = () => {
  const { phase } = useEventContext();

  switch (phase) {
    case ContractEventPhase.ROUND_2_SECRET_TASK:
      return <SecretMission />;
    case ContractEventPhase.ROUND_2_NOMINATIONS:
      return <NominationStatus />;
    case ContractEventPhase.ROUND_3_IMMUNITY:
      return <ImmunityChallenge />;
    case ContractEventPhase.ROUND_3_VOTING_OPEN:
    case ContractEventPhase.ROUND_3_VOTING_CLOSED:
      return <Voting />;
    case ContractEventPhase.ROUND_3_EVICTION_REVEAL:
      return <EvictionReveal />;
    case ContractEventPhase.ROUND_4_FEATURES_REVEALED:
      return <Round4Features />;
    case ContractEventPhase.ROUND_4_SUBMISSION:
      return <Round4Submission />;
    case ContractEventPhase.FINAL_RESULTS:
      return <FinalResults />;
    default:
      return (
        <div className="text-center text-text-secondary py-12 font-mono">
          Waiting for event to begin... ({phase})
        </div>
      );
  }
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventPhaseProvider>
          <Routes>
            {/* Participant Primary Flow (Aryan & Anjishth) */}
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

            {/* Anjishth's Mid/Late Event Modules */}
            <Route
              path="/secret-mission"
              element={
                <ParticipantModuleShell>
                  <SecretMission />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/nomination-status"
              element={
                <ParticipantModuleShell>
                  <NominationStatus />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/immunity-challenge"
              element={
                <ParticipantModuleShell>
                  <ImmunityChallenge />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/voting"
              element={
                <ParticipantModuleShell>
                  <Voting />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/eviction-reveal"
              element={
                <ParticipantModuleShell>
                  <EvictionReveal />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/round-4-features"
              element={
                <ParticipantModuleShell>
                  <Round4Features />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/round-4-submission"
              element={
                <ParticipantModuleShell>
                  <Round4Submission />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/final-results"
              element={
                <ParticipantModuleShell>
                  <FinalResults />
                </ParticipantModuleShell>
              }
            />
            <Route
              path="/participant-panel"
              element={
                <ParticipantModuleShell>
                  <ActiveParticipantModule />
                </ParticipantModuleShell>
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
