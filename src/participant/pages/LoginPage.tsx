import React from 'react';
import { HeroEyeZoom } from '../components/HeroEyeZoom';

export const LoginPage: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050506] text-text-primary selection:bg-accent-blue/30 selection:text-accent-blue-glow">
      <HeroEyeZoom initialResolved={true} />
    </div>
  );
};

export default LoginPage;
