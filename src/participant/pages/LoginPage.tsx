import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { EyeAnimation } from '../components/EyeAnimation';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import eyeHeroImg from '../../assets/eye-hero.png';
import { Lock, Shield, ArrowRight, AlertCircle, Key, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [teamId, setTeamId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPostLoginZoom, setShowPostLoginZoom] = useState(false);

  const { loginTeam } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId.trim() || !passcode.trim()) {
      setErrorMessage('Please provide both House Team ID and Passcode.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await loginTeam(teamId, passcode);
    setIsLoading(false);

    if (result.success) {
      // Trigger post-login eye-zoom transition per DESIGN.md §5
      setShowPostLoginZoom(true);
    } else {
      setErrorMessage(result.error || 'Authentication rejected by The Eye.');
    }
  };

  const handleZoomComplete = () => {
    navigate('/dashboard');
  };

  // Quick preset helper for evaluation
  const setDemoCredentials = (id: string, code: string) => {
    setTeamId(id);
    setPasscode(code);
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Persistent Ambient Eye Background */}
      <AmbientEyeBackground position="bottom-right" />

      {/* Post-Login Lighter Eye Zoom Sequence */}
      {showPostLoginZoom && (
        <EyeAnimation mode="login-zoom" onComplete={handleZoomComplete} />
      )}

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md panel-card p-6 sm:p-8 border border-accent-blue/30 glow-blue">
        {/* Top Camera Status */}
        <div className="flex items-center justify-between pb-5 border-b border-accent-blue/20">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full border border-accent-blue/50 overflow-hidden flex items-center justify-center glow-blue-sm bg-bg-primary shrink-0">
              <img src={eyeHeroImg} alt="Dev House Eye" className="w-full h-full object-cover scale-150" />
              <div className="absolute inset-0 rounded-full border border-accent-blue/40 pointer-events-none" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                SECURITY TERMINAL
              </div>
              <div className="font-display text-xl uppercase tracking-wider text-text-primary">
                House Verification
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-elevated-hover border border-accent-blue/20 text-text-secondary">
            PORT 443
          </span>
        </div>

        {/* Informational Notice */}
        <div className="mt-4 p-3 rounded bg-bg-elevated-hover/80 border border-accent-blue/15 text-xs text-text-secondary flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
          <span>
            Credentials are issued directly by the control room. Self-registration is restricted.
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded bg-danger-red/15 border border-danger-red/40 text-xs text-danger-red flex items-start gap-2.5 glow-red">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Access Denied:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-1.5">
              Team Identifier (ID or Name)
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="e.g. team-01 or CyberNexus"
                className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-1.5">
              Authorization Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display text-lg tracking-wider uppercase font-bold flex items-center justify-center gap-2 transition-all glow-blue disabled:opacity-50"
          >
            {isLoading ? (
              <span className="font-mono text-sm">AUTHENTICATING...</span>
            ) : (
              <>
                <span>VERIFY & ENTER</span>
                <ArrowRight className="w-4 h-4 stroke-2" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Select */}
        <div className="mt-6 pt-5 border-t border-accent-blue/15">
          <div className="text-[11px] font-mono text-text-secondary mb-2 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-accent-blue" />
            <span>TEST CREDENTIALS (CLICK TO AUTO-FILL):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('team-01', 'devhouse')}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue text-accent-blue-glow transition-all"
            >
              team-01 (CyberNexus)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('team-02', 'devhouse')}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue text-accent-blue-glow transition-all"
            >
              team-02 (NullPointers)
            </button>
          </div>
        </div>

        {/* Return to landing */}
        <div className="mt-5 text-center">
          <Link to="/" className="text-xs font-mono text-text-secondary hover:text-accent-blue-glow transition-colors">
            ← Return to Event Brief
          </Link>
        </div>
      </div>
    </div>
  );
};
