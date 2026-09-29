/**
 * Event Operations Service
 * Bridges Round 0 (Rapid Assessment Quiz with 10s Timer) and Round 1 (Build Challenge with Manual Checking)
 * between the Admin Control Room and the Participant Panels with local persistence and cross-tab reactive sync.
 */

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points: number;
}

export interface Round0TeamSubmission {
  teamId: string;
  teamName: string;
  answers: Record<string, number>; // questionId -> chosenIndex
  correctCount: number;
  totalQuestions: number;
  score: number;
  timeTakenSeconds: number;
  submittedAt: string;
}

export interface Round0State {
  isActive: boolean;
  timerPerQuestion: number; // default 10 seconds per user requirement
  questions: QuizQuestion[];
  submissions: Record<string, Round0TeamSubmission>;
  initialLeaderboardLocked: boolean;
  initialLeaderboardGeneratedAt?: string;
}

export interface Round1Deliverable {
  id: string;
  label: string;
  points: number;
  required: boolean;
}

export interface Round1TaskDef {
  id: string;
  title: string;
  category: string;
  brief: string;
  deliverables: Round1Deliverable[];
  instructions: string[];
  maxPoints: number;
  deadlineMinutes: number;
}

export interface Round1Evaluation {
  checkedDeliverableIds: string[];
  codeQualityScore: number;
  functionalityScore: number;
  bonusScore: number;
  totalPoints: number;
  feedback: string;
  evaluatedAt: string;
  evaluatorName: string;
}

export interface Round1TeamSubmission {
  teamId: string;
  teamName: string;
  repoUrl: string;
  liveUrl: string;
  notes: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'SCORED';
  evaluation?: Round1Evaluation;
}

export interface Round1State {
  task: Round1TaskDef;
  submissions: Record<string, Round1TeamSubmission>;
  allEvaluationsPublished: boolean;
}

// ─── DEFAULT SEED DATA ────────────────────────────────────────────────────────

export const DEFAULT_ROUND_0_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'In JavaScript Event Loop, which queue has the highest priority after the current call stack clears?',
    options: ['Microtask Queue (Promises, queueMicrotask)', 'Macrotask Queue (setTimeout)', 'Animation Frame Callback Queue', 'I/O Polling Queue'],
    correctIndex: 0,
    explanation: 'Microtasks (resolved promises, process.nextTick) run immediately after current script execution before the next macrotask.',
    points: 20,
  },
  {
    id: 'q2',
    text: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 1,
    explanation: 'Balanced BST search takes logarithmic time O(log N) as the search space is halved at each node.',
    points: 20,
  },
  {
    id: 'q3',
    text: 'Which HTTP status code is most appropriate when a JWT token is valid but the user lacks role permission for a resource?',
    options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '422 Unprocessable Entity'],
    correctIndex: 1,
    explanation: '401 is for unauthenticated callers (missing/invalid credentials). 403 Forbidden is for authenticated callers lacking authorization.',
    points: 20,
  },
  {
    id: 'q4',
    text: 'What does the ACID "I" property stand for in relational database transactions?',
    options: ['Idempotency', 'Integrity', 'Isolation', 'Immutable'],
    correctIndex: 2,
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
    points: 20,
  },
  {
    id: 'q5',
    text: 'In Git, which command safely incorporates remote changes by moving your local commits on top of the fetched branch without a merge commit?',
    options: ['git merge --squash', 'git pull --rebase', 'git checkout -f', 'git cherry-pick --all'],
    correctIndex: 1,
    explanation: 'git pull --rebase replays your local unpushed commits on top of the upstream branch, creating a clean linear commit graph.',
    points: 20,
  },
  {
    id: 'q6',
    text: 'What is the primary architectural purpose of a reverse proxy like NGINX or Envoy in front of web microservices?',
    options: ['Compile TypeScript files on the fly', 'SSL termination, load balancing, and routing isolation', 'Direct database indexing', 'Client-side DOM rendering'],
    correctIndex: 1,
    explanation: 'Reverse proxies shield upstream servers by handling TLS/SSL termination, load distribution, and request routing.',
    points: 20,
  },
];

