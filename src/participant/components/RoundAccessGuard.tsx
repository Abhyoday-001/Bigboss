import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { EventPhase } from '../../shared/state-machine/types';
import { ParticipantNavbar } from './ParticipantNavbar';
import { NeuronNetworkBackground } from './NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { Radio, Lock, ArrowLeft, ShieldAlert, Zap } from 'lucide-react';

interface RoundAccessGuardProps {
  requiredPhase: EventPhase | EventPhase[];
  roundName: string;
  roundNumber?: number;
  children: React.ReactNode;
}

export const RoundAccessGuard: React.FC<RoundAccessGuardProps> = ({
  requiredPhase,
  roundName,
  roundNumber,
  children,
}) => {
  const { currentPhase } = useEventPhase();
  const navigate = useNavigate();

  const isAuthorized = Array.isArray(requiredPhase)
    ? requiredPhase.includes(currentPhase)
    : currentPhase === requiredPhase;

  // If Admin has authorized this phase, render the actual round content immediately!
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Otherwise, render the secure Control Room standby screen
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="center" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="panel-card p-8 md:p-10 border-t-4 border-t-warning-amber glow-amber max-w-xl w-full space-y-6">
          {/* Animated Scanning Beacon */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-warning-amber/30 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-center text-warning-amber">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning-amber/10 border border-warning-amber/30 text-warning-amber text-[11px] font-mono uppercase tracking-widest mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>AWAITING ADMIN AUTHORIZATION</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-display uppercase tracking-wider text-text-primary">
              {roundName} Is Locked
            </h1>

            <p className="text-xs md:text-sm text-text-secondary mt-3 leading-relaxed">
              This round has not been launched by the Control Room yet. All systems and telemetry are calibrated and on standby.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-bg-elevated/80 border border-warning-amber/20 text-left font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-text-muted">
              <span>TARGET DESIGNATION:</span>
              <span className="text-warning-amber font-bold">
                {roundNumber !== undefined ? `ROUND ${roundNumber}` : roundName}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>GLOBAL STATUS:</span>
              <span className="text-accent-blue uppercase">STANDBY • LISTENING</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>AUTO-TRIGGER:</span>
              <span className="text-success-green">ENABLED (Instant Sync)</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-[11px] text-text-muted flex items-center justify-center gap-2">
              <Zap className="w-3.5 h-3.5 text-accent-blue" />
              <span>Keep this tab open. The round will automatically start on your screen the instant the Admin clicks Start.</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-lg bg-bg-elevated hover:bg-bg-border border border-border-default hover:border-accent-blue/40 text-xs font-mono text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to House Dashboard</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
