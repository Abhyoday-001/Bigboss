import React, { useEffect, useState } from 'react';
import { useEventPhase } from '../hooks/useEventPhase';

export const PhaseTransitionOverlay: React.FC = () => {
  const { currentPhase, currentMetadata } = useEventPhase();
  const [showOverlay, setShowOverlay] = useState(false);
  const [prevPhase, setPrevPhase] = useState(currentPhase);

  useEffect(() => {
    if (currentPhase !== prevPhase) {
      setShowOverlay(true);
      setPrevPhase(currentPhase);
      const timer = setTimeout(() => setShowOverlay(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, prevPhase]);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-bg-secondary border border-accent-blue/30 p-8 rounded-xl text-center max-w-md w-full shadow-2xl shadow-accent-blue/20">
        <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-widest">
          {currentMetadata.roundTitle}
        </h2>
        <h3 className="text-xl text-accent-blue font-mono mb-4 uppercase">
          {currentMetadata.subPhaseTitle}
        </h3>
        <p className="text-text-secondary text-sm">
          {currentMetadata.description}
        </p>
      </div>
    </div>
  );
};
