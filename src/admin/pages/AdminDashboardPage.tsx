import React, { useState } from 'react';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { EventPhase } from '../../shared/state-machine/types';
import { INITIAL_MOCK_TEAMS, TeamRecord } from '../../mocks/mockTeams';
import { Team } from '../../shared/state-machine/types';
import { AdminHeader } from '../components/AdminHeader';
import { RoundTabControlBanner } from '../components/RoundTabControlBanner';
import { LiveLeaderboard } from '../../shared/components/LiveLeaderboard';
import { ScoreManager } from '../components/ScoreManager';

// Round 0 & 1 Modules
// @ts-ignore
import Round0QuizControl from '../rounds/Round0QuizControl';
// @ts-ignore
import Round1TaskControl from '../rounds/Round1TaskControl';

// Round 2 Modules
// @ts-ignore
import Round2Captaincy from '../rounds/Round2Captaincy';
// @ts-ignore
import Round2Nominations from '../rounds/Round2Nominations';
// @ts-ignore
import Round2SecretMission from '../rounds/Round2SecretMission';

// Round 3 Modules
// @ts-ignore
import Round3TeamPairing from '../rounds/Round3TeamPairing';
// @ts-ignore
import Round3ImmunityControl from '../rounds/Round3ImmunityControl';
// @ts-ignore
import Round3VotingControl from '../rounds/Round3VotingControl';
// @ts-ignore
import Round3EvictionReveal from '../rounds/Round3EvictionReveal';

// Round 4 Modules
// @ts-ignore
import Round4HiddenFeatures from '../rounds/Round4HiddenFeatures';
// @ts-ignore
import Round4Submissions from '../rounds/Round4Submissions';
// @ts-ignore
import Round4JudgeScoring from '../rounds/Round4JudgeScoring';
// @ts-ignore
import Round4PenaltyInterface from '../rounds/Round4PenaltyInterface';
// @ts-ignore
import Round4FinalScoreboard from '../rounds/Round4FinalScoreboard';

import {
  HelpCircle,
  Terminal,
  Crown,
  Swords,
  Trophy,
  Award,
  Radio,
  Pause,
  Zap,
} from 'lucide-react';

type AdminTab = 'round-0' | 'round-1' | 'round-2' | 'round-3' | 'round-4' | 'leaderboard';

