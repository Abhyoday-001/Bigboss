import React from 'react';

/**
 * SurveillanceEye Motif Component
 * Matches the glowing blue mechanical camera eye from the event poster
 * per DESIGN.md §4.
 */
export function SurveillanceEye({ size = 'md', glowing = true, isAlert = false, className = '' }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const primaryColor = isAlert ? '#FF3B4E' : '#1EA7FF';
  const glowColor = isAlert ? 'rgba(255, 59, 78, 0.5)' : 'rgba(79, 195, 255, 0.5)';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{
          filter: glowing ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
        }}
      >
        {/* Outer mechanical eye aperture ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.5"
          strokeDasharray="6 3"
          className="opacity-70"
        />

        {/* Inner camera bezel */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="#050506"
          stroke={primaryColor}
          strokeWidth="2"
        />

        {/* Shutter lines */}
        <line x1="14" y1="50" x2="86" y2="50" stroke={primaryColor} strokeWidth="1" strokeOpacity="0.4" />
        <line x1="50" y1="14" x2="50" y2="86" stroke={primaryColor} strokeWidth="1" strokeOpacity="0.4" />

        {/* Glowing Iris */}
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke={primaryColor}
          strokeWidth="4"
          className="animate-pulse"
        />

        {/* Inner pupil lens */}
        <circle
          cx="50"
          cy="50"
          r="12"
          fill={primaryColor}
          className="transition-all duration-300"
        />

        {/* Central camera aperture sensor dot */}
        <circle
          cx="50"
          cy="50"
          r="4"
          fill="#FFFFFF"
        />

        {/* Specular glare reflection */}
        <ellipse
          cx="45"
          cy="44"
          rx="5"
          ry="3"
          fill="#FFFFFF"
          opacity="0.75"
          transform="rotate(-30 45 44)"
        />
      </svg>
    </div>
  );
}

export default SurveillanceEye;
