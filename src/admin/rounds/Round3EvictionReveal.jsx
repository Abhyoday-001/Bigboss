import React, { useState, useEffect } from 'react';
import { Skull, AlertTriangle, ShieldCheck, Flame, RefreshCw, Radio } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import SurveillanceEye from '../components/SurveillanceEye';
import StatusBadge from '../components/StatusBadge';

export function Round3EvictionReveal() {
  const [teams, setTeams] = useState([]);
  const [evictionData, setEvictionData] = useState({ evictedTeamIds: [], revealed: false, timestamp: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected teams to evict
  const [selectedToEvict, setSelectedToEvict] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsList, evData] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getEvictionStatus(),
      ]);
      setTeams(teamsList);
      setEvictionData(evData);
      setSelectedToEvict(evData.evictedTeamIds || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load eviction status.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvict = (teamId) => {
    setSelectedToEvict((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleTriggerEviction = async () => {
    if (selectedToEvict.length === 0) {
      alert('Please select at least one team to evict.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await adminRoundService.triggerEviction(selectedToEvict);
      setEvictionData(updated);
      setShowConfirmModal(false);
      // Reload teams to sync status
      const refreshedTeams = await adminRoundService.getTeams();
      setTeams(refreshedTeams);
    } catch (err) {
      alert('Error triggering eviction: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#FF3B4E] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Loading Eviction Protocols...</p>
      </div>
    );
  }

  const nominatedOrInDangerTeams = teams.filter((t) => t.status === 'nominated' || selectedToEvict.includes(t.id));
  const otherTeams = teams.filter((t) => !nominatedOrInDangerTeams.some((n) => n.id === t.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF3B4E] font-semibold">
            Round 3 Controls // High-Stakes Elimination
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#FF3B4E] font-mono">[ </span>
            EVICTION TRIGGER & REVEAL SCREEN
            <span className="text-[#FF3B4E] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Audience-facing dramatic reveal moment. Triggers red alert broadcast and locks evicted teams out of Round 4.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh State
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Dramatic Hero Reveal Card matching DESIGN.md */}
      <div className="p-8 bg-[#0d0f14] border border-[#FF3B4E]/50 rounded-2xl shadow-[0_0_30px_rgba(255,59,78,0.2)] relative overflow-hidden text-center">
        {/* Ambient red beam accents */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <SurveillanceEye size="lg" isAlert={true} className="mx-auto" />

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF3B4E] font-bold">
              SURVEILLANCE TERMINATION PROTOCOL
            </span>
            <h3 className="text-3xl font-display font-black text-white tracking-wide mt-1">
              <span className="text-[#FF3B4E]">[ </span>
              THE HOUSE HAS SPOKEN
              <span className="text-[#FF3B4E]"> ]</span>
            </h3>
            <p className="text-xs text-gray-300 mt-2">
              Broadcast the dramatic eviction reveal sequence to all participant laptops and phones.
            </p>
          </div>

          {/* Trigger Button with Danger Red Glow */}
          <div className="pt-2">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedToEvict.length === 0}
              className={`px-8 py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 mx-auto transition-all ${
                selectedToEvict.length === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-[#FF3B4E] hover:bg-red-600 text-white shadow-[0_0_25px_rgba(255,59,78,0.6)] animate-pulse'
              }`}
            >
              <Flame className="w-5 h-5 fill-current" />
              TRIGGER LIVE EVICTION BROADCAST ({selectedToEvict.length} Teams)
            </button>
          </div>

          {evictionData.revealed && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-[11px] font-mono text-red-300">
              <Radio className="w-3.5 h-3.5 text-[#FF3B4E] animate-ping" />
              Active Broadcast Triggered at {new Date(evictionData.timestamp || Date.now()).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Select Teams to Evict */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Skull className="w-4 h-4 text-[#FF3B4E]" />
            Designate Evicted Team(s) for Elimination
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            {selectedToEvict.length} designated for eviction
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const isSelected = selectedToEvict.includes(team.id);
            const isAlreadyEvicted = team.status === 'evicted';

            return (
              <div
                key={team.id}
                onClick={() => handleToggleEvict(team.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-950/30 border-[#FF3B4E] shadow-[0_0_20px_rgba(255,59,78,0.3)]'
                    : isAlreadyEvicted
                    ? 'bg-black/60 border-red-900/30 opacity-60'
                    : 'bg-[#0d0f14] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-white text-base truncate">{team.name}</span>
                    <StatusBadge status={isSelected ? 'nominated' : team.status} text={isSelected ? 'TO EVICT' : team.status} />
                  </div>
                  <p className="text-xs text-gray-400 font-mono mb-2">
                    Members: {team.members.join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Score: <strong className="text-white">{team.score} pts</strong> · Rank: <strong className="text-[#1EA7FF]">#{team.rank || '-'}</strong>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">
                    {isSelected ? 'Marked for eviction' : 'Click to mark'}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-gray-700 text-[#FF3B4E] focus:ring-0 w-4 h-4"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleTriggerEviction}
        title="HIGH-STAKES: EXECUTE EVICTION"
        message={`WARNING: You are about to permanently EVICT ${selectedToEvict.length} team(s) from The Dev House. This will trigger a dramatic red-alert eviction sequence on the participant panels and prevent them from competing in Round 4 Finale.\n\nProceed with elimination broadcast?`}
        confirmText="Confirm Permanent Eviction"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round3EvictionReveal;
