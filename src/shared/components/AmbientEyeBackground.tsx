import React, { useEffect, useState } from 'react';

export interface AmbientEyeBackgroundProps {
  className?: string;
  position?: 'bottom-right' | 'top-right' | 'center';
}

export const AmbientEyeBackground: React.FC<AmbientEyeBackgroundProps> = ({
  className = '',
  position = 'bottom-right',
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-[-10%] right-[-10%] sm:bottom-[-5%] sm:right-[-5%] w-[480px] sm:w-[650px] lg:w-[850px]',
    'top-right': 'top-[-10%] right-[-10%] w-[480px] sm:w-[650px] lg:w-[850px]',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] lg:w-[1000px]',
  }[position];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <div
        className={`absolute aspect-video ${positionClasses} opacity-[0.05] transition-opacity duration-1000 ${
          prefersReducedMotion ? '' : 'animate-[pulse_10s_ease-in-out_infinite]'
        } ${className}`}
        style={{
          maskImage: 'radial-gradient(ellipse 65% 55% at 50% 50%, black 35%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 50%, black 35%, transparent 95%)',
        }}
      >
        <img
          src="/eye-hero.png"
          alt=""
          className="w-full h-full object-cover filter contrast-125 brightness-110"
        />
      </div>

      {/* Very faint cyan ambient gradient highlight in corner */}
      <div
        className="absolute bottom-0 right-0 w-125 h-125 rounded-full pointer-events-none bg-accent-blue/2 blur-[120px]"
      />
    </div>
  );
};
