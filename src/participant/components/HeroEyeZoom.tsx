import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { NeuralNetworkOverlay } from './NeuralNetworkOverlay';
import { NeuronNetworkBackground } from './NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import eyeHeroImg from '../../assets/eye-hero.png';
import { AlertCircle, ArrowRight, ShieldCheck, Key, Lock, Users } from 'lucide-react';

export interface HeroEyeZoomProps {
  onTap?: () => void;
  onLoginSuccess?: () => void;
  initialResolved?: boolean;
}

const SESSION_STORAGE_KEY = 'the_dev_house_intro_played';

export const HeroEyeZoom: React.FC<HeroEyeZoomProps> = ({
  onTap,
  onLoginSuccess,
  initialResolved = false,
}) => {
  const navigate = useNavigate();
  const { loginTeam, isAuthenticated } = useAuth();

  // Track prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Animation & session state
  const isAnimatingRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasEntered, setHasEntered] = useState(initialResolved);
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

  // Preload eye hero asset to prevent decode-stall
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
  const progress = useMotionValue(initialResolved ? 1 : 0);

  // Check sessionStorage on mount: if already played this session, skip straight to login
  useEffect(() => {
    if (initialResolved) {
      progress.set(1);
      setHasEntered(true);
      return;
    }
    try {
      const alreadyPlayed = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
      if (alreadyPlayed) {
        progress.set(1);
        setHasEntered(true);
      }
    } catch {
      // Ignore sessionStorage exceptions
    }
  }, [initialResolved, progress]);

  // Derived transforms strictly driven by the single progress value
  const scale = useTransform(progress, [0, 0.4, 0.72, 0.9, 1], [1, 3.6, 14, 32, 40]);
  const brandingOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const brandingY = useTransform(progress, [0, 0.12], [0, -28]);
  const blackOverlayOpacity = useTransform(progress, [0.85, 0.98, 1], [0, 0.96, 1]);
  const loginFormOpacity = useTransform(progress, [0.94, 1], [0, 1]);
  const loginFormScale = useTransform(progress, [0.94, 1], [0.96, 1]);
  const loginPointerEvents = useTransform(progress, (p) => (p >= 0.95 ? 'auto' : 'none'));

  // Trigger the single timed animation sequence on tap/click
  const handleTap = () => {
    if (isAnimatingRef.current || hasEntered) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setWillChangeActive(true);
    onTap?.();

    // 5.0-second fixed duration timeline driven by single progress value
    animate(progress, 1, {
      duration: 5.0,
      ease: [0.35, 0.0, 0.25, 1.0],
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

  // Reset sequence to return to eye
  const handleReturnToEye = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage restrictions
    }
    window.location.href = '/';
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

  // Reusable Single Login Card Component
  const renderLoginCard = () => (
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
              The Dev House
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

      {/* 1-Click Demo Login Presets */}
      <div className="mt-5 pt-4 border-t border-accent-blue/15 text-center">
        <div className="text-[11px] font-mono text-text-secondary mb-2 flex items-center justify-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-accent-blue" />
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
        <div className="mt-2 text-[10px] font-mono text-text-secondary">
          Passcode: <code className="text-accent-blue">devhouse</code> (or any text)
        </div>
      </div>

      <div className="mt-4 text-center">
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

  // When resolved (after zoom completes, via same-session revisit, or prefers-reduced-motion):
  if (prefersReducedMotion || hasEntered) {
    return (
      <div className="relative w-full h-screen bg-[#050506] text-text-primary flex flex-col justify-center items-center px-4 overflow-hidden selection:bg-accent-blue/30 selection:text-accent-blue-glow">
        {/* Full-Screen Distributed Animated Neuron Network */}
        <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-0 opacity-80" />

        {/* Persistent Ambient Eye Background in bottom-right corner */}
        <AmbientEyeBackground position="bottom-right" />

        {/* Ambient Blue Radial Glow behind login card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 rounded-full bg-accent-blue/15 blur-[120px] pointer-events-none z-0" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md flex items-center justify-center"
        >
          {renderLoginCard()}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      onClick={handleTap}
      className={`relative w-full h-screen overflow-hidden bg-[#050506] select-none flex items-center justify-center ${
        hasEntered ? '' : 'cursor-pointer'
      }`}
    >
      {/* Persistent Neuron Network Background on Landing & Login */}
      <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-0 opacity-75" />

      {/* Eye Pop-In Container: Opacity 0 -> 1, Scale 0.9 -> 1 on mount in ~0.4s */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden"
      >
        {/* Zooming Eye Image with hardware acceleration */}
        <motion.div
          style={{
            scale,
            transformOrigin: '50.98% 46.88%',
            willChange: willChangeActive ? 'transform, opacity' : 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className="relative w-full max-w-240 aspect-video flex items-center justify-center shrink-0"
        >
          <div className="w-full h-full relative">
            <img
              src={eyeHeroImg}
              alt="The Dev House Surveillance Eye"
              className="w-full h-full object-cover pointer-events-none"
              style={{ transform: 'translateZ(0)' }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 51% 47%, transparent 40%, #050506 95%)',
              }}
            />

            <motion.div
              style={{
                left: 'calc(50.98% - 56px)',
                top: 'calc(46.88% - 56px)',
                opacity: brandingOpacity as any,
              }}
              className="absolute pointer-events-none w-28 h-28 rounded-full bg-accent-blue/30 blur-xl animate-pulse"
            />
          </div>
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
              className="pointer-events-auto font-mono text-[11px] text-text-secondary hover:text-accent-blue-glow border border-accent-blue/20 hover:border-accent-blue/50 px-3 py-1.5 rounded bg-bg-elevated/80 backdrop-blur transition-all uppercase tracking-wider cursor-pointer"
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
          className="absolute inset-0 bg-[#050506] pointer-events-none z-40"
        />

        {/* Neuron Network Background behind resolved login form */}
        <NeuronNetworkBackground className="fixed inset-0 pointer-events-none z-45 opacity-80" />

        {/* Ambient Blue Radial Glow behind login card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 rounded-full bg-accent-blue/15 blur-[100px] pointer-events-none z-46" />

        {/* Resolved Login Form Container (Crossfades in as screen goes black) */}
        <motion.div
          style={{
            opacity: loginFormOpacity,
            scale: loginFormScale,
            pointerEvents: loginPointerEvents,
          }}
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
        >
          {renderLoginCard()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroEyeZoom;
