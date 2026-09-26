import React, { useState, useEffect } from 'react';
import { Shield, Crown, Play, Eye, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round2Captaincy() {
  const [teams, setTeams] = useState([]);
  const [captaincyData, setCaptaincyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [challengeBrief, setChallengeBrief] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [advantageText, setAdvantageText] = useState('');

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsList, capStatus] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getCaptaincyStatus(),
      ]);
      setTeams(teamsList);
      setCaptaincyData(capStatus);
      setSelectedCompetitors(capStatus.competitors || []);
      setChallengeBrief(capStatus.challenge || '');
      setWinnerTeamId(capStatus.winnerId || '');
      setCaptainName(capStatus.captainName || '');
      setAdvantageText(capStatus.advantage || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load captaincy status.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompetitor = (teamId) => {
    setSelectedCompetitors((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleStartCompetition = async () => {
    if (selectedCompetitors.length < 2) {
      alert('Please select at least 2 teams for the Captaincy duel.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await adminRoundService.startCaptaincyCompetition(selectedCompetitors, challengeBrief);
      setCaptaincyData(updated);
      setShowStartModal(false);
    } catch (err) {
      alert('Error starting captaincy challenge: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveWinner = async () => {
    if (!winnerTeamId) {
      alert('Please select the winning team.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await adminRoundService.setCaptainWinner(winnerTeamId, captainName, advantageText);
      setCaptaincyData(updated);
      setShowResolveModal(false);
    } catch (err) {
      alert('Error declaring captain: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerReveal = async () => {
    setSubmitting(true);
    try {
      const nextState = !captaincyData?.revealedToParticipants;
      const updated = await adminRoundService.revealCaptain(nextState);
      setCaptaincyData(updated);
      setShowRevealModal(false);
    } catch (err) {
      alert('Error toggling reveal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Loading Captaincy Management...</p>
      </div>
    );
  }

  const activeTeams = teams.filter((t) => t.status !== 'evicted');
  const winningTeam = teams.find((t) => t.id === captaincyData?.winnerId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Bracket Motif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 2 Controls // Surveillance Authority
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            CAPTAINCY MANAGEMENT & REVEAL
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure the captaincy competition, declare the house leader, and control participant-side dramatic reveal.
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
          <AlertCircle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Top Banner: Current Captain Status */}
      <div className="p-6 bg-[#0d0f14] border border-[#1EA7FF]/30 rounded-xl shadow-[0_0_20px_rgba(30,167,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Crown className="w-32 h-32 text-[#1EA7FF]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">House Captain</span>
            <div className="flex items-center gap-3 mt-1">
              <Crown className="w-6 h-6 text-[#1EA7FF]" />
              <span className="text-xl font-bold text-white">
                {winningTeam ? winningTeam.name : 'No Captain Declared Yet'}
              </span>
            </div>
            {captaincyData?.captainName && (
              <p className="text-xs text-[#1EA7FF] mt-1 font-mono">
                Designated Leader: <strong className="text-white">{captaincyData.captainName}</strong>
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">Captaincy Advantage</span>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed border-l-2 border-[#1EA7FF] pl-3 py-0.5">
              {captaincyData?.advantage || 'No special advantage assigned.'}
            </p>
          </div>

          <div className="bg-[#050506] p-4 rounded-xl border border-gray-800 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">Participant Visibility</span>
              {captaincyData?.revealedToParticipants ? (
                <StatusBadge status="immune" text="BROADCAST LIVE" />
              ) : (
                <StatusBadge status="nominated" text="CONCEALED / HIDDEN" />
              )}
            </div>

            <button
              onClick={() => setShowRevealModal(true)}
              disabled={!captaincyData?.winnerId}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !captaincyData?.winnerId
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : captaincyData?.revealedToParticipants
                  ? 'bg-[#FF3B4E]/20 text-[#FF3B4E] hover:bg-[#FF3B4E]/30 border border-[#FF3B4E]/40'
                  : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.4)]'
              }`}
            >
              <Eye className="w-4 h-4" />
              {captaincyData?.revealedToParticipants
                ? 'Conceal Captain from Participants'
                : 'Trigger Dramatic Captain Reveal'}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Setup & Competitors vs Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Challenge & Competitor Selection */}
        <div className="bg-[#0d0f14] p-6 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#1EA7FF]" />
              <h3 className="text-base font-bold text-white tracking-wide">
                1. Select Competing Teams & Challenge
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Captaincy Task / Challenge Brief
                </label>
                <textarea
                  rows={3}
                  value={challengeBrief}
                  onChange={(e) => setChallengeBrief(e.target.value)}
                  placeholder="Enter task rules, clues, and objectives..."
                  className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-3 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-gray-400">
                    Contenders ({selectedCompetitors.length} selected)
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">Min 2 required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {activeTeams.map((team) => {
                    const isSelected = selectedCompetitors.includes(team.id);
                    return (
                      <div
                        key={team.id}
                        onClick={() => handleToggleCompetitor(team.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#1EA7FF]/15 border-[#1EA7FF] text-white shadow-[0_0_10px_rgba(30,167,255,0.2)]'
                            : 'bg-[#050506] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="truncate font-semibold">{team.name}</div>
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <span className="text-[10px] font-mono text-gray-400">{team.score} pts</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            className="rounded border-gray-700 text-[#1EA7FF] focus:ring-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
            <button
              onClick={() => setShowStartModal(true)}
              disabled={selectedCompetitors.length < 2}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                selectedCompetitors.length < 2
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.3)]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Captaincy Duel
            </button>
          </div>
        </div>

        {/* Right Column: Declare Winner & Advantage */}
        <div className="bg-[#0d0f14] p-6 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-[#1EA7FF]" />
              <h3 className="text-base font-bold text-white tracking-wide">
                2. Resolve Duel & Crown Captain
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Select Victorious Team
                </label>
                <select
                  value={winnerTeamId}
                  onChange={(e) => setWinnerTeamId(e.target.value)}
                  className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2.5 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="">-- Choose Victorious Team --</option>
                  {(selectedCompetitors.length > 0 ? selectedCompetitors : activeTeams.map((t) => t.id)).map(
                    (id) => {
                      const t = teams.find((team) => team.id === id);
                      if (!t) return null;
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name} (Current Score: {t.score})
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Designated Individual Captain Name
                </label>
                <input
                  type="text"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="e.g. Alice or Team Rep"
                  className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Granted Captaincy Advantage
                </label>
                <textarea
                  rows={2}
                  value={advantageText}
                  onChange={(e) => setAdvantageText(e.target.value)}
                  placeholder="Detail the advantage (immunity shield, nomination save, bonus hints)..."
                  className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
            <button
              onClick={() => setShowResolveModal(true)}
              disabled={!winnerTeamId}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                !winnerTeamId
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-[#2ED67B] hover:bg-emerald-400 text-[#050506] shadow-[0_0_15px_rgba(46,214,123,0.3)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save & Lock Captain Result
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={handleStartCompetition}
        title="START CAPTAINCY COMPETITION"
        message={`Are you ready to initiate the Captaincy challenge between ${selectedCompetitors.length} teams? This will broadcast the challenge brief to contenders.`}
        confirmText="Initiate Duel"
        isLoading={submitting}
      />

      <ConfirmationModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={handleResolveWinner}
        title="DECLARE CAPTAINCY WINNER"
        message={`Confirm declaring ${winningTeam?.name || 'Selected Team'} as the official House Captain? You can reveal the captain to participants when ready.`}
        confirmText="Confirm Captain"
        isLoading={submitting}
      />

      <ConfirmationModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        onConfirm={handleTriggerReveal}
        title={captaincyData?.revealedToParticipants ? 'CONCEAL CAPTAIN REVEAL' : 'BROADCAST CAPTAIN REVEAL'}
        message={
          captaincyData?.revealedToParticipants
            ? 'This will hide the captain identity from participant screens.'
            : `Triggering this will immediately play the dramatic captain reveal moment on all participant screens with bracket styling [ ${winningTeam?.name} ].`
        }
        confirmText={captaincyData?.revealedToParticipants ? 'Conceal' : 'Broadcast Live Reveal'}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round2Captaincy;
