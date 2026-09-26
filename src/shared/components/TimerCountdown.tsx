import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export interface TimerCountdownProps {
  targetTimestamp: number; // Unix epoch ms
  serverOffsetMs?: number; // Clock skew correction if any
  onExpire?: () => void;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TimerCountdown: React.FC<TimerCountdownProps> = ({
  targetTimestamp,
  serverOffsetMs = 0,
  onExpire,
  className = '',
  showLabels = true,
  size = 'md',
}) => {
  const calculateRemaining = () => {
    const currentAdjustedTime = Date.now() + serverOffsetMs;
    return Math.max(0, targetTimestamp - currentAdjustedTime);
  };

  const [remainingMs, setRemainingMs] = useState<number>(calculateRemaining);

  useEffect(() => {
    // Initial compute
    setRemainingMs(calculateRemaining());

    // Update every 1000ms, computing delta from absolute timestamps to eliminate setInterval drift
    const interval = setInterval(() => {
      const ms = calculateRemaining();
      setRemainingMs(ms);
      if (ms <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, serverOffsetMs]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Urgency color shifts per DESIGN.md
  // > 10m: accent blue
  // <= 10m & > 3m: warning amber
  // <= 3m: danger red (pulsing)
  const isCritical = totalSeconds > 0 && totalSeconds <= 180; // <= 3 minutes
  const isWarning = totalSeconds > 180 && totalSeconds <= 600; // <= 10 minutes
  const isExpired = totalSeconds === 0;

  const colorClass = isExpired
    ? 'text-[#6E7278] border-[#6E7278]/30 bg-[#0d0f14]'
    : isCritical
    ? 'text-[#FF3B4E] border-[#FF3B4E]/60 bg-[#FF3B4E]/10 glow-red animate-pulse'
    : isWarning
    ? 'text-[#FFB300] border-[#FFB300]/50 bg-[#FFB300]/10'
    : 'text-[#1EA7FF] border-[#1EA7FF]/40 bg-[#1EA7FF]/10 glow-blue-sm';

  const pad = (n: number) => n.toString().padStart(2, '0');

  const sizeClasses = {
    sm: 'text-sm px-2.5 py-1 gap-1.5',
    md: 'text-lg px-4 py-2 gap-2.5',
    lg: 'text-3xl md:text-4xl px-6 py-3.5 gap-4 font-bold',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-mono-numbers rounded-lg border transition-all duration-300 ${colorClass} ${sizeClasses} ${className}`}
      title={isExpired ? 'Session Expired' : 'Synchronized Countdown'}
    >
      {isCritical ? (
        <AlertTriangle className={`${size === 'lg' ? 'w-7 h-7' : 'w-4 h-4'} text-danger-red animate-bounce`} />
      ) : (
        <Clock className={`${size === 'lg' ? 'w-7 h-7' : 'w-4 h-4'} opacity-80`} />
      )}

      <div className="flex items-baseline tracking-widest font-mono">
        {hours > 0 && (
          <>
            <span className="font-bold">{pad(hours)}</span>
            {showLabels && <span className="text-[0.6em] opacity-60 ml-0.5 mr-1 font-sans">h</span>}
            <span className="opacity-40 mx-0.5">:</span>
          </>
        )}
        <span className="font-bold">{pad(minutes)}</span>
        {showLabels && <span className="text-[0.6em] opacity-60 ml-0.5 mr-1 font-sans">m</span>}
        <span className="opacity-40 mx-0.5">:</span>
        <span className="font-bold">{pad(seconds)}</span>
        {showLabels && <span className="text-[0.6em] opacity-60 ml-0.5 font-sans">s</span>}
      </div>

      {isCritical && !isExpired && (
        <span className="text-[10px] font-sans uppercase tracking-wider bg-danger-red text-black font-bold px-1.5 py-0.5 rounded">
          CRITICAL
        </span>
      )}

      {isExpired && (
        <span className="text-[10px] font-sans uppercase tracking-wider bg-gray-700 text-white px-1.5 py-0.5 rounded">
          TIME UP
        </span>
      )}
    </div>
  );
};
