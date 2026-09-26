import React, { useState, useEffect } from 'react';
import { EventState, EventPhase } from '../../shared/types/event';
import { INITIAL_EVENT_STATE, PHASE_METADATA } from '../../mocks/mockEventState';
import { AdminHeader } from '../components/AdminHeader';
import { EventOverview } from '../components/EventOverview';
import { RoundControls } from '../components/RoundControls';
import { LayoutDashboard, Users, Award, Sliders } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [eventState, setEventState] = useState<EventState>(INITIAL_EVENT_STATE);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'scores' | 'round-tools'>('overview');

  // Simulated live countdown timer tick
  useEffect(() => {
    if (eventState.status !== 'RUNNING' || eventState.timer.remainingSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setEventState((prev) => {
        if (prev.status !== 'RUNNING' || prev.timer.remainingSeconds <= 0) {
          return prev;
        }
        return {
          ...prev,
          timer: {
            ...prev.timer,
            remainingSeconds: Math.max(0, prev.timer.remainingSeconds - 1),
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [eventState.status, eventState.timer.remainingSeconds]);

  // Handler to update event state
  const handleUpdateState = (updated: Partial<EventState>) => {
    setEventState((prev) => ({
      ...prev,
      ...updated,
      lastUpdated: new Date().toLocaleTimeString(),
    }));
  };

  // Handler to advance phase
  const handleAdvancePhase = (nextPhase: EventPhase) => {
    const meta = PHASE_METADATA[nextPhase];
    setEventState((prev) => ({
      ...prev,
      currentPhase: nextPhase,
      phaseLabel: meta.label,
      roundName: meta.name,
      roundDescription: meta.description,
      roundNumber: meta.roundNumber,
      status: 'IDLE',
      timer: {
        durationSeconds: 1800,
        remainingSeconds: 1800,
        isRunning: false,
        serverTimestamp: Date.now(),
      },
      lastUpdated: new Date().toLocaleTimeString(),
    }));
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#F2F3F5] flex flex-col selection:bg-accent-blue selection:text-black">
      {/* Surveillance Admin Header */}
      <AdminHeader currentPhase={eventState.currentPhase} />

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-bg-border pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-[#0d0f14]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Event Overview & Controls</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'teams'
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-[#0d0f14]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teams List (Module 3)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'scores'
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-[#0d0f14]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Score Management (Module 5)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('round-tools')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'round-tools'
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-[#0d0f14]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Round Tools (Spoorthi)</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. At-a-glance Event Overview */}
            <EventOverview
              eventState={eventState}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />

            {/* 2. Global Round Controls with Safety Confirmations */}
            <RoundControls
              eventState={eventState}
              onUpdateState={handleUpdateState}
              onAdvancePhase={handleAdvancePhase}
            />
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="p-12 text-center bg-[#0d0f14] border border-bg-border rounded-xl space-y-3">
            <Users className="w-12 h-12 text-accent-blue mx-auto opacity-70" />
            <h3 className="text-xl font-bold">Teams List & Detail Module</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Ready to build next! Will include full table of registered teams, active vs eliminated filter, and team drill-down modal.
            </p>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="p-12 text-center bg-[#0d0f14] border border-bg-border rounded-xl space-y-3">
            <Award className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-xl font-bold">Score Management & Audit Trail</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Ready to build! Will include score adjustments, reason tagging, and change history logs.
            </p>
          </div>
        )}

        {activeTab === 'round-tools' && (
          <div className="p-12 text-center bg-[#0d0f14] border border-bg-border rounded-xl space-y-3">
            <Sliders className="w-12 h-12 text-purple-400 mx-auto opacity-70" />
            <h3 className="text-xl font-bold">Round Specific Admin Tools</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Spoorthi's modules (Captaincy, Secret Task, Nominations, Evictions). Hooks seamlessly onto this state machine!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
