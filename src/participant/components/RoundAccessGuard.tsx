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
  const { currentPhase, isRoundAccessible } = useEventPhase();

  // If a roundNumber is explicitly provided, enforce explicit ACTIVE status from Tech Boss
  // Otherwise fallback to checking the phase directly (which is less strict).
  const isAuthorized = roundNumber !== undefined 
    ? isRoundAccessible(roundNumber)
    : (Array.isArray(requiredPhase)
        ? requiredPhase.includes(currentPhase)
        : currentPhase === requiredPhase);

  // If Admin has authorized this phase, render the actual round content immediately!
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Otherwise, render the secure waiting screen
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="center" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="panel-card p-10 max-w-xl w-full border-t-4 border-t-accent-blue space-y-6">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-accent-blue/30 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-accent-blue/15 border border-accent-blue/40 flex items-center justify-center text-accent-blue">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-display uppercase tracking-wider text-text-primary">
              Waiting for Tech Boss to start the next round.
            </h1>
            <p className="text-xs text-text-secondary mt-3 leading-relaxed">
              Target Designation: {roundNumber !== undefined ? `ROUND ${roundNumber}` : roundName}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