export const DEFAULT_ROUND_1_TASK: Round1TaskDef = {
  id: 'r1-task-01',
  title: 'Protocol Breach: Real-Time Telemetry & Systems Dashboard',
  category: 'Full-Stack Architecture & Systems',
  brief: 'Your team is tasked with constructing a resilient, cyber-themed surveillance micro-frontend. The dashboard must ingest a simulated event telemetry stream, expose responsive status views, and enforce strict role-based access boundaries.',
  deliverables: [
    { id: 'del-1', label: 'Dark Cyberpunk UI matching design aesthetic & color palette', points: 20, required: true },
    { id: 'del-2', label: 'Live telemetry state management with simulation or websocket stream', points: 25, required: true },
    { id: 'del-3', label: 'Robust error boundaries & offline/fallback state handling', points: 15, required: true },
    { id: 'del-4', label: 'Clean Git repository with modular directory structure & README documentation', points: 20, required: true },
    { id: 'del-5', label: 'Live Hosted Deployment URL (Vercel, Netlify, Render, or Railway)', points: 20, required: true },
  ],
  instructions: [
    'Inspect the challenge parameters and verify all team members are coordinated.',
    'Initialize your solution using modern web tooling (React, Next.js, Vite, or equivalent).',
    'Fulfill all mandatory checklist deliverables before the submission window closes.',
    'Provide the public GitHub repository link and public live deployment URL in your submission panel.',
    'Our evaluation team will manually review your codebase, inspect implementation criteria, and grade each deliverable.',
  ],
  maxPoints: 100,
  deadlineMinutes: 45,
};

const R0_STORAGE_KEY = 'devhouse_round0_state_v1';
const R1_STORAGE_KEY = 'devhouse_round1_state_v1';
const EVENT_BUS_NAME = 'devhouse_operations_update';

