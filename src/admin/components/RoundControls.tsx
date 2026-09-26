import React, { useState } from 'react';
import { Play, Pause, Square, PlusCircle, RotateCcw, FastForward } from 'lucide-react';
import { EventState, EventPhase } from '../../shared/types/event';
import { ConfirmationModal, ConfirmationModalProps } from '../../shared/components/ConfirmationModal';
import { PHASE_METADATA } from '../../mocks/mockEventState';

interface RoundControlsProps {
  eventState: EventState;
  onUpdateState: (updated: Partial<EventState>) => Promise<void> | void;
  onAdvancePhase?: (nextPhase: EventPhase) => Promise<void> | void;
}

export const RoundControls: React.FC<RoundControlsProps> = ({
  eventState,
  onUpdateState,
  onAdvancePhase,
}) => {
  const [modalConfig, setModalConfig] = useState<ConfirmationModalProps | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to open confirmation modal
  const requestConfirmation = (config: Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>) => {
    setModalConfig({
      ...config,
      isOpen: true,
      onClose: () => setModalConfig(null),
    });
  };

  // Handlers for Round Actions
  const handleStartRound = () => {
    requestConfirmation({
      title: 'Start / Resume Round',
      description: `You are about to ACTIVATE "${eventState.roundName}". The server timer will begin ticking down for all live participant terminals.`,
      confirmLabel: 'Activate Round Now',
      variant: 'primary',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await new Promise((r) => setTimeout(r, 600));
          onUpdateState({
            status: 'RUNNING',
            timer: {
              ...eventState.timer,
              isRunning: true,
            },
          });
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handlePauseRound = () => {
    requestConfirmation({
      title: 'Pause Active Round',
      description: `This will FREEZE the round timer and signal all participant screens that the round is paused by Admin.`,
      confirmLabel: 'Pause Round',
      variant: 'warning',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await new Promise((r) => setTimeout(r, 600));
          onUpdateState({
            status: 'PAUSED',
            timer: {
              ...eventState.timer,
              isRunning: false,
            },
          });
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handleEndRound = () => {
    requestConfirmation({
      title: 'Emergency End / Close Round',
      description: `Are you sure you want to forcibly END "${eventState.roundName}"? Submissions will be locked immediately.`,
      confirmLabel: 'Yes, End Round Now',
      variant: 'danger',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await new Promise((r) => setTimeout(r, 800));
          onUpdateState({
            status: 'COMPLETED',
            timer: {
              ...eventState.timer,
              remainingSeconds: 0,
              isRunning: false,
            },
          });
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // Handlers for Timer Adjustments
  const handleAddMinutes = (mins: number) => {
    const extraSeconds = mins * 60;
    requestConfirmation({
      title: `Extend Round by +${mins} Minutes`,
      description: `This will add ${mins} minutes (${extraSeconds}s) to the countdown timer for all participants in real time.`,
      confirmLabel: `Add +${mins} Mins`,
      variant: 'primary',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await new Promise((r) => setTimeout(r, 400));
          const newRemaining = eventState.timer.remainingSeconds + extraSeconds;
          const newDuration = eventState.timer.durationSeconds + extraSeconds;
          onUpdateState({
            timer: {
              ...eventState.timer,
              durationSeconds: newDuration,
              remainingSeconds: newRemaining,
            },
          });
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handleResetTimer = (minutes = 30) => {
    requestConfirmation({
      title: 'Reset Round Timer',
      description: `Reset timer to ${minutes}:00 minutes. Current countdown will be overwritten.`,
      confirmLabel: 'Reset Timer',
      variant: 'warning',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await new Promise((r) => setTimeout(r, 400));
          onUpdateState({
            timer: {
              durationSeconds: minutes * 60,
              remainingSeconds: minutes * 60,
              isRunning: false,
              serverTimestamp: Date.now(),
            },
            status: 'IDLE',
          });
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // Phase Transitions
  const phaseList: EventPhase[] = [
    'NOT_STARTED',
    'ROUND_1_TASK',
    'ROUND_2_CAPTAINCY',
    'ROUND_2_SECRET_TASK',
    'ROUND_2_NOMINATIONS',
    'ROUND_3_IMMUNITY',
    'ROUND_3_VOTING',
    'ROUND_3_EVICTION',
    'ROUND_4_FINALE',
    'EVENT_ENDED',
  ];

  const currentIndex = phaseList.indexOf(eventState.currentPhase);
  const nextPhase = currentIndex < phaseList.length - 1 ? phaseList[currentIndex + 1] : null;

  const handleAdvanceToNextPhase = () => {
    if (!nextPhase) return;
    const targetMeta = PHASE_METADATA[nextPhase];
    requestConfirmation({
      title: `Advance Event to: ${targetMeta.name}`,
      description: `You are transitioning the global event state to ${targetMeta.label}. All participant screens will immediately switch to this phase view.`,
      confirmLabel: 'Advance Global Phase',
      variant: 'primary',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await new Promise((r) => setTimeout(r, 700));
          if (onAdvancePhase) {
            await onAdvancePhase(nextPhase);
          } else {
            onUpdateState({
              currentPhase: nextPhase,
              phaseLabel: targetMeta.label,
              roundName: targetMeta.name,
              roundDescription: targetMeta.description,
              roundNumber: targetMeta.roundNumber,
              status: 'IDLE',
              timer: {
                durationSeconds: 1800,
                remainingSeconds: 1800,
                isRunning: false,
                serverTimestamp: Date.now(),
              },
            });
          }
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  return (
    <div className="bg-[#0d0f14] border border-bg-border rounded-xl p-5 md:p-6 shadow-xl relative">
      {/* Confirmation Modal Container */}
      {modalConfig && <ConfirmationModal {...modalConfig} isLoading={isProcessing} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-bg-border">
        <div>
          <div className="text-xs font-mono tracking-widest text-accent-blue uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
            Global State Machine
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-wide mt-0.5">
            Round & Timer Master Controls
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-secondary px-2.5 py-1 rounded bg-[#161a23] border border-bg-border">
            Status: <strong className={eventState.status === 'RUNNING' ? 'text-success-green' : eventState.status === 'PAUSED' ? 'text-amber-400' : 'text-text-muted'}>{eventState.status}</strong>
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Start / Resume */}
        <button
          type="button"
          onClick={handleStartRound}
          disabled={isProcessing || eventState.status === 'RUNNING'}
          className={`px-4 py-3.5 rounded-lg flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
            eventState.status === 'RUNNING'
              ? 'bg-[#161a23] text-text-muted border border-bg-border cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-600/30'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{eventState.status === 'PAUSED' ? 'Resume Round' : 'Start Round'}</span>
        </button>

        {/* Pause */}
        <button
          type="button"
          onClick={handlePauseRound}
          disabled={isProcessing || eventState.status !== 'RUNNING'}
          className={`px-4 py-3.5 rounded-lg flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
            eventState.status !== 'RUNNING'
              ? 'bg-[#161a23] text-text-muted border border-bg-border cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg hover:shadow-amber-500/20'
          }`}
        >
          <Pause className="w-4 h-4 fill-current" />
          <span>Pause Round</span>
        </button>

        {/* End Round */}
        <button
          type="button"
          onClick={handleEndRound}
          disabled={isProcessing || eventState.status === 'COMPLETED'}
          className={`px-4 py-3.5 rounded-lg flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
            eventState.status === 'COMPLETED'
              ? 'bg-[#161a23] text-text-muted border border-bg-border cursor-not-allowed'
              : 'bg-danger-red hover:bg-red-600 text-white shadow-glow-red'
          }`}
        >
          <Square className="w-4 h-4 fill-current" />
          <span>End Round (Lock)</span>
        </button>
      </div>

      {/* Timer Quick Adjustment Controls */}
      <div className="bg-[#090b10] border border-bg-border rounded-lg p-4 mb-6">
        <div className="text-xs font-mono text-text-secondary mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-accent-blue">
            <PlusCircle className="w-3.5 h-3.5" />
            LIVE TIMER OVERRIDES
          </span>
          <span className="text-[11px] text-text-muted">Requires Confirmation Modal</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleAddMinutes(2)}
            disabled={isProcessing}
            className="px-3 py-2 text-xs font-medium rounded bg-[#161a23] hover:bg-[#1f2430] text-text-primary border border-bg-border transition-colors hover:border-accent-blue/50"
          >
            +2 Minutes
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(5)}
            disabled={isProcessing}
            className="px-3 py-2 text-xs font-medium rounded bg-[#161a23] hover:bg-[#1f2430] text-text-primary border border-bg-border transition-colors hover:border-accent-blue/50"
          >
            +5 Minutes
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(10)}
            disabled={isProcessing}
            className="px-3 py-2 text-xs font-medium rounded bg-[#161a23] hover:bg-[#1f2430] text-text-primary border border-bg-border transition-colors hover:border-accent-blue/50"
          >
            +10 Minutes
          </button>
          <button
            type="button"
            onClick={() => handleResetTimer(30)}
            disabled={isProcessing}
            className="px-3 py-2 text-xs font-medium rounded bg-[#161a23] hover:bg-amber-950/40 text-amber-300 border border-bg-border transition-colors hover:border-amber-500/50 flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset 30m
          </button>
        </div>
      </div>

      {/* Global Phase Advancement */}
      {nextPhase && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20">
          <div>
            <div className="text-xs font-mono text-accent-blue">NEXT EVENT MILESTONE</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">
              Advance to {PHASE_METADATA[nextPhase].name}
            </div>
            <div className="text-xs text-text-secondary line-clamp-1">
              {PHASE_METADATA[nextPhase].description}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdvanceToNextPhase}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-lg bg-accent-blue hover:bg-sky-400 text-black font-semibold text-xs tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
          >
            <FastForward className="w-4 h-4" />
            <span>ADVANCE PHASE</span>
          </button>
        </div>
      )}
    </div>
  );
};
