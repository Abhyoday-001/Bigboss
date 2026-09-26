import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { MOCK_TEAMS } from '../../shared/mocks/mockData';
import { Eye, User, LogOut, Terminal, Crown, Home, ChevronDown, Check, Shield } from 'lucide-react';

export const ParticipantNavbar: React.FC = () => {
  const { team, logout, switchActiveTeam, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Round 1 Task', path: '/round-1', icon: Terminal },
    { name: 'Round 2 Captaincy', path: '/round-2-captaincy', icon: Crown },
    { name: 'Team Profile', path: '/profile', icon: User },
    { name: 'Admin Console', path: '/admin', icon: Shield },
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

        {/* Team Pill & Quick Persona Switcher */}
        <div className="flex items-center gap-3">
          {team && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded bg-bg-elevated hover:bg-bg-elevated-hover border border-accent-blue/30 transition-all text-left group"
                title="Switch Demo Persona"
              >
                <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                <div className="text-right">
                  <div className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-accent-blue-glow">
                    {team.teamName}
                  </div>
                  <div className="text-[10px] font-mono text-accent-blue">
                    {team.score} PTS • #{team.rank}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent-blue" />
              </button>

              {/* Persona Switcher Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 panel-card p-2 border border-accent-blue/40 bg-bg-elevated/95 backdrop-blur-xl shadow-2xl rounded-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-text-secondary border-b border-accent-blue/15 mb-1.5 flex items-center justify-between">
                    <span>SWITCH ACTIVE PERSONA</span>
                    <span className="text-accent-blue">DEMO</span>
                  </div>
                  <div className="space-y-1">
                    {MOCK_TEAMS.slice(0, 5).map((t) => {
                      const isSelected = team.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            switchActiveTeam(t.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-accent-blue/20 text-accent-blue font-bold border border-accent-blue/40'
                              : 'hover:bg-bg-primary text-text-primary'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{t.teamName}</div>
                            <div className="text-[10px] font-mono text-text-secondary">
                              {t.members[0]?.name} • #{t.rank} ({t.score} pts)
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent-blue" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
