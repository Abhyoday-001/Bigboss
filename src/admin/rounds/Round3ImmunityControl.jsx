import React, { useState, useEffect } from 'react';
import { Shield, Swords, CheckCircle2, Play, RefreshCw, AlertTriangle, Trophy, XCircle } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round3ImmunityControl() {
  const [teams, setTeams] = useState([]);
  const [immunityData, setImmunityData] = useState({ active: false, challengeName: '', pairings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [challengeNameInput, setChallengeNameInput] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null); // { pairingId, winnerId, immunityGranted }
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsList, immStatus] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getImmunityStatus(),
      ]);
      setTeams(teamsList);
      setImmunityData(immStatus);
      setChallengeNameInput(immStatus.challengeName || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load Immunity Challenge data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartImmunity = async () => {
    setSubmitting(true);
    try {
      const updated = await adminRoundService.startImmunityChallenge(challengeNameInput);
      setImmunityData((prev) => ({ ...prev, ...updated, active: true }));
      setShowStartModal(false);
    } catch (err) {
      alert('Error starting immunity round: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResolve = (pair, winnerId, immunityGranted) => {
    setResolveTarget({
      pairingId: pair.id,
      pair,
      winnerId,
      immunityGranted,
    });
    setShowResolveModal(true);
  };

  const handleConfirmResolve = async () => {
    if (!resolveTarget) return;
    setSubmitting(true);
    try {
      const updated = await adminRoundService.resolveImmunityDuel(
        resolveTarget.pairingId,
        resolveTarget.winnerId,
        resolveTarget.immunityGranted
      );
      setImmunityData(updated);
      setShowResolveModal(false);
      // Reload teams to reflect immune/safe updates
      const refreshedTeams = await adminRoundService.getTeams();
      setTeams(refreshedTeams);
    } catch (err) {
      alert('Error resolving duel: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Loading Immunity Control Matrix...</p>
      </div>
    );
  }

  const pairings = immunityData.pairings || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#2ED67B] font-semibold">
            Round 3 Controls // Immunity Battles
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#2ED67B] font-mono">[ </span>
            IMMUNITY ROUND CONTROL
            <span className="text-[#2ED67B] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Start the head-to-head duels and resolve immunity outcomes. Nominees who win become Safe/Immune from eviction.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Duel Status
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Global Round 3 Immunity Starter */}
      <div className="p-6 bg-[#0d0f14] border border-gray-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#2ED67B]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Immunity Challenge Objective
            </h3>
            {immunityData.active && <StatusBadge status="safe" text="CHALLENGE IN PROGRESS" />}
          </div>
          <input
            type="text"
            value={challengeNameInput}
            onChange={(e) => setChallengeNameInput(e.target.value)}
            placeholder="e.g. Algorithmic Overclock: Reverse engineer and patch the vulnerability..."
            className="w-full bg-[#050506] border border-gray-800 focus:border-[#2ED67B] rounded-lg p-2.5 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => setShowStartModal(true)}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2ED67B] hover:bg-emerald-400 text-[#050506] shadow-[0_0_15px_rgba(46,214,123,0.3)] flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            {immunityData.active ? 'Update & Broadcast Duel' : 'Commence Immunity Challenge'}
          </button>
        </div>
      </div>

      {/* Duels List & Outcome Resolutions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1EA7FF]" />
          Active Immunity Duels ({pairings.length})
        </h3>

        {pairings.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0f14] border border-gray-800 rounded-xl text-gray-400 text-xs">
            No pairings found. Please visit Safe & Nominated Team Pairing first to generate duels.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pairings.map((pair) => {
              const nomTeam = teams.find((t) => t.id === pair.nominatedTeamId);
              const safeTeam = teams.find((t) => t.id === pair.safeTeamId);
              const isResolved = pair.status === 'resolved';
              const winnerTeam = teams.find((t) => t.id === pair.winnerId);

              return (
                <div
                  key={pair.id}
                  className={`bg-[#0d0f14] border rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${
                    isResolved ? 'border-emerald-800/40 bg-[#08130e]' : 'border-gray-800'
                  }`}
                >
                  {/* Duel Contestants */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nominated Team Card */}
                    <div
                      className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                        pair.winnerId === nomTeam?.id
                          ? 'bg-emerald-950/40 border-[#2ED67B] shadow-[0_0_10px_rgba(46,214,123,0.2)]'
                          : 'bg-[#050506] border-red-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status="nominated" text="NOMINEE" />
                        {pair.winnerId === nomTeam?.id && (
                          <span className="text-[10px] font-mono text-[#2ED67B] font-bold flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> IMMUNITY WON
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold text-white truncate">{nomTeam?.name || 'Nominee'}</span>
                      <span className="text-xs text-gray-400 font-mono">Score: {nomTeam?.score} pts</span>
                    </div>

                    {/* Safe Team Card */}
                    <div
                      className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                        pair.winnerId === safeTeam?.id
                          ? 'bg-blue-950/40 border-[#1EA7FF] shadow-[0_0_10px_rgba(30,167,255,0.2)]'
                          : 'bg-[#050506] border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status="safe" text="SAFE PARTNER" />
                        {pair.winnerId === safeTeam?.id && (
                          <span className="text-[10px] font-mono text-[#1EA7FF] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> DEFENDED
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold text-white truncate">{safeTeam?.name || 'Safe Team'}</span>
                      <span className="text-xs text-gray-400 font-mono">Score: {safeTeam?.score} pts</span>
                    </div>
                  </div>

                  {/* Actions / Outcome Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 lg:border-l lg:border-gray-800 lg:pl-6">
                    {isResolved ? (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Duel Resolved</span>
                        <div className="text-xs text-white font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2ED67B]" />
                          Winner: <strong className="text-[#1EA7FF]">{winnerTeam?.name}</strong>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {pair.immunityGranted ? '🛡️ Nominee earned immunity' : '❌ Nominee remains in danger'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenResolve(pair, nomTeam.id, true)}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2ED67B]/20 text-[#2ED67B] hover:bg-[#2ED67B] hover:text-[#050506] border border-[#2ED67B]/40 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          Grant Immunity to {nomTeam?.name}
                        </button>

                        <button
                          onClick={() => handleOpenResolve(pair, safeTeam.id, false)}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/60 transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 text-[#FF3B4E]" />
                          Safe Team Won (Nominee Remains)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={handleStartImmunity}
        title="START IMMUNITY ROUND DUELS"
        message={`This will broadcast the Immunity Challenge objective ("${challengeNameInput}") to all teams and start the head-to-head timers.`}
        confirmText="Commence Challenge"
        isLoading={submitting}
      />

      <ConfirmationModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={handleConfirmResolve}
        title="RESOLVE IMMUNITY DUEL OUTCOME"
        message={
          resolveTarget?.immunityGranted
            ? `Confirm that the Nominated team (${teams.find((t) => t.id === resolveTarget?.winnerId)?.name}) won the duel and is granted full Immunity from Round 3 Eviction?`
            : `Confirm that the Safe team won? The Nominated team will remain in the eviction danger pool for voting.`
        }
        confirmText="Confirm Outcome"
        isLoading={submitting}
      />
    </div>
  );
}

export default Round3ImmunityControl;
