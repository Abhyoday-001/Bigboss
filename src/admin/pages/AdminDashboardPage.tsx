import React, { useState, useEffect } from 'react';
import { EventState, EventPhase } from '../../shared/types/event';
import { INITIAL_EVENT_STATE, PHASE_METADATA } from '../../mocks/mockEventState';
import { INITIAL_MOCK_TEAMS, TeamRecord, TeamStatus } from '../../mocks/mockTeams';
import { AdminHeader } from '../components/AdminHeader';
import { EventOverview } from '../components/EventOverview';
import { RoundControls } from '../components/RoundControls';
import { TeamsTable } from '../components/TeamsTable';
import { TeamDetailModal } from '../components/TeamDetailModal';
// @ts-ignore
import { RoundToolsContainer } from '../rounds/RoundToolsContainer';
import { LayoutDashboard, Users, Award, Sliders } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [eventState, setEventState] = useState<EventState>(INITIAL_EVENT_STATE);
  const [teams, setTeams] = useState<TeamRecord[]>(INITIAL_MOCK_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<TeamRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'scores' | 'round-tools'>('overview');

  // Keep team counts synchronized with actual teams roster
  useEffect(() => {
    const total = teams.length;
    const active = teams.filter((t) => t.status !== 'EVICTED').length;
    const nominated = teams.filter((t) => t.status === 'NOMINATED').length;
    const eliminated = teams.filter((t) => t.status === 'EVICTED').length;
    const safe = teams.filter((t) => t.status === 'IMMUNE' || t.status === 'CAPTAIN').length;

    setEventState((prev) => ({
      ...prev,
      teamCounts: {
        total,
        active,
        nominated,
        eliminated,
        safe,
      },
    }));
  }, [teams]);

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

  // Handler for Team Drill-down
  const handleSelectTeam = (team: TeamRecord) => {
    setSelectedTeam(team);
    setIsDetailModalOpen(true);
  };

  // Handler to update team status
  const handleUpdateTeamStatus = (teamId: string, newStatus: TeamStatus) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t))
    );
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Handler to register new team
  const handleAddTeam = (newTeam: Partial<TeamRecord>) => {
    const newId = `team-${teams.length + 1}`;
    const newCode = `DEV-${100 + teams.length + 1}`;
    const record: TeamRecord = {
      id: newId,
      teamCode: newCode,
      name: newTeam.name || `Team ${teams.length + 1}`,
      leader: newTeam.leader || 'Leader',
      members: newTeam.members || ['Leader', 'Member 2', 'Member 3'],
      status: 'ACTIVE',
      score: 0,
      rank: teams.length + 1,
      registeredAt: new Date().toLocaleTimeString(),
      roundScores: { round1: 0, round2: 0, round3: 0, round4: 0 },
      scoreHistory: [],
    };
    setTeams((prev) => [...prev, record]);
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
            <span>Teams List & Details ({teams.length})</span>
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

        {/* Tab 1: Event Overview & Master Controls */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <EventOverview
              eventState={eventState}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />

            <RoundControls
              eventState={eventState}
              onUpdateState={handleUpdateState}
              onAdvancePhase={handleAdvancePhase}
            />
          </div>
        )}

        {/* Tab 2: All Teams List & Drill-down */}
        {activeTab === 'teams' && (
          <div className="space-y-6 animate-fadeIn">
            <TeamsTable
              teams={teams}
              onSelectTeam={handleSelectTeam}
              onAddTeam={handleAddTeam}
            />
          </div>
        )}

        {/* Tab 3: Score Management Placeholder */}
        {activeTab === 'scores' && (
          <div className="p-12 text-center bg-[#0d0f14] border border-bg-border rounded-xl space-y-3">
            <Award className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-xl font-bold">Score Management & Audit Trail</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Ready to build! Will include manual point entry/adjustment forms and visible audit logs for Dilraj.
            </p>
          </div>
        )}

        {/* Tab 4: Spoorthi's Round Tools */}
        {activeTab === 'round-tools' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundToolsContainer />
          </div>
        )}

        {/* Team Detail Modal */}
        <TeamDetailModal
          isOpen={isDetailModalOpen}
          team={selectedTeam}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateStatus={handleUpdateTeamStatus}
        />
      </main>
    </div>
  );
};
