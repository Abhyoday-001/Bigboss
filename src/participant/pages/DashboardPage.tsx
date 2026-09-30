import React from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { RoundStatusBadge } from '../../shared/components/RoundStatusBadge';
import { TimerCountdown } from '../../shared/components/TimerCountdown';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import {
  Crown,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Radio,
  Clock,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { team } = useAuth();
  const { currentMetadata, targetEndTime } = useEventPhase();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Status & Timer Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1">
            <RoundStatusBadge />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 panel-card px-5 py-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                ROUND TIMER
              </div>
              <div className="text-xs text-accent-blue font-medium">
                {currentMetadata.isTimed ? 'Synchronized' : 'Host Controlled'}
              </div>
            </div>
            <TimerCountdown targetTimestamp={targetEndTime} size="md" />
          </div>
        </div>

        {/* Team Telemetry Card */}
        <div className="panel-card p-6 border-l-4 border-l-accent-blue glow-blue-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                HOUSE TELEMETRY • {team?.tableNumber || 'POD —'}
              </span>
              <h1 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                {team?.teamName || '—'}
              </h1>
              <div className="text-xs text-text-secondary mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-accent-blue" />
                  <span>{team?.members?.length || 0} Operatives</span>
                </span>
                <span className="text-text-secondary/40">•</span>
                <span className="font-mono text-accent-blue font-bold">
                  {team?.score ? team.score.toLocaleString() : 0} PTS
                </span>
              </div>
            </div>

            {/* Team Status Pill */}
            <div className="flex items-center gap-2">
              {team?.isCaptain && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-warning-amber/15 border border-warning-amber/40 text-warning-amber font-mono text-xs uppercase font-bold">
                  <Crown className="w-3.5 h-3.5" /> House Captain
                </span>
              )}
              {team?.isImmune && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-success-green/15 border border-success-green/40 text-success-green font-mono text-xs uppercase font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Immune From Eviction
                </span>
              )}
              {team?.isNominated && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-danger-red/15 border border-danger-red/40 text-danger-red font-mono text-xs uppercase font-bold glow-red">
                  <ShieldAlert className="w-3.5 h-3.5" /> Nominated for Eviction
                </span>
              )}
              {!team?.isCaptain && !team?.isNominated && !team?.isImmune && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent-blue/15 border border-accent-blue/40 text-accent-blue-glow font-mono text-xs uppercase">
                  Status: Safe & Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Standby / Waiting Room */}
        <div className="panel-card p-10 border-t-4 border-t-accent-blue text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-blue/15 border border-accent-blue/40 flex items-center justify-center mx-auto text-accent-blue">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue font-bold">
              SURVEILLANCE EYE • STANDBY MODE
            </span>
            <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
              Awaiting Host Signal
            </h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto mt-2 leading-relaxed">
              You're connected to the house network. Stay at your designated table pod and keep this tab open.
              The host will launch each round from the Control Room — your screen will update automatically.
            </p>
          </div>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-bg-primary border border-accent-blue/25 text-xs font-mono text-accent-blue-glow">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Listening for Control Room broadcast...</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
