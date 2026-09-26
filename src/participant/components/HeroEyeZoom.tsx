import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { NeuralNetworkOverlay } from './NeuralNetworkOverlay';
import { NeuronNetworkBackground } from './NeuronNetworkBackground';
import eyeHeroImg from '../../assets/eye-hero.png';
import { AlertCircle, ArrowRight } from 'lucide-react';

export interface HeroEyeZoomProps {
  onLoginSuccess?: () => void;
}

export const HeroEyeZoom: React.FC<HeroEyeZoomProps> = ({ onLoginSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { loginTeam, isAuthenticated } = useAuth();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Form State
  const [teamId, setTeamId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Always reset scroll to top on reload so the animation plays smoothly from the start
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Framer Motion scroll tracking scoped to tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth physics spring interpolation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 28,
    mass: 0.65,
    restDelta: 0.0005,
  });

  // Scale: 1 -> 45, centered precisely on pupil (50.98%, 46.88%)
  const scale = useTransform(smoothProgress, [0, 0.65, 0.92, 1], [1, 12, 38, 45]);

  // Fade out starting branding quickly as zoom initiates
  const brandingOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  const brandingY = useTransform(smoothProgress, [0, 0.08], [0, -35]);

  // Black overlay across last ~15% of progress (masks extreme rasterization)
  const blackOverlayOpacity = useTransform(smoothProgress, [0.82, 0.96, 1], [0, 0.94, 0.98]);

  // Login form crossfades in right at the end
  const loginFormOpacity = useTransform(smoothProgress, [0.93, 1], [0, 1]);
  const loginFormScale = useTransform(smoothProgress, [0.93, 1], [0.96, 1]);
  const loginPointerEvents = useTransform(smoothProgress, (p) => (p >= 0.94 ? 'auto' : 'none'));

  const handleLogin = async (e: React.FormEvent) => {
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
      onLoginSuccess ? onLoginSuccess() : navigate('/dashboard');
    } else {
      setErrorMessage(result.error || 'Authentication rejected by The Eye.');
    }
  };

  const setDemoCredentials = (id: string, code: string) => {
    setTeamId(id);
    setPasscode(code);
    setErrorMessage(null);
  };

  const handleQuickLogin = async (teamAlias: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const result = await loginTeam(teamAlias);
    setIsLoading(false);
    if (result.success) {
      onLoginSuccess ? onLoginSuccess() : navigate('/dashboard');
    } else {
      setErrorMessage(result.error || 'Authentication error.');
    }
  };

  const jumpToLogin = () => {
    if (containerRef.current) {
      const targetY = containerRef.current.scrollHeight - window.innerHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  // If user prefers reduced motion, show fast-resolved view
  if (prefersReducedMotion) {
    return (
      <div className="relative min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Animated Neuron Network Background */}
        <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-0 opacity-80" />

        {/* Ambient radial glow behind login card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 rounded-full bg-accent-blue/15 blur-[120px] pointer-events-none z-0" />

        {/* Resolved Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md panel-card p-6 sm:p-8 border border-accent-blue/30 glow-blue shadow-2xl bg-bg-elevated/95 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between pb-5 border-b border-accent-blue/20">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full border border-accent-blue/40 overflow-hidden bg-bg-primary flex items-center justify-center glow-blue-sm">
                <img src={eyeHeroImg} alt="Eye" className="w-full h-full object-cover scale-150" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                  SECURITY TERMINAL
                </div>
                <div className="font-display text-xl uppercase tracking-wider text-text-primary">
                  The Dev House
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-elevated border border-accent-blue/20 text-[10px] font-mono text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
              <span>GRID LIVE</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded bg-danger-red/15 border border-danger-red/40 text-xs text-danger-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
                Team Identifier
              </label>
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="e.g. TEAM_ALPHA"
                className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
                Terminal Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-display text-base tracking-wider uppercase font-bold bg-accent-blue hover:bg-accent-blue-glow text-black transition-all glow-blue-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="font-mono text-xs">SYNCHRONIZING...</span>
              ) : (
                <>
                  <span>ENTER THE HOUSE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick presets */}
          <div className="mt-6 pt-4 border-t border-accent-blue/15 text-center">
            <div className="text-[11px] font-mono text-text-secondary mb-2.5 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              <span>DEMO LOGIN (1-CLICK DIRECT ACCESS):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin('TEAM_ALPHA')}
                className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
              >
                <span className="font-bold text-text-primary">TEAM ALPHA</span>
                <span className="text-[10px] text-text-secondary">Aryan Sharma (#1)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('TEAM_BETA')}
                className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
              >
                <span className="font-bold text-text-primary">TEAM BETA</span>
                <span className="text-[10px] text-text-secondary">Anjishth Kumar (#2)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('TEAM_GAMMA')}
                className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
              >
                <span className="font-bold text-text-primary">TEAM GAMMA</span>
                <span className="text-[10px] text-text-secondary">Dilraj Singh (#3)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('TEAM_DELTA')}
                className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
              >
                <span className="font-bold text-text-primary">TEAM DELTA</span>
                <span className="text-[10px] text-text-secondary">Spoorthi Gowda (#4)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-bg-primary"
      style={{ height: '500vh' }}
    >
      {/* Sticky Viewport Wrapper */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Eye Pop-In Container (0 -> 1 opacity, 0.9 -> 1 scale on initial mount) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          {/* Zooming Eye Image with hardware acceleration */}
          <motion.div
            style={{
              scale,
              // Exact center of pupil measured: X=50.98%, Y=46.88%
              transformOrigin: '50.98% 46.88%',
              willChange: 'transform',
            }}
            className="relative w-full max-w-240 aspect-video flex items-center justify-center select-none translate-z-0"
          >
            <img
              src={eyeHeroImg}
              alt="The Dev House Surveillance Eye"
              className="w-full h-full object-cover filter contrast-125 brightness-105 pointer-events-none"
            />

            {/* Seamless edge blend into page background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 51% 47%, transparent 40%, #050506 95%)',
              }}
            />

            {/* Subtle center pupil light pulse */}
            <div
              className="absolute pointer-events-none w-36 h-36 rounded-full bg-accent-blue/30 blur-2xl animate-pulse"
              style={{ left: 'calc(50.98% - 72px)', top: 'calc(46.88% - 72px)' }}
            />
          </motion.div>

          {/* Neural Network Travel Overlay (Canvas Particles radiating from pupil smoothly) */}
          <NeuralNetworkOverlay
            progress={smoothProgress}
            pupilCenter={{ xPercent: 50.98, yPercent: 46.88 }}
          />

          {/* Initial Resting State Branding (Fades out quickly as scroll begins) */}
          <motion.div
            style={{ opacity: brandingOpacity, y: brandingY }}
            className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between items-center p-6 sm:p-10"
          >
            {/* Top Brand Banner & Skip to Login */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-blue/30 bg-bg-elevated/80 backdrop-blur text-xs font-mono text-accent-blue tracking-widest uppercase glow-blue-sm">
                <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                <span>COGNITO CLUB • JAIN FET</span>
              </div>

              <button
                type="button"
                onClick={jumpToLogin}
                className="pointer-events-auto font-mono text-[11px] text-text-secondary hover:text-accent-blue-glow border border-accent-blue/20 px-3 py-1.5 rounded bg-bg-elevated/80 backdrop-blur transition-all uppercase tracking-wider"
              >
                SKIP TO LOGIN ↓
              </button>
            </div>

            {/* Bottom Title & Scroll-To-Enter Prompt */}
            <div className="flex flex-col items-center text-center">
              <h1 className="metal-headline text-5xl sm:text-7xl md:text-8xl font-display tracking-wider uppercase mb-2">
                THE DEV HOUSE
              </h1>
              <p className="font-mono text-xs sm:text-sm text-text-secondary tracking-widest uppercase mb-8 bracket-framed">
                13 STAGES • 30 CODERS • 1 ULTIMATE SURVIVOR
              </p>

              {/* Scroll indicator */}
              <div className="flex flex-col items-center gap-2 font-mono text-[11px] text-accent-blue-glow tracking-widest uppercase animate-bounce">
                <span>SCROLL TO ENTER</span>
                <div className="w-5 h-8 rounded-full border border-accent-blue/50 flex justify-center p-1">
                  <div className="w-1.5 h-2 rounded-full bg-accent-blue animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Black Vignette Overlay (Fades in during last 15% of zoom) */}
          <motion.div
            style={{ opacity: blackOverlayOpacity }}
            className="absolute inset-0 bg-bg-primary/94 pointer-events-none z-40 backdrop-blur-[2px]"
          />

          {/* Persistent Neuron Network Background Layer (Placed above black overlay at z-45!) */}
          <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-45 opacity-80" />

          {/* Ambient Blue Radial Glow directly behind the login card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 rounded-full bg-accent-blue/15 blur-[120px] pointer-events-none z-46" />

          {/* Resolved Login Form Container (Crossfades in as screen resolves) */}
          <motion.div
            style={{
              opacity: loginFormOpacity,
              scale: loginFormScale,
              pointerEvents: loginPointerEvents,
            }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md panel-card p-6 sm:p-8 border border-accent-blue/40 glow-blue shadow-2xl bg-bg-elevated/95 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-5 border-b border-accent-blue/20">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full border border-accent-blue/40 overflow-hidden bg-bg-primary flex items-center justify-center glow-blue-sm">
                    <img src={eyeHeroImg} alt="Eye" className="w-full h-full object-cover scale-150" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                      AUTHENTICATION TERMINAL
                    </div>
                    <div className="font-display text-xl uppercase tracking-wider text-text-primary">
                      The Dev House
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-primary border border-accent-blue/20 text-[10px] font-mono text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
                  <span>GRID ACCESS</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 rounded bg-danger-red/15 border border-danger-red/40 text-xs text-danger-red flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
                    Team Identifier
                  </label>
                  <input
                    type="text"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="e.g. TEAM_ALPHA"
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
                    Terminal Passcode
                  </label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-display text-base tracking-wider uppercase font-bold bg-accent-blue hover:bg-accent-blue-glow text-black transition-all glow-blue-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="font-mono text-xs">SYNCHRONIZING...</span>
                  ) : (
                    <>
                      <span>ENTER THE HOUSE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick presets */}
              <div className="mt-6 pt-4 border-t border-accent-blue/15 text-center">
                <div className="text-[11px] font-mono text-text-secondary mb-2.5 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                  <span>DEMO LOGIN (1-CLICK DIRECT ACCESS):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('TEAM_ALPHA')}
                    className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
                  >
                    <span className="font-bold text-text-primary">TEAM ALPHA</span>
                    <span className="text-[10px] text-text-secondary">Aryan Sharma (#1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('TEAM_BETA')}
                    className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
                  >
                    <span className="font-bold text-text-primary">TEAM BETA</span>
                    <span className="text-[10px] text-text-secondary">Anjishth Kumar (#2)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('TEAM_GAMMA')}
                    className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
                  >
                    <span className="font-bold text-text-primary">TEAM GAMMA</span>
                    <span className="text-[10px] text-text-secondary">Dilraj Singh (#3)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('TEAM_DELTA')}
                    className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col"
                  >
                    <span className="font-bold text-text-primary">TEAM DELTA</span>
                    <span className="text-[10px] text-text-secondary">Spoorthi Gowda (#4)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
