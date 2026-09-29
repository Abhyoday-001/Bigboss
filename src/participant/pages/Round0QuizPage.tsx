import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { RoundAccessGuard } from '../components/RoundAccessGuard';
import {
  eventOperationsService,
  QuizQuestion,
  Round0TeamSubmission,
} from '../../shared/services/eventOperationsService';
import {
  Terminal,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
  Flame,
  BarChart3,
  Award,
} from 'lucide-react';

export const Round0QuizPage: React.FC = () => {
  const { team } = useAuth();
  const { currentPhase } = useEventPhase();
  const navigate = useNavigate();

  const [r0State, setR0State] = useState(eventOperationsService.getRound0State());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [currentSelectedOption, setCurrentSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(r0State.timerPerQuestion || 10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Round0TeamSubmission | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsub = eventOperationsService.subscribe(() => {
      const updated = eventOperationsService.getRound0State();
      setR0State(updated);
    });
    return () => unsub();
  }, []);

  // Check if team already submitted
  useEffect(() => {
    if (team?.id) {
      const existing = eventOperationsService.getRound0Submission(team.id);
      if (existing) {
        setSubmissionResult(existing);
        setIsCompleted(true);
      }
    }
  }, [team?.id]);

  // Anti-cheat window blur/tab-switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isCompleted) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isCompleted]);

  const questions = r0State.questions;
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];
  const timerDuration = r0State.timerPerQuestion || 10;

  // Question countdown tick
  useEffect(() => {
    if (isCompleted || !currentQuestion) return;

    setTimeLeft(timerDuration);
    setCurrentSelectedOption(selectedAnswers[currentQuestion.id] ?? null);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question -> auto-advance!
          handleNextQuestion(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isCompleted, currentQuestion?.id]);

  const handleSelectOption = (index: number) => {
    if (!currentQuestion || isCompleted) return;
    setCurrentSelectedOption(index);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  const handleNextQuestion = (isTimeout: boolean = false) => {
    if (!currentQuestion) return;

    // Record whatever is currently selected
    const updatedAnswers = {
      ...selectedAnswers,
      ...(currentSelectedOption !== null ? { [currentQuestion.id]: currentSelectedOption } : {}),
    };

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all questions!
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = (finalAnswers: Record<string, number>) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCompleted(true);

    const totalElapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const teamId = team?.id || 'team-01';
    const teamName = team?.teamName || 'CyberNexus';

    const result = eventOperationsService.submitRound0Quiz(
      teamId,
      teamName,
      finalAnswers,
      totalElapsedSec
    );
    setSubmissionResult(result);
  };

  // Timer urgency style
  const timerPercentage = (timeLeft / timerDuration) * 100;
  const isUrgent = timeLeft <= 3;
  const isWarning = timeLeft <= 5 && timeLeft > 3;

  if (!isCompleted && currentPhase !== 'ROUND_0_ACTIVE') {
    return (
      <RoundAccessGuard
        requiredPhase="ROUND_0_ACTIVE"
        roundName="Round 0: Rapid Technical Assessment"
        roundNumber={0}
      >
        <div />
      </RoundAccessGuard>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Anti-cheat tab warning */}
        {showTabWarning && (
          <div className="p-3 rounded-lg bg-danger-red/20 border border-danger-red/60 text-danger-red flex items-center justify-between text-xs animate-bounce">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                <strong>SURVEILLANCE WARNING:</strong> Window blur detected ({tabSwitchCount}x).
                Tab switching is strictly logged during speed assessments.
              </span>
            </div>
            <button
              onClick={() => setShowTabWarning(false)}
              className="text-[10px] font-mono underline hover:text-white uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="panel-card p-5 border-l-4 border-l-accent-blue flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>ROUND 00 • RAPID TECHNICAL ASSESSMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
              Speed Elimination & Calibration
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {timerDuration}s per question • Instant submission • Initial House Leaderboard will seed from these results.
            </p>
          </div>

          {!isCompleted && currentQuestion && (
            <div className="flex items-center gap-3 bg-bg-primary/80 border border-accent-blue/30 px-4 py-2.5 rounded-lg">
              <Clock
                className={`w-5 h-5 ${
                  isUrgent
                    ? 'text-danger-red animate-pulse'
                    : isWarning
                    ? 'text-warning-amber'
                    : 'text-accent-blue'
                }`}
              />
              <div>
                <div className="text-[9px] font-mono uppercase text-text-secondary tracking-wider">
                  QUESTION TIMER
                </div>
                <div
                  className={`font-mono text-xl font-bold ${
                    isUrgent
                      ? 'text-danger-red animate-ping'
                      : isWarning
                      ? 'text-warning-amber'
                      : 'text-accent-blue-glow'
                  }`}
                >
                  {timeLeft.toString().padStart(2, '0')}s
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── QUESTION VIEW ── */}
        {!isCompleted && currentQuestion && (
          <div className="panel-card p-6 sm:p-8 space-y-6">
            {/* Progress Bar & Question Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-accent-blue uppercase font-bold">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span className="text-text-secondary">
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-accent-blue/20">
                <div
                  className="h-full bg-accent-blue transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Tense Question Countdown Bar */}
              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    isUrgent ? 'bg-danger-red' : isWarning ? 'bg-warning-amber' : 'bg-accent-blue'
                  }`}
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h2 className="text-lg sm:text-xl font-medium text-text-primary leading-relaxed font-sans">
                {currentQuestion.text}
              </h2>
              <div className="mt-2 text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-warning-amber" />
                <span>Value: {currentQuestion.points} House Points</span>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentSelectedOption === index;
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-3.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-accent-blue/20 border-accent-blue text-white shadow-glow-blue'
                        : 'bg-bg-primary hover:bg-bg-primary/80 border-accent-blue/20 hover:border-accent-blue/50 text-text-primary'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-accent-blue text-black'
                          : 'bg-bg-elevated border border-accent-blue/30 text-accent-blue'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base font-normal">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-accent-blue/20 flex items-center justify-between">
              <span className="text-[11px] font-mono text-text-secondary">
                Auto-advances when timer hits 0s
              </span>
              <button
                onClick={() => handleNextQuestion(false)}
                className="px-6 py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display tracking-wider uppercase text-sm font-bold flex items-center gap-2 glow-blue-sm transition-all cursor-pointer"
              >
                <span>{currentIndex === questions.length - 1 ? 'Lock & Finish' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── COMPLETION & SUBMISSION VIEW ── */}
        {isCompleted && submissionResult && (
          <div className="panel-card p-8 sm:p-10 border-t-4 border-t-success-green space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-success-green/20 border border-success-green/50 flex items-center justify-center mx-auto text-success-green glow-green">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-success-green font-bold">
                ASSESSMENT TRANSMITTED & VERIFIED
              </span>
              <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                Round 0 Performance Logged
              </h2>
              <p className="text-xs text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
                Your team's responses and velocity telemetry have been securely registered with the Control Room.
                The official House Leaderboard is being calculated to seed Round 1 and determine Captaincy contenders.
              </p>
            </div>

            {/* Scorecard Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-2">
              <div className="p-4 rounded-lg bg-bg-primary border border-accent-blue/30 text-center">
                <div className="text-[10px] font-mono uppercase text-text-secondary">POINTS EARNED</div>
                <div className="font-mono text-2xl font-bold text-accent-blue-glow mt-0.5">
                  {submissionResult.score} PTS
                </div>
                <div className="text-[10px] text-text-secondary mt-1">
                  {submissionResult.correctCount} of {submissionResult.totalQuestions} Correct
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bg-primary border border-accent-blue/30 text-center">
                <div className="text-[10px] font-mono uppercase text-text-secondary">ELAPSED TIME</div>
                <div className="font-mono text-2xl font-bold text-warning-amber mt-0.5">
                  {submissionResult.timeTakenSeconds}s
                </div>
                <div className="text-[10px] text-text-secondary mt-1">Speed Factor</div>
              </div>

              <div className="p-4 rounded-lg bg-bg-primary border border-accent-blue/30 text-center">
                <div className="text-[10px] font-mono uppercase text-text-secondary">HOUSE STATUS</div>
                <div className="font-mono text-base font-bold text-success-green mt-1 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>CALIBRATING</span>
                </div>
                <div className="text-[10px] text-text-secondary mt-1">Admin Locking Ranks</div>
              </div>
            </div>

            {/* Action to Dashboard */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display tracking-wider text-sm uppercase font-bold flex items-center justify-center gap-2 shadow-glow-blue transition-all cursor-pointer"
              >
                <span>Return to Surveillance Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
