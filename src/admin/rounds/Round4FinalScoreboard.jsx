import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Radio, Sparkles, RefreshCw, AlertTriangle, Eye, ShieldAlert, Award } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import SurveillanceEye from '../components/SurveillanceEye';
import StatusBadge from '../components/StatusBadge';

export function Round4FinalScoreboard() {
  const [resultsData, setResultsData] = useState({ winnerRevealed: false, winner: null, standings: [], evictedTeams: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRevealModal, setShowRevealModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminRoundService.getFinalResults();
      setResultsData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load final scoreboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWinnerReveal = async () => {
    setSubmitting(true);
    try {
      const nextState = !resultsData.winnerRevealed;
      const updated = await adminRoundService.revealWinner(nextState);
      setResultsData(updated);
      setShowRevealModal(false);
    } catch (err) {
      alert('Error updating winner broadcast: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Calculating Grand Finale Standings...</p>
      </div>
    );
  }

  const { winner, standings = [], evictedTeams = [], winnerRevealed } = resultsData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Finale Controls // The Dev House Crown
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            FINAL SCOREBOARD & WINNER REVEAL
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Grand finale scoreboard with cumulative round scores, penalty audits, and live winner announcement broadcast.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Standings
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Dramatic Winner Hero Banner */}
      <div className="p-8 bg-[#0d0f14] border border-[#1EA7FF]/40 rounded-2xl shadow-[0_0_35px_rgba(30,167,255,0.15)] relative overflow-hidden text-center">
        {/* Glow ambient background effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1EA7FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1EA7FF]/20 to-transparent border border-[#1EA7FF]/30 shadow-[0_0_20px_rgba(30,167,255,0.2)]">
              <Trophy className="w-12 h-12 text-[#1EA7FF] animate-pulse" />
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#1EA7FF] font-bold">
              COG-TECH REALITY SURVIVAL CHAMPION
            </span>
            <h1 className="text-4xl sm:text-5xl font-display-metal font-black tracking-wider uppercase mt-2">
              {winner ? winner.name : 'Awaiting Final Scores'}
            </h1>
            {winner && (
              <p className="text-xs text-gray-300 font-mono mt-1">
                Members: <strong className="text-white">{winner.members?.join(' · ')}</strong> · Cumulative Score:{' '}
                <strong className="text-[#2ED67B] font-bold">{winner.score} Points</strong>
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowRevealModal(true)}
              disabled={!winner}
              className={`px-8 py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
                !winner
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : winnerRevealed
                  ? 'bg-[#FF3B4E]/20 text-[#FF3B4E] hover:bg-[#FF3B4E]/30 border border-[#FF3B4E]/40'
                  : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_25px_rgba(30,167,255,0.5)]'
              }`}
            >
              {winnerRevealed ? (
                <>
                  <Eye className="w-4 h-4" />
                  Conceal Winner Broadcast
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Broadcast Grand Winner Reveal
                </>
              )}
            </button>
          </div>

          {winnerRevealed && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1EA7FF]/10 border border-[#1EA7FF]/40 text-xs font-mono text-[#1EA7FF]">
              <Radio className="w-4 h-4 animate-ping" />
              Live Winner Banner Broadcasting on All Screens
            </div>
          )}
        </div>
      </div>

      {/* Official Standings Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-[#1EA7FF]" />
          Comprehensive Final Standings ({standings.length} Finalists)
        </h3>

        <div className="bg-[#0d0f14] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050506] text-gray-400 font-mono uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Round 4 Score</th>
                  <th className="py-3 px-4">Penalties</th>
                  <th className="py-3 px-4 text-right">Cumulative Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {standings.map((team, idx) => {
                  const isTop = idx === 0;

                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isTop ? 'bg-[#1EA7FF]/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {isTop ? (
                          <span className="flex items-center gap-1.5 text-amber-400 font-display text-base">
                            <Crown className="w-4 h-4 text-amber-400" /> #1
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">#{idx + 1}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white text-sm font-body">
                        {team.name}
                        {isTop && (
                          <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Winner
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 font-body">
                        {team.members?.join(', ')}
                      </td>

                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        +{team.round4Score || 0} pts
                      </td>

                      <td className="py-3.5 px-4">
                        {team.penaltyDeductions > 0 ? (
                          <span className="text-[#FF3B4E] font-bold">
                            -{team.penaltyDeductions} pts
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-white text-base">
                        {team.score} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Evicted Teams Archive */}
      {evictedTeams.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FF3B4E]" />
            Evicted Housemates Registry ({evictedTeams.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {evictedTeams.map((team) => (
              <div
                key={team.id}
                className="p-4 bg-[#050506] border border-red-950/60 rounded-xl flex items-center justify-between text-xs opacity-70"
              >
                <div>
                  <span className="font-bold text-gray-300 line-through">{team.name}</span>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Eliminated in Round 3 Eviction
                  </p>
                </div>
                <StatusBadge status="evicted" text="EVICTED" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        onConfirm={handleToggleWinnerReveal}
        title={winnerRevealed ? 'CONCEAL WINNER REVEAL' : 'BROADCAST GRAND WINNER'}
        message={
          winnerRevealed
            ? 'This will conceal the champion announcement from participant screens.'
            : `Are you ready to crown ${winner?.name} as the official WINNER of The Dev House and broadcast the grand finale visual sequence across all screens?`
        }
        confirmText={winnerRevealed ? 'Conceal' : 'Crown & Broadcast Winner'}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round4FinalScoreboard;
