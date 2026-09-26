import React from 'react';
import { Clock, Pause, AlertCircle } from 'lucide-react';
import { RoundStatus } from '../types/event';

interface TimerDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  status: RoundStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  totalSeconds,
  status,
  size = 'md',
}) => {
  const formatTime = (secs: number) => {
    const clamped = Math.max(0, secs);
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLow = remainingSeconds <= 300 && remainingSeconds > 0;
  const isExpired = remainingSeconds <= 0;
  const percentage = Math.min(100, Math.max(0, (remainingSeconds / (totalSeconds || 1)) * 100));

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-4xl md:text-5xl',
    lg: 'text-6xl md:text-7xl font-display',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#090b10] border border-bg-border relative overflow-hidden">
      {/* Background glow when low */}
      {isLow && (
        <div className="absolute inset-0 bg-danger-red/10 animate-pulse pointer-events-none" />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-2 text-xs font-mono tracking-wider text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-accent-blue" />
          <span>OFFICIAL SERVER CLOCK</span>
        </div>
        <div className="flex items-center gap-1.5">
          {status === 'RUNNING' && (
            <span className="flex items-center gap-1 text-success-green">
              <span className="w-2 h-2 rounded-full bg-success-green animate-ping" />
              RUNNING
            </span>
          )}
          {status === 'PAUSED' && (
            <span className="flex items-center gap-1 text-amber-400">
              <Pause className="w-3 h-3" />
              PAUSED
            </span>
          )}
          {status === 'COMPLETED' && (
            <span className="flex items-center gap-1 text-danger-red">
              <AlertCircle className="w-3 h-3" />
              ROUND TIME UP
            </span>
          )}
          {status === 'IDLE' && (
            <span className="text-text-muted">STANDBY</span>
          )}
        </div>
      </div>

      {/* Digits Display */}
      <div className={`font-mono font-bold tracking-tight my-1 ${textSizes[size]} ${
        isExpired ? 'text-danger-red animate-pulse' :
        isLow ? 'text-danger-red' :
        'text-text-primary'
      }`}>
        {formatTime(remainingSeconds)}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#161a23] h-1.5 rounded-full mt-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isLow ? 'bg-danger-red shadow-glow-red' : 'bg-accent-blue shadow-glow-blue'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
