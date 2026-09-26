import React from 'react';
import { useEventPhase } from '../hooks/useEventPhase';
import { PHASE_CONFIG } from '../state-machine/eventPhases';
import { Radio, ArrowRight } from 'lucide-react';

export interface RoundStatusBadgeProps {
  className?: string;
  showNextPreview?: boolean;
}

export const RoundStatusBadge: React.FC<RoundStatusBadgeProps> = ({
  className = '',
  showNextPreview = true,
}) => {
  const { currentMetadata } = useEventPhase();

  const nextPhaseMetadata = currentMetadata.nextPhase
    ? PHASE_CONFIG[currentMetadata.nextPhase]
    : null;

  return (
    <div className={`panel-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-accent-blue/25 ${className}`}>
      {/* Current Round Indicator */}
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-accent-blue/10 border border-accent-blue/30 text-accent-blue mt-0.5">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent-blue font-semibold">
              CURRENT EVENT PHASE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-ping" />
          </div>
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
            {currentMetadata.roundTitle}
          </h2>
          <div className="text-sm text-text-secondary flex items-center gap-2 mt-0.5">
            <span className="text-accent-blue-glow font-medium bracket-framed">
              {currentMetadata.subPhaseTitle}
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline text-xs">{currentMetadata.description}</span>
          </div>
        </div>
      </div>

      {/* Up Next Preview */}
      {showNextPreview && nextPhaseMetadata && (
        <div className="md:border-l md:border-accent-blue/15 md:pl-6 flex flex-col justify-center min-w-50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <span>UPCOMING PHASE</span>
            <ArrowRight className="w-3 h-3 text-accent-blue" />
          </div>
          <div className="font-semibold text-sm text-text-primary mt-1 line-clamp-1">
            {nextPhaseMetadata.roundTitle}
          </div>
          <div className="text-xs text-text-secondary line-clamp-1">
            {nextPhaseMetadata.subPhaseTitle}
          </div>
        </div>
      )}
    </div>
  );
};
