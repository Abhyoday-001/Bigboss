import React from 'react';
import { X, Trophy, Shield, AlertTriangle, Users, Clock, FileText } from 'lucide-react';
import { TeamRecord, TeamStatus } from '../../mocks/mockTeams';

interface TeamDetailModalProps {
  isOpen: boolean;
  team: TeamRecord | null;
  onClose: () => void;
  onUpdateStatus?: (teamId: string, newStatus: TeamStatus) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  isOpen,
  team,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !team) return null;

  const getStatusBadge = (status: TeamStatus) => {
    switch (status) {
      case 'CAPTAIN':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1.5"><Shield className="w-3 h-3" /> HOUSE CAPTAIN</span>;
      case 'IMMUNE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5"><Shield className="w-3 h-3" /> IMMUNE (SAFE)</span>;
      case 'NOMINATED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> NOMINATED (DANGER)</span>;
      case 'EVICTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-danger-red/20 text-danger-red border border-danger-red/40 flex items-center gap-1.5">❌ EVICTED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/40 flex items-center gap-1.5">⚡ ACTIVE IN HOUSE</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0d0f14] border border-accent-blue/40 rounded-2xl p-6 md:p-8 text-text-primary shadow-2xl my-8"
        role="dialog"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-secondary hover:text-text-primary p-1.5 rounded-lg bg-[#161a23] hover:bg-[#1f2430] border border-bg-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-bg-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-accent-blue font-bold tracking-wider px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30">
                {team.teamCode}
              </span>
              <span className="font-mono text-xs text-text-secondary">
                Rank #{team.rank}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              {team.name}
            </h2>
            <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
              <span>Leader: <strong className="text-text-primary">{team.leader}</strong></span>
              <span>·</span>
              <span>Registered: {team.registeredAt}</span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <div>{getStatusBadge(team.status)}</div>
            <div className="flex items-center gap-2 text-2xl font-bold font-mono text-accent-blue">
              <Trophy className="w-5 h-5 text-accent-blue" />
              <span>{team.score} PTS</span>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="py-4 border-b border-bg-border">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent-blue" />
            Squad Roster ({team.members.length} Members)
          </div>
          <div className="flex flex-wrap gap-2">
            {team.members.map((member, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs rounded-lg bg-[#161a23] border border-bg-border text-text-primary font-medium"
              >
                {member}
              </span>
            ))}
          </div>
        </div>

        {/* Round-by-Round Breakdown */}
        <div className="py-5 border-b border-bg-border">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
            Round-by-Round Performance
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#090b10] border border-bg-border rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-text-secondary">ROUND 1</div>
              <div className="text-xs text-text-muted">Task Decrypt</div>
              <div className="text-lg font-bold font-mono text-accent-blue mt-1">
                {team.roundScores.round1} pts
              </div>
            </div>

            <div className="bg-[#090b10] border border-bg-border rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-text-secondary">ROUND 2</div>
              <div className="text-xs text-text-muted">Captain/Secret</div>
              <div className="text-lg font-bold font-mono text-accent-blue mt-1">
                {team.roundScores.round2} pts
              </div>
            </div>

            <div className="bg-[#090b10] border border-bg-border rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-text-secondary">ROUND 3</div>
              <div className="text-xs text-text-muted">Immunity/Vote</div>
              <div className="text-lg font-bold font-mono text-text-muted mt-1">
                {team.roundScores.round3 > 0 ? `${team.roundScores.round3} pts` : '—'}
              </div>
            </div>

            <div className="bg-[#090b10] border border-bg-border rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-text-secondary">ROUND 4</div>
              <div className="text-xs text-text-muted">Finale Build</div>
              <div className="text-lg font-bold font-mono text-text-muted mt-1">
                {team.roundScores.round4 > 0 ? `${team.roundScores.round4} pts` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail / History */}
        <div className="pt-5">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-blue" />
              Score Adjustment Audit Trail
            </span>
            <span className="text-[11px] text-text-muted">{team.scoreHistory.length} logs recorded</span>
          </div>

          {team.scoreHistory.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#090b10] border border-bg-border text-center text-xs text-text-muted font-mono">
              No manual score adjustments recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {team.scoreHistory.map((audit) => (
                <div
                  key={audit.id}
                  className="p-3 rounded-lg bg-[#090b10] border border-bg-border flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                      <span className="text-accent-blue font-semibold">{audit.round}</span>
                      <span>·</span>
                      <span>{audit.timestamp}</span>
                      <span>·</span>
                      <span className="text-text-muted">by {audit.adjustedBy}</span>
                    </div>
                    <div className="text-text-primary mt-1 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-text-muted" />
                      {audit.reason}
                    </div>
                  </div>

                  <div className={`font-mono font-bold flex-shrink-0 ${
                    audit.delta >= 0 ? 'text-success-green' : 'text-danger-red'
                  }`}>
                    {audit.delta >= 0 ? `+${audit.delta}` : audit.delta} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Status Modifiers */}
        {onUpdateStatus && (
          <div className="mt-6 pt-4 border-t border-bg-border flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-text-secondary">Quick Status Override:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateStatus(team.id, 'ACTIVE')}
                className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                  team.status === 'ACTIVE' ? 'bg-accent-blue text-black border-accent-blue' : 'bg-[#161a23] text-text-secondary border-bg-border hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(team.id, 'NOMINATED')}
                className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                  team.status === 'NOMINATED' ? 'bg-amber-500 text-black border-amber-500' : 'bg-[#161a23] text-text-secondary border-bg-border hover:text-amber-400'
                }`}
              >
                Nominate
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(team.id, 'IMMUNE')}
                className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                  team.status === 'IMMUNE' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-[#161a23] text-text-secondary border-bg-border hover:text-emerald-400'
                }`}
              >
                Immune
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(team.id, 'EVICTED')}
                className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                  team.status === 'EVICTED' ? 'bg-danger-red text-white border-danger-red' : 'bg-[#161a23] text-text-secondary border-bg-border hover:text-danger-red'
                }`}
              >
                Evict
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
