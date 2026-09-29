import React, { useState, useEffect } from 'react';
import {
  eventOperationsService,
} from '../../shared/services/eventOperationsService';
import {
  Terminal,
  FileCode,
  Globe,
  Github,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Save,
  Award,
  Layers,
  CheckSquare,
  Square,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function Round1TaskControl() {
  const [r1State, setR1State] = useState(eventOperationsService.getRound1State());
  const [taskForm, setTaskForm] = useState(r1State.task);
  const [newDeliverableLabel, setNewDeliverableLabel] = useState('');
  const [newDeliverablePoints, setNewDeliverablePoints] = useState(20);

  // Selected team for manual evaluation
  const [evaluatingTeamId, setEvaluatingTeamId] = useState(null);
  const [checkedDeliverableIds, setCheckedDeliverableIds] = useState([]);
  const [codeQualityScore, setCodeQualityScore] = useState(20);
  const [functionalityScore, setFunctionalityScore] = useState(35);
  const [bonusScore, setBonusScore] = useState(10);
  const [evaluatorFeedback, setEvaluatorFeedback] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('Surveillance Jury');
  const [actionNotice, setActionNotice] = useState(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsub = eventOperationsService.subscribe(() => {
      const updated = eventOperationsService.getRound1State();
      setR1State(updated);
      setTaskForm(updated.task);
    });
    return () => unsub();
  }, []);

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Save task brief changes
  const handleSaveTaskBrief = (e) => {
    e.preventDefault();
    eventOperationsService.updateRound1Task(taskForm);
    showNotice('Round 1 Challenge Brief updated and pushed to all participant terminals.');
  };

  // Deliverable additions/deletions
  const handleAddDeliverable = () => {
    if (!newDeliverableLabel.trim()) return;
    eventOperationsService.addRound1Deliverable(newDeliverableLabel, newDeliverablePoints);
    setNewDeliverableLabel('');
    showNotice('New required deliverable added to Round 1 checklist.');
  };

  const handleRemoveDeliverable = (id) => {
    eventOperationsService.removeRound1Deliverable(id);
    showNotice('Deliverable removed from checklist.');
  };

  // Open evaluation for a team
  const handleOpenEvaluation = (teamId) => {
    const submission = r1State.submissions[teamId];
    setEvaluatingTeamId(teamId);

    if (submission?.evaluation) {
      setCheckedDeliverableIds(submission.evaluation.checkedDeliverableIds || []);
      setCodeQualityScore(submission.evaluation.codeQualityScore || 0);
      setFunctionalityScore(submission.evaluation.functionalityScore || 0);
      setBonusScore(submission.evaluation.bonusScore || 0);
      setEvaluatorFeedback(submission.evaluation.feedback || '');
      setEvaluatorName(submission.evaluation.evaluatorName || 'Surveillance Jury');
    } else {
      // Default: check all deliverables
      setCheckedDeliverableIds(r1State.task.deliverables.map((d) => d.id));
      setCodeQualityScore(20);
      setFunctionalityScore(35);
      setBonusScore(10);
      setEvaluatorFeedback('Good architecture and implementation. Deliverables verified.');
    }
  };

  const handleToggleDeliverableCheck = (id) => {
    setCheckedDeliverableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!evaluatingTeamId) return;

    eventOperationsService.evaluateRound1Submission(evaluatingTeamId, {
      checkedDeliverableIds,
      codeQualityScore,
      functionalityScore,
      bonusScore,
      feedback: evaluatorFeedback,
      evaluatorName,
    });

    showNotice(`Evaluation committed for ${evaluatingTeamId}! Score credited to house leaderboard.`);
    setEvaluatingTeamId(null);
  };

  // Calculate live total for evaluation form
  const totalDeliverablePoints = r1State.task.deliverables
    .filter((d) => checkedDeliverableIds.includes(d.id))
    .reduce((sum, d) => sum + d.points, 0);

  const totalCalculatedScore =
    totalDeliverablePoints + Number(codeQualityScore) + Number(functionalityScore) + Number(bonusScore);

  const mockTeamsList = [
    { id: 'team-01', name: 'CyberNexus' },
    { id: 'team-02', name: 'NullPointers' },
    { id: 'team-03', name: 'ByteForce' },
    { id: 'team-04', name: 'GlitchHunters' },
    { id: 'team-05', name: 'ZeroDay Protocol' },
    { id: 'team-06', name: 'KernelPanic' },
    { id: 'team-07', name: 'CodeBreakers' },
    { id: 'team-08', name: 'BufferOverflow' },
    { id: 'team-09', name: 'SyntaxErrors' },
  ];

  const selectedTeamSubmission = evaluatingTeamId ? r1State.submissions[evaluatingTeamId] : null;

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3 rounded-lg bg-accent-blue/15 border border-accent-blue/40 text-accent-blue-glow font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-accent-blue" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="panel-card p-6 border-l-4 border-l-accent-blue flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>ROUND 01 CONTROL • BUILD CHALLENGE & MANUAL AUDIT</span>
          </div>
          <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
            Task Assignment & Manual Checking Center
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Assign the building task, set mandatory feature checklists, inspect participants' GitHub and
            deployment URLs, and manually score their work.
          </p>
        </div>
      </div>

      {/* Main Grid: Task Manager & Submissions Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task & Deliverables Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="panel-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-accent-blue/20">
              <h3 className="font-display text-base uppercase tracking-wider text-text-primary flex items-center gap-2">
                <FileCode className="w-4 h-4 text-accent-blue" />
                <span>Task Assignment Editor</span>
              </h3>
              <span className="text-[10px] font-mono text-text-secondary uppercase">Live Synced</span>
            </div>

            <form onSubmit={handleSaveTaskBrief} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-secondary">Challenge Title:</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-bg-primary border border-accent-blue/30 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-secondary">Category / Domain:</label>
                <input
                  type="text"
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                  className="w-full bg-bg-primary border border-accent-blue/30 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-secondary">Challenge Brief / Description:</label>
                <textarea
                  rows={3}
                  value={taskForm.brief}
                  onChange={(e) => setTaskForm({ ...taskForm, brief: e.target.value })}
                  className="w-full bg-bg-primary border border-accent-blue/30 rounded p-2.5 text-xs text-text-primary focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-text-secondary">Max Points:</label>
                  <input
                    type="number"
                    value={taskForm.maxPoints}
                    onChange={(e) => setTaskForm({ ...taskForm, maxPoints: Number(e.target.value) })}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded px-2 py-1 text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-secondary">Duration (Mins):</label>
                  <input
                    type="number"
                    value={taskForm.deadlineMinutes}
                    onChange={(e) => setTaskForm({ ...taskForm, deadlineMinutes: Number(e.target.value) })}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded px-2 py-1 text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-accent-blue hover:bg-accent-blue-glow text-black font-display uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publish Task Updates</span>
              </button>
            </form>
          </div>

          {/* Mandatory Deliverables Checklist ("Things which should be there") */}
          <div className="panel-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-accent-blue/20">
              <h3 className="font-display text-sm uppercase tracking-wider text-text-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-warning-amber" />
                <span>Required Deliverables Checklist</span>
              </h3>
              <span className="text-[10px] font-mono text-text-secondary">
                {r1State.task.deliverables.length} Items
              </span>
            </div>

            <div className="space-y-2">
              {r1State.task.deliverables.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded bg-bg-primary border border-accent-blue/20 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-medium text-text-primary">{item.label}</span>
                    <span className="text-[10px] font-mono text-accent-blue block">
                      +{item.points} pts • {item.required ? 'Mandatory' : 'Bonus'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveDeliverable(item.id)}
                    className="p-1 rounded text-text-secondary hover:text-danger-red transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Deliverable */}
            <div className="pt-2 border-t border-accent-blue/15 flex gap-2">
              <input
                type="text"
                placeholder="New required item..."
                value={newDeliverableLabel}
                onChange={(e) => setNewDeliverableLabel(e.target.value)}
                className="flex-1 bg-bg-primary border border-accent-blue/30 rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-1 rounded bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/40 text-accent-blue font-mono text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Team Submissions & Manual Grading (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-success-green" />
              <span>Team Submissions & Manual Grading</span>
            </h3>
            <span className="text-[10px] font-mono text-text-secondary">
              {Object.keys(r1State.submissions).length} Submissions Received
            </span>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            {mockTeamsList.map((team) => {
              const sub = r1State.submissions[team.id];
              const isSubmitted = sub !== undefined;
              const isScored = sub?.status === 'SCORED';

              return (
                <div
                  key={team.id}
                  className={`panel-card p-4 border transition-all ${
                    isScored
                      ? 'border-success-green/40 bg-success-green/5'
                      : isSubmitted
                      ? 'border-warning-amber/40 bg-warning-amber/5'
                      : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display uppercase text-sm font-bold text-text-primary">
                          {team.name}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary">
                          ({team.id})
                        </span>
                        {isScored ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-success-green/20 text-success-green font-bold">
                            SCORED (+{sub.evaluation?.totalPoints} PTS)
                          </span>
                        ) : isSubmitted ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-warning-amber/20 text-warning-amber font-bold animate-pulse">
                            PENDING AUDIT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-text-secondary">
                            NOT SUBMITTED
                          </span>
                        )}
                      </div>

                      {/* Links preview if submitted */}
                      {isSubmitted && (
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono">
                          {sub.repoUrl && (
                            <a
                              href={sub.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent-blue hover:underline flex items-center gap-1"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>GitHub Repo</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {sub.liveUrl && (
                            <a
                              href={sub.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-success-green hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Live App</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}

                      {sub?.notes && (
                        <div className="text-[11px] text-text-secondary mt-1 max-w-md line-clamp-1 italic">
                          "{sub.notes}"
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {isSubmitted ? (
                        <button
                          onClick={() => handleOpenEvaluation(team.id)}
                          className="px-4 py-2 rounded-lg bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/40 text-accent-blue-glow font-display uppercase tracking-wider text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isScored ? 'Edit Grade' : 'Check & Grade'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-text-secondary italic">
                          Awaiting Push
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manual Evaluation Modal / Drawer */}
      {evaluatingTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl panel-card p-6 border border-accent-blue/40 bg-bg-elevated shadow-2xl rounded-xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-accent-blue/20">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                  MANUAL CODE AUDIT & SCORE COMMITTAL
                </div>
                <h3 className="text-xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                  Grading {selectedTeamSubmission?.teamName || evaluatingTeamId}
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingTeamId(null)}
                className="p-1 rounded text-text-secondary hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Links inspection */}
            <div className="p-3 rounded-lg bg-bg-primary border border-accent-blue/20 flex flex-wrap gap-4 text-xs font-mono">
              <a
                href={selectedTeamSubmission?.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent-blue hover:underline flex items-center gap-1.5 font-bold"
              >
                <Github className="w-4 h-4" />
                <span>Open GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={selectedTeamSubmission?.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-success-green hover:underline flex items-center gap-1.5 font-bold"
              >
                <Globe className="w-4 h-4" />
                <span>Open Live Deployment</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-5">
              {/* Deliverables Checklist Verification */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold block">
                  1. Check Completed Deliverables ("Things which should be there"):
                </label>
                <div className="space-y-2">
                  {r1State.task.deliverables.map((item) => {
                    const isChecked = checkedDeliverableIds.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleToggleDeliverableCheck(item.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-success-green/15 border-success-green/40 text-text-primary'
                            : 'bg-bg-primary border-accent-blue/20 text-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-success-green shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-text-secondary shrink-0" />
                          )}
                          <span className="text-xs font-medium">{item.label}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-accent-blue shrink-0">
                          +{item.points} pts
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rubric Points Fields */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold block">
                  2. Manual Rubric Scoring:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded bg-bg-primary border border-accent-blue/20 space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary block">
                      Code Quality (0-30):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={codeQualityScore}
                      onChange={(e) => setCodeQualityScore(Number(e.target.value))}
                      className="w-full bg-bg-elevated border border-accent-blue/40 rounded p-1.5 text-sm font-mono text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="p-3 rounded bg-bg-primary border border-accent-blue/20 space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary block">
                      Functionality (0-50):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={functionalityScore}
                      onChange={(e) => setFunctionalityScore(Number(e.target.value))}
                      className="w-full bg-bg-elevated border border-accent-blue/40 rounded p-1.5 text-sm font-mono text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="p-3 rounded bg-bg-primary border border-accent-blue/20 space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary block">
                      Bonus & Speed (0-20):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={bonusScore}
                      onChange={(e) => setBonusScore(Number(e.target.value))}
                      className="w-full bg-bg-elevated border border-accent-blue/40 rounded p-1.5 text-sm font-mono text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Evaluator Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold block">
                  3. Evaluator Remarks & Feedback:
                </label>
                <textarea
                  rows={2}
                  value={evaluatorFeedback}
                  onChange={(e) => setEvaluatorFeedback(e.target.value)}
                  placeholder="Notes on code structure, architecture strengths, or missed items..."
                  className="w-full bg-bg-primary border border-accent-blue/30 rounded p-2 text-xs text-text-primary resize-none font-mono focus:outline-none"
                />
              </div>

              {/* Total Score Display & Action */}
              <div className="pt-3 border-t border-accent-blue/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-text-secondary uppercase">
                    TOTAL AWARDED POINTS
                  </div>
                  <div className="font-mono text-2xl font-bold text-success-green">
                    +{totalCalculatedScore} / {r1State.task.maxPoints} PTS
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEvaluatingTeamId(null)}
                    className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-text-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-success-green hover:bg-emerald-400 text-black font-display uppercase tracking-wider text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Commit & Publish Score</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
