import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { NeuralNetworkOverlay } from './NeuralNetworkOverlay';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { NeuronNetworkBackground } from './NeuronNetworkBackground';
import eyeHeroImg from '../../assets/eye-hero.png';
import { AlertCircle, ArrowRight, ShieldCheck, Key, Lock, Users } from 'lucide-react';

export interface HeroEyeZoomProps {
  onTap?: () => void;
  onLoginSuccess?: () => void;
  initialResolved?: boolean;
}

const SESSION_STORAGE_KEY = 'the_dev_house_intro_played';

type Phase = 'idle' | 'animating' | 'login';

export const HeroEyeZoom: React.FC<HeroEyeZoomProps> = ({
  onTap,
  onLoginSuccess,
  initialResolved = false,
}) => {
  const navigate = useNavigate();
  const { loginTeam, loginAdmin, isAuthenticated } = useAuth();

  // Synchronous session check — zero delay on revisit
  const isInitiallyEntered = (() => {
    if (initialResolved) return true;
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  })();

  // Phase drives which canvas is active — only ONE canvas runs per phase
  const [phase, setPhase] = useState<Phase>(isInitiallyEntered ? 'login' : 'idle');
  const isAnimatingRef = useRef(false);
  // showLoginBg pre-mounts the login canvas while hidden behind the black overlay
  // so it's already warm/rendering when animation ends — eliminates cold-start delay
  const loginBgMountedRef = useRef(isInitiallyEntered);
  const [showLoginBg, setShowLoginBg] = useState(isInitiallyEntered);

  // Form State — pre-filled with demo credentials so user never has to type
  const [teamId, setTeamId] = useState('team-01');
  const [passcode, setPasscode] = useState('devhouse');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preload eye image to prevent decode stall
  useEffect(() => {
    const img = new Image();
    img.src = eyeHeroImg;
    if ('decode' in img) img.decode().catch(() => {});
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Single progress MotionValue — drives all visual transforms
  const progress = useMotionValue(isInitiallyEntered ? 1 : 0);
  // Separate overlay for the "Return to Eye" transition — covers the screen while state resets
  const returnBlackOpacity = useMotionValue(0);
  const [isReturning, setIsReturning] = useState(false);

  // All visual states are pure derived transforms — no React state involved
  const eyeScale     = useTransform(progress, [0, 0.45, 0.78, 1], [1, 3.8, 16, 40]);
  const brandOpacity = useTransform(progress, [0, 0.18], [1, 0]);
  const brandY       = useTransform(progress, [0, 0.18], [0, -30]);
  const blackOpacity = useTransform(progress, [0.60, 0.88, 1], [0, 0.97, 1]);
  const loginOpacity = useTransform(progress, [0.65, 0.92, 1], [0, 1, 1]);
  const loginScale   = useTransform(progress, [0.65, 0.92, 1], [0.96, 1, 1]);
  const loginEvents  = useTransform(progress, (p) => (p >= 0.80 ? 'auto' : 'none'));
  const eyeEvents    = useTransform(progress, (p) => (p > 0 ? 'none' : 'auto'));

  // Pre-mount login canvas when black overlay reaches ~55% opacity (p=0.55)
  // Canvas initializes hidden behind solid black — eliminates 1s cold-start flash
  useEffect(() => {
    const unsub = progress.on('change', (p) => {
      if (p >= 0.55 && !loginBgMountedRef.current) {
        loginBgMountedRef.current = true;
        setShowLoginBg(true);
      }
    });
    return unsub;
  }, [progress]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (isAnimatingRef.current || phase !== 'idle') return;

    isAnimatingRef.current = true;
    // Kill idle neuron background BEFORE animation starts — frees GPU budget for smooth zoom
    setPhase('animating');
    onTap?.();

    animate(progress, 1, {
      duration: 3.5,
      ease: [0.25, 0.1, 0.25, 1.0],
      onComplete: () => {
        isAnimatingRef.current = false;
        // Mount login background AFTER animation ends — no canvas competition
        setPhase('login');
        try { sessionStorage.setItem(SESSION_STORAGE_KEY, 'true'); } catch { /* ignore */ }
      },
    });
  }, [progress, phase, onTap]);

  const handleSkipToLogin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Pre-mount login bg immediately before jumping to login
    loginBgMountedRef.current = true;
    setShowLoginBg(true);
    progress.set(1);
    isAnimatingRef.current = false;
    setPhase('login');
    try { sessionStorage.setItem(SESSION_STORAGE_KEY, 'true'); } catch { /* ignore */ }
  }, [progress]);

  const handleReturnToEye = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* ignore */ }
    if (isReturning) return;
    setIsReturning(true);
    // Step 1: instantly cover screen with black (0.2s)
    animate(returnBlackOpacity, 1, {
      duration: 0.2,
      ease: 'easeOut',
      onComplete: () => {
        // Step 2: reset all state while hidden — zero glitch visible to user
        loginBgMountedRef.current = false;
        setShowLoginBg(false);
        setPhase('idle');
        progress.set(0);
        isAnimatingRef.current = false;
        // Step 3: fade black out to reveal the eye (0.35s)
        animate(returnBlackOpacity, 0, {
          duration: 0.35,
          ease: 'easeIn',
          onComplete: () => setIsReturning(false),
        });
      },
    });
  }, [progress, returnBlackOpacity, isReturning]);

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

  // ─── Login Card ──────────────────────────────────────────────────────────
  const loginCard = (
    <div className="w-full max-w-md panel-card p-6 sm:p-8 border border-accent-blue/40 glow-blue shadow-2xl bg-bg-elevated/95 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-5 border-b border-accent-blue/20">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full border border-accent-blue/40 overflow-hidden bg-bg-primary flex items-center justify-center glow-blue-sm">
            <img src={eyeHeroImg} alt="Eye" className="w-full h-full object-cover scale-150" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-accent-blue" />
              <span>SECURITY TERMINAL</span>
            </div>
            <div className="font-display text-xl uppercase tracking-wider text-text-primary">
              Tech Boss
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-primary border border-accent-blue/20 text-[10px] font-mono text-text-secondary">
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
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="e.g. TEAM_ALPHA or team-01"
              className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
            Terminal Passcode
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow font-mono"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-display text-base tracking-wider uppercase font-bold bg-accent-blue hover:bg-accent-blue-glow text-black transition-all glow-blue-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer shadow-lg"
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

      {/* Demo Credentials (1-Click Login & Auto-Fill) */}
      <div className="mt-5 pt-4 border-t border-accent-blue/20">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono text-accent-blue flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Key className="w-3.5 h-3.5" />
            <span>DEMO CREDENTIALS (CLICK TO ENTER):</span>
          </span>
          <span className="text-[10px] font-mono text-text-secondary/70">No typing required</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-left">
          <button
            type="button"
            onClick={() => handleQuickLogin('team-01')}
            className="p-2 rounded-lg bg-bg-primary/90 border border-accent-blue/30 hover:border-accent-blue text-accent-blue-glow hover:bg-accent-blue/10 transition-all font-mono text-xs flex flex-col cursor-pointer"
          >
            <span className="font-bold text-text-primary text-[12px]">CyberNexus (#1)</span>
            <span className="text-[10px] text-text-secondary">Captain • team-01 / devhouse</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('team-02')}
            className="p-2 rounded-lg bg-bg-primary/90 border border-accent-blue/30 hover:border-accent-blue text-accent-blue-glow hover:bg-accent-blue/10 transition-all font-mono text-xs flex flex-col cursor-pointer"
          >
            <span className="font-bold text-text-primary text-[12px]">NullPointers (#2)</span>
            <span className="text-[10px] text-text-secondary">Finalist • team-02 / devhouse</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('team-05')}
            className="p-2 rounded-lg bg-bg-primary/90 border border-accent-blue/30 hover:border-accent-blue text-accent-blue-glow hover:bg-accent-blue/10 transition-all font-mono text-xs flex flex-col cursor-pointer"
          >
            <span className="font-bold text-text-primary text-[12px]">ZeroDay Protocol (#5)</span>
            <span className="text-[10px] text-text-secondary">Mid-Rank • team-05 / devhouse</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('team-09')}
            className="p-2 rounded-lg bg-bg-primary/90 border border-accent-blue/30 hover:border-accent-blue text-accent-blue-glow hover:bg-accent-blue/10 transition-all font-mono text-xs flex flex-col cursor-pointer"
          >
            <span className="font-bold text-text-primary text-[12px]">SyntaxErrors (#9)</span>
            <span className="text-[10px] text-text-secondary">Nominated • team-09 / devhouse</span>
          </button>
        </div>

        {/* Control Room Admin Shortcut */}
        <div className="mt-2 flex items-center justify-between p-2 rounded bg-accent-blue/10 border border-accent-blue/30">
          <div className="text-[10px] font-mono">
            <span className="text-accent-blue font-bold">CONTROL ROOM ADMIN:</span>{' '}
            <span className="text-text-secondary">admin / admin123</span>
          </div>
          <button
            type="button"
            onClick={() => {
              loginAdmin();
              navigate('/admin');
            }}
            className="px-2.5 py-1 rounded bg-accent-blue hover:bg-accent-blue-glow text-black font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
          >
            Enter Admin ➔
          </button>
        </div>
      </div>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={handleReturnToEye}
          className="text-xs font-mono text-text-secondary hover:text-accent-blue-glow transition-colors cursor-pointer"
        >
          ← Return to Surveillance Eye
        </button>
      </div>
    </div>
  );

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050506] select-none flex items-center justify-center">

      {/* ── IDLE PHASE: Eye neuron ambient — only renders when not animating or returning ── */}
      {phase === 'idle' && !isReturning && (
        <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-0 opacity-75" />
      )}

      {/* ── Eye & Zoom layer ── */}
      <motion.div
        style={{ pointerEvents: eyeEvents as any }}
        onClick={handleTap}
        className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        {/* Zooming eye — GPU composited, no layout, no paint */}
        <motion.div
          style={{
            scale: eyeScale,
            transformOrigin: '50.98% 46.88%',
            willChange: phase === 'animating' ? 'transform' : 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className="relative w-full max-w-240 aspect-video flex items-center justify-center shrink-0"
        >
          <div className="w-full h-full relative">
            <img
              src={eyeHeroImg}
              alt="Tech Boss Surveillance Eye"
              className="w-full h-full object-cover pointer-events-none"
              style={{ transform: 'translateZ(0)' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at 51% 47%, transparent 40%, #050506 95%)',
              }}
            />
            <motion.div
              style={{
                left: 'calc(50.98% - 56px)',
                top: 'calc(46.88% - 56px)',
                opacity: brandOpacity as any,
              }}
              className="absolute pointer-events-none w-28 h-28 rounded-full bg-accent-blue/30 blur-xl animate-pulse"
            />
          </div>
        </motion.div>

        {/* ANIMATING PHASE: Neural particle system — only renders during zoom */}
        {phase === 'animating' && (
          <NeuralNetworkOverlay
            progress={progress}
            pupilCenter={{ xPercent: 50.98, yPercent: 46.88 }}
          />
        )}

        {/* Landing branding + tap prompt */}
        <motion.div
          style={{ opacity: brandOpacity, y: brandY }}
          className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between items-center p-6 sm:p-10"
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-blue/30 bg-bg-elevated/80 backdrop-blur text-xs font-mono text-accent-blue tracking-widest uppercase glow-blue-sm">
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
              <span>COGNITO CLUB • JAIN FET</span>
            </div>
            <button
              type="button"
              onClick={handleSkipToLogin}
              className="pointer-events-auto font-mono text-[11px] text-text-secondary hover:text-accent-blue-glow border border-accent-blue/20 hover:border-accent-blue/50 px-3 py-1.5 rounded bg-bg-elevated/80 backdrop-blur transition-all uppercase tracking-wider cursor-pointer"
            >
              SKIP TO LOGIN ➔
            </button>
          </div>

          <div className="flex flex-col items-center text-center pb-6 sm:pb-8">
            <h1 className="metal-headline text-5xl sm:text-7xl md:text-8xl font-display tracking-wider uppercase mb-2">
              TECH BOSS
            </h1>
            <p className="font-mono text-xs sm:text-sm text-text-secondary tracking-widest uppercase mb-6 sm:mb-8 bracket-framed">
              13 STAGES • 30 CODERS • 1 ULTIMATE SURVIVOR
            </p>
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-accent-blue/60 bg-bg-elevated/95 text-accent-blue-glow font-mono text-xs sm:text-sm tracking-widest uppercase glow-blue shadow-2xl backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
              <span className="font-bold">TAP ANYWHERE TO ENTER</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Black fade overlay — motion value, no re-render ── */}
      <motion.div
        style={{ opacity: blackOpacity, willChange: phase === 'animating' ? 'opacity' : 'auto' }}
        className="absolute inset-0 bg-[#050506] pointer-events-none z-[40]"
      />

      {/* ── LOGIN BACKGROUND: mounts at p>=0.55, hidden behind black overlay while warming up ── */}
      {/* Rendering early (hidden) means canvas is already running when animation ends            */}
      {showLoginBg && (
        <>
          {/* Neuron canvas — reduced node count (28) to cut GPU load during login phase */}
          <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-[41] opacity-80" nodeCount={28} />

          {/* Ambient eye — same component as the dashboard bottom-right eye */}
          {/* AmbientEyeBackground already includes its own corner glow, no extra blur needed */}
          <div className="z-[42] pointer-events-none">
            <AmbientEyeBackground position="bottom-right" />
          </div>
        </>
      )}

      {/* ── Login card — motion value driven, no remount ── */}
      <motion.div
        style={{
          opacity: loginOpacity,
          scale: loginScale,
          pointerEvents: loginEvents as any,
        }}
        className="absolute inset-0 z-[50] flex items-center justify-center p-4"
      >
        {loginCard}
      </motion.div>

      {/* ── Return-to-eye black cover — top of stack, hides all state swaps ── */}
      <motion.div
        style={{ opacity: returnBlackOpacity }}
        className="absolute inset-0 bg-[#050506] pointer-events-none z-[99]"
      />
    </div>
  );
};

export default HeroEyeZoom;
