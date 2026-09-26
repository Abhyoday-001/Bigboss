import React, { useState } from 'react';
import {
  Crown,
  UserMinus,
  EyeOff,
  Users,
  Swords,
  Vote,
  Skull,
  FileCode,
  Globe,
  Award,
  MinusCircle,
  Trophy,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

import Round2Captaincy from './Round2Captaincy';
import Round2Nominations from './Round2Nominations';
import Round2SecretMission from './Round2SecretMission';
import Round3TeamPairing from './Round3TeamPairing';
import Round3ImmunityControl from './Round3ImmunityControl';
import Round3VotingControl from './Round3VotingControl';
import Round3EvictionReveal from './Round3EvictionReveal';
import Round4HiddenFeatures from './Round4HiddenFeatures';
import Round4Submissions from './Round4Submissions';
import Round4JudgeScoring from './Round4JudgeScoring';
import Round4PenaltyInterface from './Round4PenaltyInterface';
import Round4FinalScoreboard from './Round4FinalScoreboard';
import SurveillanceEye from '../components/SurveillanceEye';
import adminRoundService from '../services/adminRoundService';

export function RoundToolsContainer({ activeRound = null, onSelectTool = null, embedded = false }) {
  const [activeTab, setActiveTab] = useState('r2-captaincy');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

  const tools = [
    // Round 2 Modules
    {
      id: 'r2-captaincy',
      round: 'Round 2',
      title: 'Captaincy & Reveal',
      icon: Crown,
      badge: 'R2',
      component: Round2Captaincy,
    },
    {
      id: 'r2-nominations',
      round: 'Round 2',
      title: 'Nomination Quotas',
      icon: UserMinus,
      badge: 'R2',
      component: Round2Nominations,
    },
    {
      id: 'r2-secret-mission',
      round: 'Round 2',
      title: 'Secret Mission (1st/Mid/Last)',
      icon: EyeOff,
      badge: 'R2',
      component: Round2SecretMission,
    },

    // Round 3 Modules
    {
      id: 'r3-pairings',
      round: 'Round 3',
      title: 'Team Pairings',
      icon: Users,
      badge: 'R3',
      component: Round3TeamPairing,
    },
    {
      id: 'r3-immunity',
      round: 'Round 3',
      title: 'Immunity Duels',
      icon: Swords,
      badge: 'R3',
      component: Round3ImmunityControl,
    },
    {
      id: 'r3-voting',
      round: 'Round 3',
      title: 'Voting Control & Tallies',
      icon: Vote,
      badge: 'R3',
      component: Round3VotingControl,
    },
    {
      id: 'r3-eviction',
      round: 'Round 3',
      title: 'Eviction Trigger & Reveal',
      icon: Skull,
      badge: 'R3',
      component: Round3EvictionReveal,
    },

    // Round 4 Modules
    {
      id: 'r4-hidden-features',
      round: 'Round 4',
      title: 'Hidden Features Spec',
      icon: FileCode,
      badge: 'R4',
      component: Round4HiddenFeatures,
    },
    {
      id: 'r4-submissions',
      round: 'Round 4',
      title: 'Team Submissions',
      icon: Globe,
      badge: 'R4',
      component: Round4Submissions,
    },
    {
      id: 'r4-judging',
      round: 'Round 4',
      title: 'Judge Scoring Rubric',
      icon: Award,
      badge: 'R4',
      component: Round4JudgeScoring,
    },
    {
      id: 'r4-penalties',
      round: 'Round 4',
      title: 'Out-of-Scope Penalties',
      icon: MinusCircle,
      badge: 'R4',
      component: Round4PenaltyInterface,
    },
    {
      id: 'r4-final-scoreboard',
      round: 'Round 4',
      title: 'Final Scoreboard & Winner',
      icon: Trophy,
      badge: 'Finale',
      component: Round4FinalScoreboard,
    },
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all demo state back to factory initial state?')) {
      adminRoundService.resetAllState();
      window.location.reload();
    }
  };

  const currentTool = tools.find((t) => t.id === activeTab) || tools[0];
  const ActiveComponent = currentTool.component;

  const filteredTools =
    selectedRoundFilter === 'all'
      ? tools
      : tools.filter((t) => t.round.toLowerCase() === selectedRoundFilter.toLowerCase());

  return (
    <div className={`w-full flex flex-col ${embedded ? '' : 'min-h-screen bg-bg-primary text-text-primary'}`}>
      {/* Top Header Bar only if rendered standalone */}
      {!embedded && (
        <header className="bg-bg-elevated border-b border-accent-blue/20 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-lg backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SurveillanceEye size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-wider uppercase metal-headline">
                    THE DEV HOUSE
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-accent-blue/15 border border-accent-blue/40 text-accent-blue-glow font-bold">
                    ROUND OPERATIONS
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary font-mono">
                  Cognito Club · JAIN FET · Live Round Control Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="/admin"
                className="px-3 py-1.5 rounded-lg bg-bg-primary hover:bg-accent-blue/15 border border-accent-blue/30 text-accent-blue-glow transition-all text-xs font-mono font-bold uppercase glow-blue-sm"
              >
                ← Master Command
              </a>
              <a
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black transition-all text-xs font-mono font-bold uppercase"
              >
                Participant View ➔
              </a>
            </div>
          </div>
        </header>
      )}

      {/* Round Sub-filter Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl panel-card border border-accent-blue/25 bg-bg-elevated/95 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold mr-1">
            Filter Round:
          </span>
          <div className="flex items-center bg-bg-primary border border-accent-blue/20 rounded-lg p-1 text-xs font-mono">
            {['all', 'Round 2', 'Round 3', 'Round 4'].map((rf) => (
              <button
                key={rf}
                onClick={() => setSelectedRoundFilter(rf)}
                className={`px-3 py-1 rounded transition-all uppercase text-[11px] font-semibold cursor-pointer ${
                  selectedRoundFilter === rf
                    ? 'bg-accent-blue text-black font-bold glow-blue-sm shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-text-secondary">
            Current Module: <strong className="text-accent-blue-glow">{currentTool.title}</strong>
          </span>
          <button
            onClick={handleResetData}
            title="Reset Demo Round Data"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-text-secondary hover:text-danger-red border border-accent-blue/20 hover:border-danger-red/40 rounded-lg hover:bg-danger-red/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[10px]">RESET</span>
          </button>
        </div>
      </div>

      {/* Main Body with Sidebar Navigation */}
      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tool Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="panel-card border border-accent-blue/25 bg-bg-elevated/95 p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-accent-blue/15 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5 font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-accent-blue" />
                Operational Engines
              </span>
              <span className="text-[10px] font-mono text-accent-blue font-bold px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30">
                {filteredTools.length} Modules
              </span>
            </div>

            <nav className="space-y-1">
              {filteredTools.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-accent-blue/20 text-accent-blue-glow font-bold border border-accent-blue/50 glow-blue-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated-hover border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-blue' : 'text-text-secondary'}`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-bg-primary border border-accent-blue/20 text-accent-blue shrink-0 ml-1">
                      {t.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Surveillance Badge */}
          <div className="p-3.5 panel-card border border-accent-blue/15 bg-bg-elevated/60 text-xs text-text-secondary space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-accent-blue font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              <span>LIVE CONTROL INTEGRATION</span>
            </div>
            <p className="text-[11px] leading-relaxed text-text-secondary/70">
              State updates in these engines synchronize across the central control grid and live participant screens.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

export default RoundToolsContainer;
