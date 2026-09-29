import React, { useState } from 'react';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { EventPhase } from '../../shared/state-machine/types';
import { eventOperationsService } from '../../shared/services/eventOperationsService';
import {
  Play,
  Square,
  Pause,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HelpCircle,
  Terminal,
  Crown,
  Swords,
  Trophy,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface RoundDef {
  number: number;
  id: string;
  name: string;
  shortDesc: string;
  startPhase: EventPhase;
  endPhase: EventPhase;
  route: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  subPhases?: { name: string; phase: EventPhase }[];
}

const ROUNDS_CATALOG: RoundDef[] = [
  {
    number: 0,
    id: 'round-0',
    name: 'Round 0: Rapid Technical Assessment',
    shortDesc: '10s per question quiz to calibrate and seed the initial leaderboard.',
    startPhase: 'ROUND_0_ACTIVE',
    endPhase: 'ROUND_0_RESULTS',
    route: '/round-0',
    icon: HelpCircle,
    accentColor: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10',
  },
  {
    number: 1,
    id: 'round-1',
    name: 'Round 1: Rapid Task & Architecture Challenge',
    shortDesc: 'Hands-on system build with checklist criteria and manual evaluator grading.',
    startPhase: 'ROUND_1_ACTIVE',
    endPhase: 'ROUND_1_RESULTS',
    route: '/round-1',
    icon: Terminal,
    accentColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    number: 2,
    id: 'round-2',
    name: 'Round 2: Captaincy Battle & Secret Missions',
    shortDesc: 'House duel for captaincy immunity followed by nominations and classified tasks.',
    startPhase: 'ROUND_2_CAPTAINCY',
    endPhase: 'ROUND_3_IMMUNITY',
    route: '/round-2-captaincy',
    icon: Crown,
    accentColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    subPhases: [
      { name: 'Captaincy Duel', phase: 'ROUND_2_CAPTAINCY' },
      { name: 'Nominations', phase: 'ROUND_2_NOMINATIONS' },
      { name: 'Secret Missions', phase: 'ROUND_2_SECRET_TASK' },
    ],
  },
  {
    number: 3,
    id: 'round-3',
    name: 'Round 3: Immunity Challenge & House Eviction',
    shortDesc: 'Allied pairings clash for survival followed by live house voting and dramatic cut.',
    startPhase: 'ROUND_3_IMMUNITY',
    endPhase: 'ROUND_4_FEATURES_REVEALED',
    route: '/round-3-immunity',
    icon: Swords,
    accentColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    subPhases: [
      { name: 'Immunity Battle', phase: 'ROUND_3_IMMUNITY' },
      { name: 'House Voting', phase: 'ROUND_3_VOTING' },
      { name: 'Eviction Verdict', phase: 'ROUND_3_EVICTION_REVEAL' },
    ],
  },
  {
    number: 4,
    id: 'round-4',
    name: 'Round 4: The Finale Build & CTF Face-Off',
    shortDesc: 'Final surviving 3 teams build live features and jury awards championship trophy.',
    startPhase: 'ROUND_4_FEATURES_REVEALED',
    endPhase: 'FINAL_RESULTS',
    route: '/round-4-features',
    icon: Trophy,
    accentColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    subPhases: [
      { name: 'Features Unlocked', phase: 'ROUND_4_FEATURES_REVEALED' },
      { name: 'Submissions Open', phase: 'ROUND_4_SUBMISSION' },
      { name: 'Jury Evaluation', phase: 'ROUND_4_JUDGING' },
      { name: 'Crown Champions', phase: 'FINAL_RESULTS' },
    ],
  },
];

export const AdminRoundLauncher: React.FC = () => {
  const { currentPhase, setPhase, setTargetEndTime } = useEventPhase();
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setBroadcastNotice(msg);
    setTimeout(() => setBroadcastNotice(null), 5000);
  };

  const handleStartRound = (round: RoundDef) => {
    // 1. Activate phase
    setPhase(round.startPhase);

    // 2. Extra sync for R0 or R1
    if (round.startPhase === 'ROUND_0_ACTIVE') {
      eventOperationsService.updateRound0Config({ isActive: true });
    }

    // 3. Set default 30 min timer
    setTargetEndTime(Date.now() + 30 * 60 * 1000);

    showNotice(
      `BROADCAST DISPATCHED: "${round.name}" is now LIVE! All participant panels are auto-navigating to ${round.route} and starting immediately.`
    );
  };

  const handleEndRound = (round: RoundDef) => {
    setPhase(round.endPhase);

    if (round.startPhase === 'ROUND_0_ACTIVE') {
      eventOperationsService.updateRound0Config({ isActive: false });
    }

    showNotice(
      `BROADCAST DISPATCHED: "${round.name}" has been CLOSED. Participants returned to Standby Dashboard.`
    );
  };

  const handleSetSubPhase = (subPhase: EventPhase, subName: string) => {
    setPhase(subPhase);
    showNotice(
      `BROADCAST DISPATCHED: Activated sub-phase "${subName}". Participant panels synchronized.`
    );
  };

  const handleSetStandby = () => {
    setPhase('ROUND_0_RESULTS');
    showNotice(
      'BROADCAST DISPATCHED: Entire House placed on STANDBY / INTERMISSION. All participant screens returned to waiting mode.'
    );
  };

  return (
    <div className="bg-[#0b0e14] border border-accent-blue/30 rounded-xl p-5 md:p-6 shadow-2xl relative space-y-6">
      {/* Top Banner & Live Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-accent-blue/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent-blue font-bold">
              TECH BOSS CENTRAL MISSION CONTROL
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
            Individual Round Launchers
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Click Start for any round below. The active round page loads automatically on all participant terminals and begins in real-time.
          </p>
        </div>

        {/* Global Broadcast Status Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-bg-elevated border border-accent-blue/30 flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-accent-blue animate-pulse" />
            <div className="text-left font-mono">
              <div className="text-[9px] uppercase text-text-secondary">ACTIVE PARTICIPANT BROADCAST</div>
              <div className="text-xs font-bold text-accent-blue-glow truncate max-w-[200px]">
                {currentPhase}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSetStandby}
            className="px-3.5 py-2 rounded-lg bg-bg-elevated hover:bg-bg-border border border-border-default hover:border-warning-amber/50 text-xs font-mono text-text-secondary hover:text-warning-amber transition-all flex items-center gap-1.5 cursor-pointer"
            title="Return all participant panels to standby / intermission"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>House Standby</span>
          </button>
        </div>
      </div>

      {/* Live Broadcast Toast */}
      {broadcastNotice && (
        <div className="p-3.5 rounded-lg bg-accent-blue/15 border border-accent-blue/50 text-accent-blue-glow text-xs font-mono flex items-center gap-2.5 shadow-glow-blue animate-in fade-in">
          <Zap className="w-4 h-4 shrink-0 fill-current animate-pulse text-accent-blue" />
          <span className="flex-1">{broadcastNotice}</span>
        </div>
      )}

      {/* Individual Round Launcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROUNDS_CATALOG.map((round) => {
          const Icon = round.icon;
          const isRoundActive =
            currentPhase === round.startPhase ||
            (round.subPhases && round.subPhases.some((sp) => sp.phase === currentPhase));

          return (
            <div
              key={round.id}
              className={`rounded-xl p-5 border transition-all relative flex flex-col justify-between ${
                isRoundActive
                  ? 'bg-accent-blue/10 border-accent-blue shadow-glow-blue'
                  : 'bg-bg-elevated/70 border-bg-border hover:border-accent-blue/30'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center ${round.accentColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        ROUND 0{round.number}
                      </span>
                      <h3 className="text-sm font-bold text-text-primary line-clamp-1">
                        {round.name.split(':')[1] || round.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isRoundActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-success-green/20 border border-success-green/40 text-success-green flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase text-text-muted bg-bg-primary border border-bg-border">
                      STANDBY
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-4 min-h-[32px]">
                  {round.shortDesc}
                </p>

                {/* Sub-phases if applicable */}
                {round.subPhases && (
                  <div className="mb-4 pt-3 border-t border-bg-border/60">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">
                      Sub-Phase Milestones:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {round.subPhases.map((sp) => {
                        const isSubActive = currentPhase === sp.phase;
                        return (
                          <button
                            key={sp.phase}
                            type="button"
                            onClick={() => handleSetSubPhase(sp.phase, sp.name)}
                            className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-accent-blue text-black font-bold'
                                : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-bg-border'
                            }`}
                          >
                            {sp.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-bg-border/60 space-y-2">
                {!isRoundActive ? (
                  <button
                    type="button"
                    onClick={() => handleStartRound(round)}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-wider font-bold shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START ROUND {round.number} (AUTO-LAUNCH)</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled
                      className="py-2.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RUNNING</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEndRound(round)}
                      className="py-2.5 px-3 rounded-lg bg-danger-red hover:bg-red-600 text-white text-xs font-mono uppercase font-bold shadow-glow-red flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>END ROUND</span>
                    </button>
                  </div>
                )}

                <div className="text-[10px] font-mono text-text-muted flex items-center justify-between">
                  <span>Target Route:</span>
                  <span className="text-accent-blue">{round.route}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
