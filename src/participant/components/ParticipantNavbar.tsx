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
              TECH BOSS
            </span>
            <span className="text-[9px] font-mono text-accent-blue tracking-wider -mt-0.5">
              PARTICIPANT TERMINAL
            </span>
          </div>
        </Link>

        {/* Minimal Right Section: Status Pill, Team Name & Logout */}
        <div className="flex items-center gap-3">
          {/* Simple Clean Team Identifier with Popover */}
          {team && (
            <div className="relative group">
              <button 
                type="button" 
                className="flex items-center gap-2 px-3 py-1 rounded bg-bg-elevated hover:bg-bg-border border border-accent-blue/30 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
                  {team.teamName}
                </span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-accent-blue/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-3">
                <div className="text-[10px] font-mono text-text-muted mb-1 uppercase">Team Name</div>
                <div className="text-sm font-bold text-accent-blue mb-3">{team.teamName}</div>
                
                <div className="text-[10px] font-mono text-text-muted mb-1 uppercase">Team Members</div>
                <ul className="text-xs text-text-primary space-y-1">
                  {team.members && team.members.length > 0 ? (
                    team.members.map((member, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-blue/50" />
                        {member.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-text-secondary italic">No members</li>
                  )}
                </ul>
              </div>
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

