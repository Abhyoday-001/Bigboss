import React, { useState, useEffect } from 'react';
import { EyeOff, Award, CheckCircle, XCircle, Clock, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round2SecretMission() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [missionData, setMissionData] = useState({ assigned: false, brief: '', assignments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [briefInput, setBriefInput] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lb, missionStatus] = await Promise.all([
        adminRoundService.getLeaderboard(),
        adminRoundService.getSecretMissionStatus(),
      ]);
      setLeaderboard(lb);
      setMissionData(missionStatus);
      setBriefInput(missionStatus.brief || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load Secret Mission data.');
    } finally {
      setLoading(false);
    }
  };

  // Compute First, Middle, and Last from Leaderboard
  const computedFirst = leaderboard[0] || null;
  const computedMiddle = leaderboard.length >= 3 ? leaderboard[Math.floor(leaderboard.length / 2)] : null;
  const computedLast = leaderboard.length >= 3 ? leaderboard[leaderboard.length - 1] : null;

  const handleAssignMissions = async () => {
    if (leaderboard.length < 3) {
      alert('At least 3 ranked teams are required on the leaderboard to determine 1st, middle, and last.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await adminRoundService.assignSecretMissions(briefInput);
      setMissionData(updated);
      setShowAssignModal(false);
    } catch (err) {
      alert('Error assigning secret missions: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (teamId, status, points = 25) => {
    try {
      const updated = await adminRoundService.updateSecretMissionStatus(teamId, status, points);
      setMissionData(updated);
      // Refresh leaderboard to reflect updated scores
      const refreshedLb = await adminRoundService.getLeaderboard();
      setLeaderboard(refreshedLb);
    } catch (err) {
      alert('Failed to update mission status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Accessing Secret Mission Channels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 2 Controls // Covert Ops
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            SECRET MISSION ASSIGNMENT & STATUS
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Auto-assigned strictly to 1st, Middle, and Last teams on the live leaderboard. Hidden from all other participants.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Leaderboard
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Mechanics Explanation Banner */}
      <div className="p-5 bg-[#0d0f14] border border-blue-900/40 rounded-xl text-xs text-gray-300 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-blue-950/60 text-[#1EA7FF] border border-blue-800/40 shrink-0">
          <EyeOff className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-1">
            Enforced Leaderboard Algorithm
          </h4>
          <p className="text-gray-400 leading-relaxed">
            Per the event rules and <strong className="text-white">spoorthi.md</strong>, the admin cannot manually choose teams for this covert task.
            The platform automatically resolves the <span className="text-[#1EA7FF] font-mono">1st (Rank 1)</span>, <span className="text-[#1EA7FF] font-mono">Middle (Rank {Math.floor(leaderboard.length / 2) + 1})</span>, and <span className="text-[#1EA7FF] font-mono">Last (Rank {leaderboard.length})</span> teams directly from live standings.
          </p>
        </div>
      </div>

      {/* Secret Mission Configuration */}
      <div className="p-6 bg-[#0d0f14] border border-gray-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Send className="w-4 h-4 text-[#1EA7FF]" />
          Covert Task Directive / Mission Brief
        </h3>
        <textarea
          rows={3}
          value={briefInput}
          onChange={(e) => setBriefInput(e.target.value)}
          placeholder="Describe the secret task (e.g. inject hidden feature, covertly sabotage, solve secret riddle)..."
          className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-3 text-xs text-white focus:outline-none transition-colors"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-mono">
            {missionData.assigned ? 'Missions already dispatched. Re-assigning will overwrite targets.' : 'Ready to dispatch to 3 targets.'}
          </span>
          <button
            onClick={() => setShowAssignModal(true)}
            disabled={!briefInput.trim() || leaderboard.length < 3}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              !briefInput.trim() || leaderboard.length < 3
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.4)]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {missionData.assigned ? 'Re-Dispatch Secret Mission' : 'Dispatch Secret Mission'}
          </button>
        </div>
      </div>

      {/* Three Auto-Derived Teams Display & Tracking */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#1EA7FF]" />
          Target Operatives Status ({missionData.assignments.length > 0 ? 'Assigned' : 'Calculated Standings'})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              posLabel: '1. First on Leaderboard',
              badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
              team: computedFirst,
              assignment: missionData.assignments.find((a) => a.position?.toLowerCase().includes('first')),
            },
            {
              posLabel: '2. Middle of Leaderboard',
              badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
              team: computedMiddle,
              assignment: missionData.assignments.find((a) => a.position?.toLowerCase().includes('middle')),
            },
            {
              posLabel: '3. Last on Leaderboard',
              badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
              team: computedLast,
              assignment: missionData.assignments.find((a) => a.position?.toLowerCase().includes('last')),
            },
          ].map(({ posLabel, badgeColor, team, assignment }, index) => {
            const currentStatus = assignment?.status || 'unassigned';
            const displayTeam = assignment ? { name: assignment.teamName, id: assignment.teamId, rank: assignment.rank } : team;

            return (
              <div
                key={index}
                className="bg-[#0d0f14] border border-gray-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${badgeColor}`}>
                      {posLabel}
                    </span>
                    {assignment && <StatusBadge status={currentStatus} />}
                  </div>

                  <h4 className="text-lg font-bold text-white truncate mb-1">
                    {displayTeam?.name || 'Calculating...'}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono mb-4">
                    Standings Rank: <strong className="text-[#1EA7FF]">#{displayTeam?.rank || index + 1}</strong>
                  </p>

                  <div className="bg-[#050506] p-3 rounded-lg border border-gray-800 text-xs space-y-1 mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Reward Stakes:</span>
                      <strong className="text-[#2ED67B] font-mono">+25 Points</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Execution State:</span>
                      <strong className="uppercase font-mono text-gray-200">{currentStatus}</strong>
                    </div>
                  </div>
                </div>

                {assignment && (
                  <div className="pt-3 border-t border-gray-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-gray-400 block">
                      Update Live Outcome:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(assignment.teamId, 'pending', 0)}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                          currentStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        Pending
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(assignment.teamId, 'completed', 25)}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                          currentStatus === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                            : 'bg-gray-800 text-gray-400 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Passed
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(assignment.teamId, 'failed', 0)}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                          currentStatus === 'failed'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                            : 'bg-gray-800 text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <XCircle className="w-3 h-3" />
                        Failed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onConfirm={handleAssignMissions}
        title="CONFIRM SECRET MISSION DISPATCH"
        message={`This will transmit the secret task exclusively to:\n1. 1st: ${computedFirst?.name}\n2. Middle: ${computedMiddle?.name}\n3. Last: ${computedLast?.name}\n\nAll other teams will have no visibility into this mission.`}
        confirmText="Dispatch Covert Mission"
        isLoading={submitting}
      />
    </div>
  );
}

export default Round2SecretMission;