export const AdminDashboardPage: React.FC = () => {
  const { currentPhase, setPhase } = useEventPhase();
  const [teams, setTeams] = useState<TeamRecord[]>(INITIAL_MOCK_TEAMS);
  
  // Clean primary round tab
  const [activeTab, setActiveTab] = useState<AdminTab>('round-0');

  // Sub-tabs for complex rounds
  const [r2SubTab, setR2SubTab] = useState<'captaincy' | 'nominations' | 'secret-mission'>('captaincy');
  const [r3SubTab, setR3SubTab] = useState<'pairings' | 'immunity' | 'voting' | 'eviction'>('immunity');
  const [r4SubTab, setR4SubTab] = useState<'hidden' | 'submissions' | 'judging' | 'penalties' | 'scoreboard'>('hidden');

  // Score calibration handlers
  const handleUpdateScore = (teamId: string, newScore: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: newScore } : t))
    );
  };

  const handleScoreAdjustment = (teamId: string, delta: number, _round: string, _reason: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
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

  const handleSetStandby = () => {
    setPhase('ROUND_0_RESULTS');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col selection:bg-accent-blue/30 selection:text-accent-blue-glow surveillance-grid">
      {/* Top Header */}
      <AdminHeader currentPhase={currentPhase as any} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Global Control & Quick Standby Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-elevated border border-accent-blue/20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase text-accent-blue tracking-widest font-bold">
                GLOBAL HOST BROADCAST STATUS
              </div>
              <div className="text-sm font-bold text-text-primary mt-0.5 flex items-center gap-2">
                <span className="text-text-secondary">Currently Broadcasting:</span>
                <span className="text-accent-blue-glow font-mono font-bold uppercase">
                  {currentPhase}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetStandby}
              className="py-2 px-4 rounded-lg bg-bg-primary hover:bg-bg-border border border-border-default hover:border-warning-amber/50 text-xs font-mono text-text-secondary hover:text-warning-amber transition-all flex items-center gap-2 cursor-pointer"
              title="Return all participant screens to waiting dashboard"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Intermission / Pause House</span>
            </button>
          </div>
        </div>

        {/* ── CLEAN ROUND-WISE TABS NAVIGATION ── */}
        <div className="flex items-center gap-2 border-b border-accent-blue/20 pb-3 overflow-x-auto">
          {/* Tab 0: Round 0 */}
          <button
            type="button"
            onClick={() => setActiveTab('round-0')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-0'
                ? 'bg-accent-blue text-black font-bold shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>[ R0 · RAPID QUIZ ]</span>
          </button>

          {/* Tab 1: Round 1 */}
          <button
            type="button"
            onClick={() => setActiveTab('round-1')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-1'
                ? 'bg-accent-blue text-black font-bold shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>[ R1 · BUILD CHALLENGE ]</span>
          </button>

          {/* Tab 2: Round 2 */}
          <button
            type="button"
            onClick={() => setActiveTab('round-2')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-2'
                ? 'bg-accent-blue text-black font-bold shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>[ R2 · CAPTAINCY & NOMINATIONS ]</span>
          </button>

          {/* Tab 3: Round 3 */}
          <button
            type="button"
            onClick={() => setActiveTab('round-3')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-3'
                ? 'bg-accent-blue text-black font-bold shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>[ R3 · IMMUNITY & EVICTIONS ]</span>
          </button>

          {/* Tab 4: Round 4 */}
          <button
            type="button"
            onClick={() => setActiveTab('round-4')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'round-4'
                ? 'bg-accent-blue text-black font-bold shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>[ R4 · THE FINALE ]</span>
          </button>

          {/* Tab 5: Leaderboard */}
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-accent-blue text-black font-bold shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>[ 🏆 LIVE LEADERBOARD ]</span>
          </button>
        </div>

        {/* ── TAB 0: ROUND 0 ── */}
        {activeTab === 'round-0' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundTabControlBanner
              roundNumber={0}
              roundTitle="Round 0: Rapid Technical Assessment"
              roundRoute="/round-0"
              startPhase="ROUND_0_ACTIVE"
              endPhase="ROUND_0_RESULTS"
              description="10-second rapid quiz to calibrate and seed the initial House Leaderboard. Configure questions, track real-time answers, and lock standings."
              defaultMinutes={10}
            />
            <Round0QuizControl />
          </div>
        )}

        {/* ── TAB 1: ROUND 1 ── */}
        {activeTab === 'round-1' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundTabControlBanner
              roundNumber={1}
              roundTitle="Round 1: Rapid Task & Architecture Challenge"
              roundRoute="/round-1"
              startPhase="ROUND_1_ACTIVE"
              endPhase="ROUND_1_RESULTS"
              description="Full-stack build task with mandatory checklists. Review team GitHub repos & live URLs, and manually grade deliverables."
              defaultMinutes={45}
            />
            <Round1TaskControl />
          </div>
        )}

        {/* ── TAB 2: ROUND 2 ── */}
        {activeTab === 'round-2' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundTabControlBanner
              roundNumber={2}
              roundTitle="Round 2: Captaincy Battle & Secret Missions"
              roundRoute="/round-2-captaincy"
              startPhase="ROUND_2_CAPTAINCY"
              endPhase="ROUND_3_IMMUNITY"
              activePhases={['ROUND_2_CAPTAINCY', 'ROUND_2_NOMINATIONS', 'ROUND_2_SECRET_TASK']}
              description="Manage the house captaincy duel, reveal the new House Captain, assign nominations risk, and issue classified secret missions."
              defaultMinutes={30}
            />

            {/* Clean Sub-navigation for Round 2 */}
            <div className="flex items-center gap-2 p-1.5 bg-bg-elevated border border-accent-blue/20 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setR2SubTab('captaincy');
                  setPhase('ROUND_2_CAPTAINCY');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r2SubTab === 'captaincy'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                1. Captaincy Duel & Reveal
              </button>
              <button
                type="button"
                onClick={() => {
                  setR2SubTab('nominations');
                  setPhase('ROUND_2_NOMINATIONS');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r2SubTab === 'nominations'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                2. House Nominations
              </button>
              <button
                type="button"
                onClick={() => {
                  setR2SubTab('secret-mission');
                  setPhase('ROUND_2_SECRET_TASK');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r2SubTab === 'secret-mission'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                3. Secret Missions (3 Teams)
              </button>
            </div>

            {/* Active Sub-module */}
            <div>
              {r2SubTab === 'captaincy' && <Round2Captaincy />}
              {r2SubTab === 'nominations' && <Round2Nominations />}
              {r2SubTab === 'secret-mission' && <Round2SecretMission />}
            </div>
          </div>
        )}

        {/* ── TAB 3: ROUND 3 ── */}
        {activeTab === 'round-3' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundTabControlBanner
              roundNumber={3}
              roundTitle="Round 3: Immunity Challenge & House Eviction"
              roundRoute="/round-3-immunity"
              startPhase="ROUND_3_IMMUNITY"
              endPhase="ROUND_4_FEATURES_REVEALED"
              activePhases={['ROUND_3_IMMUNITY', 'ROUND_3_VOTING', 'ROUND_3_EVICTION_REVEAL']}
              description="Pair nominated teams with safe allies for immunity duels, open the live house eviction ballot, and reveal the eliminated teams."
              defaultMinutes={30}
            />

            {/* Clean Sub-navigation for Round 3 */}
            <div className="flex items-center gap-2 p-1.5 bg-bg-elevated border border-accent-blue/20 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setR3SubTab('immunity');
                  setPhase('ROUND_3_IMMUNITY');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r3SubTab === 'immunity'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                1. Immunity Challenge
              </button>
              <button
                type="button"
                onClick={() => {
                  setR3SubTab('pairings');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r3SubTab === 'pairings'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                2. Team Pairings
              </button>
              <button
                type="button"
                onClick={() => {
                  setR3SubTab('voting');
                  setPhase('ROUND_3_VOTING');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r3SubTab === 'voting'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                3. House Voting
              </button>
              <button
                type="button"
                onClick={() => {
                  setR3SubTab('eviction');
                  setPhase('ROUND_3_EVICTION_REVEAL');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  r3SubTab === 'eviction'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                4. Eviction Reveal
              </button>
            </div>

            {/* Active Sub-module */}
            <div>
              {r3SubTab === 'immunity' && <Round3ImmunityControl />}
              {r3SubTab === 'pairings' && <Round3TeamPairing />}
              {r3SubTab === 'voting' && <Round3VotingControl />}
              {r3SubTab === 'eviction' && <Round3EvictionReveal />}
            </div>
          </div>
        )}

        {/* ── TAB 4: ROUND 4 ── */}
        {activeTab === 'round-4' && (
          <div className="space-y-6 animate-fadeIn">
            <RoundTabControlBanner
              roundNumber={4}
              roundTitle="Round 4: The Finale Build & CTF Face-Off"
              roundRoute="/round-4-features"
              startPhase="ROUND_4_FEATURES_REVEALED"
              endPhase="FINAL_RESULTS"
              activePhases={['ROUND_4_FEATURES_REVEALED', 'ROUND_4_SUBMISSION', 'ROUND_4_JUDGING', 'FINAL_RESULTS']}
              description="Release live surprise specs to the top 3 surviving finalist teams, review finalist submissions, apply jury scores, and crown the champion."
              defaultMinutes={60}
            />

            {/* Clean Sub-navigation for Round 4 */}
            <div className="flex items-center gap-2 p-1.5 bg-bg-elevated border border-accent-blue/20 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setR4SubTab('hidden');
                  setPhase('ROUND_4_FEATURES_REVEALED');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                  r4SubTab === 'hidden'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                1. Hidden Feature Specs
              </button>
              <button
                type="button"
                onClick={() => {
                  setR4SubTab('submissions');
                  setPhase('ROUND_4_SUBMISSION');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                  r4SubTab === 'submissions'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                2. Finalist Submissions
              </button>
              <button
                type="button"
                onClick={() => {
                  setR4SubTab('judging');
                  setPhase('ROUND_4_JUDGING');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                  r4SubTab === 'judging'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                3. Jury Scoring & Deductions
              </button>
              <button
                type="button"
                onClick={() => {
                  setR4SubTab('scoreboard');
                  setPhase('FINAL_RESULTS');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                  r4SubTab === 'scoreboard'
                    ? 'bg-accent-blue text-black shadow-glow-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                4. Final Champion Reveal
              </button>
            </div>

            {/* Active Sub-module */}
            <div>
              {r4SubTab === 'hidden' && <Round4HiddenFeatures />}
              {r4SubTab === 'submissions' && <Round4Submissions />}
              {r4SubTab === 'judging' && (
                <div className="space-y-6">
                  <Round4JudgeScoring />
                  <Round4PenaltyInterface />
                </div>
              )}
              {r4SubTab === 'scoreboard' && <Round4FinalScoreboard />}
            </div>
          </div>
        )}

        {/* ── TAB 5: LEADERBOARD ── */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 rounded-xl panel-card border border-accent-blue/30 bg-bg-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue font-bold">
                  SURVEILLANCE ROSTER & STANDINGS
                </span>
                <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                  Live House Leaderboard & Scores
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Real-time scores, ranks, and operational statuses across all participating house pods.
                </p>
              </div>
            </div>

            {/* Live Leaderboard Display */}
            <LiveLeaderboard teams={leaderboardTeams} />

            {/* Direct Score Calibration & Manual Override */}
            <ScoreManager
              teams={teams}
              onAdjustScore={handleScoreAdjustment}
              onDirectSetScore={handleUpdateScore}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
