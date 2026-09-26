import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEventPhase } from '../hooks/useEventPhase';
import { MOCK_TEAMS } from '../mocks/mockData';
import { EventPhase } from '../state-machine/types';
import {
  Key,
  Users,
  Shield,
  Crown,
  Eye,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoAccessDrawer: React.FC = () => {
  const { team, role, loginTeam, loginAdmin, switchActiveTeam } = useAuth();
  const { currentPhase, setPhase, allPhases } = useEventPhase();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSelectTeam = async (teamId: string) => {
    if (role === 'PARTICIPANT' && team) {
      switchActiveTeam(teamId);
    } else {
      await loginTeam(teamId, 'devhouse');
      navigate('/dashboard');
    }
  };

  const handleAdminLogin = async () => {
    await loginAdmin('admin123');
    navigate('/dashboard');
  };

  const demoAccounts = [
    {
      id: 'team-01',
      teamName: 'CyberNexus',
      lead: 'Aryan Sharma',
      rank: '#1',
      passcode: 'devhouse',
      badge: 'CAPTAIN • SECRET MISSION',
      badgeColor: 'border-accent-cyan text-accent-cyan bg-accent-cyan/10',
      description: 'First on Leaderboard, holds Captaincy immunity and Round 2 secret mission.',
    },
    {
      id: 'team-02',
      teamName: 'NullPointers',
      lead: 'Anjishth Kumar',
      rank: '#2',
      passcode: 'devhouse',
      badge: 'CHALLENGER',
      badgeColor: 'border-accent-blue text-accent-blue bg-accent-blue/10',
      description: 'Top contender, competing for captaincy.',
    },
    {
      id: 'team-03',
      teamName: 'ByteForce',
      lead: 'Dilraj Singh',
      rank: '#3',
      passcode: 'devhouse',
      badge: 'CONTENDER',
      badgeColor: 'border-accent-blue text-accent-blue bg-accent-blue/10',
      description: 'High tier participant team with active challenge progress.',
    },
    {
      id: 'team-04',
      teamName: 'GlitchHunters',
      lead: 'Spoorthi Gowda',
      rank: '#4',
      passcode: 'devhouse',
      badge: 'SAFE',
      badgeColor: 'border-accent-blue text-accent-blue bg-accent-blue/10',
      description: 'Mid-table contestant team with complete squad roster.',
    },
    {
      id: 'team-05',
      teamName: 'ZeroDay Protocol',
      lead: 'Tanmay Joshi',
      rank: '#5',
      passcode: 'devhouse',
      badge: 'SECRET MISSION (MIDDLE)',
      badgeColor: 'border-accent-cyan text-accent-cyan bg-accent-cyan/10',
      description: 'Leaderboard middle team unlocked for secret Bigg Boss saboteur task.',
    },
    {
      id: 'team-09',
      teamName: 'SyntaxErrors',
      lead: 'Manish Das',
      rank: '#9',
      passcode: 'devhouse',
      badge: 'SECRET MISSION • NOMINATED',
      badgeColor: 'border-danger-red text-danger-red bg-danger-red/10',
      description: 'Bottom leaderboard team in the eviction danger zone with underdog secret mission.',
    },
  ];

  return (
    <>
      {/* Floating Toggle Button (Always accessible at bottom-right) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all shadow-xl backdrop-blur-md border ${
            isOpen
              ? 'bg-accent-blue text-black border-accent-blue-glow glow-blue font-bold'
              : 'bg-bg-elevated/90 hover:bg-bg-elevated-hover text-accent-blue-glow border-accent-blue/40 glow-blue-sm'
          }`}
          title="Toggle Demo Credentials & Quick Switcher"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DEMO CREDENTIALS</span>
          <span className="sm:hidden">DEMO</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Slide-Up / Popover Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-[92vw] max-w-lg max-h-[80vh] overflow-y-auto panel-card p-5 border border-accent-blue/50 glow-blue shadow-2xl bg-bg-elevated/95 backdrop-blur-xl rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-accent-blue/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded border border-accent-blue/40 bg-bg-primary flex items-center justify-center glow-blue-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
              </div>
              <div>
                <h3 className="font-display tracking-wider text-base uppercase text-text-primary">
                  Demo Credentials & Switcher
                </h3>
                <p className="text-[10px] font-mono text-accent-blue -mt-0.5">
                  1-CLICK DIRECT ACCESS TO ANY ROLE & PHASE
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Active Persona Summary */}
          <div className="mt-3 p-2.5 rounded bg-bg-primary/90 border border-accent-blue/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
              <div>
                <div className="text-[10px] font-mono uppercase text-text-secondary">ACTIVE STATE:</div>
                <div className="text-xs font-bold text-text-primary">
                  {role === 'ADMIN'
                    ? 'CONTROL ROOM ADMIN'
                    : team
                    ? `${team.teamName} (${team.members[0]?.name || team.id})`
                    : 'UNAUTHENTICATED (ANONYMOUS)'}
                </div>
              </div>
            </div>
            {team && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                RANK {team.rank} • {team.score} PTS
              </span>
            )}
          </div>

          {/* Quick Team Switcher / Accounts */}
          <div className="mt-4">
            <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-accent-blue" />
                Participant Teams (Click to Switch):
              </span>
              <span className="text-[9px] text-text-secondary">Passcode: devhouse</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc) => {
                const isCurrent = team?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                      isCurrent
                        ? 'bg-accent-blue/15 border-accent-blue glow-blue-sm'
                        : 'bg-bg-primary/60 border-accent-blue/20 hover:border-accent-blue/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display tracking-wider text-sm font-bold text-text-primary">
                          {acc.teamName}
                        </span>
                        <span className="text-[10px] font-mono text-accent-blue font-bold">
                          {acc.rank}
                        </span>
                        {acc.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${acc.badgeColor}`}
                          >
                            {acc.badge}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectTeam(acc.id)}
                        className={`text-xs font-mono px-2.5 py-1 rounded transition-all flex items-center gap-1 uppercase tracking-wider ${
                          isCurrent
                            ? 'bg-accent-blue text-black font-bold'
                            : 'bg-bg-elevated hover:bg-accent-blue hover:text-black text-text-primary border border-accent-blue/30'
                        }`}
                      >
                        {isCurrent ? <Check className="w-3 h-3" /> : null}
                        <span>{isCurrent ? 'ACTIVE' : 'SWITCH'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-text-secondary flex items-center justify-between">
                      <span>Lead: <strong className="text-text-primary font-mono">{acc.lead}</strong></span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(acc.id, `id-${acc.id}`)}
                          className="font-mono text-[10px] text-text-secondary hover:text-accent-blue flex items-center gap-1"
                          title="Copy Team ID"
                        >
                          <span>ID: {acc.id}</span>
                          {copiedKey === `id-${acc.id}` ? (
                            <Check className="w-2.5 h-2.5 text-success-green" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                        <span className="text-text-secondary/40">•</span>
                        <button
                          onClick={() => copyToClipboard(acc.passcode, `pass-${acc.id}`)}
                          className="font-mono text-[10px] text-text-secondary hover:text-accent-blue flex items-center gap-1"
                          title="Copy Passcode"
                        >
                          <span>Pass: {acc.passcode}</span>
                          {copiedKey === `pass-${acc.id}` ? (
                            <Check className="w-2.5 h-2.5 text-success-green" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Role Quick Login */}
          <div className="mt-4 pt-3 border-t border-accent-blue/20">
            <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-warning-yellow" />
                Admin / Control Room Access:
              </span>
              <span className="text-[9px] text-text-secondary">Passcode: admin123</span>
            </div>
            <div className="p-2.5 rounded-lg border border-warning-yellow/30 bg-warning-yellow/5 flex items-center justify-between">
              <div>
                <div className="font-display tracking-wider text-sm font-bold text-text-primary">
                  CONTROL ROOM MASTER
                </div>
                <div className="text-[11px] font-mono text-text-secondary">
                  Full administrative permissions & timer controls.
                </div>
              </div>
              <button
                onClick={handleAdminLogin}
                className={`text-xs font-mono px-3 py-1.5 rounded transition-all flex items-center gap-1 uppercase tracking-wider ${
                  role === 'ADMIN'
                    ? 'bg-warning-yellow text-black font-bold'
                    : 'bg-bg-elevated hover:bg-warning-yellow hover:text-black text-warning-yellow border border-warning-yellow/40'
                }`}
              >
                {role === 'ADMIN' ? <Check className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                <span>{role === 'ADMIN' ? 'ACTIVE' : 'ENTER ADMIN'}</span>
              </button>
            </div>
          </div>

          {/* Event Phase Simulator Switcher */}
          <div className="mt-4 pt-3 border-t border-accent-blue/20">
            <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-accent-cyan" />
                Live Event Phase Simulator:
              </span>
              <span className="text-[9px] text-accent-cyan font-mono">Current: {currentPhase}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              {allPhases.map((phase) => {
                const isActive = currentPhase === phase;
                return (
                  <button
                    key={phase}
                    onClick={() => setPhase(phase)}
                    className={`p-1.5 rounded border text-left truncate transition-all ${
                      isActive
                        ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold'
                        : 'bg-bg-primary/60 border-accent-blue/15 text-text-secondary hover:text-text-primary hover:border-accent-blue/30'
                    }`}
                    title={phase}
                  >
                    {isActive ? '▶ ' : ''}{phase.replace('ROUND_', 'R').replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Page Jump Links */}
          <div className="mt-4 pt-3 border-t border-accent-blue/20">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider mb-2">
              Quick Jump to Screens:
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                className="px-2 py-1 rounded bg-bg-primary border border-accent-blue/25 hover:border-accent-blue text-text-secondary hover:text-accent-blue"
              >
                /dashboard
              </button>
              <button
                onClick={() => { navigate('/round-1'); setIsOpen(false); }}
                className="px-2 py-1 rounded bg-bg-primary border border-accent-blue/25 hover:border-accent-blue text-text-secondary hover:text-accent-blue"
              >
                /round-1
              </button>
              <button
                onClick={() => { navigate('/round-2-captaincy'); setIsOpen(false); }}
                className="px-2 py-1 rounded bg-bg-primary border border-accent-blue/25 hover:border-accent-blue text-text-secondary hover:text-accent-blue"
              >
                /round-2-captaincy
              </button>
              <button
                onClick={() => { navigate('/profile'); setIsOpen(false); }}
                className="px-2 py-1 rounded bg-bg-primary border border-accent-blue/25 hover:border-accent-blue text-text-secondary hover:text-accent-blue"
              >
                /profile
              </button>
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="px-2 py-1 rounded bg-bg-primary border border-accent-blue/25 hover:border-accent-blue text-text-secondary hover:text-accent-blue"
              >
                /login
              </button>
              <button
                onClick={() => { navigate('/'); setIsOpen(false); }}
                className="px-2 py-1 rounded bg-bg-primary border border-accent-blue/25 hover:border-accent-blue text-text-secondary hover:text-accent-blue"
              >
                / (landing)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
