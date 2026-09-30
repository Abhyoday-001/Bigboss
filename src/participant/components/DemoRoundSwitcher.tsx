import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import type { EventPhase } from '../../shared/state-machine/types';
import { Layers, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

interface RoundOption {
  label: string;
  roundName: string;
  phase: EventPhase;
  route: string;
  description: string;
}

const DEMO_ROUNDS: RoundOption[] = [
  {
    label: 'R0',
    roundName: 'Round 0',
    phase: 'ROUND_0_ACTIVE',
    route: '/round-0',
    description: '10s Rapid Quiz Assessment',
  },
  {
    label: 'R1',
    roundName: 'Round 1',
    phase: 'ROUND_1_ACTIVE',
    route: '/round-1',
    description: 'Build & Systems Challenge',
  },
  {
    label: 'R2',
    roundName: 'Round 2',
    phase: 'ROUND_2_CAPTAINCY',
    route: '/round-2-captaincy',
    description: 'Captaincy Arena & Duel',
  },
  {
    label: 'R2 Secret',
    roundName: 'Secret Task',
    phase: 'ROUND_2_SECRET_TASK',
    route: '/secret-mission',
    description: 'Classified Task (#1, #5, #9)',
  },
  {
    label: 'R3',
    roundName: 'Round 3',
    phase: 'ROUND_3_IMMUNITY',
    route: '/immunity-challenge',
    description: 'Immunity Duels & Pairings',
  },
  {
    label: 'R3 Evict',
    roundName: 'Evictions',
    phase: 'ROUND_3_EVICTION_REVEAL',
    route: '/eviction-reveal',
    description: 'Voting & Eviction Broadcast',
  },
  {
    label: 'R4',
    roundName: 'Round 4',
    phase: 'ROUND_4_FEATURES_REVEALED',
    route: '/round-4',
    description: 'CTF Finale & Submission',
  },
  {
    label: 'Podium',
    roundName: 'Finale',
    phase: 'FINAL_RESULTS',
    route: '/final-results',
    description: 'Champions Victory Podium',
  },
];

export const DemoRoundSwitcher: React.FC = () => {
  const { currentPhase, setPhase } = useEventPhase();
  const navigate = useNavigate();

  const handleSelectRound = (option: RoundOption) => {
    setPhase(option.phase);
    navigate(option.route);
  };

  const handleResetToRound0 = () => {
    localStorage.removeItem('devhouse_current_phase');
    setPhase('ROUND_0_ACTIVE');
  };

  return (
    <div className="w-full panel-card p-4 border border-accent-blue/40 bg-bg-elevated/95 backdrop-blur-md rounded-xl space-y-3 shadow-lg glow-blue-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-accent-blue/15">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-blue" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
            DEMO TESTING CONTROLS • SWITCH ACTIVE ROUND
          </span>
          <span className="text-[10px] font-mono text-text-secondary hidden md:inline">
            (Temporary demo toggle to test and verify all rounds)
          </span>
        </div>

        <button
          type="button"
          onClick={handleResetToRound0}
          className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-primary hover:bg-white/5 border border-white/10 text-[10px] font-mono text-text-secondary hover:text-white transition-all cursor-pointer"
          title="Reset back to Round 0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Round 0</span>
        </button>
      </div>

      {/* Round Selection Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {DEMO_ROUNDS.map((item) => {
          const isActive = currentPhase === item.phase;

          return (
            <div
              key={item.phase}
              onClick={() => handleSelectRound(item)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-accent-blue/20 border-accent-blue text-white shadow-glow-blue'
                  : 'bg-bg-primary hover:bg-bg-primary/80 border-accent-blue/20 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
                )}
              </div>
              <div className="text-[10px] truncate mt-1 text-text-secondary">
                {item.roundName}
              </div>
              <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-accent-blue">
                <span className="truncate">{item.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
