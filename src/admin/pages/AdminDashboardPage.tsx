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
import { LiveLeaderboard } from '../../shared/components/LiveLeaderboard';

// Spoorthi's Round 2 Modules
// @ts-ignore
import Round2Captaincy from '../rounds/Round2Captaincy';
// @ts-ignore
import Round2Nominations from '../rounds/Round2Nominations';
// @ts-ignore
import Round2SecretMission from '../rounds/Round2SecretMission';

// Spoorthi's Round 3 Modules
// @ts-ignore
import Round3TeamPairing from '../rounds/Round3TeamPairing';
// @ts-ignore
import Round3ImmunityControl from '../rounds/Round3ImmunityControl';
// @ts-ignore
import Round3VotingControl from '../rounds/Round3VotingControl';
// @ts-ignore
import Round3EvictionReveal from '../rounds/Round3EvictionReveal';

// Spoorthi's Round 4 Modules
// @ts-ignore
import Round4HiddenFeatures from '../rounds/Round4HiddenFeatures';
// @ts-ignore
import Round4Submissions from '../rounds/Round4Submissions';
// @ts-ignore
import Round4JudgeScoring from '../rounds/Round4JudgeScoring';
// Spoorthi's Round 4 Modules
// @ts-ignore
import Round4PenaltyInterface from '../rounds/Round4PenaltyInterface';
// @ts-ignore
import Round4FinalScoreboard from '../rounds/Round4FinalScoreboard';
// @ts-ignore
import { RoundToolsContainer } from '../rounds/RoundToolsContainer';

import {
  LayoutDashboard,
  Crown,
  Swords,
  Trophy,
  Users,
  Award,
  ShieldCheck,
  AlertCircle,
  Eye,
  Sliders,
  UserMinus,
  EyeOff,
  Vote,
  Skull,
  FileCode,
  Globe,
  MinusCircle,
  RotateCcw,
} from 'lucide-react';

type AdminTab = 'overview' | 'round-2' | 'round-3' | 'round-4' | 'round-tools' | 'teams' | 'scores';

