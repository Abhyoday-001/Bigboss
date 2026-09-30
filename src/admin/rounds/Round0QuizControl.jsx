import React, { useState, useEffect } from 'react';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import {
  eventOperationsService,
  DEFAULT_ROUND_0_QUESTIONS,
} from '../../shared/services/eventOperationsService';
import {
  HelpCircle,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Users,
  Trophy,
  Zap,
  Lock,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function Round0QuizControl() {
  const { currentPhase, setPhase } = useEventPhase();
  const [r0State, setR0State] = useState(eventOperationsService.getRound0State());
  const [timerSeconds, setTimerSeconds] = useState(r0State.timerPerQuestion || 10);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    points: 20,
    explanation: '',
  });
  const [actionNotice, setActionNotice] = useState(null);

  // Subscribe to reactive service changes
  useEffect(() => {
    const unsub = eventOperationsService.subscribe(() => {
      setR0State(eventOperationsService.getRound0State());
    });
    return () => unsub();
  }, []);

  const handleUpdateTimer = (val) => {
    const clamped = Math.max(5, Math.min(60, val));
    setTimerSeconds(clamped);
    eventOperationsService.updateRound0Config({ timerPerQuestion: clamped });
    showNotice(`Question countdown timer set to ${clamped} seconds.`);
  };

  const handleToggleActive = () => {
    const nextActive = !r0State.isActive;
    eventOperationsService.updateRound0Config({ isActive: nextActive });
    if (nextActive) {
      setPhase('ROUND_0_ACTIVE');
    } else {
      setPhase('ROUND_0_RESULTS');
    }
    showNotice(
      `Round 0 Assessment is now ${
        nextActive
          ? 'LIVE (Participants auto-navigated to /round-0)'
          : 'LOCKED (Standby Mode)'
      }.`
    );
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.text.trim()) return;

    eventOperationsService.addRound0Question(newQuestion);
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 20,
      explanation: '',
    });
    setIsEditingQuestion(false);
    showNotice('New question added to Round 0 Question Bank.');
  };

  const handleDeleteQuestion = (id) => {
    eventOperationsService.deleteRound0Question(id);
    showNotice('Question deleted from Question Bank.');
  };

  const handleGenerateLeaderboard = () => {
    const ranking = eventOperationsService.generateAndLockInitialLeaderboard();
    showNotice(
      `Initial House Leaderboard locked! Ranks 1 to ${ranking.length} established and synced across all participant panels.`
    );
  };

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const allMockTeams = [
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

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3 rounded-lg bg-accent-blue/15 border border-accent-blue/40 text-accent-blue-glow font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-accent-blue" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header & Global Controls */}
      <div className="panel-card p-6 border-l-4 border-l-accent-blue flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ROUND 0 CONTROL • RAPID EVALUATION QUIZ</span>
          </div>
          <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
            Question Bank & Initial Leaderboard Seeder
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Configure the 10-second rapid fire assessment. When finished, lock rankings to establish
            initial house standings for Round 1 and Captaincy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 10s Timer Config */}
          <div className="bg-bg-primary px-3 py-2 rounded-lg border border-accent-blue/30 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning-amber" />
            <div className="text-left">
              <div className="text-[9px] font-mono uppercase text-text-secondary">Timer / Question</div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={timerSeconds}
                  onChange={(e) => handleUpdateTimer(Number(e.target.value))}
                  className="w-12 bg-bg-elevated border border-accent-blue/40 rounded px-1.5 py-0.5 text-xs font-mono text-text-primary focus:outline-none"
                />
                <span className="text-[11px] font-mono text-accent-blue font-bold">sec</span>
              </div>
            </div>
          </div>

          {/* Active / Lock Toggle */}
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2.5 rounded-lg font-display text-xs tracking-wider uppercase font-bold flex items-center gap-2 cursor-pointer transition-all ${
              r0State.isActive
                ? 'bg-success-green/20 border border-success-green/40 text-success-green hover:bg-success-green/30'
                : 'bg-danger-red/20 border border-danger-red/40 text-danger-red hover:bg-danger-red/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{r0State.isActive ? 'Status: Active' : 'Status: Paused'}</span>
          </button>

          {/* Lock Initial Leaderboard */}
          <button
            onClick={handleGenerateLeaderboard}
            className="px-5 py-2.5 rounded-lg bg-warning-amber hover:bg-amber-400 text-black font-display text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Lock Initial Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Grid: Question Bank Manager & Live Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Bank (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-accent-blue" />
              <span>Questions in Active Bank ({r0State.questions.length})</span>
            </h3>
            <button
              onClick={() => setIsEditingQuestion(!isEditingQuestion)}
              className="px-3 py-1.5 rounded-md bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/40 text-accent-blue font-mono text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEditingQuestion ? 'Cancel' : 'Add Question'}</span>
            </button>
          </div>

          {/* Add Question Form */}
          {isEditingQuestion && (
            <form onSubmit={handleAddQuestion} className="panel-card p-5 border border-accent-blue/40 space-y-4 animate-in fade-in">
              <div className="text-xs font-mono uppercase text-accent-blue font-bold">
                Create New Assessment Question
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-secondary">Question Text:</label>
                <input
                  type="text"
                  required
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="e.g. Which command reverts a Git commit safely?"
                  className="w-full bg-bg-primary border border-accent-blue/30 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {newQuestion.options.map((opt, i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary">
                      Option {String.fromCharCode(65 + i)}:
                    </label>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newQuestion.options];
                        copy[i] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: copy });
                      }}
                      placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                      className="w-full bg-bg-primary border border-accent-blue/30 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-mono text-text-secondary block mb-1">
                    Correct Option:
                  </label>
                  <select
                    value={newQuestion.correctIndex}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctIndex: Number(e.target.value) })}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none"
                  >
                    {newQuestion.options.map((_, i) => (
                      <option key={i} value={i}>
                        Option {String.fromCharCode(65 + i)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-secondary block mb-1">
                    Points:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-accent-blue hover:bg-accent-blue-glow text-black font-display uppercase tracking-wider text-xs font-bold cursor-pointer transition-all"
              >
                Save Question to Bank
              </button>
            </form>
          )}

          {/* Question List Cards */}
          <div className="space-y-3">
            {r0State.questions.map((q, idx) => (
              <div key={q.id} className="panel-card p-4 space-y-2 border border-accent-blue/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-accent-blue/20 text-accent-blue font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-text-primary leading-snug">
                        {q.text}
                      </h4>
                      <div className="text-[10px] font-mono text-text-secondary mt-1">
                        Points: <span className="text-accent-blue font-bold">+{q.points}</span> • Timer: {timerSeconds}s
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1 rounded text-text-secondary hover:text-danger-red hover:bg-white/5 transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Options display */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
                  {q.options.map((opt, oIndex) => {
                    const isCorrect = q.correctIndex === oIndex;
                    return (
                      <div
                        key={oIndex}
                        className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 ${
                          isCorrect
                            ? 'bg-success-green/15 border-success-green/40 text-success-green font-bold'
                            : 'bg-bg-primary/60 border-accent-blue/15 text-text-secondary'
                        }`}
                      >
                        <span className="shrink-0">{String.fromCharCode(65 + oIndex)}.</span>
                        <span className="truncate">{opt}</span>
                        {isCorrect && <Check className="w-3 h-3 ml-auto text-success-green shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Telemetry & Leaderboard Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-warning-amber" />
              <span>Live Team Progress & Velocity</span>
            </h3>
            <span className="text-[10px] font-mono text-text-secondary">
              {Object.keys(r0State.submissions).length} Submitted
            </span>
          </div>

          <div className="panel-card p-4 space-y-3">
            <div className="text-xs text-text-secondary leading-relaxed">
              Teams are graded by <strong>Total Points</strong> first, then tie-broken by <strong>Completion Speed</strong>.
            </div>

            <div className="space-y-2 pt-1 max-h-[500px] overflow-y-auto">
              {allMockTeams.map((team, idx) => {
                const sub = r0State.submissions[team.id];
                const isSubmitted = sub !== undefined;

                return (
                  <div
                    key={team.id}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isSubmitted
                        ? 'bg-bg-primary border-accent-blue/30'
                        : 'bg-bg-primary/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-text-primary">
                          {team.name}
                        </span>
                        {isSubmitted ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-success-green/20 text-success-green font-bold">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-warning-amber/15 text-warning-amber">
                            PENDING
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-text-secondary mt-0.5">
                        ID: {team.id}
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      {isSubmitted ? (
                        <>
                          <div className="font-mono text-sm font-bold text-accent-blue-glow">
                            {sub.score} PTS
                          </div>
                          <div className="text-[10px] font-mono text-text-secondary">
                            {sub.correctCount}/{sub.totalQuestions} • Duration: {sub.timeTakenSeconds}s
                          </div>
                          {sub.submittedAt && (
                            <div className="text-[10px] font-mono text-accent-blue flex items-center justify-end gap-1 font-semibold">
                              <Clock className="w-3 h-3 text-accent-blue" />
                              <span>
                                {new Date(sub.submittedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[10px] font-mono text-text-secondary">
                          -- pts
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
