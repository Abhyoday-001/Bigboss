import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EyeAnimationProps {
  mode?: 'intro' | 'login-zoom' | 'static';
  onComplete?: () => void;
  className?: string;
}

export const EyeAnimation: React.FC<EyeAnimationProps> = ({
  mode = 'intro',
  onComplete,
  className = '',
}) => {
  useEffect(() => {
    if (mode === 'static') return;

    const duration = mode === 'intro' ? 3200 : 1400;
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [mode, onComplete]);

  if (mode === 'static') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <EyeGraphic isPulsing={true} scale={1} />
      </div>
    );
  }

  const isIntro = mode === 'intro';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Subtle camera lens vignette & scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,black_100%)] z-10" />

        {/* Skip button for accessibility / quick dev testing */}
        {isIntro && (
          <button
            onClick={() => onComplete?.()}
            className="absolute bottom-8 right-8 z-30 font-mono text-xs text-text-secondary hover:text-accent-blue-glow border border-accent-blue/20 px-3 py-1.5 rounded bg-bg-elevated/80 backdrop-blur transition-all"
          >
            SKIP SEQUENCE [ESC]
          </button>
        )}

        {/* The Eye SVG Zoom Animation */}
        <motion.div
          className="relative z-20 flex items-center justify-center"
          initial={
            isIntro
              ? { scale: 0.25, opacity: 0 }
              : { scale: 0.8, opacity: 0.8 }
          }
          animate={
            isIntro
              ? {
                  scale: [0.25, 0.9, 1.05, 5.5],
                  opacity: [0, 1, 1, 0],
                }
              : {
                  scale: [0.8, 1.2, 4.5],
                  opacity: [0.8, 1, 0],
                }
          }
          transition={{
            duration: isIntro ? 3.2 : 1.3,
            times: isIntro ? [0, 0.45, 0.75, 1] : [0, 0.4, 1],
            ease: [0.25, 0.1, 0.25, 1], // cinematic cubic bezier
          }}
        >
          <EyeGraphic isPulsing={true} scale={1.2} />
        </motion.div>

        {/* Ambient iris flare during peak zoom */}
        <motion.div
          className="absolute inset-0 z-25 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={
            isIntro
              ? { opacity: [0, 0, 0.4, 0.9, 0] }
              : { opacity: [0, 0.5, 0] }
          }
          transition={{
            duration: isIntro ? 3.2 : 1.3,
            times: isIntro ? [0, 0.5, 0.7, 0.9, 1] : [0, 0.5, 1],
          }}
          style={{
            background: 'radial-gradient(circle, rgba(30,167,255,0.4) 0%, rgba(5,5,6,0) 70%)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export const EyeGraphic: React.FC<{ isPulsing?: boolean; scale?: number }> = ({
  isPulsing = false,
  scale = 1,
}) => {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${280 * scale}px`,
        height: `${280 * scale}px`,
      }}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-[0_0_35px_rgba(30,167,255,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Surveillance Ring */}
        <circle
          cx="200"
          cy="200"
          r="185"
          stroke="#1EA7FF"
          strokeWidth="2"
          strokeOpacity="0.4"
          strokeDasharray="6 8"
        />
        <circle
          cx="200"
          cy="200"
          r="165"
          stroke="#1EA7FF"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />

        {/* Diagonal Corner Reticle Crosshairs */}
        <line x1="50" y1="50" x2="110" y2="110" stroke="#1EA7FF" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="350" y1="50" x2="290" y2="110" stroke="#1EA7FF" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="50" y1="350" x2="110" y2="290" stroke="#1EA7FF" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="350" y1="350" x2="290" y2="290" stroke="#1EA7FF" strokeWidth="1" strokeOpacity="0.5" />

        {/* Eyelid Contour (Outer Eye Hull) */}
        <path
          d="M 40 200 C 120 70, 280 70, 360 200 C 280 330, 120 330, 40 200 Z"
          fill="#0d0f14"
          stroke="#1EA7FF"
          strokeWidth="4"
        />
        <path
          d="M 70 200 C 135 105, 265 105, 330 200 C 265 295, 135 295, 70 200 Z"
          fill="#050506"
          stroke="#4FC3FF"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Iris Outer Ring */}
        <circle
          cx="200"
          cy="200"
          r="80"
          fill="#08101a"
          stroke="#1EA7FF"
          strokeWidth="3.5"
        />

        {/* Iris Circuit / Shutter Blades Pattern */}
        <g stroke="#4FC3FF" strokeWidth="1.5" strokeOpacity="0.55">
          <line x1="200" y1="120" x2="200" y2="150" />
          <line x1="200" y1="250" x2="200" y2="280" />
          <line x1="120" y1="200" x2="150" y2="200" />
          <line x1="250" y1="200" x2="280" y2="200" />
          <line x1="143" y1="143" x2="165" y2="165" />
          <line x1="257" y1="143" x2="235" y2="165" />
          <line x1="143" y1="257" x2="165" y2="235" />
          <line x1="257" y1="257" x2="235" y2="235" />
        </g>

        {/* Mechanical Aperture Rings */}
        <circle
          cx="200"
          cy="200"
          r="52"
          fill="#050b14"
          stroke="#4FC3FF"
          strokeWidth="2.5"
        />

        {/* Pupil Core (Glowing Blue Laser) */}
        <circle
          cx="200"
          cy="200"
          r="30"
          fill="#1EA7FF"
          className={isPulsing ? 'animate-pulse' : ''}
        />
        <circle
          cx="200"
          cy="200"
          r="16"
          fill="#4FC3FF"
        />
        <circle
          cx="200"
          cy="200"
          r="8"
          fill="#ffffff"
        />

        {/* Lens Glare Reflection */}
        <ellipse
          cx="186"
          cy="186"
          rx="10"
          ry="6"
          transform="rotate(-40 186 186)"
          fill="#ffffff"
          fillOpacity="0.85"
        />
      </svg>
    </div>
  );
};
