import React, { useState, useEffect } from 'react';
import { Users, Link2, Unlink, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round3TeamPairing() {
  const [nominatedTeams, setNominatedTeams] = useState([]);
  const [safeTeams, setSafeTeams] = useState([]);
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ nominatedTeams: nom, safeTeams: safe }, existingPairings] = await Promise.all([
        adminRoundService.getNominatedAndSafeTeams(),
        adminRoundService.getPairings(),
      ]);
      setNominatedTeams(nom);
      setSafeTeams(safe);
      setPairings(existingPairings || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load team data for pairings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePairSelection = (nominatedTeamId, safeTeamId) => {
    setPairings((prev) => {
      // Remove any existing pairing for this nominated team or safe team
      const filtered = prev.filter((p) => p.nominatedTeamId !== nominatedTeamId && p.safeTeamId !== safeTeamId);
      if (!safeTeamId) return filtered;
      return [
        ...filtered,
        {
          id: `pair-${nominatedTeamId}-${Date.now()}`,
          nominatedTeamId,
          safeTeamId,
          status: 'pending',
          winnerId: null,
        },
      ];
    });
  };

  const handleAutoPair = () => {
    if (safeTeams.length < nominatedTeams.length) {
      alert('Not enough safe teams to pair 1-to-1 with nominated teams.');
      return;
    }
    const newPairings = nominatedTeams.map((nom, index) => ({
      id: `pair-${nom.id}-${index}-${Date.now()}`,
      nominatedTeamId: nom.id,
      safeTeamId: safeTeams[index].id,
      status: 'pending',
      winnerId: null,
    }));
    setPairings(newPairings);
  };

  const handleClearPairings = () => {
    setPairings([]);
  };

  const handleSavePairings = async () => {
    setSubmitting(true);
    try {
      const saved = await adminRoundService.savePairings(pairings);
      setPairings(saved);
      setShowSaveModal(false);
    } catch (err) {
      alert('Failed to save pairings: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Configuring Immunity Duels...</p>
      </div>
    );
  }

  const assignedSafeIds = pairings.map((p) => p.safeTeamId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 3 Controls // Immunity Matchmaking
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            SAFE & NOMINATED TEAM PAIRING
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Pair each endangered Nominated team with an eligible Safe team for the head-to-head Immunity Challenge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoPair}
            disabled={nominatedTeams.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1EA7FF] hover:bg-[#1EA7FF]/10 border border-[#1EA7FF]/40 rounded-lg transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Auto-Pair 1:1
          </button>
          <button
            onClick={handleClearPairings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 rounded-lg transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={loadData}
            className="p-1.5 text-gray-400 hover:text-white border border-gray-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Pairing Summary Stat Bar */}
      <div className="p-5 bg-[#0d0f14] border border-gray-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-950/40 text-[#FF3B4E] border border-red-900/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase">Nominated Teams:</span>
            <span className="text-lg font-bold text-white block">{nominatedTeams.length} Teams In Danger</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/40 text-[#2ED67B] border border-emerald-900/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase">Available Safe Teams:</span>
            <span className="text-lg font-bold text-white block">{safeTeams.length} Eligible Partners</span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="text-right">
            <span className="text-xs font-mono text-gray-400 block">Matched Pairs:</span>
            <span className="font-mono text-sm font-bold text-[#1EA7FF]">
              {pairings.length} of {nominatedTeams.length}
            </span>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={pairings.length === 0}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              pairings.length === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.3)]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Lock & Save Pairings
          </button>
        </div>
      </div>

      {/* Pairings Builder List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-[#1EA7FF]" />
          Nominated Team Immunity Duels
        </h3>

        {nominatedTeams.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0f14] border border-gray-800 rounded-xl text-gray-400 text-xs">
            No teams are currently nominated. Proceed to Round 2 Nominations first to designate nominees.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {nominatedTeams.map((nomTeam) => {
              const currentPair = pairings.find((p) => p.nominatedTeamId === nomTeam.id);
              const matchedSafeTeam = safeTeams.find((s) => s.id === currentPair?.safeTeamId);

              return (
                <div
                  key={nomTeam.id}
                  className="bg-[#0d0f14] border border-gray-800 hover:border-gray-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                >
                  {/* Left: Nominated Team */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-[#FF3B4E]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{nomTeam.name}</span>
                        <StatusBadge status="nominated" text="NOMINATED" />
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        Score: {nomTeam.score} pts · Members: {nomTeam.members.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Center: VS Connector */}
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1 rounded bg-[#050506] border border-gray-800 text-xs font-mono font-bold text-[#1EA7FF]">
                      [ VS ]
                    </span>
                  </div>

                  {/* Right: Safe Team Selector */}
                  <div className="flex-1 flex items-center gap-4 justify-end">
                    <div className="w-full max-w-sm">
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                        Assigned Safe Team Partner:
                      </label>
                      <select
                        value={currentPair?.safeTeamId || ''}
                        onChange={(e) => handlePairSelection(nomTeam.id, e.target.value)}
                        className={`w-full bg-[#050506] border rounded-lg p-2.5 text-xs focus:outline-none transition-colors ${
                          matchedSafeTeam
                            ? 'border-[#2ED67B]/50 text-white'
                            : 'border-gray-800 text-gray-400 focus:border-[#1EA7FF]'
                        }`}
                      >
                        <option value="">-- Select Safe Partner --</option>
                        {safeTeams.map((safe) => {
                          const isUsedElsewhere = assignedSafeIds.includes(safe.id) && currentPair?.safeTeamId !== safe.id;
                          return (
                            <option key={safe.id} value={safe.id} disabled={isUsedElsewhere}>
                              {safe.name} (Score: {safe.score}) {isUsedElsewhere ? '— [Already Paired]' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {matchedSafeTeam ? (
                      <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[#2ED67B]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0 text-gray-600">
                        ?
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSavePairings}
        title="CONFIRM IMMUNITY PAIRINGS"
        message={`Save ${pairings.length} head-to-head pairings for Round 3 Immunity Challenge? Both safe and nominated teams will receive pairing notices on their screens.`}
        confirmText="Save & Publish Pairings"
        isLoading={submitting}
      />
    </div>
  );
}

export default Round3TeamPairing;
