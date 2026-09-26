import React, { useState, useEffect } from 'react';
import { Award, CheckSquare, Save, RefreshCw, AlertTriangle, FileText, Calculator } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round4JudgeScoring() {
  const [teams, setTeams] = useState([]);
  const [features, setFeatures] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [existingScores, setExistingScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Team for Scoring
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [featureScores, setFeatureScores] = useState({});
  const [judgeNotes, setJudgeNotes] = useState('');

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
      const [teamsList, featList, subsList, scoresList] = await Promise.all([
        adminRoundService.getTeams(),
        adminRoundService.getHiddenFeatures(),
        adminRoundService.getSubmissions(),
        adminRoundService.getJudgeScores(),
      ]);
      setTeams(teamsList);
      setFeatures(featList);
      setSubmissions(subsList);
      setExistingScores(scoresList || {});

      // Default to first submission team if available
      if (subsList.length > 0 && !selectedTeamId) {
        setSelectedTeamId(subsList[0].teamId);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load judging data.');
    } finally {
      setLoading(false);
    }
  };

  // When selected team changes, load their existing score data if present
  useEffect(() => {
    if (selectedTeamId && existingScores[selectedTeamId]) {
      setFeatureScores(existingScores[selectedTeamId].featureScores || {});
      setJudgeNotes(existingScores[selectedTeamId].notes || '');
    } else {
      setFeatureScores({});
      setJudgeNotes('');
    }
  }, [selectedTeamId, existingScores]);

  const handleScoreChange = (featureId, points, maxPoints) => {
    const validPoints = Math.max(0, Math.min(maxPoints, Number(points || 0)));
    setFeatureScores((prev) => ({
      ...prev,
      [featureId]: validPoints,
    }));
  };

  const handleToggleFullScore = (featureId, maxPoints) => {
    const current = featureScores[featureId] || 0;
    handleScoreChange(featureId, current === maxPoints ? 0 : maxPoints, maxPoints);
  };

  const currentTotal = Object.values(featureScores).reduce((sum, val) => sum + Number(val || 0), 0);
  const maxPossible = features.reduce((sum, f) => sum + (f.points || 0), 0);

  const handleSubmitScore = async () => {
    if (!selectedTeamId) {
      alert('Please select a team to score.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await adminRoundService.submitJudgeScore(selectedTeamId, featureScores, judgeNotes);
      setExistingScores((prev) => ({ ...prev, [selectedTeamId]: updated }));
      setShowConfirmModal(false);
      // Refresh teams to update total score
      const refreshedTeams = await adminRoundService.getTeams();
      setTeams(refreshedTeams);
    } catch (err) {
      alert('Failed to submit score: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Preparing Judge Scorecards...</p>
      </div>
    );
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const selectedSubmission = submissions.find((s) => s.teamId === selectedTeamId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 4 Controls // Official Evaluation
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            JUDGE SCORING INTERFACE
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Official scorecard for judging website builds against revealed hidden feature criteria.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Scores
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Select Team & Scorecard Summary Bar */}
      <div className="p-6 bg-[#0d0f14] border border-gray-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
            Select Contender to Evaluate
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] text-white text-xs font-bold py-2 px-3 rounded-lg focus:outline-none"
          >
            <option value="">-- Choose Team to Grade --</option>
            {teams
              .filter((t) => t.status !== 'evicted')
              .map((team) => {
                const isGraded = Boolean(existingScores[team.id]);
                return (
                  <option key={team.id} value={team.id}>
                    {team.name} (Current: {team.score} pts) {isGraded ? '✓ [Scored]' : ''}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="bg-[#050506] p-3 rounded-xl border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-[#2ED67B]" />
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Calculated Round 4 Score</span>
              <span className="text-xl font-black font-mono text-[#2ED67B]">
                {currentTotal} <span className="text-xs text-gray-500 font-normal">/ {maxPossible} max</span>
              </span>
            </div>
          </div>
          {existingScores[selectedTeamId] && (
            <StatusBadge status="immune" text="SCORED & RECORDED" />
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedTeamId}
            className={`w-full md:w-auto px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              !selectedTeamId
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.3)]'
            }`}
          >
            <Save className="w-4 h-4" />
            Submit Official Score
          </button>
        </div>
      </div>

      {/* Selected Team Project Preview Links */}
      {selectedSubmission && (
        <div className="p-4 bg-[#050506] border border-gray-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="font-mono text-gray-500">Evaluating Submission:</span>
            <strong className="text-white">{selectedSubmission.teamName}</strong>
          </div>
          <div className="flex items-center gap-4">
            {selectedSubmission.repoUrl && (
              <a
                href={selectedSubmission.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#1EA7FF] hover:underline font-mono"
              >
                Codebase Repository ↗
              </a>
            )}
            {selectedSubmission.liveDemoUrl && (
              <a
                href={selectedSubmission.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#2ED67B] hover:underline font-mono font-bold"
              >
                Live Working Build ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Feature Scoring Rubric */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-[#1EA7FF]" />
          Feature Rubric & Point Awards
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {features.map((feat) => {
            const awarded = featureScores[feat.id] || 0;
            const isFullScore = awarded === feat.points;

            return (
              <div
                key={feat.id}
                className="p-5 bg-[#0d0f14] border border-gray-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        feat.category === 'required'
                          ? 'bg-blue-950/60 text-[#1EA7FF] border-[#1EA7FF]/40'
                          : 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                      }`}
                    >
                      {feat.category}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      Max: <strong className="text-white">+{feat.points} Pts</strong>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white tracking-wide">{feat.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.description}</p>
                </div>

                {/* Score Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleFullScore(feat.id, feat.points)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isFullScore
                        ? 'bg-[#2ED67B] text-[#050506] shadow-[0_0_10px_rgba(46,214,123,0.3)]'
                        : 'bg-[#050506] text-gray-400 hover:text-white border border-gray-700'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Full Score ({feat.points})
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#050506] border border-gray-800 px-3 py-1.5 rounded-lg">
                    <input
                      type="number"
                      min={0}
                      max={feat.points}
                      value={awarded}
                      onChange={(e) => handleScoreChange(feat.id, e.target.value, feat.points)}
                      className="w-12 bg-transparent text-center font-mono font-bold text-white text-sm focus:outline-none"
                    />
                    <span className="text-xs font-mono text-gray-500">/ {feat.points}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Judge Feedback & Notes */}
      <div className="p-6 bg-[#0d0f14] border border-gray-800 rounded-xl space-y-2">
        <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#1EA7FF]" />
          Judge Evaluation Notes & Feedback
        </label>
        <textarea
          rows={3}
          value={judgeNotes}
          onChange={(e) => setJudgeNotes(e.target.value)}
          placeholder="Record notes on UX, code cleanlines, architecture, edge cases..."
          className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-3 text-xs text-white focus:outline-none transition-colors"
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmitScore}
        title="SUBMIT OFFICIAL SCORECARD"
        message={`Are you ready to commit an official score of ${currentTotal} points to ${selectedTeam?.name}? This will instantly update the team's total score and live leaderboard standings.`}
        confirmText="Confirm & Save Score"
        isLoading={submitting}
      />
    </div>
  );
}

export default Round4JudgeScoring;
