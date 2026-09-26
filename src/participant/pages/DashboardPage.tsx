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
import { Crown, ShieldAlert, ShieldCheck, Trophy, ArrowRight, UserCheck, RefreshCw, Zap } from 'lucide-react';

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
