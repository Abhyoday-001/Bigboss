import React, { useState, useEffect } from 'react';
import { Eye, Radio, Clock } from 'lucide-react';
import { EventPhase } from '../../shared/types/event';

interface AdminHeaderProps {
  currentPhase: EventPhase;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#07080b]/90 backdrop-blur-md border-b border-bg-border px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Branding & Surveillance Eye */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-accent-blue/10 border border-accent-blue/40 shadow-glow-blue">
          <Eye className="w-5 h-5 text-accent-blue animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger-red rounded-full ring-2 ring-black animate-ping" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-wider text-text-primary">
              THE DEV HOUSE
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-accent-blue/20 text-accent-blue rounded font-bold">
              ADMIN DESK
            </span>
          </div>
          <div className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
            <span className="text-accent-blue font-bold">[SURVEILLANCE_ACTIVE]</span>
            <span>· COGNITO CLUB JAIN FET</span>
          </div>
        </div>
      </div>

      {/* System Status & Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-bg-border font-mono text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-accent-blue" />
          <span className="text-text-primary font-bold">{timeStr || '00:00:00'}</span>
          <span className="text-[10px] text-success-green flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" /> SYNCED
          </span>
        </div>

        {/* Dilraj Admin Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-bg-border">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/50 flex items-center justify-center text-accent-blue text-xs font-bold">
            D
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-text-primary leading-tight">Dilraj (Core Admin)</div>
            <div className="text-[10px] font-mono text-accent-blue">Global State Machine</div>
          </div>
        </div>
      </div>
    </header>
  );
};
