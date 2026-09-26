import React, { useState, useEffect } from 'react';
import { EventState, EventPhase } from '../../shared/types/event';
import { INITIAL_EVENT_STATE, PHASE_METADATA } from '../../mocks/mockEventState';
import { INITIAL_MOCK_TEAMS, TeamRecord, TeamStatus } from '../../mocks/mockTeams';
import { Team } from '../../shared/state-machine/types';
import { AdminHeader } from '../components/AdminHeader';
import { EventOverview } from '../components/EventOverview';
import { RoundControls } from '../components/RoundControls';
import { TeamsTable } from '../components/TeamsTable';
import { TeamDetailModal } from '../components/TeamDetailModal';
// @ts-ignore
import { RoundToolsContainer } from '../rounds/RoundToolsContainer';
import { LiveLeaderboard } from '../../shared/components/LiveLeaderboard';
import { LayoutDashboard, Users, Award, Sliders, ShieldCheck, Plus, AlertCircle, RotateCcw } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [eventState, setEventState] = useState<EventState>(INITIAL_EVENT_STATE);
  const [teams, setTeams] = useState<TeamRecord[]>(INITIAL_MOCK_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<TeamRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'scores' | 'round-tools'>('overview');

  // Audit log entries for score adjustments
  const [auditLogs, setAuditLogs] = useState<
    { timestamp: string; teamName: string; delta: number; reason: string }[]
  >([
    { timestamp: '23:40:12', teamName: 'CyberNexus', delta: 50, reason: 'Round 1 First Solver Bonus' },
    { timestamp: '23:35:00', teamName: 'NullPointers', delta: -10, reason: 'Late Submission Deduction' },
    { timestamp: '23:30:15', teamName: 'ByteForce', delta: 25, reason: 'Speed Milestone Award' },
  ]);

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

  // Handler to update score in real-time
  const handleUpdateScore = (teamId: string, newScore: number) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const delta = newScore - t.score;
          setAuditLogs((logs) => [
            {
              timestamp: new Date().toLocaleTimeString(),
              teamName: t.name,
              delta,
              reason: 'Direct Admin Score Calibration',
            },
            ...logs.slice(0, 9),
          ]);
          return { ...t, score: newScore };
        }
        return t;
      })
    );
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

  // Convert TeamRecord to participant Team interface for LiveLeaderboard
  const leaderboardTeams: Team[] = teams.map((t) => ({
    id: t.id,
    teamName: t.name,
    score: t.score,
    status:
      t.status === 'EVICTED'
        ? 'ELIMINATED'
        : t.status === 'NOMINATED'
        ? 'NOMINATED'
        : t.status === 'IMMUNE' || t.status === 'CAPTAIN'
        ? 'SAFE'
        : 'ACTIVE',
    rank: t.rank,
    members: t.members.map((m, idx) => ({
      name: m,
      role: idx === 0 ? 'CAPTAIN' : 'MEMBER',
    })),
  }));

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col selection:bg-accent-blue/30 selection:text-accent-blue-glow surveillance-grid">
      {/* Surveillance Admin Header */}
      <AdminHeader currentPhase={eventState.currentPhase} />

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Unified Command Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-accent-blue/20 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-accent-blue" />
            <span>[ 01 · COMMAND CENTER ]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('round-tools')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'round-tools'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4 text-accent-blue" />
            <span>[ 02 · ROUND ENGINES (R2–R4) ]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-accent-blue" />
            <span>[ 03 · HOUSE ROSTER ({teams.length}) ]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'scores'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Award className="w-4 h-4 text-accent-blue" />
            <span>[ 04 · SCORING & AUDIT ]</span>
          </button>
        </div>

        {/* Tab 1: Event Command Center & Master Controls */}
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

        {/* Tab 2: Round Operational Engines (Spoorthi's modules seamlessly integrated) */}
        {activeTab === 'round-tools' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundToolsContainer embedded={true} />
          </div>
        )}

        {/* Tab 3: House Roster & Drill-down */}
        {activeTab === 'teams' && (
          <div className="space-y-6 animate-fadeIn">
            <TeamsTable
              teams={teams}
              onSelectTeam={handleSelectTeam}
              onAddTeam={handleAddTeam}
            />
          </div>
        )}

        {/* Tab 4: Unified Scoring Console, Live Leaderboard & Audit Trail */}
        {activeTab === 'scores' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl panel-card border border-accent-blue/25 bg-bg-elevated">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-accent-blue font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AUTHORITATIVE SCORING ENGINE</span>
                </div>
                <h2 className="text-xl font-display uppercase tracking-wider text-text-primary mt-1">
                  House Calibration & Audit Trail
                </h2>
                <p className="text-xs text-text-secondary">
                  Click on any score directly in the table below to adjust points, grant bonuses, or penalize teams.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                <span>LEDGER ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Interactive Leaderboard with Admin Edit Capability */}
              <div className="lg:col-span-2 space-y-4">
                <LiveLeaderboard
                  teams={leaderboardTeams}
                  isAdmin={true}
                  onUpdateScore={handleUpdateScore}
                />
              </div>

              {/* Real-time Audit Trail & Calibration Log */}
              <div className="space-y-4">
                <div className="panel-card border border-accent-blue/20 bg-bg-elevated p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-accent-blue/15 mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-accent-blue" />
                      Live Point Log
                    </span>
                    <span className="text-[10px] font-mono text-accent-blue">
                      {auditLogs.length} events
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {auditLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-bg-primary border border-accent-blue/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-text-primary font-mono">{log.teamName}</div>
                          <div className="text-[10px] text-text-secondary">{log.reason}</div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-mono font-bold ${
                              log.delta > 0 ? 'text-success-green' : 'text-danger-red'
                            }`}
                          >
                            {log.delta > 0 ? `+${log.delta}` : log.delta} pts
                          </span>
                          <div className="text-[9px] font-mono text-text-secondary/60">
                            {log.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Policy Reference */}
                <div className="panel-card border border-accent-blue/15 bg-bg-elevated/60 p-4 text-xs text-text-secondary space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent-blue font-bold block">
                    // SCORING POLICY RULES
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-text-secondary/80 leading-relaxed font-mono">
                    <li>Round 1: +100 max algorithmic task</li>
                    <li>Round 2: Captain immunity + quota pass</li>
                    <li>Round 3: Pairing duel points & voting ratio</li>
                    <li>Round 4: Judge rubric 100 max + penalty deductions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Detail Drill-down Modal */}
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
