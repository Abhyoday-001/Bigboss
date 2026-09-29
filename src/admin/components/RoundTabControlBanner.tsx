import React, { useState } from 'react';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { EventPhase } from '../../shared/state-machine/types';
import { eventOperationsService } from '../../shared/services/eventOperationsService';
import {
  Play,
  Square,
  Radio,
  Clock,
  CheckCircle2,
  Zap,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface RoundTabControlBannerProps {
  roundNumber: number;
  roundTitle: string;
  roundRoute: string;
  startPhase: EventPhase;
  endPhase: EventPhase;
  description: string;
  activePhases?: EventPhase[]; // In case round has sub-phases (like R2, R3, R4)
  defaultMinutes?: number;
}

export const RoundTabControlBanner: React.FC<RoundTabControlBannerProps> = ({
  roundNumber,
  roundTitle,
  roundRoute,
  startPhase,
  endPhase,
  description,
  activePhases,
  defaultMinutes = 30,
}) => {
  const { currentPhase, setPhase, targetEndTime, setTargetEndTime } = useEventPhase();
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const isLive = activePhases
    ? activePhases.includes(currentPhase) || currentPhase === startPhase
    : currentPhase === startPhase;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleStartRound = () => {
    setPhase(startPhase);

    if (startPhase === 'ROUND_0_ACTIVE') {
      eventOperationsService.updateRound0Config({ isActive: true });
    }

    setTargetEndTime(Date.now() + defaultMinutes * 60 * 1000);
    showToast(
      `BROADCAST LAUNCHED: Round ${roundNumber} is now LIVE! Participant screens auto-navigated to ${roundRoute}.`
    );
  };

  const handleEndRound = () => {
    setPhase(endPhase);

    if (startPhase === 'ROUND_0_ACTIVE') {
      eventOperationsService.updateRound0Config({ isActive: false });
    }

    showToast(
      `BROADCAST ENDED: Round ${roundNumber} closed. Participant screens returned to Standby Dashboard.`
    );
  };

  const handleAddMinutes = (mins: number) => {
    const newEnd = Math.max(Date.now(), targetEndTime) + mins * 60 * 1000;
    setTargetEndTime(newEnd);
    showToast(`Timer extended by +${mins} minutes for all participants.`);
  };

  const handleResetTimer = (mins = 30) => {
    const newEnd = Date.now() + mins * 60 * 1000;
    setTargetEndTime(newEnd);
    showToast(`Timer reset to ${mins}:00 minutes.`);
  };

  // Calculate remaining seconds for badge
  const remainingSec = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="bg-[#0c0f16] border border-accent-blue/30 rounded-xl p-5 shadow-xl space-y-4">
      {/* Toast Alert */}
      {toastNotice && (
        <div className="p-3 rounded-lg bg-accent-blue/15 border border-accent-blue/50 text-accent-blue-glow text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-accent-blue fill-current animate-pulse shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Main Banner Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Round Info & Streaming Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue font-bold">
              ROUND 0{roundNumber} CONTROL ROOM
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-green/20 border border-success-green/40 text-success-green font-mono text-[10px] uppercase font-bold">
                <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                BROADCASTING LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bg-elevated border border-bg-border text-text-muted font-mono text-[10px] uppercase">
                ROUND ON STANDBY
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-text-primary">
            {roundTitle}
          </h2>
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Right: Master Start / Stop Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {!isLive ? (
            <button
              type="button"
              onClick={handleStartRound}
              className="py-3 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-wider font-bold shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START ROUND {roundNumber} (AUTO-LAUNCH)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="py-3 px-4 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono uppercase font-bold flex items-center gap-2 cursor-default"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>LIVE STREAMING</span>
              </button>
              <button
                type="button"
                onClick={handleEndRound}
                className="py-3 px-4 rounded-lg bg-danger-red hover:bg-red-600 text-white text-xs font-mono uppercase font-bold shadow-glow-red flex items-center gap-2 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>END ROUND</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-bar: Participant Route & Live Round Timer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-accent-blue/15 text-xs font-mono">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-text-muted">Target Route:</span>
          <span className="text-accent-blue font-bold">{roundRoute}</span>
          <span className="text-text-muted/40">•</span>
          <span className="text-text-muted">Status:</span>
          <span className={isLive ? 'text-success-green font-bold' : 'text-text-muted'}>
            {isLive ? 'PARTICIPANTS LOCKED ON THIS PAGE' : 'STANDBY LOCK ACTIVE'}
          </span>
        </div>

        {/* Quick Timer Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-bg-border text-text-primary">
            <Clock className="w-3.5 h-3.5 text-accent-blue" />
            <span className="font-bold text-accent-blue-glow">{timeFormatted}</span>
          </div>

          <button
            type="button"
            onClick={() => handleAddMinutes(5)}
            className="px-2 py-1 rounded bg-bg-elevated hover:bg-bg-border border border-border-default hover:border-accent-blue/40 text-[10px] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            +5m
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(10)}
            className="px-2 py-1 rounded bg-bg-elevated hover:bg-bg-border border border-border-default hover:border-accent-blue/40 text-[10px] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            +10m
          </button>
          <button
            type="button"
            onClick={() => handleResetTimer(defaultMinutes)}
            className="px-2 py-1 rounded bg-bg-elevated hover:bg-bg-border border border-border-default hover:border-amber-500/40 text-[10px] text-text-secondary hover:text-amber-400 transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
