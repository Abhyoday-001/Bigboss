import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { usePolling } from '../../shared/hooks/usePolling';
import { MOCK_TEAMS } from '../../shared/mocks/mockData';
import { Team } from '../../shared/state-machine/types';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { RoundStatusBadge } from '../../shared/components/RoundStatusBadge';
import { TimerCountdown } from '../../shared/components/TimerCountdown';
import { LiveLeaderboard } from '../../shared/components/LiveLeaderboard';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { 
  Crown, ShieldAlert, ShieldCheck, Trophy, ArrowRight, UserCheck, RefreshCw, Zap, 
  Terminal, KeyRound, Vote, Skull, Layers, Send, ChevronRight, Shield 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { team } = useAuth();
  const { currentPhase, currentMetadata, targetEndTime, setPhase, allPhases } = useEventPhase();

  // Polling leaderboard data every 3.5 seconds
  const [teamsState] = useState<Team[]>(MOCK_TEAMS);

  const { data: polledTeams, refetch } = usePolling<Team[]>(
    async () => {
      // In production, this calls backend API /api/leaderboard
      return teamsState;
    },
    { intervalMs: 3500 }
  );

  const activeTeams = polledTeams || teamsState;
  const currentTeamData = activeTeams.find((t: Team) => t.id === team?.id) || team || activeTeams[0];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Status & Timer Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1">
            <RoundStatusBadge />
          </div>
          <div className="flex items-center justify-between lg:justify-end gap-3 panel-card px-5 py-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                ROUND TIMER
              </div>
              <div className="text-xs text-accent-blue font-medium">
                {currentMetadata.isTimed ? 'Synchronized' : 'Paused / Untimed'}
              </div>
            </div>
            <TimerCountdown
              targetTimestamp={targetEndTime}
              size="md"
            />
          </div>
        </div>

        {/* Team Overview Card & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Team Card */}
          <div className="md:col-span-2 panel-card p-6 border-l-4 border-l-accent-blue glow-blue-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-accent-blue/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                  HOUSE TELEMETRY • {currentTeamData.tableNumber || 'POD ASSIGNED'}
                </span>
                <h1 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                  {currentTeamData.teamName}
                </h1>
                <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-accent-blue" />
                  <span>{currentTeamData.members?.length || 2} Registered Operatives</span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex flex-col items-start sm:items-end gap-1.5">
                {currentTeamData.isCaptain && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-amber/15 border border-warning-amber/40 text-warning-amber font-mono text-xs uppercase font-bold">
                    <Crown className="w-3.5 h-3.5" /> House Captain
                  </span>
                )}
                {currentTeamData.isImmune && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-green/15 border border-success-green/40 text-success-green font-mono text-xs uppercase font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Immune From Eviction
                  </span>
                )}
                {currentTeamData.isNominated && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-red/15 border border-danger-red/40 text-danger-red font-mono text-xs uppercase font-bold glow-red">
                    <ShieldAlert className="w-3.5 h-3.5" /> Nominated for Eviction
                  </span>
                )}
                {!currentTeamData.isCaptain && !currentTeamData.isNominated && !currentTeamData.isImmune && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/15 border border-accent-blue/40 text-accent-blue-glow font-mono text-xs uppercase">
                    Status: Safe & Active
                  </span>
                )}
              </div>
            </div>

            {/* Score & Rank Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="bg-bg-primary p-3.5 rounded-lg border border-accent-blue/15">
                <div className="text-[10px] font-mono uppercase text-text-secondary">Total Points</div>
                <div className="text-2xl font-mono font-bold text-text-primary mt-1">
                  {currentTeamData.score.toLocaleString()}
                </div>
              </div>

              <div className="bg-bg-primary p-3.5 rounded-lg border border-accent-blue/15">
                <div className="text-[10px] font-mono uppercase text-text-secondary">Current Rank</div>
                <div className="text-2xl font-display text-accent-blue-glow mt-1">
                  #{currentTeamData.rank}
                </div>
              </div>

              <div className="bg-bg-primary p-3.5 rounded-lg border border-accent-blue/15">
                <div className="text-[10px] font-mono uppercase text-text-secondary">Previous Rank</div>
                <div className="text-2xl font-display text-text-secondary mt-1">
                  #{currentTeamData.previousRank || currentTeamData.rank}
                </div>
              </div>

              <div className="bg-bg-primary p-3.5 rounded-lg border border-accent-blue/15">
                <div className="text-[10px] font-mono uppercase text-text-secondary">Survival Index</div>
                <div className="text-2xl font-mono font-bold text-success-green mt-1">
                  94.2%
                </div>
              </div>
            </div>
          </div>

          {/* Quick Round Action Card */}
          <div className="panel-card p-6 flex flex-col justify-between border-t-2 border-t-accent-blue">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue mb-1">
                ACTION REQUIRED
              </div>
              <h2 className="text-xl font-display uppercase tracking-wider text-text-primary">
                {currentMetadata.roundNumber ? `Round ${currentMetadata.roundNumber} Mission` : 'House Operations'}
              </h2>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {currentMetadata.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-accent-blue/15 flex flex-col gap-2.5">
              <Link
                to={currentMetadata.participantRoute}
                className="w-full py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 transition-all glow-blue-sm"
              >
                <span>Proceed to Mission</span>
                <ArrowRight className="w-4 h-4 stroke-2" />
              </Link>
              <Link
                to="/profile"
                className="w-full py-2 text-center rounded border border-accent-blue/20 hover:border-accent-blue/50 text-xs font-mono text-text-secondary hover:text-accent-blue-glow transition-all"
              >
                View House Roster
              </Link>
            </div>
          </div>
        </div>

        {/* Competition Stages & Respective Operations Areas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-blue" />
              <span>Event Operations & Round Protocols</span>
            </h2>
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Phase Connected • All Modules Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Round 1 Card */}
            <div className="panel-card p-5 border-t-2 border-t-accent-blue flex flex-col justify-between hover:border-accent-blue/60 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-accent-blue tracking-widest flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5" /> ROUND 01
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-accent-blue/15 text-accent-blue uppercase">
                    Task Arena
                  </span>
                </div>
                <h3 className="text-lg font-display uppercase tracking-wider text-text-primary group-hover:text-accent-blue-glow transition-all">
                  Rapid Task Challenge
                </h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  Algorithmic system challenges and initial scoreboard telemetry.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-accent-blue/10">
                <Link
                  to="/round-1"
                  className="w-full py-2 rounded bg-bg-elevated hover:bg-accent-blue/20 border border-accent-blue/30 text-xs font-mono text-accent-blue uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Launch Task Brief</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Round 2 Card */}
            <div className="panel-card p-5 border-t-2 border-t-warning-amber flex flex-col justify-between hover:border-warning-amber/60 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-warning-amber tracking-widest flex items-center gap-1.5 font-bold">
                    <Crown className="w-3.5 h-3.5" /> ROUND 02
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-warning-amber/15 text-warning-amber uppercase">
                    Leadership
                  </span>
                </div>
                <h3 className="text-lg font-display uppercase tracking-wider text-text-primary group-hover:text-warning-amber transition-all">
                  Captaincy & Classified Ops
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Duel for immunity, classified team directives, and eviction risk.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-warning-amber/15 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/round-2-captaincy"
                    className="py-1.5 px-2 rounded bg-bg-elevated hover:bg-warning-amber/20 border border-warning-amber/30 text-[10px] font-mono text-warning-amber uppercase text-center truncate transition-all"
                  >
                    Captaincy Duel
                  </Link>
                  <Link
                    to="/secret-mission"
                    className="py-1.5 px-2 rounded bg-bg-elevated hover:bg-accent-blue/20 border border-accent-blue/30 text-[10px] font-mono text-accent-blue uppercase text-center truncate transition-all"
                  >
                    Secret Task
                  </Link>
                </div>
                <Link
                  to="/nomination-status"
                  className="w-full py-1.5 rounded bg-bg-elevated hover:bg-danger-red/20 border border-danger-red/30 text-[10px] font-mono text-danger-red uppercase flex items-center justify-center gap-1 transition-all"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>Nomination Status</span>
                </Link>
              </div>
            </div>

            {/* Round 3 Card */}
            <div className="panel-card p-5 border-t-2 border-t-danger-red flex flex-col justify-between hover:border-danger-red/60 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-danger-red tracking-widest flex items-center gap-1.5 font-bold">
                    <Skull className="w-3.5 h-3.5" /> ROUND 03
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-danger-red/15 text-danger-red uppercase">
                    Survival
                  </span>
                </div>
                <h3 className="text-lg font-display uppercase tracking-wider text-text-primary group-hover:text-danger-red transition-all">
                  Immunity, Vote & Eviction
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Survive the cut, cast confidential ballots, and face the eye.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-danger-red/15 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/immunity-challenge"
                    className="py-1.5 px-2 rounded bg-bg-elevated hover:bg-success-green/20 border border-success-green/30 text-[10px] font-mono text-success-green uppercase text-center truncate transition-all"
                  >
                    Immunity
                  </Link>
                  <Link
                    to="/voting"
                    className="py-1.5 px-2 rounded bg-bg-elevated hover:bg-accent-blue/20 border border-accent-blue/30 text-[10px] font-mono text-accent-blue uppercase text-center truncate transition-all"
                  >
                    House Vote
                  </Link>
                </div>
                <Link
                  to="/eviction-reveal"
                  className="w-full py-1.5 rounded bg-bg-elevated hover:bg-danger-red/20 border border-danger-red/30 text-[10px] font-mono text-danger-red uppercase flex items-center justify-center gap-1 transition-all"
                >
                  <Skull className="w-3 h-3" />
                  <span>Eviction Ceremony</span>
                </Link>
              </div>
            </div>

            {/* Round 4 Card */}
            <div className="panel-card p-5 border-t-2 border-t-success-green flex flex-col justify-between hover:border-success-green/60 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-success-green tracking-widest flex items-center gap-1.5 font-bold">
                    <Trophy className="w-3.5 h-3.5" /> ROUND 04
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-success-green/15 text-success-green uppercase">
                    Grand Finale
                  </span>
                </div>
                <h3 className="text-lg font-display uppercase tracking-wider text-text-primary group-hover:text-success-green transition-all">
                  Finale Build & Champions
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Live hidden specifications, deployment link submission, and crown reveal.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-success-green/15 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/round-4-features"
                    className="py-1.5 px-2 rounded bg-bg-elevated hover:bg-accent-blue/20 border border-accent-blue/30 text-[10px] font-mono text-accent-blue uppercase text-center truncate transition-all"
                  >
                    Hidden Specs
                  </Link>
                  <Link
                    to="/round-4-submission"
                    className="py-1.5 px-2 rounded bg-bg-elevated hover:bg-warning-amber/20 border border-warning-amber/30 text-[10px] font-mono text-warning-amber uppercase text-center truncate transition-all"
                  >
                    Submit Build
                  </Link>
                </div>
                <Link
                  to="/final-results"
                  className="w-full py-1.5 rounded bg-bg-elevated hover:bg-success-green/20 border border-success-green/30 text-[10px] font-mono text-success-green uppercase flex items-center justify-center gap-1 transition-all"
                >
                  <Trophy className="w-3 h-3" />
                  <span>Grand Champions Reveal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Leaderboard Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-blue" />
              <span>Live House Standings</span>
            </h2>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-accent-blue-glow px-2.5 py-1 rounded bg-bg-elevated border border-accent-blue/20 transition-all"
              title="Manual Sync"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Poll Now</span>
            </button>
          </div>

          <LiveLeaderboard
            teams={activeTeams}
            currentTeamId={currentTeamData.id}
          />
        </div>

        {/* Phase Simulator Bar for Development / Organizer Testing */}
        <div className="panel-card p-4 border border-warning-amber/30 bg-bg-elevated/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning-amber" />
              <span className="text-xs font-mono uppercase text-warning-amber font-bold">
                DEV TESTER / ORGANIZER PHASE SIMULATOR:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allPhases.map((phase) => (
                <button
                  key={phase}
                  onClick={() => setPhase(phase)}
                  className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${
                    currentPhase === phase
                      ? 'bg-warning-amber text-black font-bold'
                      : 'bg-bg-primary text-text-secondary border border-white/10 hover:border-warning-amber/50'
                  }`}
                >
                  {phase.replace('ROUND_', 'R').replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
