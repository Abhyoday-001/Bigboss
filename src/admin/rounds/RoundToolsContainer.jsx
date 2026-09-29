import React, { useState } from 'react';
import {
  Crown,
  UserMinus,
  EyeOff,
  Vote,
  Skull,
  FileCode,
  Globe,
  MinusCircle,
  Trophy,
  RotateCcw,
  LayoutDashboard,
} from 'lucide-react';

import Round2Captaincy from './Round2Captaincy';
import Round2Nominations from './Round2Nominations';
import Round2SecretMission from './Round2SecretMission';
import Round3VotingControl from './Round3VotingControl';
import Round3EvictionReveal from './Round3EvictionReveal';
import Round4HiddenFeatures from './Round4HiddenFeatures';
import Round4Submissions from './Round4Submissions';
import Round4PenaltyInterface from './Round4PenaltyInterface';
import Round4FinalScoreboard from './Round4FinalScoreboard';
import SurveillanceEye from '../components/SurveillanceEye';
import adminRoundService from '../services/adminRoundService';

export function RoundToolsContainer({ activeRound = null, onSelectTool = null, embedded = false }) {
  const [activeTab, setActiveTab] = useState('r2-captaincy');

  const tools = [
    {
      id: 'r2-captaincy',
      title: 'Captaincy Management',
      icon: Crown,
      component: Round2Captaincy,
    },
    {
      id: 'r2-nominations',
      title: 'Team Nominations',
      icon: UserMinus,
      component: Round2Nominations,
    },
    {
      id: 'r2-secret-mission',
      title: 'Secret Missions (1st/Mid/Last)',
      icon: EyeOff,
      component: Round2SecretMission,
    },
    {
      id: 'r3-voting',
      title: 'Voting Control & Tallies',
      icon: Vote,
      component: Round3VotingControl,
    },
    {
      id: 'r3-eviction',
      title: 'Eviction Trigger & Reveal',
      icon: Skull,
      component: Round3EvictionReveal,
    },
    {
      id: 'r4-hidden-features',
      title: 'Hidden Features Spec',
      icon: FileCode,
      component: Round4HiddenFeatures,
    },
    {
      id: 'r4-submissions',
      title: 'Team Submissions',
      icon: Globe,
      component: Round4Submissions,
    },
    {
      id: 'r4-penalties',
      title: 'Out-of-Scope Penalties',
      icon: MinusCircle,
      component: Round4PenaltyInterface,
    },
    {
      id: 'r4-final-scoreboard',
      title: 'Final Scoreboard & Winner',
      icon: Trophy,
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
                    ADMIN DASHBOARD
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary font-mono">
                  Cognito Club · JAIN FET · Live Round Control Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleResetData}
                title="Reset Demo Round Data"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-text-secondary hover:text-white bg-bg-primary hover:bg-bg-elevated border border-accent-blue/20 rounded-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Body with Clean Streamlined Sidebar */}
      <div className={`w-full flex flex-col lg:flex-row gap-6 ${embedded ? '' : 'max-w-7xl mx-auto p-4 sm:p-8'}`}>
        {/* Sidebar Tool Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="panel-card border border-accent-blue/25 bg-bg-elevated/95 p-4 shadow-xl rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-accent-blue/15 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5 font-bold">
                <LayoutDashboard className="w-3.5 h-3.5 text-accent-blue" />
                Control Modules
              </span>
              <span className="text-[10px] font-mono text-accent-blue font-bold px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30">
                {tools.length} Tools
              </span>
            </div>

            <nav className="space-y-1">
              {tools.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-accent-blue/20 text-accent-blue-glow font-bold border border-accent-blue/50 glow-blue-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated-hover border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-blue' : 'text-text-secondary'}`} />
                    <span className="truncate">{t.title}</span>
                  </button>
                );
              })}
            </nav>
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
