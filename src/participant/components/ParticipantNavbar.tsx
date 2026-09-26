import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { Eye, User, LogOut, Terminal, Crown, Home } from 'lucide-react';

export const ParticipantNavbar: React.FC = () => {
  const { team, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Round 1 Task', path: '/round-1', icon: Terminal },
    { name: 'Round 2 Captaincy', path: '/round-2-captaincy', icon: Crown },
    { name: 'Team Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-accent-blue/20 bg-bg-primary/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded border border-accent-blue/40 bg-bg-elevated flex items-center justify-center glow-blue-sm">
            <Eye className="w-4 h-4 text-accent-blue animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-display tracking-widest text-base text-text-primary uppercase">
              THE DEV HOUSE
            </span>
            <span className="text-[9px] font-mono text-accent-blue tracking-wider -mt-0.5">
              PARTICIPANT TERMINAL
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  isActive
                    ? 'bg-accent-blue/20 text-accent-blue-glow border border-accent-blue/40 font-bold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Team Pill & Logout */}
        <div className="flex items-center gap-3">
          {team && (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-bg-elevated border border-accent-blue/25">
              <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
              <div className="text-right">
                <div className="text-xs font-bold text-text-primary line-clamp-1">
                  {team.teamName}
                </div>
                <div className="text-[10px] font-mono text-accent-blue">
                  {team.score} PTS • #{team.rank}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-danger-red/10 border border-transparent hover:border-danger-red/30 text-text-secondary hover:text-danger-red transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Links Row */}
      <div className="md:hidden flex items-center justify-around border-t border-accent-blue/10 py-2 px-3 font-mono text-[11px] bg-bg-elevated/60">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 py-1 px-2 rounded ${
                isActive ? 'text-accent-blue-glow font-bold bg-accent-blue/20' : 'text-text-secondary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.name.replace('Round ', 'R')}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