export const AdminDashboardPage: React.FC = () => {
  const [eventState, setEventState] = useState<EventState>(INITIAL_EVENT_STATE);
  const [teams, setTeams] = useState<TeamRecord[]>(INITIAL_MOCK_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<TeamRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Active primary tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Sub-tabs for each specific round
  const [r2SubTab, setR2SubTab] = useState<'captaincy' | 'nominations' | 'secret-mission'>('captaincy');
  const [r3SubTab, setR3SubTab] = useState<'pairings' | 'immunity' | 'voting' | 'eviction'>('pairings');
  const [r4SubTab, setR4SubTab] = useState<'hidden' | 'submissions' | 'judging' | 'penalties' | 'scoreboard'>('hidden');

  // Audit log entries for score adjustments
  const [auditLogs, setAuditLogs] = useState<
    { timestamp: string; teamName: string; delta: number; reason: string }[]
  >([
    { timestamp: '23:40:12', teamName: 'CyberNexus', delta: 50, reason: 'Round 1 Algorithmic Winner' },
    { timestamp: '23:35:00', teamName: 'NullPointers', delta: -10, reason: 'Out of Scope Deduction' },
    { timestamp: '23:30:15', teamName: 'ByteForce', delta: 25, reason: 'Captaincy Challenge Bonus' },
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
          {/* Tab 1: Command Center */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-accent-blue" />
            <span>[ 01 · COMMAND CENTER ]</span>
          </button>

          {/* Tab 2: Round 2 Operations */}
          <button
            type="button"
            onClick={() => setActiveTab('round-2')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-2'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Crown className="w-4 h-4 text-accent-blue" />
            <span>[ 02 · ROUND 2 (CAPTAINCY) ]</span>
          </button>

          {/* Tab 3: Round 3 Operations */}
          <button
            type="button"
            onClick={() => setActiveTab('round-3')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-3'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Swords className="w-4 h-4 text-accent-blue" />
            <span>[ 03 · ROUND 3 (EVICTIONS) ]</span>
          </button>

          {/* Tab 4: Round 4 Finale */}
          <button
            type="button"
            onClick={() => setActiveTab('round-4')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-4'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Trophy className="w-4 h-4 text-accent-blue" />
            <span>[ 04 · ROUND 4 (FINALE) ]</span>
          </button>

          {/* Tab 5: All Round Engines Matrix */}
          <button
            type="button"
            onClick={() => setActiveTab('round-tools')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-tools'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4 text-accent-blue" />
            <span>[ 05 · ALL ROUND ENGINES ]</span>
          </button>

          {/* Tab 6: House Roster */}
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-accent-blue" />
            <span>[ 06 · HOUSE ROSTER ({teams.length}) ]</span>
          </button>

          {/* Tab 7: Scoring & Audit */}
          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scores'
                ? 'bg-accent-blue/15 text-accent-blue-glow border border-accent-blue/40 shadow-glow-blue font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Award className="w-4 h-4 text-accent-blue" />
            <span>[ 07 · SCORING & AUDIT ]</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: COMMAND CENTER (DILRAJ'S MASTER CONTROLS)          */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <EventOverview
              eventState={eventState}
              onNavigateTab={(tab) => {
                if (tab === 'round-tools') setActiveTab('round-tools');
                else if (tab === 'teams') setActiveTab('teams');
                else if (tab === 'scores') setActiveTab('scores');
                else setActiveTab(tab as any);
              }}
            />

            <RoundControls
              eventState={eventState}
              onUpdateState={handleUpdateState}
              onAdvancePhase={handleAdvancePhase}
            />

            {/* Quick Access Matrix to All Operations */}
            <div className="p-6 rounded-xl panel-card border border-accent-blue/25 bg-bg-elevated space-y-4">
              <div className="flex items-center justify-between border-b border-accent-blue/15 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-accent-blue" />
                  <h3 className="font-display tracking-wider text-base uppercase text-text-primary">
                    Round Specific Operations Dispatch
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-accent-blue uppercase tracking-widest">
                  DIRECT ACCESS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab('round-2')}
                  className="p-4 rounded-lg bg-bg-primary/80 border border-accent-blue/20 hover:border-accent-blue hover:bg-accent-blue/10 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent-blue">ROUND 2</span>
                    <Crown className="w-4 h-4 text-accent-blue group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary">Captaincy & Intrigue</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Captain nomination competition, reveal ceremonies, quota allocation, and secret missions.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('round-3')}
                  className="p-4 rounded-lg bg-bg-primary/80 border border-accent-blue/20 hover:border-accent-blue hover:bg-accent-blue/10 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent-blue">ROUND 3</span>
                    <Swords className="w-4 h-4 text-accent-blue group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary">Pairings & Evictions</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Team pairings, immunity duels, real-time voting controls, and dramatic eviction reveals.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('round-4')}
                  className="p-4 rounded-lg bg-bg-primary/80 border border-accent-blue/20 hover:border-accent-blue hover:bg-accent-blue/10 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent-blue">ROUND 4</span>
                    <Trophy className="w-4 h-4 text-accent-blue group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary">Finale & Judging</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Hidden feature unlocks, repository submissions, judge rubric scoring, and the final trophy ceremony.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ROUND 2 OPERATIONS (SPOORTHI'S ROUND 2 ENGINES)     */}
        {/* ========================================================= */}
        {activeTab === 'round-2' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Sub-navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl panel-card border border-accent-blue/25 bg-bg-elevated">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-accent-blue font-bold uppercase tracking-wider">
                  <Crown className="w-4 h-4" />
                  <span>ROUND 2 OPERATIONAL ENGINE</span>
                </div>
                <h2 className="text-xl font-display uppercase tracking-wider text-text-primary mt-1">
                  Captaincy, Nominations & Secret Missions
                </h2>
                <p className="text-xs text-text-secondary">
                  Manage the captain election duel, reveal the house leader, establish nomination quotas, and dispatch secret missions.
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center bg-bg-primary border border-accent-blue/20 rounded-lg p-1 text-xs font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => setR2SubTab('captaincy')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase ${
                    r2SubTab === 'captaincy'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Captaincy & Reveal
                </button>
                <button
                  type="button"
                  onClick={() => setR2SubTab('nominations')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase ${
                    r2SubTab === 'nominations'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Nominations
                </button>
                <button
                  type="button"
                  onClick={() => setR2SubTab('secret-mission')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase ${
                    r2SubTab === 'secret-mission'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Secret Mission
                </button>
              </div>
            </div>

            {/* Active Sub-module */}
            <div className="w-full">
              {r2SubTab === 'captaincy' && <Round2Captaincy />}
              {r2SubTab === 'nominations' && <Round2Nominations />}
              {r2SubTab === 'secret-mission' && <Round2SecretMission />}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ROUND 3 OPERATIONS (SPOORTHI'S ROUND 3 ENGINES)     */}
        {/* ========================================================= */}
        {activeTab === 'round-3' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Sub-navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl panel-card border border-accent-blue/25 bg-bg-elevated">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-accent-blue font-bold uppercase tracking-wider">
                  <Swords className="w-4 h-4" />
                  <span>ROUND 3 OPERATIONAL ENGINE</span>
                </div>
                <h2 className="text-xl font-display uppercase tracking-wider text-text-primary mt-1">
                  Team Pairings, Immunity Duels & Eviction Ceremony
                </h2>
                <p className="text-xs text-text-secondary">
                  Coordinate the head-to-head duels, grant immune protections, manage live voting sessions, and execute eviction reveals.
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center bg-bg-primary border border-accent-blue/20 rounded-lg p-1 text-xs font-mono shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setR3SubTab('pairings')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r3SubTab === 'pairings'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Pairings
                </button>
                <button
                  type="button"
                  onClick={() => setR3SubTab('immunity')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r3SubTab === 'immunity'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Immunity
                </button>
                <button
                  type="button"
                  onClick={() => setR3SubTab('voting')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r3SubTab === 'voting'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Voting
                </button>
                <button
                  type="button"
                  onClick={() => setR3SubTab('eviction')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r3SubTab === 'eviction'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Eviction Reveal
                </button>
              </div>
            </div>

            {/* Active Sub-module */}
            <div className="w-full">
              {r3SubTab === 'pairings' && <Round3TeamPairing />}
              {r3SubTab === 'immunity' && <Round3ImmunityControl />}
              {r3SubTab === 'voting' && <Round3VotingControl />}
              {r3SubTab === 'eviction' && <Round3EvictionReveal />}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ROUND 4 FINALE (SPOORTHI'S ROUND 4 ENGINES)         */}
        {/* ========================================================= */}
        {activeTab === 'round-4' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Sub-navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl panel-card border border-accent-blue/25 bg-bg-elevated">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-accent-blue font-bold uppercase tracking-wider">
                  <Trophy className="w-4 h-4" />
                  <span>ROUND 4 FINALE & JUDGING ENGINE</span>
                </div>
                <h2 className="text-xl font-display uppercase tracking-wider text-text-primary mt-1">
                  Hidden Features, Judge Scoring & Winner Podium
                </h2>
                <p className="text-xs text-text-secondary">
                  Unlock hidden surprise specifications, audit repository commits, submit rubric judge evaluations, and crown the winner.
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center bg-bg-primary border border-accent-blue/20 rounded-lg p-1 text-xs font-mono shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setR4SubTab('hidden')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r4SubTab === 'hidden'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Hidden Specs
                </button>
                <button
                  type="button"
                  onClick={() => setR4SubTab('submissions')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r4SubTab === 'submissions'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Submissions
                </button>
                <button
                  type="button"
                  onClick={() => setR4SubTab('judging')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r4SubTab === 'judging'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Judging
                </button>
                <button
                  type="button"
                  onClick={() => setR4SubTab('penalties')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r4SubTab === 'penalties'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Penalties
                </button>
                <button
                  type="button"
                  onClick={() => setR4SubTab('scoreboard')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                    r4SubTab === 'scoreboard'
                      ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Final Winner
                </button>
              </div>
            </div>

            {/* Active Sub-module */}
            <div className="w-full">
              {r4SubTab === 'hidden' && <Round4HiddenFeatures />}
              {r4SubTab === 'submissions' && <Round4Submissions />}
              {r4SubTab === 'judging' && <Round4JudgeScoring />}
              {r4SubTab === 'penalties' && <Round4PenaltyInterface />}
              {r4SubTab === 'scoreboard' && <Round4FinalScoreboard />}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ALL ROUND ENGINES (SPOORTHI'S FULL MATRIX)         */}
        {/* ========================================================= */}
        {activeTab === 'round-tools' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundToolsContainer embedded={true} />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: HOUSE ROSTER & DRILL-DOWN (DILRAJ'S TEAMS TABLE)    */}
        {/* ========================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-6 animate-fadeIn">
            <TeamsTable
              teams={teams}
              onSelectTeam={handleSelectTeam}
              onAddTeam={handleAddTeam}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: UNIFIED SCORING CONSOLE & AUDIT TRAIL              */}
        {/* ========================================================= */}
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

export default AdminDashboardPage;
