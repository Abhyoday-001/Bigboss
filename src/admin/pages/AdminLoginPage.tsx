import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../shared/hooks/useAuth';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { NeuronNetworkBackground } from '../../participant/components/NeuronNetworkBackground';
import { 
  Lock, 
  Eye, 
  ArrowRight, 
  AlertCircle, 
  Radio, 
  Terminal
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [adminId, setAdminId] = useState('dilraj.admin');
  const [passcode, setPasscode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'core' | 'tools' | 'judge'>('core');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim()) {
      setErrorMessage('Admin identifier required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Simulate auth handshake
      await new Promise((r) => setTimeout(r, 450));
      const res = await loginAdmin(passcode);
      if (res.success) {
        navigate('/admin', { replace: true });
      } else {
        setErrorMessage(res.error || 'Invalid Admin credentials or clearance expired.');
      }
    } catch {
      setErrorMessage('System authentication failure. Retry connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleSelect = (roleKey: 'core' | 'tools' | 'judge', defaultId: string) => {
    setSelectedRole(roleKey);
    setAdminId(defaultId);
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050506] text-text-primary selection:bg-accent-blue selection:text-black overflow-hidden p-4">
      {/* 1. Ambient Eye in Background */}
      <AmbientEyeBackground position="center" className="opacity-15 scale-110" />

      {/* 2. Interactive Neuron Network Animation */}
      <NeuronNetworkBackground />

      {/* 3. Subtle Surveillance Grid & Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-0 surveillance-grid opacity-60" />
      <div className="fixed inset-0 pointer-events-none z-0 scanline opacity-40" />

      {/* 4. Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative bg-[#0d0f14]/90 backdrop-blur-xl border border-accent-blue/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-accent-blue/10">
          {/* Top Eye Accent & Surveillance Pill */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-accent-blue/20">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/40 shadow-glow-blue">
                <Eye className="w-4 h-4 text-accent-blue animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger-red animate-ping" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-accent-blue uppercase block">
                  [CLEARANCE LEVEL 4]
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  COGNITO CONTROL ROOM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161a23] border border-bg-border text-[10px] font-mono text-success-green">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1 mb-6 text-left">
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-text-primary flex items-center gap-2">
              <span>THE DEV HOUSE</span>
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed font-mono">
              Authoritative host terminal for state machine control, score calibration, and live event telemetry.
            </p>
          </div>

          {/* Quick Role Selectors */}
          <div className="mb-5 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
              Quick Clearance Profile:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('core', 'dilraj.admin')}
                className={`px-2 py-1.5 text-[11px] font-mono rounded border transition-all ${
                  selectedRole === 'core'
                    ? 'bg-accent-blue text-black border-accent-blue font-bold shadow-glow-blue'
                    : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
                }`}
              >
                Dilraj (Core)
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('tools', 'spoorthi.admin')}
                className={`px-2 py-1.5 text-[11px] font-mono rounded border transition-all ${
                  selectedRole === 'tools'
                    ? 'bg-accent-blue text-black border-accent-blue font-bold shadow-glow-blue'
                    : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
                }`}
              >
                Spoorthi (Tools)
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('judge', 'judge.panel')}
                className={`px-2 py-1.5 text-[11px] font-mono rounded border transition-all ${
                  selectedRole === 'judge'
                    ? 'bg-accent-blue text-black border-accent-blue font-bold shadow-glow-blue'
                    : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
                }`}
              >
                Judge Desk
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-danger-red/10 border border-danger-red/30 text-xs text-danger-red flex items-center gap-2 font-mono animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Admin ID / Identifier */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent-blue" />
                  Admin Identifier
                </span>
                <span className="text-[10px] text-text-muted">Host ID</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. dilraj.admin"
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-lg bg-[#090b10] border border-bg-border focus:border-accent-blue text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Security Passkey / Master Key */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent-blue" />
                  Master Security Key
                </span>
                <span className="text-[10px] text-text-muted">Passphrase</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret key or press enter for demo"
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-lg bg-[#090b10] border border-bg-border focus:border-accent-blue text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-accent-blue hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  VERIFYING CLEARANCE...
                </>
              ) : (
                <>
                  <span>AUTHENTICATE & ENTER CONTROL ROOM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Switching Option */}
          <div className="mt-6 pt-4 border-t border-accent-blue/15 flex items-center justify-between text-xs font-mono text-text-secondary">
            <Link
              to="/"
              className="hover:text-accent-blue transition-colors flex items-center gap-1 text-[11px]"
            >
              ← Switch to Participant Terminal
            </Link>
            <span className="text-[10px] text-text-muted">
              v1.0-AUTH
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
