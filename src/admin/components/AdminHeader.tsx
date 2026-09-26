import React, { useState, useEffect } from 'react';
import { Eye, Radio, Clock, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EventPhase } from '../../shared/types/event';

interface AdminHeaderProps {
  currentPhase: EventPhase;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-accent-blue/20 bg-bg-primary/95 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Branding & Surveillance Eye */}
      <div className="flex items-center gap-3.5">
        <Link to="/admin" className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-bg-elevated border border-accent-blue/40 glow-blue-sm shrink-0">
          <Eye className="w-5 h-5 text-accent-blue animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger-red rounded-full ring-2 ring-black animate-ping" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-display tracking-widest text-lg sm:text-xl text-text-primary uppercase metal-headline">
              THE DEV HOUSE
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-accent-blue/15 border border-accent-blue/30 text-accent-blue-glow rounded font-bold tracking-wider">
              CONTROL ROOM
            </span>
          </div>
          <div className="text-[10px] font-mono text-text-secondary flex items-center gap-1.5 -mt-0.5">
            <span className="text-accent-blue font-bold">[SURVEILLANCE_ACTIVE]</span>
            <span className="text-text-secondary/60">· COGNITO CLUB · JAIN FET</span>
          </div>
        </div>
      </div>

      {/* System Status & Admin Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-accent-blue/20 font-mono text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-accent-blue" />
          <span className="text-text-primary font-bold">{timeStr || '00:00:00'}</span>
          <span className="text-[10px] text-success-green flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" /> SYNCED
          </span>
        </div>

        {/* Link back to Participant Portal */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-accent-blue/15 border border-accent-blue/30 text-accent-blue-glow hover:text-accent-blue transition-all font-mono text-xs uppercase tracking-wider glow-blue-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">PARTICIPANT VIEW</span>
          <span className="md:hidden">PORTAL</span>
        </Link>

        {/* Administrator Profile Pill (Dilraj & Admin Team) */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-accent-blue/20">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/50 flex items-center justify-center text-accent-blue text-xs font-bold glow-blue-sm">
            D
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-text-primary leading-tight font-display tracking-wider">
              Dilraj (Admin)
            </div>
            <div className="text-[9px] font-mono text-accent-blue uppercase tracking-widest">
              Live State Machine
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
