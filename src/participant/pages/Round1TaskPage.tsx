import React, { useState, useEffect } from 'react';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { TimerCountdown } from '../../shared/components/TimerCountdown';
import { MOCK_ROUND_1_TASK } from '../../shared/mocks/mockData';
import { TaskRound1 } from '../../shared/state-machine/types';
import { Terminal, Send, CheckCircle2, AlertCircle, FileCode, Check } from 'lucide-react';

const STORAGE_SUBMISSION_KEY = 'devhouse_r1_submission_state';

export const Round1TaskPage: React.FC = () => {
  const { targetEndTime } = useEventPhase();

  const [task, setTask] = useState<TaskRound1>(MOCK_ROUND_1_TASK);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPointsConfirmed, setIsPointsConfirmed] = useState(false);

  // Restore saved submission state if reloaded
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_SUBMISSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubmissionUrl(parsed.url || '');
        setTask((prev) => ({
          ...prev,
          status: parsed.status,
          pointsAwarded: parsed.pointsAwarded,
        }));
        if (parsed.status === 'SCORED') {
          setIsPointsConfirmed(true);
        }
      } catch (e) {
        console.error('Error parsing stored submission', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) {
      setErrorMsg('Please provide a repository link, pull request, or verifiable deployment URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Realistic API submission simulation
    await new Promise((res) => setTimeout(res, 1200));
    setIsSubmitting(false);

    const updatedTask: TaskRound1 = {
      ...task,
      status: 'SCORED',
      pointsAwarded: 300,
      submissionUrl: submissionUrl.trim(),
    };

    setTask(updatedTask);
    setIsPointsConfirmed(true);

    // Save to localStorage for reload resilience per acceptance criteria
    localStorage.setItem(
      STORAGE_SUBMISSION_KEY,
      JSON.stringify({
        url: submissionUrl.trim(),
        status: 'SCORED',
        pointsAwarded: 300,
      })
    );
  };

  const handleResetForTesting = () => {
    localStorage.removeItem(STORAGE_SUBMISSION_KEY);
    setTask(MOCK_ROUND_1_TASK);
    setSubmissionUrl('');
    setIsPointsConfirmed(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Header & Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 panel-card p-5 border-l-4 border-l-accent-blue">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>ROUND 01 • TASK CHALLENGE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono text-text-secondary uppercase">TIME REMAINING</div>
              <div className="text-xs text-accent-blue">Window Closes</div>
            </div>
            <TimerCountdown targetTimestamp={targetEndTime} size="md" />
          </div>
        </div>

        {/* Points Confirmation Banner (if scored) */}
        {isPointsConfirmed && (
          <div className="p-4 rounded-lg bg-success-green/15 border border-success-green/50 flex items-center justify-between gap-4 glow-green animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success-green/20 text-success-green">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-display text-lg uppercase tracking-wider text-text-primary">
                  Submission Verified & Points Confirmed!
                </div>
                <div className="text-xs text-success-green">
                  +{task.pointsAwarded || 300} points credited to your team. Leaderboard has been updated.
                </div>
              </div>
            </div>
            <button
              onClick={handleResetForTesting}
              className="text-[11px] font-mono text-text-secondary hover:text-white underline"
            >
              Reset for demo
            </button>
          </div>
        )}

        {/* Main Task Brief Card */}
        <div className="panel-card p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-accent-blue font-semibold">
              MISSION BRIEFING
            </span>
            <p className="mt-2 text-sm sm:text-base text-text-primary leading-relaxed">
              {task.brief}
            </p>
          </div>

          {/* Guidelines / Specifications */}
          <div className="bg-bg-primary p-5 rounded-lg border border-accent-blue/20">
            <h3 className="font-display text-base uppercase tracking-wider text-accent-blue-glow mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              <span>Technical Acceptance Criteria</span>
            </h3>
            <ul className="space-y-2.5">
              {task.instructions.map((inst, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-text-secondary">
                  <span className="font-mono text-accent-blue font-bold mt-0.5">[{index + 1}]</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Interface */}
          <div className="pt-4 border-t border-accent-blue/20">
            <h3 className="font-display text-xl uppercase tracking-wider text-text-primary mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-accent-blue" />
              <span>Deliverable Submission</span>
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Enter the GitHub repository link, live deployment endpoint, or pull request URL for your team's solution.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-danger-red/15 border border-danger-red/40 text-xs text-danger-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/team-repo/task-01 or commit hash"
                disabled={task.status === 'SCORED' || isSubmitting}
                className="flex-1 bg-bg-primary border border-accent-blue/30 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow focus:ring-1 focus:ring-accent-blue-glow disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={task.status === 'SCORED' || isSubmitting}
                className={`px-6 py-2.5 rounded-lg font-display text-base tracking-wider uppercase font-bold flex items-center justify-center gap-2 transition-all ${
                  task.status === 'SCORED'
                    ? 'bg-success-green/20 border border-success-green/40 text-success-green cursor-default'
                    : 'bg-accent-blue hover:bg-accent-blue-glow text-black glow-blue-sm'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <span className="font-mono text-xs">AUDITING...</span>
                ) : task.status === 'SCORED' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>LOCKED & SCORED</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT MISSION</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
