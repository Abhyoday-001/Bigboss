import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../shared/hooks/useAuth';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import eyeHeroImg from '../../assets/eye-hero.png';
import { Lock, Shield, ArrowRight, AlertCircle, Key, Users, Radio } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [teamId, setTeamId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error || 'Authentication rejected by The Eye.');
    }
  };

  const handleQuickLogin = async (alias: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const result = await loginTeam(alias);
    setIsLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error || 'Authentication error.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050506] text-text-primary flex flex-col justify-center items-center p-4 sm:p-6 overflow-x-hidden selection:bg-accent-blue/30 selection:text-accent-blue-glow">
      {/* 1. Full-Screen Distributed Animated Neuron Network */}
      <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-0 opacity-85" />

      {/* 2. Persistent Ambient Eye Background in bottom-right corner */}
      <AmbientEyeBackground position="bottom-right" />

      {/* 3. Ambient Blue Radial Glow behind login card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 sm:w-150 h-120 sm:h-150 rounded-full bg-accent-blue/12 blur-[100px] pointer-events-none z-0" />

      {/* 4. Optimized Cyber Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md panel-card p-5 sm:p-7 border border-accent-blue/35 glow-blue shadow-2xl bg-bg-elevated/95 backdrop-blur-xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-blue/20">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full border border-accent-blue/50 overflow-hidden flex items-center justify-center glow-blue-sm bg-bg-primary shrink-0">
              <img src={eyeHeroImg} alt="Dev House Eye" className="w-full h-full object-cover scale-150" />
              <div className="absolute inset-0 rounded-full border border-accent-blue/40 pointer-events-none" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-1 font-bold">
                <Shield className="w-3 h-3 text-accent-blue" />
                <span>SECURITY TERMINAL</span>
              </div>
              <h1 className="font-display text-xl uppercase tracking-wider text-text-primary leading-tight">
                House Verification
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-primary border border-accent-blue/25 text-[10px] font-mono text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
            <span>GRID LIVE</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-3.5 p-2.5 rounded-lg bg-bg-primary/80 border border-accent-blue/15 text-[11px] text-text-secondary flex items-start gap-2 leading-relaxed">
          <Radio className="w-3.5 h-3.5 text-accent-blue shrink-0 mt-0.5 animate-pulse" />
          <span>
            Authorized house access only. Surveillance state machine is active.
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-3.5 p-3 rounded-lg bg-danger-red/15 border border-danger-red/40 text-xs text-danger-red flex items-start gap-2.5 glow-red">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Access Denied:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-1">
              Team Identifier (ID or Name)
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="e.g. team-01 or CyberNexus"
                className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-1">
              Authorization Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display text-base tracking-wider uppercase font-bold flex items-center justify-center gap-2 transition-all glow-blue-sm disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isLoading ? (
              <span className="font-mono text-xs">SYNCHRONIZING...</span>
            ) : (
              <>
                <span>VERIFY & ENTER</span>
                <ArrowRight className="w-4 h-4 stroke-2" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Select */}
        <div className="mt-4 pt-3.5 border-t border-accent-blue/15 text-center">
          <div className="text-[10px] font-mono text-text-secondary mb-2 flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <Key className="w-3 h-3 text-accent-blue" />
            <span>1-Click Direct Demo Access:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <button
              type="button"
              onClick={() => handleQuickLogin('team-01')}
              className="p-1.5 px-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
            >
              <span className="font-bold text-text-primary text-[11px]">TEAM ALPHA</span>
              <span className="text-[9px] text-text-secondary">Aryan Sharma (#1)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('team-02')}
              className="p-1.5 px-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
            >
              <span className="font-bold text-text-primary text-[11px]">TEAM BETA</span>
              <span className="text-[9px] text-text-secondary">Anjishth Kumar (#2)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('team-03')}
              className="p-1.5 px-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
            >
              <span className="font-bold text-text-primary text-[11px]">TEAM GAMMA</span>
              <span className="text-[9px] text-text-secondary">Dilraj Singh (#3)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('team-04')}
              className="p-1.5 px-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
            >
              <span className="font-bold text-text-primary text-[11px]">TEAM DELTA</span>
              <span className="text-[9px] text-text-secondary">Spoorthi Gowda (#4)</span>
            </button>
          </div>
          <div className="mt-1.5 text-[9px] font-mono text-text-secondary">
            Passcode: <code className="text-accent-blue">devhouse</code> (or any text)
          </div>
        </div>

        {/* Return to landing */}
        <div className="mt-3.5 text-center">
          <Link to="/" className="text-[11px] font-mono text-text-secondary hover:text-accent-blue-glow transition-colors">
            ← Return to Event Brief
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
