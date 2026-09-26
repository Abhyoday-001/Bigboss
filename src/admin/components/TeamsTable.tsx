import React, { useState } from 'react';
import { Search, Plus, Trophy, Shield, AlertTriangle, Users, Eye } from 'lucide-react';
import { TeamRecord, TeamStatus } from '../../mocks/mockTeams';

interface TeamsTableProps {
  teams: TeamRecord[];
  onSelectTeam: (team: TeamRecord) => void;
  onAddTeam?: (newTeam: Partial<TeamRecord>) => void;
}

export const TeamsTable: React.FC<TeamsTableProps> = ({
  teams,
  onSelectTeam,
  onAddTeam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE_ONLY' | 'NOMINATED' | 'EVICTED' | 'IMMUNE'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newLeaderName, setNewLeaderName] = useState('');

  // Filter logic
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teamCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.members.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE_ONLY') {
      return t.status === 'ACTIVE' || t.status === 'CAPTAIN' || t.status === 'IMMUNE' || t.status === 'NOMINATED';
    }
    if (statusFilter === 'NOMINATED') return t.status === 'NOMINATED';
    if (statusFilter === 'EVICTED') return t.status === 'EVICTED';
    if (statusFilter === 'IMMUNE') return t.status === 'IMMUNE' || t.status === 'CAPTAIN';

    return true;
  });

  const getStatusBadge = (status: TeamStatus) => {
    switch (status) {
      case 'CAPTAIN':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5 inline-flex">
            <Shield className="w-3 h-3" /> CAPTAIN
          </span>
        );
      case 'IMMUNE':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 inline-flex">
            <Shield className="w-3 h-3" /> IMMUNE
          </span>
        );
      case 'NOMINATED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 inline-flex">
            <AlertTriangle className="w-3 h-3" /> NOMINATED
          </span>
        );
      case 'EVICTED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-danger-red/10 text-danger-red border border-danger-red/30 flex items-center gap-1.5 inline-flex">
            EVICTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/30 flex items-center gap-1.5 inline-flex">
            ACTIVE
          </span>
        );
    }
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    if (onAddTeam) {
      onAddTeam({
        name: newTeamName.trim(),
        leader: newLeaderName.trim() || 'TBA',
        members: [newLeaderName.trim() || 'Leader', 'Member 2', 'Member 3'],
        status: 'ACTIVE',
      });
    }
    setNewTeamName('');
    setNewLeaderName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-[#0d0f14] border border-bg-border rounded-xl p-5 md:p-6 shadow-xl space-y-5">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono tracking-widest text-accent-blue uppercase flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Live House Roster
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-wide mt-0.5">
            Registered Teams Management ({filteredTeams.length} / {teams.length})
          </h2>
        </div>

        {/* Quick Add Team Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-black border border-accent-blue/30 text-xs font-bold tracking-wider flex items-center gap-2 transition-all self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW TEAM</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams by name, ID (e.g. DEV-101), or member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#090b10] border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/60 transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-accent-blue text-black border-accent-blue font-bold shadow-glow-blue'
                : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
            }`}
          >
            All ({teams.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE_ONLY')}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'ACTIVE_ONLY'
                ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
            }`}
          >
            Active In House
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('NOMINATED')}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'NOMINATED'
                ? 'bg-amber-500 text-black border-amber-500 font-bold'
                : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
            }`}
          >
            Nominated
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('EVICTED')}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'EVICTED'
                ? 'bg-danger-red text-white border-danger-red font-bold'
                : 'bg-[#090b10] text-text-secondary border-bg-border hover:text-text-primary'
            }`}
          >
            Eliminated
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="overflow-x-auto rounded-xl border border-bg-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#090b10] text-text-secondary font-mono text-xs uppercase tracking-wider border-b border-bg-border">
            <tr>
              <th className="py-3.5 px-4">Rank</th>
              <th className="py-3.5 px-4">Team</th>
              <th className="py-3.5 px-4">Leader / Squad</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Score</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-bg-border">
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted font-mono text-xs">
                  No teams found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => onSelectTeam(team)}
                  className="hover:bg-[#121620] cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 font-mono font-bold text-text-secondary">
                    {team.rank === 1 ? (
                      <span className="text-amber-400 font-extrabold flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" /> #1
                      </span>
                    ) : (
                      `#${team.rank}`
                    )}
                  </td>

                  {/* Team Code & Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-primary group-hover:text-accent-blue transition-colors flex items-center gap-2">
                      {team.name}
                    </div>
                    <div className="font-mono text-[11px] text-text-muted">
                      {team.teamCode}
                    </div>
                  </td>

                  {/* Leader & Members */}
                  <td className="py-3.5 px-4 text-xs text-text-secondary">
                    <div className="text-text-primary font-medium">{team.leader}</div>
                    <div className="text-[11px] text-text-muted line-clamp-1">
                      {team.members.join(', ')}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(team.status)}
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-text-primary">
                    <span className={team.score > 0 ? 'text-accent-blue' : 'text-text-muted'}>
                      {team.score} pts
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTeam(team);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-[#161a23] group-hover:bg-accent-blue group-hover:text-black text-text-secondary font-medium border border-bg-border transition-all flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Team Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0d0f14] border border-accent-blue/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
              <span className="text-accent-blue">[REGISTRATION]</span> Add New Team
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Add walk-in registration or placeholder team to the live roster.
            </p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phoenix Hackers"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090b10] border border-bg-border text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Team Leader Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newLeaderName}
                  onChange={(e) => setNewLeaderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090b10] border border-bg-border text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-[#161a23] text-text-secondary hover:text-text-primary border border-bg-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-accent-blue text-black hover:bg-sky-400 shadow-glow-blue"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
