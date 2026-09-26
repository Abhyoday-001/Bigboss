import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Crown, ShieldAlert, ShieldCheck, Eye, Edit3, Check, X } from 'lucide-react';
import { Team } from '../state-machine/types';

export interface LiveLeaderboardProps {
  teams: Team[];
  currentTeamId?: string;
  isAdmin?: boolean;
  onUpdateScore?: (teamId: string, newScore: number) => void;
  className?: string;
  compact?: boolean;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  teams,
  currentTeamId,
  isAdmin = false,
  onUpdateScore,
  className = '',
  compact = false,
}) => {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<string>('');

  // Sort teams primarily by score descending, then previous rank
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const startEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditScoreValue(team.score.toString());
  };

  const handleSaveScore = (teamId: string) => {
    const parsed = parseInt(editScoreValue, 10);
    if (!isNaN(parsed) && onUpdateScore) {
      onUpdateScore(teamId, parsed);
    }
    setEditingTeamId(null);
  };

  return (
    <div className={`panel-card overflow-hidden ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-accent-blue/20 bg-bg-primary/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse glow-blue-sm" />
          <h3 className="font-display text-lg tracking-wider text-text-primary uppercase">
            Surveillance Leaderboard
          </h3>
          <span className="text-xs font-mono text-text-secondary px-2 py-0.5 rounded bg-bg-elevated-hover border border-accent-blue/20">
            {teams.length} HOUSES
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
          <Eye className="w-3.5 h-3.5 text-accent-blue animate-pulse" />
          <span className="hidden sm:inline">LIVE SYNC (3S)</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-accent-blue/10 text-[11px] font-mono uppercase tracking-wider text-text-secondary bg-bg-elevated/80">
              <th className="py-2.5 px-4 w-16 text-center">Rank</th>
              <th className="py-2.5 px-2 w-12 text-center">Delta</th>
              <th className="py-2.5 px-4">House / Team</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Points</th>
              {isAdmin && <th className="py-2.5 px-4 text-right w-24">Control</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-blue/10 text-sm">
            {sortedTeams.map((team, index) => {
              const currentRank = index + 1;
              const isCurrentTeam = currentTeamId === team.id;
              const rankDelta = team.previousRank ? team.previousRank - currentRank : 0;

              return (
                <tr
                  key={team.id}
                  className={`transition-colors duration-150 ${
                    isCurrentTeam
                      ? 'bg-accent-blue/10 border-l-4 border-l-accent-blue glow-blue-sm'
                      : 'hover:bg-bg-elevated-hover/80'
                  } ${team.isEliminated ? 'opacity-40 grayscale' : ''}`}
                >
                  {/* Rank Column with Display Font */}
                  <td className="py-3 px-4 text-center font-display text-xl text-text-primary">
                    {currentRank === 1 ? (
                      <span className="text-accent-blue-glow drop-shadow-[0_0_8px_rgba(79,195,255,0.6)]">#1</span>
                    ) : (
                      `#${currentRank}`
                    )}
                  </td>

                  {/* Rank Movement Indicator */}
                  <td className="py-3 px-2 text-center">
                    {rankDelta > 0 ? (
                      <span className="inline-flex items-center text-success-green text-xs font-mono font-bold" title={`Gained ${rankDelta} position`}>
                        <ArrowUp className="w-3.5 h-3.5 stroke-3" />
                        {!compact && rankDelta}
                      </span>
                    ) : rankDelta < 0 ? (
                      <span className="inline-flex items-center text-danger-red text-xs font-mono font-bold" title={`Dropped ${Math.abs(rankDelta)} position`}>
                        <ArrowDown className="w-3.5 h-3.5 stroke-3" />
                        {!compact && Math.abs(rankDelta)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[#6E7278] text-xs" title="No change">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Team Name & Meta */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <div className="font-semibold text-text-primary flex items-center gap-2">
                          <span className={isCurrentTeam ? 'text-accent-blue-glow font-bold' : ''}>
                            {team.teamName}
                          </span>
                          {isCurrentTeam && (
                            <span className="text-[10px] font-mono uppercase bg-accent-blue text-black px-1.5 py-0.2 rounded font-bold">
                              YOUR TEAM
                            </span>
                          )}
                        </div>
                        {!compact && team.tableNumber && (
                          <div className="text-[11px] font-mono text-text-secondary">
                            Pod: {team.tableNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                      {team.isCaptain && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-warning-amber bg-warning-amber/15 border border-warning-amber/40 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3" /> Captain
                        </span>
                      )}
                      {team.isImmune && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-success-green bg-success-green/15 border border-success-green/40 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Immune
                        </span>
                      )}
                      {team.isNominated && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-danger-red bg-danger-red/15 border border-danger-red/40 px-2 py-0.5 rounded-full glow-red">
                          <ShieldAlert className="w-3 h-3" /> Nominated
                        </span>
                      )}
                      {team.isEliminated && (
                        <span className="text-[11px] font-mono uppercase font-bold text-[#6E7278] bg-gray-900 border border-gray-700 px-2 py-0.5 rounded-full">
                          Evicted
                        </span>
                      )}
                      {!team.isCaptain && !team.isNominated && !team.isEliminated && !team.isImmune && (
                        <span className="text-[11px] font-mono uppercase text-text-secondary/70">
                          Active
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-4 text-right">
                    {editingTeamId === team.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={editScoreValue}
                          onChange={(e) => setEditScoreValue(e.target.value)}
                          className="w-20 px-2 py-1 text-right font-mono text-sm bg-black border border-accent-blue rounded text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveScore(team.id)}
                          className="p-1 rounded bg-success-green/20 text-success-green hover:bg-success-green/40"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTeamId(null)}
                          className="p-1 rounded bg-danger-red/20 text-danger-red hover:bg-danger-red/40"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="font-mono-numbers font-bold text-lg text-text-primary tracking-tight">
                        {team.score.toLocaleString()}
                        <span className="text-[10px] font-normal text-text-secondary ml-1 font-sans">pts</span>
                      </div>
                    )}
                  </td>

                  {/* Admin inline controls */}
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => startEdit(team)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-accent-blue hover:text-accent-blue-glow p-1.5 rounded hover:bg-accent-blue/10 transition-colors"
                        title="Edit score directly"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
