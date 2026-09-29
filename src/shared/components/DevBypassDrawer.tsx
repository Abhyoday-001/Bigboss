import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEventPhase } from '../hooks/useEventPhase';
import { useNavigate } from 'react-router-dom';
import { MOCK_TEAMS } from '../mocks/mockData';
import { Key, X, Zap, Users, Navigation, Check } from 'lucide-react';

export const DevBypassDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { team, switchActiveTeam, loginAdmin } = useAuth();
  const { currentPhase, setPhase, allPhases } = useEventPhase();
  const navigate = useNavigate();

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated/95 hover:bg-bg-elevated border border-warning-amber/50 text-warning-amber hover:text-amber-300 font-mono text-[11px] font-bold tracking-wider shadow-2xl backdrop-blur-md transition-all cursor-pointer glow-blue-sm"
          title="Open Developer Bypass Panel"
        >
          <Key className="w-3.5 h-3.5 animate-pulse" />
          <span>[DEV BYPASS]</span>
        </button>
      </div>

      {/* Floating Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg panel-card p-5 border border-warning-amber/40 shadow-2xl bg-bg-elevated/95 backdrop-blur-xl rounded-xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-warning-amber/20">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-warning-amber" />
                <span className="font-display uppercase tracking-wider text-sm font-bold text-text-primary">
                  DEVELOPER BYPASS & TEST SUITE
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Quick Persona Switching */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-warning-amber font-bold">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Switch Team Persona:</span>
                </span>
                <span className="text-[10px] text-text-secondary">
                  Current: {team?.teamName || 'None'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'team-01', name: 'CyberNexus (#1)', desc: 'Captain • Secret Mission' },
                  { id: 'team-02', name: 'NullPointers (#2)', desc: 'Finalist • Safe' },
                  { id: 'team-03', name: 'ByteForce (#3)', desc: 'Finalist • Safe' },
                  { id: 'team-04', name: 'GlitchHunters (#4)', desc: 'Spectator in R4' },
                  { id: 'team-05', name: 'ZeroDay (#5 Mid)', desc: 'Middle • Secret Mission' },
                  { id: 'team-09', name: 'SyntaxErrors (#9)', desc: 'Nominated • Secret Mission' },
                ].map((item) => {
                  const isSelected = team?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => switchActiveTeam(item.id)}
                      className={`p-2 rounded text-left border transition-all text-xs font-mono cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-warning-amber/15 border-warning-amber text-warning-amber font-bold'
                          : 'bg-bg-primary/80 border-accent-blue/20 hover:border-accent-blue text-text-primary'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] leading-tight">{item.name}</div>
                        <div className="text-[9px] text-text-secondary">{item.desc}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-warning-amber" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quick Phase Simulator */}
            <div className="space-y-1.5 pt-2 border-t border-accent-blue/15">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-warning-amber font-bold">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Event Phase:</span>
                </span>
                <span className="text-[10px] text-accent-blue font-bold">{currentPhase}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {allPhases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setPhase(phase)}
                    className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                      currentPhase === phase
                        ? 'bg-warning-amber text-black font-bold shadow-sm'
                        : 'bg-bg-primary border border-white/10 hover:border-warning-amber/40 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {phase.replace('ROUND_', 'R').replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Direct Route Teleport */}
            <div className="space-y-1.5 pt-2 border-t border-accent-blue/15">
              <div className="text-[11px] font-mono uppercase text-warning-amber font-bold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>Direct Route Jump:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                {[
                  { label: 'Dashboard', path: '/dashboard' },
                  { label: 'R0 Quiz', path: '/round-0' },
                  { label: 'Round 1', path: '/round-1' },
                  { label: 'R2 Captaincy', path: '/round-2-captaincy' },
                  { label: 'R2 Secret', path: '/secret-mission' },
                  { label: 'R2 Nominate', path: '/nomination-status' },
                  { label: 'R3 Immunity', path: '/immunity-challenge' },
                  { label: 'R3 Voting', path: '/voting' },
                  { label: 'R3 Eviction', path: '/eviction-reveal' },
                  { label: 'R4 CTF Specs', path: '/round-4-features' },
                  { label: 'R4 Submit', path: '/round-4-submission' },
                  { label: 'Finale Podium', path: '/final-results' },
                  { label: 'Admin Hub', path: '/admin' },
                ].map((route) => (
                  <button
                    key={route.path}
                    onClick={() => {
                      navigate(route.path);
                      setIsOpen(false);
                    }}
                    className="p-1.5 rounded bg-bg-primary border border-accent-blue/20 hover:border-accent-blue text-accent-blue-glow hover:bg-accent-blue/10 text-center transition-all cursor-pointer truncate"
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 text-center text-[10px] font-mono text-text-secondary/50">
              Developer tool enabled • Press [DEV BYPASS] anytime to test different conditions
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevBypassDrawer;
