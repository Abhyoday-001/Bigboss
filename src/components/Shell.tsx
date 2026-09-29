import React from 'react';
import { useEventContext } from '../contracts/EventContext';
import { useAuth } from '../contracts/AuthContext';
import { EventPhase } from '../contracts/types';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { phase, setPhase } = useEventContext();
  const { team } = useAuth();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative overflow-hidden flex flex-col">
      {/* Background Motifs */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {/* Placeholder for Eye and Neural network motifs */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-blue/10 via-bg-primary to-bg-primary"></div>
      </div>
      
      {/* Dev Tools (Mock Control Panel) */}
      <div className="bg-bg-elevated border-b border-accent-blue/20 p-2 text-xs flex justify-between items-center z-50">
        <div className="text-text-secondary">
          <span className="font-bold text-accent-blue">MOCK CONTROL PANEL:</span> Current Phase:
        </div>
        <select 
          className="bg-bg-primary border border-accent-blue/30 text-text-primary rounded px-2 py-1"
          value={phase}
          onChange={(e) => setPhase(e.target.value as EventPhase)}
        >
          {Object.values(EventPhase).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Header */}
      <header className="border-b border-accent-blue/20 p-4 relative z-10 flex justify-between items-center">
        <h1 className="text-2xl distressed-text">TECH BOSS</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-text-secondary tracking-widest uppercase">Team</div>
            <div className="font-bold">{team?.name}</div>
          </div>
          {/* Eye Icon Motif */}
          <div className="w-8 h-8 rounded-full border border-accent-blue flex items-center justify-center shadow-glow">
            <div className="w-2 h-2 rounded-full bg-accent-blue-glow"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 relative z-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
