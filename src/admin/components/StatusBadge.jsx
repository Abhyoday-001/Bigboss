import React from 'react';

/**
 * StatusBadge Component
 * Pill-shaped color-coded status badges per DESIGN.md §6
 * (danger-red / success-green / muted-gray / accent-blue)
 */
export function StatusBadge({ status, text, className = '' }) {
  const normStatus = (status || '').toLowerCase();
  
  let colorStyles = 'bg-gray-800 text-gray-300 border-gray-700';

  if (normStatus === 'safe' || normStatus === 'active') {
    colorStyles = 'bg-[#2ED67B]/10 text-[#2ED67B] border-[#2ED67B]/30 shadow-[0_0_10px_rgba(46,214,123,0.15)]';
  } else if (normStatus === 'nominated' || normStatus === 'failed') {
    colorStyles = 'bg-[#FF3B4E]/10 text-[#FF3B4E] border-[#FF3B4E]/30 shadow-[0_0_10px_rgba(255,59,78,0.15)]';
  } else if (normStatus === 'immune' || normStatus === 'completed') {
    colorStyles = 'bg-[#1EA7FF]/10 text-[#1EA7FF] border-[#1EA7FF]/30 shadow-[0_0_10px_rgba(30,167,255,0.2)]';
  } else if (normStatus === 'evicted') {
    colorStyles = 'bg-red-950/40 text-gray-400 line-through border-red-900/40';
  }

  const label = text || status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${colorStyles} ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
