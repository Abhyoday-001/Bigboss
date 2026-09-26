import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { NeuralNetworkOverlay } from './NeuralNetworkOverlay';
import { NeuronNetworkBackground } from './NeuronNetworkBackground';
import eyeHeroImg from '../../assets/eye-hero.png';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export interface HeroEyeZoomProps {
  onTap?: () => void;
  onLoginSuccess?: () => void;
}

const SESSION_STORAGE_KEY = 'the_dev_house_intro_played';

export const HeroEyeZoom: React.FC<HeroEyeZoomProps> = ({ onTap, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { loginTeam, isAuthenticated } = useAuth();

  // Track prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Animation & session state
  const isAnimatingRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [willChangeActive, setWillChangeActive] = useState(false);

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

  // Preload eye hero asset to prevent decode-stall mid-animation
  useEffect(() => {
    const img = new Image();
    img.src = eyeHeroImg;
    if ('decode' in img) {
      img.decode().catch(() => {});
    }
  }, []);

  // If already authenticated, redirect straight to participant dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Single source of truth: 0 -> 1 progress value
  const progress = useMotionValue(0);

  // Check sessionStorage on mount: if already played this session, skip straight to login
  useEffect(() => {
    try {
      const alreadyPlayed = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
      if (alreadyPlayed) {
        progress.set(1);
        setHasEntered(true);
      }
    } catch {
      // Ignore sessionStorage exceptions (e.g. private browsing storage restrictions)
    }
  }, [progress]);

  // Derived transforms strictly driven by the single progress value
  // Scale eye from 1 -> 40 with accelerating exponential-like interpolation
  const scale = useTransform(progress, [0, 0.4, 0.72, 0.9, 1], [1, 3.6, 14, 32, 40]);

  // Fade out idle branding quickly as zoom initiates (0 -> 0.12)
  const brandingOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const brandingY = useTransform(progress, [0, 0.12], [0, -28]);

  // Black overlay across last ~15% of timeline (0.85 -> 1.0)
  const blackOverlayOpacity = useTransform(progress, [0.85, 0.98, 1], [0, 0.96, 1]);

  // Crossfade login form right as screen goes black (0.94 -> 1.0)
  const loginFormOpacity = useTransform(progress, [0.94, 1], [0, 1]);
  const loginFormScale = useTransform(progress, [0.94, 1], [0.96, 1]);
  const loginPointerEvents = useTransform(progress, (p) => (p >= 0.95 ? 'auto' : 'none'));

  // Trigger the single timed animation sequence on tap/click
  const handleTap = () => {
    // If already animating, already completed, or reduced motion, prevent any second trigger
    if (isAnimatingRef.current || hasEntered) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setWillChangeActive(true);
    onTap?.();

    // 5.5-second fixed duration timeline driven by single progress value
    // Eased curve: starts gentle, accelerates through middle, settles smoothly into 1
    animate(progress, 1, {
      duration: 5.5,
      ease: [0.42, 0.0, 0.25, 1.0],
      onComplete: () => {
        setHasEntered(true);
        setIsAnimating(false);
        setWillChangeActive(false);
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        } catch {
          // Ignore storage restrictions
        }
      },
    });
  };

  // Skip straight to login without waiting for animation
  const handleSkipToLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    progress.set(1);
    setHasEntered(true);
    setIsAnimating(false);
    setWillChangeActive(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage restrictions
    }
  };

  // Form submission handler
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

  // 1-Click direct demo login presets
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

  // If user prefers reduced motion, skip sequence directly to login form
  if (prefersReducedMotion) {
    return (
      <div className="relative w-full h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 overflow-hidden selection:bg-accent-blue/30 selection:text-accent-blue-glow">
        <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-0 opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 rounded-full bg-accent-blue/15 blur-[120px] pointer-events-none z-0" />

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
      onClick={handleTap}
      className={`relative w-full h-screen overflow-hidden bg-bg-primary select-none flex items-center justify-center ${
        hasEntered ? '' : 'cursor-pointer'
      }`}
    >
      {/* Eye Pop-In Container: Opacity 0 -> 1, Scale 0.9 -> 1 on mount in ~0.4s */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        {/* Zooming Eye Image */}
        <motion.div
          style={{
            scale,
            // Fixed origin on pupil's measured coordinate: X=50.98%, Y=46.88%
            transformOrigin: '50.98% 46.88%',
            willChange: willChangeActive ? 'transform, opacity' : 'auto',
          }}
          className="relative w-full max-w-240 aspect-video flex items-center justify-center translate-z-0 shrink-0"
        >
          {/* Subtle slow idle breathing on eye when waiting for tap (~3s loop) */}
          <motion.div
            animate={
              isAnimating || hasEntered
                ? { scale: 1, filter: 'brightness(1.05) contrast(1.2)' }
                : {
                    scale: [1, 1.02, 1],
                    filter: [
                      'brightness(1.02) contrast(1.2)',
                      'brightness(1.15) contrast(1.28)',
                      'brightness(1.02) contrast(1.2)',
                    ],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full relative"
          >
            <img
              src={eyeHeroImg}
              alt="The Dev House Surveillance Eye"
              className="w-full h-full object-cover filter pointer-events-none"
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
        </motion.div>

        {/* Neural Network Travel Overlay: Canvas particle system driven by SAME progress value */}
        <NeuralNetworkOverlay
          progress={progress}
          pupilCenter={{ xPercent: 50.98, yPercent: 46.88 }}
        />

        {/* Initial Resting State Branding & Tap-To-Enter Prompt */}
        <motion.div
          style={{ opacity: brandingOpacity, y: brandingY }}
          className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between items-center p-6 sm:p-10"
        >
          {/* Top Brand Banner & Skip to Login Button */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-blue/30 bg-bg-elevated/80 backdrop-blur text-xs font-mono text-accent-blue tracking-widest uppercase glow-blue-sm">
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
              <span>COGNITO CLUB • JAIN FET</span>
            </div>

            <button
              type="button"
              onClick={handleSkipToLogin}
              className="pointer-events-auto font-mono text-[11px] text-text-secondary hover:text-accent-blue-glow border border-accent-blue/20 hover:border-accent-blue/50 px-3 py-1.5 rounded bg-bg-elevated/80 backdrop-blur transition-all uppercase tracking-wider"
            >
              SKIP TO LOGIN ➔
            </button>
          </div>

          {/* Bottom Title & Pulsing Tap to Enter Prompt */}
          <div className="flex flex-col items-center text-center pb-6 sm:pb-8">
            <h1 className="metal-headline text-5xl sm:text-7xl md:text-8xl font-display tracking-wider uppercase mb-2">
              THE DEV HOUSE
            </h1>
            <p className="font-mono text-xs sm:text-sm text-text-secondary tracking-widest uppercase mb-6 sm:mb-8 bracket-framed">
              13 STAGES • 30 CODERS • 1 ULTIMATE SURVIVOR
            </p>

            {/* Pulsing Tap to Enter Prompt with subtle breathing loop */}
            <motion.div
              animate={{
                scale: [1, 1.04, 1],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-accent-blue/60 bg-bg-elevated/95 text-accent-blue-glow font-mono text-xs sm:text-sm tracking-widest uppercase glow-blue shadow-2xl backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
              <span className="font-bold">TAP ANYWHERE TO ENTER</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Full-Screen Black Overlay across last ~15% of timeline */}
        <motion.div
          style={{
            opacity: blackOverlayOpacity,
            willChange: willChangeActive ? 'opacity' : 'auto',
          }}
          className="absolute inset-0 bg-bg-primary pointer-events-none z-40 backdrop-blur-[2px]"
        />

        {/* Neuron Network Background behind resolved login form */}
        <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-45 opacity-80" />

        {/* Ambient Blue Radial Glow behind login card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 rounded-full bg-accent-blue/15 blur-[120px] pointer-events-none z-46" />

        {/* Resolved Login Form Container (Crossfades in as screen goes black) */}
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
                  <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-accent-blue" />
                    <span>AUTHENTICATION TERMINAL</span>
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
                className="w-full py-3 rounded-lg font-display text-base tracking-wider uppercase font-bold bg-accent-blue hover:bg-accent-blue-glow text-black transition-all glow-blue-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
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

            {/* Quick demo presets */}
            <div className="mt-6 pt-4 border-t border-accent-blue/15 text-center">
              <div className="text-[11px] font-mono text-text-secondary mb-2.5 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                <span>DEMO LOGIN (1-CLICK DIRECT ACCESS):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('TEAM_ALPHA')}
                  className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-text-primary">TEAM ALPHA</span>
                  <span className="text-[10px] text-text-secondary">Aryan Sharma (#1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('TEAM_BETA')}
                  className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-text-primary">TEAM BETA</span>
                  <span className="text-[10px] text-text-secondary">Anjishth Kumar (#2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('TEAM_GAMMA')}
                  className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-text-primary">TEAM GAMMA</span>
                  <span className="text-[10px] text-text-secondary">Dilraj Singh (#3)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('TEAM_DELTA')}
                  className="p-2 text-xs font-mono rounded bg-bg-primary border border-accent-blue/30 hover:border-accent-blue hover:bg-accent-blue/10 text-accent-blue-glow transition-all flex flex-col cursor-pointer"
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
  );
};

export default HeroEyeZoom;
