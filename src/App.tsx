import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/hooks/useAuth';
import { EventPhaseProvider } from './shared/hooks/useEventPhase';

import { LandingPage } from './participant/pages/LandingPage';
import { DashboardPage } from './participant/pages/DashboardPage';
import { Round0QuizPage } from './participant/pages/Round0QuizPage';
import { Round1TaskPage } from './participant/pages/Round1TaskPage';
import { Round2Page } from './participant/pages/Round2Page';
import { Round3Page } from './participant/pages/Round3Page';
import { Round4Page } from './participant/pages/Round4Page';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { IntegrationWrapper } from './shared/socket/IntegrationWrapper';
import { ParticipantSyncNavigator } from './participant/components/ParticipantSyncNavigator';
// @ts-ignore
import { RoundToolsContainer } from './admin/rounds/RoundToolsContainer';

// Anjishth's Participant Panel Contracts & Modules
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

// Route guard for Admin dashboard (direct access while auth is being rebuilt)
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Active module switcher for the interactive participant panel harness
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
          <ContractsAuthProvider>
            <EventProvider>
<IntegrationWrapper>
              <ParticipantSyncNavigator />
              <Routes>
                {/* Landing & Authentication */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />

                {/* Participant Core Space */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                {/* Round 0 Area (Rapid Quiz) */}
                <Route
                  path="/round-0"
                  element={
                    <ProtectedRoute>
                      <Round0QuizPage />
                    </ProtectedRoute>
                  }
                />

                {/* Round 1 Area */}
                <Route
                  path="/round-1"
                  element={
                    <ProtectedRoute>
                      <Round1TaskPage />
                    </ProtectedRoute>
                  }
                />

                {/* Round 2 Area (Captaincy, Secret Task, Nominations) */}
                <Route
                  path="/round-2"
                  element={
                    <ProtectedRoute>
                      <Round2Page />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-2-captaincy"
                  element={
                    <ProtectedRoute>
                      <Round2Page initialTab="captaincy" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-2-secret-task"
                  element={
                    <ProtectedRoute>
                      <Round2Page initialTab="secret-mission" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/secret-mission"
                  element={
                    <ProtectedRoute>
                      <Round2Page initialTab="secret-mission" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-2-nominations"
                  element={
                    <ProtectedRoute>
                      <Round2Page initialTab="nominations" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nomination-status"
                  element={
                    <ProtectedRoute>
                      <Round2Page initialTab="nominations" />
                    </ProtectedRoute>
                  }
                />

                {/* Round 3 Area (Immunity, Voting, Eviction Reveal) */}
                <Route
                  path="/round-3"
                  element={
                    <ProtectedRoute>
                      <Round3Page />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-3-immunity"
                  element={
                    <ProtectedRoute>
                      <Round3Page initialTab="immunity" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/immunity-challenge"
                  element={
                    <ProtectedRoute>
                      <Round3Page initialTab="immunity" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-3-voting"
                  element={
                    <ProtectedRoute>
                      <Round3Page initialTab="voting" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voting"
                  element={
                    <ProtectedRoute>
                      <Round3Page initialTab="voting" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-3-eviction"
                  element={
                    <ProtectedRoute>
                      <Round3Page initialTab="eviction" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eviction-reveal"
                  element={
                    <ProtectedRoute>
                      <Round3Page initialTab="eviction" />
                    </ProtectedRoute>
                  }
                />

                {/* Round 4 Area (Specs, Submission, Champions Standings) */}
                <Route
                  path="/round-4"
                  element={
                    <ProtectedRoute>
                      <Round4Page />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-4-features"
                  element={
                    <ProtectedRoute>
                      <Round4Page initialTab="features" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/round-4-submission"
                  element={
                    <ProtectedRoute>
                      <Round4Page initialTab="submission" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/final-results"
                  element={
                    <ProtectedRoute>
                      <Round4Page initialTab="results" />
                    </ProtectedRoute>
                  }
                />

                {/* Anjishth's Standalone Interactive Shell Harness */}
                <Route
                  path="/participant-panel"
                  element={
                    <ProtectedRoute>
                      <Shell>
                        <ActiveParticipantModule />
                      </Shell>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes (Dilraj & Spoorthi) */}
                <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
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
</IntegrationWrapper>
            </EventProvider>
          </ContractsAuthProvider>
        </EventPhaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
