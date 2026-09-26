export type EventPhase =
  | 'LANDING'
  | 'LOGIN'
  | 'ROUND_1_ACTIVE'
  | 'ROUND_1_RESULTS'
  | 'ROUND_2_CAPTAINCY'
  | 'ROUND_2_NOMINATIONS'
  | 'ROUND_2_SECRET_TASK'
  | 'ROUND_3_IMMUNITY'
  | 'ROUND_3_VOTING'
  | 'ROUND_3_EVICTION_REVEAL'
  | 'ROUND_4_FEATURES_REVEALED'
  | 'ROUND_4_SUBMISSION'
  | 'ROUND_4_JUDGING'
  | 'FINAL_RESULTS';

export interface PhaseMetadata {
  id: EventPhase;
  roundNumber: number | null;
  roundTitle: string;
  subPhaseTitle: string;
  description: string;
  nextPhase: EventPhase | null;
  isTimed: boolean;
  participantRoute: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  usn?: string;
}

export interface Team {
  id: string;
  teamName: string;
  avatarUrl?: string;
  members: TeamMember[];
  score: number;
  rank: number;
  previousRank: number;
  isCaptain?: boolean;
  isNominated?: boolean;
  isEliminated?: boolean;
  isImmune?: boolean;
  hasSecretMission?: boolean;
  tableNumber?: string;
}

export interface TaskRound1 {
  id: string;
  title: string;
  brief: string;
  instructions: string[];
  maxPoints: number;
  deadlineTimestamp: number; // Unix epoch ms
  submissionUrl?: string;
  status: 'PENDING' | 'SUBMITTED' | 'SCORED';
  pointsAwarded?: number;
  feedback?: string;
}

export interface CaptaincyState {
  activeChallengers: {
    teamId: string;
    teamName: string;
    score: number;
    completed: boolean;
  }[];
  captainTeamId: string | null;
  captainTeamName: string | null;
  isRevealed: boolean;
  advantageDescription: string;
}
