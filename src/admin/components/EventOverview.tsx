import React from 'react';
import { Users, UserCheck, UserX, AlertTriangle, ShieldCheck, Eye, ArrowRight } from 'lucide-react';
import { EventState } from '../../shared/types/event';
import { TimerDisplay } from '../../shared/components/TimerDisplay';

interface EventOverviewProps {
  eventState: EventState;
  onNavigateTab?: (tabName: string) => void;
}

export const EventOverview: React.FC<EventOverviewProps> = ({
  eventState,
  onNavigateTab,
}) => {
  const { teamCounts, timer, phaseLabel, roundName, roundDescription, status } = eventState;

  return (
    <div className="space-y-6">
      {/* Top Banner: Current Phase Status */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d121c] via-[#090c12] to-[#07080b] border border-accent-blue/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-mono font-bold tracking-widest bg-accent-blue/10 text-accent-blue border border-accent-blue/30 rounded-full">
                {phaseLabel}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full flex items-center gap-1.5 ${
                status === 'RUNNING' ? 'bg-success-green/10 text-success-green border border-success-green/30' :
                status === 'PAUSED' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' :
                status === 'COMPLETED' ? 'bg-danger-red/10 text-danger-red border border-danger-red/30' :
                'bg-zinc-800 text-zinc-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === 'RUNNING' ? 'bg-success-green animate-ping' :
                  status === 'PAUSED' ? 'bg-amber-400' :
                  status === 'COMPLETED' ? 'bg-danger-red' :
                  'bg-zinc-400'
                }`} />
                {status}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-text-primary">
              {roundName}
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
              {roundDescription}
            </p>
          </div>

          {/* Embedded Timer Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <TimerDisplay
              remainingSeconds={timer.remainingSeconds}
              totalSeconds={timer.durationSeconds}
              status={status}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Team Counts & Operational Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="bg-[#0d0f14] border border-bg-border rounded-xl p-5 hover:border-accent-blue/40 transition-colors">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Teams</span>
            <Users className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-3xl font-bold text-text-primary font-mono">{teamCounts.total}</div>
          <div className="text-xs text-text-muted mt-1">Registered & Checked-in</div>
        </div>

        {/* Active In House */}
        <div className="bg-[#0d0f14] border border-success-green/30 rounded-xl p-5 hover:border-success-green/50 transition-colors">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-success-green">Active In House</span>
            <UserCheck className="w-4 h-4 text-success-green" />
          </div>
          <div className="text-3xl font-bold text-success-green font-mono">{teamCounts.active}</div>
          <div className="text-xs text-text-muted mt-1">Competing in current round</div>
        </div>

        {/* Nominated / Danger */}
        <div className="bg-[#0d0f14] border border-amber-500/30 rounded-xl p-5 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Nominated</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">{teamCounts.nominated}</div>
          <div className="text-xs text-text-muted mt-1">In eviction danger zone</div>
        </div>

        {/* Eliminated */}
        <div className="bg-[#0d0f14] border border-danger-red/30 rounded-xl p-5 hover:border-danger-red/50 transition-colors">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-danger-red">Eliminated</span>
            <UserX className="w-4 h-4 text-danger-red" />
          </div>
          <div className="text-3xl font-bold text-danger-red font-mono">{teamCounts.eliminated}</div>
          <div className="text-xs text-text-muted mt-1">Evicted from the house</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateTab && onNavigateTab('teams')}
          className="group cursor-pointer bg-[#0d0f14] border border-bg-border hover:border-accent-blue/50 p-5 rounded-xl transition-all hover:bg-[#121620]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-accent-blue group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Team Management</h3>
          <p className="text-xs text-text-secondary mt-1">
            Filter active vs eliminated teams, inspect team histories, and monitor status.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab && onNavigateTab('scores')}
          className="group cursor-pointer bg-[#0d0f14] border border-bg-border hover:border-accent-blue/50 p-5 rounded-xl transition-all hover:bg-[#121620]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Score Management</h3>
          <p className="text-xs text-text-secondary mt-1">
            Manual score adjustments, bonus point allocation, and complete audit trail.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab && onNavigateTab('round-tools')}
          className="group cursor-pointer bg-[#0d0f14] border border-bg-border hover:border-accent-blue/50 p-5 rounded-xl transition-all hover:bg-[#121620]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Eye className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Round Specific Tools</h3>
          <p className="text-xs text-text-secondary mt-1">
            Captaincy management, secret missions, voting controls (Spoorthi's screens).
          </p>
        </div>
      </div>
    </div>
  );
};