class EventOperationsService {
  private r0State: Round0State;
  private r1State: Round1State;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.r0State = this.loadR0State();
    this.r1State = this.loadR1State();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === R0_STORAGE_KEY || e.key === R1_STORAGE_KEY) {
          this.r0State = this.loadR0State();
          this.r1State = this.loadR1State();
          this.notify();
        }
      });
      window.addEventListener(EVENT_BUS_NAME, () => {
        this.r0State = this.loadR0State();
        this.r1State = this.loadR1State();
        this.notify();
      });
    }
  }

  // ─── ROUND 0 METHODS ────────────────────────────────────────────────────────

  public getRound0State(): Round0State {
    return { ...this.r0State };
  }

  public updateRound0Config(update: Partial<Omit<Round0State, 'submissions'>>) {
    this.r0State = { ...this.r0State, ...update };
    this.saveR0State();
    this.broadcast();
  }

  public addRound0Question(q: Omit<QuizQuestion, 'id'>) {
    const newQuestion: QuizQuestion = {
      ...q,
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.r0State.questions = [...this.r0State.questions, newQuestion];
    this.saveR0State();
    this.broadcast();
  }

  public updateRound0Question(id: string, updated: Partial<QuizQuestion>) {
    this.r0State.questions = this.r0State.questions.map((q) => (q.id === id ? { ...q, ...updated } : q));
    this.saveR0State();
    this.broadcast();
  }

  public deleteRound0Question(id: string) {
    this.r0State.questions = this.r0State.questions.filter((q) => q.id !== id);
    this.saveR0State();
    this.broadcast();
  }

  public submitRound0Quiz(
    teamId: string,
    teamName: string,
    answers: Record<string, number>,
    timeTakenSeconds: number
  ): Round0TeamSubmission {
    let correctCount = 0;
    let score = 0;

    this.r0State.questions.forEach((q) => {
      const chosen = answers[q.id];
      if (chosen !== undefined && chosen === q.correctIndex) {
        correctCount += 1;
        score += q.points;
      }
    });

    const submission: Round0TeamSubmission = {
      teamId,
      teamName,
      answers,
      correctCount,
      totalQuestions: this.r0State.questions.length,
      score,
      timeTakenSeconds,
      submittedAt: new Date().toISOString(),
    };

    this.r0State.submissions[teamId] = submission;
    this.saveR0State();
    this.broadcast();
    return submission;
  }

  public getRound0Submission(teamId: string): Round0TeamSubmission | undefined {
    return this.r0State.submissions[teamId];
  }

  /**
   * Generates and locks the initial House Leaderboard based on Round 0 scores and speeds.
   * Updates mock teams in localStorage so the whole app reflects initial rank seeds.
   */
  public generateAndLockInitialLeaderboard(): { teamId: string; rank: number; score: number }[] {
    const allTeams = [
      { id: 'team-01', teamName: 'CyberNexus', baseScore: 850 },
      { id: 'team-02', teamName: 'NullPointers', baseScore: 820 },
      { id: 'team-03', teamName: 'ByteForce', baseScore: 740 },
      { id: 'team-04', teamName: 'GlitchHunters', baseScore: 710 },
      { id: 'team-05', teamName: 'ZeroDay Protocol', baseScore: 660 },
      { id: 'team-06', teamName: 'KernelPanic', baseScore: 610 },
      { id: 'team-07', teamName: 'CodeBreakers', baseScore: 570 },
      { id: 'team-08', teamName: 'BufferOverflow', baseScore: 520 },
      { id: 'team-09', teamName: 'SyntaxErrors', baseScore: 480 },
    ];

    // Seed mock submissions for teams that haven't taken it yet for demo realism
    allTeams.forEach((t, idx) => {
      if (!this.r0State.submissions[t.id]) {
        const dummyCorrect = Math.max(2, this.r0State.questions.length - idx);
        this.r0State.submissions[t.id] = {
          teamId: t.id,
          teamName: t.teamName,
          answers: {},
          correctCount: dummyCorrect,
          totalQuestions: this.r0State.questions.length,
          score: dummyCorrect * 20,
          timeTakenSeconds: 30 + idx * 8,
          submittedAt: new Date().toISOString(),
        };
      }
    });

    // Sort by quiz score desc, then time taken asc
    const sorted = Object.values(this.r0State.submissions).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });

    const ranking = sorted.map((s, index) => ({
      teamId: s.teamId,
      teamName: s.teamName,
      rank: index + 1,
      score: s.score,
    }));

    this.r0State.initialLeaderboardLocked = true;
    this.r0State.initialLeaderboardGeneratedAt = new Date().toISOString();
    this.saveR0State();

    // Sync to main teams storage
    if (typeof localStorage !== 'undefined') {
      try {
        const rawTeams = localStorage.getItem('devhouse_teams');
        const currentTeams = rawTeams ? JSON.parse(rawTeams) : [];
        if (Array.isArray(currentTeams) && currentTeams.length > 0) {
          const updated = currentTeams.map((t) => {
            const found = ranking.find((r) => r.teamId === t.id);
            if (found) {
              return {
                ...t,
                rank: found.rank,
                score: (t.score || 0) + found.score,
                isCaptain: found.rank === 1,
                hasSecretMission: found.rank === 1 || found.rank === 5 || found.rank === ranking.length,
              };
            }
            return t;
          });
          localStorage.setItem('devhouse_teams', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to sync generated leaderboard to teams', e);
      }
    }

    this.broadcast();
    return ranking;
  }

  // ─── ROUND 1 METHODS ────────────────────────────────────────────────────────

  public getRound1State(): Round1State {
    return { ...this.r1State };
  }

  public updateRound1Task(updated: Partial<Round1TaskDef>) {
    this.r1State.task = { ...this.r1State.task, ...updated };
    this.saveR1State();
    this.broadcast();
  }

  public addRound1Deliverable(label: string, points: number = 20, required: boolean = true) {
    const id = `del-${Date.now()}`;
    this.r1State.task.deliverables.push({ id, label, points, required });
    this.saveR1State();
    this.broadcast();
  }

  public removeRound1Deliverable(id: string) {
    this.r1State.task.deliverables = this.r1State.task.deliverables.filter((d) => d.id !== id);
    this.saveR1State();
    this.broadcast();
  }

  public submitRound1TeamWork(
    teamId: string,
    teamName: string,
    submission: { repoUrl: string; liveUrl: string; notes: string }
  ): Round1TeamSubmission {
    const existing = this.r1State.submissions[teamId];
    const newSub: Round1TeamSubmission = {
      teamId,
      teamName,
      repoUrl: submission.repoUrl.trim(),
      liveUrl: submission.liveUrl.trim(),
      notes: submission.notes.trim(),
      submittedAt: new Date().toISOString(),
      status: existing?.status === 'SCORED' ? 'SCORED' : 'SUBMITTED',
      evaluation: existing?.evaluation,
    };

    this.r1State.submissions[teamId] = newSub;
    this.saveR1State();
    this.broadcast();
    return newSub;
  }

  public evaluateRound1Submission(
    teamId: string,
    evalData: {
      checkedDeliverableIds: string[];
      codeQualityScore: number;
      functionalityScore: number;
      bonusScore: number;
      feedback: string;
      evaluatorName?: string;
    }
  ): Round1TeamSubmission {
    const existing = this.r1State.submissions[teamId];
    if (!existing) {
      throw new Error(`Submission for team ${teamId} not found.`);
    }

    // Calculate total points from checked deliverables + rubric scores
    let deliverablesPoints = 0;
    this.r1State.task.deliverables.forEach((d) => {
      if (evalData.checkedDeliverableIds.includes(d.id)) {
        deliverablesPoints += d.points;
      }
    });

    const totalPoints = deliverablesPoints + evalData.codeQualityScore + evalData.functionalityScore + evalData.bonusScore;

    const evaluation: Round1Evaluation = {
      checkedDeliverableIds: evalData.checkedDeliverableIds,
      codeQualityScore: evalData.codeQualityScore,
      functionalityScore: evalData.functionalityScore,
      bonusScore: evalData.bonusScore,
      totalPoints,
      feedback: evalData.feedback,
      evaluatedAt: new Date().toISOString(),
      evaluatorName: evalData.evaluatorName || 'Lead Auditor',
    };

    const updated: Round1TeamSubmission = {
      ...existing,
      status: 'SCORED',
      evaluation,
    };

    this.r1State.submissions[teamId] = updated;
    this.saveR1State();

    // Credit score to house leaderboard in localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const rawTeams = localStorage.getItem('devhouse_teams');
        if (rawTeams) {
          const teams = JSON.parse(rawTeams);
          const idx = teams.findIndex((t: any) => t.id === teamId);
          if (idx !== -1) {
            teams[idx].score = (teams[idx].score || 0) + totalPoints;
            localStorage.setItem('devhouse_teams', JSON.stringify(teams));
          }
        }
      } catch (err) {
        console.error('Failed to credit round 1 score to team roster', err);
      }
    }

    this.broadcast();
    return updated;
  }

  // ─── SUBSCRIPTION / SYNC ────────────────────────────────────────────────────

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Error notifying event operations listener', e);
      }
    });
  }

  private broadcast() {
    this.notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_BUS_NAME));
    }
  }

  private loadR0State(): Round0State {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(R0_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to load Round 0 state', e);
      }
    }
    return {
      isActive: true,
      timerPerQuestion: 10, // 10 seconds per question requirement
      questions: [...DEFAULT_ROUND_0_QUESTIONS],
      submissions: {
        'team-01': {
          teamId: 'team-01',
          teamName: 'CyberNexus',
          answers: { q1: 0, q2: 1, q3: 1, q4: 2, q5: 1, q6: 1 },
          correctCount: 6,
          totalQuestions: 6,
          score: 120,
          timeTakenSeconds: 38,
          submittedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        'team-02': {
          teamId: 'team-02',
          teamName: 'NullPointers',
          answers: { q1: 0, q2: 1, q3: 1, q4: 2, q5: 0, q6: 1 },
          correctCount: 5,
          totalQuestions: 6,
          score: 100,
          timeTakenSeconds: 44,
          submittedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        },
      },
      initialLeaderboardLocked: false,
    };
  }

  private saveR0State() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(R0_STORAGE_KEY, JSON.stringify(this.r0State));
      } catch (e) {
        console.error('Failed to save Round 0 state', e);
      }
    }
  }

  private loadR1State(): Round1State {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(R1_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to load Round 1 state', e);
      }
    }
    return {
      task: { ...DEFAULT_ROUND_1_TASK },
      submissions: {
        'team-01': {
          teamId: 'team-01',
          teamName: 'CyberNexus',
          repoUrl: 'https://github.com/cybernexus/devhouse-telemetry-grid',
          liveUrl: 'https://cybernexus-grid.vercel.app',
          notes: 'Built with React 18, Tailwind, Lucide icons, and simulated WebSockets telemetry pump. Passes all security checks.',
          submittedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          status: 'SCORED',
          evaluation: {
            checkedDeliverableIds: ['del-1', 'del-2', 'del-3', 'del-4', 'del-5'],
            codeQualityScore: 25,
            functionalityScore: 40,
            bonusScore: 15,
            totalPoints: 100,
            feedback: 'Exceptional clean code structure, smooth dark neon aesthetic, and proper fallback state handling.',
            evaluatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            evaluatorName: 'Lead Auditor Aryan',
          },
        },
        'team-02': {
          teamId: 'team-02',
          teamName: 'NullPointers',
          repoUrl: 'https://github.com/nullpointers/telemetry-breach-r1',
          liveUrl: 'https://nullpointers-r1.netlify.app',
          notes: 'Implemented using Vite + TypeScript. Includes error boundary fallbacks and responsive layouts.',
          submittedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          status: 'SUBMITTED',
        },
      },
      allEvaluationsPublished: false,
    };
  }

  private saveR1State() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(R1_STORAGE_KEY, JSON.stringify(this.r1State));
      } catch (e) {
        console.error('Failed to save Round 1 state', e);
      }
    }
  }
}

export const eventOperationsService = new EventOperationsService();
