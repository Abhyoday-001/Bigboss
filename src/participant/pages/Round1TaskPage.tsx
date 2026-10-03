import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { TimerCountdown } from '../../shared/components/TimerCountdown';
import { RoundAccessGuard } from '../components/RoundAccessGuard';
import {
  eventOperationsService,
  Round1TaskDef,
  Round1TeamSubmission,
} from '../../shared/services/eventOperationsService';
import {
  Terminal,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Check,
  Globe,
  Github,
  Clock,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useSocket } from '../../shared/socket/SocketProvider';

export const Round1TaskPage: React.FC = () => {
  const { team } = useAuth();
  const navigate = useNavigate();
  const { targetEndTime, currentPhase } = useEventPhase();
  const { socket } = useSocket();

  const [r1State, setR1State] = useState(eventOperationsService.getRound1State());
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);

  useEffect(() => {
    if (!liveUrl) setLiveUrl('https://dummy.com');
  }, [liveUrl]);



  useEffect(() => {
    if (typeof liveUrl === 'string' && !liveUrl.trim()) {
      setLiveUrl('https://dummy.com');
    }
  }, [liveUrl]);

  // Subscribe to service updates (e.g. when Admin evaluates or changes task)
  useEffect(() => {
    const unsub = eventOperationsService.subscribe(() => {
      setR1State(eventOperationsService.getRound1State());
    });
    return () => unsub();
  }, []);

  const teamId = team?.id || 'team-01';
  const teamName = team?.teamName || 'CyberNexus';
  const submission: Round1TeamSubmission | undefined = r1State.submissions[teamId];
  const isEvaluated = submission?.status === 'SCORED';
  const isSubmitted = submission !== undefined;

  // Restore fields from existing submission
  useEffect(() => {
    if (submission) {
      setRepoUrl(submission.repoUrl || '');
      setLiveUrl(submission.liveUrl || '');
      setNotes(submission.notes || '');
    }
  }, [submission?.submittedAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setErrorMsg('Please provide a valid GitHub repository URL.');
      return;
    }
    /*
    if (!liveUrl.trim()) {
      setErrorMsg('Please provide a live deployment URL (e.g. Vercel, Netlify, or Render).');
      return;
    }
    */

    setIsSubmitting(true);
    setErrorMsg(null);

    // Realistic brief submission lag
    await new Promise((res) => setTimeout(res, 800));

    eventOperationsService.submitRound1TeamWork(teamId, teamName, {
      repoUrl,
      liveUrl,
      notes,
    });
    
    if (import.meta.env.VITE_USE_SOCKET === 'true' && socket) {
      socket.emit('verification:ready', {
        repoUrl,
        liveUrl,
        notes,
      });
    }

    setIsSubmitting(false);
    if (isSubmitted) setShowWaitingModal(true);
    setSuccessNotice('Build submission recorded! The checking team has received your deliverable links for manual evaluation.');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const task: Round1TaskDef = r1State.task;

  if (!isSubmitted && currentPhase !== 'ROUND_1_ACTIVE') {
    return (
      <RoundAccessGuard
        requiredPhase="ROUND_1_ACTIVE"
        roundName="Round 1: Rapid Task Challenge"
        roundNumber={1}
      >
        <div />
      </RoundAccessGuard>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <style>{`
        /* Hide Live URL and Notes inputs */
        form > div.space-y-3\\.5 > div:nth-child(2),
        form > div.space-y-3\\.5 > div:nth-child(3) {
          display: none !important;
        }
        /* Hide mention of deployment endpoints in description */
        .lg\\:col-span-1 .text-xs.text-text-secondary.mt-1 {
          font-size: 0;
        }
        .lg\\:col-span-1 .text-xs.text-text-secondary.mt-1::before {
          content: "Provide your repository for the manual evaluation team.";
          font-size: 0.75rem;
        }
      `}</style>
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Header & Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 panel-card p-5 border-l-4 border-l-accent-blue">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>ROUND 01 • BUILD & SYSTEMS CHALLENGE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
              {task.title}
            </h1>
            <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
              <span className="font-mono text-accent-blue">{task.category}</span>
              <span>•</span>
              <span>Max Value: Confidential</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono text-text-secondary uppercase">TIME REMAINING</div>
              <div className="text-xs text-accent-blue">Window Closes</div>
            </div>
            <TimerCountdown targetTimestamp={targetEndTime} size="md" />
          </div>
        </div>

        {/* Evaluation Banner */}
        {isEvaluated && submission.evaluation && (
          <div className="p-5 rounded-xl bg-success-green/15 border border-success-green/50 space-y-3 glow-green animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-success-green/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-success-green/25 text-success-green">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display text-lg uppercase tracking-wider text-text-primary">
                    Manual Evaluation Complete
                  </div>
                  <div className="text-xs text-success-green">
                    Audited by {submission.evaluation.evaluatorName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Under Review Banner (If Submitted but not scored) */}
        {isSubmitted && !isEvaluated && (
          <div className="p-4 rounded-xl bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-between gap-4 text-warning-amber">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 animate-pulse shrink-0" />
              <div>
                <div className="font-display text-sm uppercase tracking-wider text-text-primary font-bold">
                  Build Submitted — Awaiting Manual Evaluation
                </div>
                <div className="text-xs text-text-secondary">
                  The checking team has received your URLs. Performance will be evaluated manually based on your code and live deliverables.
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-warning-amber/20 border border-warning-amber/40 font-mono text-xs font-bold shrink-0 uppercase">
              In Review
            </span>
          </div>
        )}

        {/* Task Briefing & Required Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission Briefing */}
          <div className="lg:col-span-2 panel-card p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-accent-blue font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>MISSION SPECIFICATION & BRIEF</span>
              </span>
              <p className="mt-2 text-sm sm:text-base text-text-primary leading-relaxed font-sans">
                {task.brief}
              </p>
            </div>

            {/* Checklist of "Things which should be there" */}
            <div className="bg-bg-primary p-5 rounded-lg border border-accent-blue/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base uppercase tracking-wider text-accent-blue-glow flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  <span>Mandatory Deliverables Checklist</span>
                </h3>
                <span className="text-[10px] font-mono text-text-secondary uppercase">
                  Inspected during manual checking
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {task.deliverables.map((item, index) => {
                  const isCheckedByAdmin = submission?.evaluation?.checkedDeliverableIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                        isCheckedByAdmin
                          ? 'bg-success-green/10 border-success-green/40 text-text-primary'
                          : 'bg-bg-elevated/40 border-accent-blue/20 text-text-secondary'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCheckedByAdmin ? (
                          <div className="w-4 h-4 rounded bg-success-green text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-accent-blue/40 text-accent-blue flex items-center justify-center font-mono text-[9px]">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-text-primary font-medium">{item.label}</div>
                        <div className="text-[10px] font-mono text-text-secondary mt-0.5">
                          {item.required ? 'Mandatory' : 'Optional Bonus'}
                        </div>
                      </div>
                      {isCheckedByAdmin && (
                        <span className="text-[10px] font-mono text-success-green font-bold uppercase shrink-0">
                          Verified
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold">
                OPERATIONAL GUIDELINES
              </h4>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {task.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-accent-blue">[{i + 1}]</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Submission Interface */}
          <div className="lg:col-span-1 panel-card p-6 space-y-5 flex flex-col">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-accent-blue font-bold flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>BUILD SUBMISSION</span>
              </div>
              <h3 className="font-display text-xl uppercase tracking-wider text-text-primary mt-1">
                Deploy & Transmit
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Provide your repository and deployment endpoints for the manual evaluation team.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-danger-red/15 border border-danger-red/40 text-xs text-danger-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 rounded bg-success-green/15 border border-success-green/40 text-xs text-success-green flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* GitHub Repo Link */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-accent-blue" />
                    <span>GitHub Repository URL:</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/team-repo/challenge"
                    disabled={isEvaluated || isSubmitting}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg px-3.5 py-2 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow disabled:opacity-60 font-mono"
                  />
                </div>

                {/* Live Hosted URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-accent-blue" />
                    <span>Live Deployment URL:</span>
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://team-demo.vercel.app"
                    disabled={isEvaluated || isSubmitting}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg px-3.5 py-2 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow disabled:opacity-60 font-mono"
                  />
                </div>

                {/* Architecture Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-accent-blue" />
                    <span>Operational & Architecture Notes:</span>
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe tech stack, key components, commands to test, and highlight completed checklist deliverables..."
                    disabled={isEvaluated || isSubmitting}
                    className="w-full bg-bg-primary border border-accent-blue/30 rounded-lg p-3 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-blue-glow disabled:opacity-60 resize-none font-mono"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isEvaluated || isSubmitting}
                className={`w-full py-3 rounded-lg font-display text-sm tracking-wider uppercase font-bold flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer ${
                  isEvaluated
                    ? 'bg-success-green/20 border border-success-green/40 text-success-green cursor-default'
                    : 'bg-accent-blue hover:bg-accent-blue-glow text-black glow-blue-sm'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <span className="font-mono text-xs">TRANSMITTING...</span>
                ) : isEvaluated ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>EVALUATION LOCKED</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>UPDATE SUBMISSION</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT FOR MANUAL EVALUATION</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {showWaitingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-primary border border-accent-blue/40 p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl relative glow-blue-sm">
            {/*
            <button 
              onClick={() => setShowWaitingModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              ✕
            </button>
            */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-display uppercase tracking-wide text-text-primary">
                Submission Updated
              </h3>
              <p className="text-sm text-text-secondary">
                Waiting for the host to begin the round 2.
              </p>
              {/*
              <button 
                onClick={() => setShowWaitingModal(false)}
                className="mt-4 px-6 py-2 bg-accent-blue text-black font-bold font-mono text-xs rounded hover:bg-accent-blue-glow w-full uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
              */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
