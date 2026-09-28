import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  Minus, 
  Clock, 
  FileText, 
  Download, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Filter
} from 'lucide-react';
import { TeamRecord, ScoreAuditEntry } from '../../mocks/mockTeams';
import { ConfirmationModal, ConfirmationModalProps } from '../../shared/components/ConfirmationModal';
import { LiveLeaderboard } from '../../shared/components/LiveLeaderboard';
import { Team } from '../../shared/state-machine/types';

interface ScoreManagerProps {
  teams: TeamRecord[];
  onAdjustScore: (teamId: string, delta: number, round: string, reason: string) => void;
  onDirectSetScore?: (teamId: string, newScore: number) => void;
}

export const ScoreManager: React.FC<ScoreManagerProps> = ({
  teams,
  onAdjustScore,
  onDirectSetScore,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [deltaValue, setDeltaValue] = useState<number>(25);
  const [customDeltaInput, setCustomDeltaInput] = useState<string>('25');
  const [roundCategory, setRoundCategory] = useState<string>('Round 1 - Task');
  const [reasonText, setReasonText] = useState<string>('');
  const [searchAuditTerm, setSearchAuditTerm] = useState<string>('');
  const [auditFilterRound, setAuditFilterRound] = useState<string>('ALL');
  const [auditFilterType, setAuditFilterType] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE'>('ALL');
  const [activeSubView, setActiveSubView] = useState<'adjust' | 'leaderboard'>('adjust');

  // Confirmation Modal state
  const [modalConfig, setModalConfig] = useState<ConfirmationModalProps | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Collect all audit history across all teams
  const allAuditEntries: (ScoreAuditEntry & { teamName: string; teamCode: string })[] = [];
  teams.forEach((team) => {
    team.scoreHistory.forEach((entry) => {
      allAuditEntries.push({
        ...entry,
        teamName: team.name,
        teamCode: team.teamCode,
      });
    });
  });

  // Sort audit entries by timestamp or id descending (latest first)
  const sortedAuditEntries = allAuditEntries.sort((a, b) => b.id.localeCompare(a.id));

  // Filter audit entries
  const filteredAuditEntries = sortedAuditEntries.filter((entry) => {
    const matchesSearch =
      entry.teamName.toLowerCase().includes(searchAuditTerm.toLowerCase()) ||
      entry.teamCode.toLowerCase().includes(searchAuditTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchAuditTerm.toLowerCase()) ||
      entry.adjustedBy.toLowerCase().includes(searchAuditTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (auditFilterRound !== 'ALL' && !entry.round.toLowerCase().includes(auditFilterRound.toLowerCase())) {
      return false;
    }

    if (auditFilterType === 'POSITIVE' && entry.delta < 0) return false;
    if (auditFilterType === 'NEGATIVE' && entry.delta >= 0) return false;

    return true;
  });

  // Selected team object
  const currentSelectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Quick Preset Points
  const presets = [
    { label: '+10 Checkpoint', delta: 10, variant: 'pos' },
    { label: '+25 Task Complete', delta: 25, variant: 'pos' },
    { label: '+50 Milestone Win', delta: 50, variant: 'pos' },
    { label: '+100 Captain/First', delta: 100, variant: 'pos' },
    { label: '-10 Rule Penalty', delta: -10, variant: 'neg' },
    { label: '-25 Scope Breach', delta: -25, variant: 'neg' },
    { label: '-50 Severe Violation', delta: -50, variant: 'neg' },
  ];

  const handlePresetClick = (delta: number, defaultReason: string) => {
    setDeltaValue(delta);
    setCustomDeltaInput(delta.toString());
    if (!reasonText) {
      setReasonText(defaultReason);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDeltaInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setDeltaValue(parsed);
    }
  };

  // Submit Adjustment Request
  const handleInitiateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedTeam || deltaValue === 0) return;

    const finalReason = reasonText.trim() || (deltaValue > 0 ? 'Manual point bonus awarded by Admin' : 'Manual point penalty deducted by Admin');
    const isDeduction = deltaValue < 0;

    setModalConfig({
      isOpen: true,
      title: isDeduction ? 'Confirm Score Deduction' : 'Confirm Score Addition',
      description: `You are about to ${isDeduction ? 'DEDUCT' : 'ADD'} ${Math.abs(deltaValue)} points ${isDeduction ? 'from' : 'to'} team "${currentSelectedTeam.name}" (${currentSelectedTeam.teamCode}). New total will be ${Math.max(0, currentSelectedTeam.score + deltaValue)} pts.`,
      confirmLabel: isDeduction ? `Deduct ${Math.abs(deltaValue)} Pts` : `Award +${deltaValue} Pts`,
      variant: isDeduction ? 'danger' : 'primary',
      onClose: () => setModalConfig(null),
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          // Simulate latency
          await new Promise((r) => setTimeout(r, 400));
          onAdjustScore(currentSelectedTeam.id, deltaValue, roundCategory, finalReason);
          setReasonText('');
          setModalConfig(null);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // Export Audit Logs
  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sortedAuditEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devhouse_score_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Total points calculation
  const totalPointsDistributed = teams.reduce((sum, t) => sum + t.score, 0);

  // Convert TeamRecord to Leaderboard Team shape
  const leaderboardTeams: Team[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    score: t.score,
    status: t.status === 'EVICTED' ? 'EVICTED' : t.status === 'NOMINATED' ? 'NOMINATED' : t.status === 'IMMUNE' ? 'IMMUNE' : 'ACTIVE',
    rank: t.rank,
    members: t.members,
    avatar: t.avatarUrl,
  }));

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      {modalConfig && <ConfirmationModal {...modalConfig} isLoading={isProcessing} />}

      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0f14] border border-accent-blue/30 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-blue font-bold">Total Points Pool</span>
            <Zap className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-3xl font-bold font-mono text-text-primary">{totalPointsDistributed} PTS</div>
          <div className="text-xs text-text-muted mt-1">Across all {teams.length} competing squads</div>
        </div>

        <div className="bg-[#0d0f14] border border-bg-border rounded-xl p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Audit Log Entries</span>
            <Clock className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-3xl font-bold font-mono text-text-primary">{allAuditEntries.length}</div>
          <div className="text-xs text-text-muted mt-1">Immutable adjustments logged</div>
        </div>

        <div className="bg-[#0d0f14] border border-success-green/30 rounded-xl p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-success-green">Highest Score</span>
            <TrendingUp className="w-4 h-4 text-success-green" />
          </div>
          <div className="text-3xl font-bold font-mono text-success-green">
            {Math.max(...teams.map((t) => t.score), 0)} PTS
          </div>
          <div className="text-xs text-text-muted mt-1">Leader: {teams[0]?.name || 'N/A'}</div>
        </div>

        <div className="bg-[#0d0f14] border border-bg-border rounded-xl p-5 flex flex-col justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">Ledger Actions</div>
          <button
            type="button"
            onClick={handleExportAuditLogs}
            className="w-full py-2.5 px-3 rounded-lg bg-[#161a23] hover:bg-[#1f2430] text-text-primary border border-bg-border text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors hover:border-accent-blue/40"
          >
            <Download className="w-3.5 h-3.5 text-accent-blue" />
            <span>EXPORT LEDGER (JSON)</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation: Manual Calibration vs Live Interactive Leaderboard */}
      <div className="flex items-center gap-2 border-b border-bg-border pb-3">
        <button
          type="button"
          onClick={() => setActiveSubView('adjust')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeSubView === 'adjust'
              ? 'bg-accent-blue text-black shadow-glow-blue'
              : 'bg-[#0d0f14] text-text-secondary hover:text-text-primary border border-bg-border'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Manual Calibration & Audit Trail</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('leaderboard')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeSubView === 'leaderboard'
              ? 'bg-accent-blue text-black shadow-glow-blue'
              : 'bg-[#0d0f14] text-text-secondary hover:text-text-primary border border-bg-border'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Inline Leaderboard Editor</span>
        </button>
      </div>

      {activeSubView === 'adjust' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Adjustment Entry Console (5 cols) */}
          <div className="lg:col-span-5 bg-[#0d0f14] border border-bg-border rounded-xl p-5 md:p-6 shadow-xl space-y-5">
            <div className="border-b border-bg-border pb-3">
              <div className="text-xs font-mono tracking-widest text-accent-blue uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                Point Allocation Engine
              </div>
              <h2 className="text-lg font-bold text-text-primary tracking-wide mt-0.5">
                Manual Score Override
              </h2>
            </div>

            <form onSubmit={handleInitiateAdjustment} className="space-y-4">
              {/* Team Selector */}
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                  Target Squad
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#090b10] border border-bg-border text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors font-mono"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.teamCode}] {t.name} (Current: {t.score} pts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Team Quick Summary Card */}
              {currentSelectedTeam && (
                <div className="p-3 rounded-lg bg-[#090b10] border border-accent-blue/20 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="text-text-secondary text-[11px]">Selected Squad</div>
                    <div className="text-text-primary font-bold">{currentSelectedTeam.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-secondary text-[11px]">Current Ledger</div>
                    <div className="text-accent-blue font-bold text-sm">{currentSelectedTeam.score} PTS</div>
                  </div>
                </div>
              )}

              {/* Round Category */}
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                  Round / Category Assignment
                </label>
                <select
                  value={roundCategory}
                  onChange={(e) => setRoundCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#090b10] border border-bg-border text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors font-mono"
                >
                  <option value="Round 1 - Task Decrypt">Round 1 - Task Decrypt</option>
                  <option value="Round 2 - Captaincy Battle">Round 2 - Captaincy Battle</option>
                  <option value="Round 2 - Secret Mission">Round 2 - Secret Mission</option>
                  <option value="Round 3 - Immunity Duel">Round 3 - Immunity Duel</option>
                  <option value="Round 4 - Final Build">Round 4 - Final Build</option>
                  <option value="Bonus - Rapid Speed Award">Bonus - Rapid Speed Award</option>
                  <option value="Penalty - House Rule Breach">Penalty - House Rule Breach</option>
                </select>
              </div>

              {/* Fast Preset Chips */}
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">
                  Quick Point Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetClick(p.delta, p.label)}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-all ${
                        deltaValue === p.delta
                          ? p.variant === 'pos'
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                            : 'bg-danger-red text-white border-red-400 font-bold'
                          : 'bg-[#161a23] text-text-secondary border-bg-border hover:text-text-primary'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Delta Input */}
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                  Point Delta (Positive or Negative)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={customDeltaInput}
                      onChange={handleCustomInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#090b10] border text-sm font-mono font-bold focus:outline-none transition-colors ${
                        deltaValue > 0
                          ? 'text-success-green border-success-green/40 focus:border-success-green'
                          : deltaValue < 0
                          ? 'text-danger-red border-danger-red/40 focus:border-danger-red'
                          : 'text-text-primary border-bg-border focus:border-accent-blue'
                      }`}
                      placeholder="+25 or -10"
                    />
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs text-text-secondary">
                    <span>New Total:</span>
                    <strong className="text-text-primary font-bold">
                      {Math.max(0, (currentSelectedTeam?.score || 0) + deltaValue)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Reason / Note */}
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                  Audit Reason / Justification
                </label>
                <textarea
                  rows={2}
                  required
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="e.g. Decrypted bonus hash before timer expiry."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#090b10] border border-bg-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={deltaValue === 0 || isProcessing}
                className={`w-full py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                  deltaValue < 0
                    ? 'bg-danger-red hover:bg-red-600 text-white shadow-glow-red'
                    : 'bg-accent-blue hover:bg-sky-400 text-black shadow-glow-blue'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {deltaValue < 0 ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>
                  {deltaValue < 0
                    ? `Deduct ${Math.abs(deltaValue)} Points`
                    : `Award +${deltaValue} Points`}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Audit Trail Ledger (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d0f14] border border-bg-border rounded-xl p-5 md:p-6 shadow-xl space-y-4">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bg-border pb-3">
              <div>
                <div className="text-xs font-mono tracking-widest text-accent-blue uppercase flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Live Ledger
                </div>
                <h2 className="text-lg font-bold text-text-primary tracking-wide mt-0.5">
                  Score Audit Trail ({filteredAuditEntries.length} Records)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-success-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-ping" />
                  REAL-TIME LOG
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter audit log by team or reason..."
                  value={searchAuditTerm}
                  onChange={(e) => setSearchAuditTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#090b10] border border-bg-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors font-mono"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAuditFilterType('ALL')}
                  className={`px-2.5 py-1.5 text-[11px] font-mono rounded border transition-colors ${
                    auditFilterType === 'ALL'
                      ? 'bg-accent-blue text-black border-accent-blue font-bold'
                      : 'bg-[#090b10] text-text-secondary border-bg-border'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterType('POSITIVE')}
                  className={`px-2.5 py-1.5 text-[11px] font-mono rounded border transition-colors ${
                    auditFilterType === 'POSITIVE'
                      ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                      : 'bg-[#090b10] text-text-secondary border-bg-border'
                  }`}
                >
                  Bonuses (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterType('NEGATIVE')}
                  className={`px-2.5 py-1.5 text-[11px] font-mono rounded border transition-colors ${
                    auditFilterType === 'NEGATIVE'
                      ? 'bg-danger-red text-white border-danger-red font-bold'
                      : 'bg-[#090b10] text-text-secondary border-bg-border'
                  }`}
                >
                  Penalties (-)
                </button>
              </div>
            </div>

            {/* Ledger List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredAuditEntries.length === 0 ? (
                <div className="p-8 text-center bg-[#090b10] border border-bg-border rounded-lg text-xs font-mono text-text-muted">
                  No audit log entries matching filters.
                </div>
              ) : (
                filteredAuditEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-lg bg-[#090b10] border border-bg-border hover:border-accent-blue/40 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-text-primary">{entry.teamName}</span>
                        <span className="text-text-muted text-[11px]">[{entry.teamCode}]</span>
                        <span className="text-text-secondary text-[10px]">·</span>
                        <span className="text-accent-blue font-semibold text-[11px]">{entry.round}</span>
                      </div>

                      <div className="text-xs text-text-secondary flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-text-muted flex-shrink-0" />
                        <span>{entry.reason}</span>
                      </div>

                      <div className="text-[10px] font-mono text-text-muted flex items-center gap-2 pt-0.5">
                        <span>Time: {entry.timestamp}</span>
                        <span>·</span>
                        <span>Logged by: {entry.adjustedBy}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`font-mono text-sm font-bold block ${
                          entry.delta > 0 ? 'text-success-green' : 'text-danger-red'
                        }`}
                      >
                        {entry.delta > 0 ? `+${entry.delta}` : entry.delta} PTS
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">
                        Total: {entry.newTotal}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Inline Leaderboard View */
        <div className="space-y-4">
          <LiveLeaderboard
            teams={leaderboardTeams}
            isAdmin={true}
            onUpdateScore={(teamId, newScore) => {
              if (onDirectSetScore) {
                onDirectSetScore(teamId, newScore);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
