import React, { useState, useEffect } from 'react';
import { UserMinus, AlertTriangle, CheckCircle, RefreshCw, Sliders, ShieldAlert, FileText } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round2Nominations() {
  const [teams, setTeams] = useState([]);
  const [nominationConfig, setNominationConfig] = useState({ maxCount: 3, nominatedTeamIds: [], notes: {}, locked: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable states
  const [maxCount, setMaxCount] = useState(3);
  const [selectedNominees, setSelectedNominees] = useState([]);
  const [nominationNotes, setNominationNotes] = useState({});

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
      const [teamsList, nomData] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getNominations(),
      ]);
      setTeams(teamsList);
      setNominationConfig(nomData);
      setMaxCount(nomData.maxCount || 3);
      setSelectedNominees(nomData.nominatedTeamIds || []);
      setNominationNotes(nomData.notes || {});
    } catch (err) {
      console.error(err);
      setError('Failed to load nomination data.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxCountChange = async (newVal) => {
    const count = Math.max(1, Math.min(teams.length, Number(newVal)));
    setMaxCount(count);
    try {
      await adminRoundService.setNominationConfig(count);
    } catch (err) {
      console.warn('Could not persist nomination config to server:', err);
    }
  };

  const handleToggleNominee = (teamId) => {
    setSelectedNominees((prev) => {
      if (prev.includes(teamId)) {
        const next = prev.filter((id) => id !== teamId);
        return next;
      } else {
        if (prev.length >= maxCount) {
          alert(`Nomination limit reached (${maxCount}). Increase maximum count or deselect another team.`);
          return prev;
        }
        return [...prev, teamId];
      }
    });
  };

  const handleNoteChange = (teamId, note) => {
    setNominationNotes((prev) => ({
      ...prev,
      [teamId]: note,
    }));
  };

  const handleSaveNominations = async () => {
    setSubmitting(true);
    try {
      const updated = await adminRoundService.submitNominations(selectedNominees, nominationNotes);
      setNominationConfig(updated);
      setShowConfirmModal(false);
      // Reload teams to sync statuses
      const refreshedTeams = await adminRoundService.getTeams();
      setTeams(refreshedTeams);
    } catch (err) {
      alert('Error updating nominations: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Loading Nomination Authority...</p>
      </div>
    );
  }

  const activeTeams = teams.filter((t) => t.status !== 'evicted');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF3B4E] font-semibold">
            Round 2 Controls // Elimination Danger Zone
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#FF3B4E] font-mono">[ </span>
            NOMINATION MANAGEMENT
            <span className="text-[#FF3B4E] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure dynamic nomination quotas and select teams in danger of eviction for Round 3 Immunity.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Teams
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Control Bar: Configurable Quota */}
      <div className="p-6 bg-[#0d0f14] border border-gray-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-[#1EA7FF]" />
            <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
              Nomination Scaling Formula
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Per PRD §8, total nominations scale dynamically with registered participant scale.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#050506] p-3 rounded-xl border border-gray-800">
          <label className="text-xs font-mono uppercase text-gray-400">Nomination Target:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={activeTeams.length}
              value={maxCount}
              onChange={(e) => handleMaxCountChange(e.target.value)}
              className="w-16 bg-[#0d0f14] border border-gray-700 focus:border-[#1EA7FF] text-center font-mono font-bold text-white text-sm py-1 rounded-md"
            />
            <span className="text-xs text-gray-400 font-mono">/ {activeTeams.length} Active Teams</span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="text-right">
            <span className="text-xs font-mono text-gray-400 block">Selected Nominees:</span>
            <span
              className={`font-mono text-sm font-bold ${
                selectedNominees.length === maxCount ? 'text-[#2ED67B]' : 'text-[#FF3B4E]'
              }`}
            >
              {selectedNominees.length} of {maxCount} designated
            </span>
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={selectedNominees.length === 0}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              selectedNominees.length === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-[#FF3B4E] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,59,78,0.4)]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Lock Nominations
          </button>
        </div>
      </div>

      {/* Teams Grid for Nomination Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <UserMinus className="w-4 h-4 text-[#FF3B4E]" />
          Active House Teams ({activeTeams.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTeams.map((team) => {
            const isNominated = selectedNominees.includes(team.id);
            const note = nominationNotes[team.id] || '';

            return (
              <div
                key={team.id}
                className={`p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isNominated
                    ? 'bg-red-950/20 border-[#FF3B4E] shadow-[0_0_15px_rgba(255,59,78,0.25)]'
                    : 'bg-[#0d0f14] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-white text-base truncate">{team.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Members: {team.members.join(', ')}
                      </p>
                    </div>
                    {isNominated ? (
                      <StatusBadge status="nominated" text="NOMINATED" />
                    ) : (
                      <StatusBadge status="safe" text="SAFE" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 py-2 border-y border-gray-800/60 mb-3">
                    <span>Current Score: <strong className="text-white font-mono">{team.score}</strong></span>
                    <span>Rank: <strong className="text-[#1EA7FF] font-mono">#{team.rank || '-'}</strong></span>
                  </div>

                  {/* Context / Reason Input */}
                  {isNominated && (
                    <div className="mt-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#FF3B4E]" />
                        Nomination Rationale / Context
                      </label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleNoteChange(team.id, e.target.value)}
                        placeholder="e.g. Failed Round 1 speed test / Rule violation"
                        className="w-full bg-[#050506] border border-red-900/60 focus:border-[#FF3B4E] rounded-md px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleNominee(team.id)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isNominated
                        ? 'bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-700/60'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    }`}
                  >
                    {isNominated ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#FF3B4E]" />
                        Nominated (Click to Safe)
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-3.5 h-3.5" />
                        Nominate for Eviction
                      </>
                    )}
                  </button>
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
        onConfirm={handleSaveNominations}
        title="CONFIRM ROUND 2 NOMINATIONS"
        message={`Are you sure you want to lock nominations for ${selectedNominees.length} team(s)? These teams will immediately receive nomination alerts on their participant dashboard and advance to the Round 3 Immunity Challenge.`}
        confirmText="Lock & Publish Nominations"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round2Nominations;
