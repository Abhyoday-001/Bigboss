import React from 'react';
import { HeroEyeZoom } from '../components/HeroEyeZoom';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-bg-primary text-text-primary selection:bg-accent-blue/30 selection:text-accent-blue-glow">
      <HeroEyeZoom />
    </div>
  );
};
