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

export function RoundToolsContainer({ activeRound = null, onSelectTool = null }) {
  // Navigation tabs for Spoorthi's modules
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
    <div className="min-h-screen bg-[#050506] text-[#F2F3F5] flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-[#0d0f14] border-b border-gray-800/80 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SurveillanceEye size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider uppercase font-display-metal">
                  THE DEV HOUSE
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/70 border border-[#1EA7FF]/40 text-[#1EA7FF]">
                  Admin Round Tools (Spoorthi)
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Cognito Club · JAIN FET · Round 2, 3, & 4 Live Control Matrix
              </p>
            </div>
          </div>

          {/* Quick Round Filter & Reset */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-[#050506] border border-gray-800 rounded-lg p-1 text-xs font-mono">
              {['all', 'Round 2', 'Round 3', 'Round 4'].map((rf) => (
                <button
                  key={rf}
                  onClick={() => setSelectedRoundFilter(rf)}
                  className={`px-2.5 py-1 rounded transition-colors uppercase ${
                    selectedRoundFilter === rf
                      ? 'bg-[#1EA7FF] text-[#050506] font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {rf}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetData}
              title="Reset Demo Data"
              className="p-2 text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg hover:bg-gray-800/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <a
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-[#1EA7FF]/40 text-[#1EA7FF] hover:bg-[#1EA7FF] hover:text-[#050506] transition-colors text-xs font-mono font-bold uppercase"
            >
              Participant Portal ➔
            </a>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar Navigation */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row p-4 sm:p-8 gap-8">
        {/* Sidebar Tool Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-[#0d0f14] border border-gray-800/80 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5 font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1EA7FF]" />
                Assigned Tool Modules
              </span>
              <span className="text-[10px] font-mono text-[#1EA7FF] font-bold">
                {filteredTools.length} Tools
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#1EA7FF]/15 text-[#1EA7FF] font-bold border border-[#1EA7FF]/40 shadow-[0_0_12px_rgba(30,167,255,0.2)]'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1EA7FF]' : 'text-gray-400'}`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-gray-400 shrink-0 ml-1">
                      {t.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Integration Specs Box */}
          <div className="p-4 bg-[#0d0f14]/60 border border-gray-800/60 rounded-xl text-xs text-gray-400 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1EA7FF] block font-bold">
              // Modular Integration Info
            </span>
            <p className="text-[11px] leading-relaxed text-gray-400">
              Each module is completely self-contained and imports cleanly into Dilraj's main admin navigation shell or can be mounted individually.
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
