import React, { useState, useEffect } from 'react';
import { AlertOctagon, MinusCircle, RefreshCw, AlertTriangle, ShieldX, Clock, History } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round4PenaltyInterface() {
  const [teams, setTeams] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [targetTeamId, setTargetTeamId] = useState('');
  const [deductionPoints, setDeductionPoints] = useState(10);
  const [outOfScopeFeature, setOutOfScopeFeature] = useState('');
  const [reason, setReason] = useState('');

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsList, penList] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getPenalties(),
      ]);
      setTeams(teamsList);
      setPenalties(penList);
    } catch (err) {
      console.error(err);
      setError('Failed to load penalties.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPenalty = async () => {
    if (!targetTeamId || !outOfScopeFeature.trim() || !reason.trim()) {
      alert('Please fill in all penalty details (target team, out-of-scope feature, and violation reason).');
      return;
    }
    setSubmitting(true);
    try {
      await adminRoundService.applyPenalty(targetTeamId, deductionPoints, outOfScopeFeature, reason);
      // Reset form
      setOutOfScopeFeature('');
      setReason('');
      setShowConfirmModal(false);
      await loadData();
    } catch (err) {
      alert('Failed to apply penalty: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#FF3B4E] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Accessing Penalty Audit Registry...</p>
      </div>
    );
  }

  const selectedTeam = teams.find((t) => t.id === targetTeamId);
  const projectedScore = selectedTeam ? Math.max(0, selectedTeam.score - Number(deductionPoints)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF3B4E] font-semibold">
            Round 4 Controls // Scope Discipline Enforcement
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#FF3B4E] font-mono">[ </span>
            OUT-OF-SCOPE FEATURE PENALTY INTERFACE
            <span className="text-[#FF3B4E] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Enforce the core event rule: Building unapproved features outside listed requirements incurs strict point penalties.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Log
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Penalty Action Form */}
      <div className="p-6 bg-[#0d0f14] border border-red-900/40 rounded-xl shadow-[0_0_20px_rgba(255,59,78,0.1)] space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
          <AlertOctagon className="w-5 h-5 text-[#FF3B4E]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Issue Point Deduction Violation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Team Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Select Offending Team
              </label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="w-full bg-[#050506] border border-gray-800 focus:border-[#FF3B4E] text-white text-xs font-bold py-2.5 px-3 rounded-lg focus:outline-none"
              >
                <option value="">-- Choose Target Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Current Score: {t.score} pts)
                  </option>
                ))}
              </select>
            </div>

            {/* Score Impact Preview */}
            {selectedTeam && (
              <div className="p-3.5 bg-[#050506] border border-red-950 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Current Team Points:</span>
                  <strong className="text-white">{selectedTeam.score} pts</strong>
                </div>
                <div className="flex justify-between text-[#FF3B4E]">
                  <span>Penalty Deduction:</span>
                  <strong>-{deductionPoints} pts</strong>
                </div>
                <div className="flex justify-between text-gray-300 pt-1 border-t border-gray-800 font-bold">
                  <span>Post-Penalty Score:</span>
                  <span className="text-[#1EA7FF]">{projectedScore} pts</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Deduction Penalty Amount
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 25].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setDeductionPoints(pts)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      deductionPoints === pts
                        ? 'bg-[#FF3B4E] text-white shadow-[0_0_10px_rgba(255,59,78,0.4)]'
                        : 'bg-[#050506] border border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    -{pts} Pts
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={deductionPoints}
                  onChange={(e) => setDeductionPoints(Math.max(1, Number(e.target.value)))}
                  className="w-20 bg-[#050506] border border-gray-800 focus:border-[#FF3B4E] text-center font-mono font-bold text-white text-xs py-1.5 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Out of Scope Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Detected Out-of-Scope Feature / Asset
              </label>
              <input
                type="text"
                value={outOfScopeFeature}
                onChange={(e) => setOutOfScopeFeature(e.target.value)}
                placeholder="e.g. Unapproved Payment Gateway / 3D Canvas Game Engine"
                className="w-full bg-[#050506] border border-gray-800 focus:border-[#FF3B4E] text-white text-xs py-2.5 px-3 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Violation Rationale & Audit Evidence
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Document specific rule violation, unapproved library, or prompt leak..."
                className="w-full bg-[#050506] border border-gray-800 focus:border-[#FF3B4E] text-white text-xs p-3 rounded-lg focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={!targetTeamId || !outOfScopeFeature.trim() || !reason.trim()}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              !targetTeamId || !outOfScopeFeature.trim() || !reason.trim()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-[#FF3B4E] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,59,78,0.4)]'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            Apply Scope Penalty
          </button>
        </div>
      </div>

      {/* Audit Log of Applied Penalties */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          Penalty Audit Log & Violation History ({penalties.length})
        </h3>

        {penalties.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0f14] border border-gray-800 rounded-xl text-gray-400 text-xs">
            No penalties have been issued. Teams have stayed strictly within feature bounds.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {penalties.map((pen) => (
              <div
                key={pen.id}
                className="p-4 bg-[#0d0f14] border border-red-950 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{pen.teamName}</span>
                    <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-800/80 text-[#FF3B4E] text-xs font-mono font-bold">
                      -{pen.deductionPoints} Points
                    </span>
                  </div>
                  <p className="text-xs text-red-300 font-mono">
                    Out of Scope: <strong className="text-white">{pen.outOfScopeFeature}</strong>
                  </p>
                  <p className="text-xs text-gray-400">{pen.reason}</p>
                </div>

                <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                  {new Date(pen.timestamp).toLocaleTimeString()} ({new Date(pen.timestamp).toLocaleDateString()})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleApplyPenalty}
        title="DEDUCT PENALTY POINTS"
        message={`Confirm deducting ${deductionPoints} points from ${selectedTeam?.name} for out-of-scope feature: "${outOfScopeFeature}"?\n\nThis will immediately decrease their total score and shift live leaderboard positions.`}
        confirmText="Confirm Deduction"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round4PenaltyInterface;
