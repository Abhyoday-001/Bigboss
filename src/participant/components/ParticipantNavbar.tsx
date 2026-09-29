import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { Eye, LogOut } from 'lucide-react';

export const ParticipantNavbar: React.FC = () => {
  const { team, logout } = useAuth();
  const { currentMetadata } = useEventPhase();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-accent-blue/20 bg-bg-primary/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded border border-accent-blue/40 bg-bg-elevated flex items-center justify-center glow-blue-sm group-hover:border-accent-blue transition-all">
            <Eye className="w-4 h-4 text-accent-blue animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-display tracking-widest text-base text-text-primary uppercase group-hover:text-accent-blue-glow transition-all">
              THE DEV HOUSE
            </span>
            <span className="text-[9px] font-mono text-accent-blue tracking-wider -mt-0.5">
              PARTICIPANT TERMINAL
            </span>
          </div>
        </Link>

        {/* Minimal Right Section: Status Pill, Team Name & Logout */}
        <div className="flex items-center gap-3">
          {/* Active Phase Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-accent-blue/20 text-[10px] font-mono text-accent-blue tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
            <span>{currentMetadata?.name || 'LIVE OPERATION'}</span>
          </div>

          {/* Simple Clean Team Identifier */}
          {team && (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-bg-elevated border border-accent-blue/30">
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
              <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
                {team.teamName}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded bg-bg-elevated hover:bg-danger-red/15 border border-white/10 hover:border-danger-red/40 text-text-secondary hover:text-danger-red transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

