import React, { useState, useEffect } from 'react';
import { Vote, Power, RefreshCw, AlertTriangle, BarChart3, Users, Clock, CheckCircle } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round3VotingControl() {
  const [teams, setTeams] = useState([]);
  const [votingData, setVotingData] = useState({ isOpen: false, voterRole: 'mixed', votes: {}, totalVotes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [voterRole, setVoterRole] = useState('mixed');
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    // 4-second auto-poll for live vote tallies when window is open
    const interval = setInterval(() => {
      fetchVotingResults();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsList, vData] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getVotingStatus(),
      ]);
      setTeams(teamsList);
      setVotingData(vData);
      setVoterRole(vData.voterRole || 'mixed');
    } catch (err) {
      console.error(err);
      setError('Failed to load voting status.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingResults = async () => {
    try {
      const vData = await adminRoundService.getVotingStatus();
      setVotingData(vData);
    } catch (err) {
      console.warn('Poll failed:', err);
    }
  };

  const handleToggleVoting = async () => {
    setSubmitting(true);
    try {
      const nextOpenState = !votingData.isOpen;
      const updated = await adminRoundService.toggleVotingWindow(nextOpenState, voterRole);
      setVotingData(updated);
      setShowToggleModal(false);
    } catch (err) {
      alert('Error updating voting window: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Accessing Ballot Systems...</p>
      </div>
    );
  }

  // Nominated candidate teams receiving votes
  const candidateTeamIds = Object.keys(votingData.votes || {});
  const totalVotes = votingData.totalVotes || 1; // avoid divide by 0

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 3 Controls // House Suffrage
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            VOTING CONTROL & RESULTS
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Open or close the eviction ballot window and monitor live vote counts for nominated teams.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Tallies
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Voting Window Control Panel */}
      <div className="p-6 bg-[#0d0f14] border border-gray-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Status Indicator */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              votingData.isOpen
                ? 'bg-emerald-950/40 border-[#2ED67B] text-[#2ED67B] shadow-[0_0_15px_rgba(46,214,123,0.3)] animate-pulse'
                : 'bg-red-950/40 border-[#FF3B4E] text-[#FF3B4E]'
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-gray-400">Ballot Window Status:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-white">
                {votingData.isOpen ? 'VOTING IS OPEN' : 'BALLOT BOX CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Voter Role Selector (Data-Driven per PRD.md §8) */}
        <div className="bg-[#050506] p-3 rounded-xl border border-gray-800">
          <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#1EA7FF]" />
            Configured Voting Body:
          </label>
          <select
            value={voterRole}
            onChange={(e) => setVoterRole(e.target.value)}
            disabled={votingData.isOpen}
            className="w-full bg-[#0d0f14] border border-gray-700 text-white text-xs font-mono py-1.5 px-2 rounded focus:outline-none focus:border-[#1EA7FF]"
          >
            <option value="mixed">Mixed (Judges + Remaining Safe Teams)</option>
            <option value="participants">Participant Housemates Only</option>
            <option value="judges">Official Faculty / Judges Only</option>
            <option value="audience">Public / Audience Vote</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowToggleModal(true)}
            className={`w-full md:w-auto px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              votingData.isOpen
                ? 'bg-[#FF3B4E] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,59,78,0.4)]'
                : 'bg-[#2ED67B] hover:bg-emerald-400 text-[#050506] shadow-[0_0_15px_rgba(46,214,123,0.3)]'
            }`}
          >
            <Vote className="w-4 h-4" />
            {votingData.isOpen ? 'Close Voting Window' : 'Open Voting Window'}
          </button>
        </div>
      </div>

      {/* Live Vote Tallies Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#1EA7FF]" />
            Live Candidate Ballot Tallies ({votingData.totalVotes || 0} Total Votes Cast)
          </h3>
          <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1EA7FF]" />
            Auto-polling every 4s
          </span>
        </div>

        {candidateTeamIds.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0f14] border border-gray-800 rounded-xl text-gray-400 text-xs">
            No active candidates registered on the ballot. Nominated teams with unresolved immunity will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {candidateTeamIds.map((teamId) => {
              const team = teams.find((t) => t.id === teamId);
              const voteCount = votingData.votes[teamId] || 0;
              const percentage = Math.round((voteCount / totalVotes) * 100);

              return (
                <div
                  key={teamId}
                  className="bg-[#0d0f14] border border-gray-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-white">{team?.name || teamId}</span>
                      <span className="text-xs text-gray-400 font-mono ml-2">
                        ({team?.members?.join(', ') || 'Team'})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400">{percentage}%</span>
                      <span className="text-lg font-black font-mono text-[#FF3B4E]">
                        {voteCount} <span className="text-xs text-gray-400 font-normal">votes</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar for Votes */}
                  <div className="w-full bg-[#050506] h-3.5 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="bg-gradient-to-r from-[#FF3B4E] to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,59,78,0.5)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={handleToggleVoting}
        title={votingData.isOpen ? 'CLOSE VOTING WINDOW' : 'OPEN BALLOT WINDOW'}
        message={
          votingData.isOpen
            ? 'Are you sure you want to close voting? Participants and voters will immediately be blocked from casting further votes.'
            : `Are you ready to open voting for the voter body: "${voterRole.toUpperCase()}"? Live voting interfaces will unlock immediately.`
        }
        confirmText={votingData.isOpen ? 'Close Window' : 'Open Window'}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round3VotingControl;
