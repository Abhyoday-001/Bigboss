export type EventPhase =
  | 'NOT_STARTED'
  | 'ROUND_1_TASK'
  | 'ROUND_2_CAPTAINCY'
  | 'ROUND_2_SECRET_TASK'
  | 'ROUND_2_NOMINATIONS'
  | 'ROUND_3_IMMUNITY'
  | 'ROUND_3_VOTING'
  | 'ROUND_3_EVICTION'
  | 'ROUND_4_FINALE'
  | 'EVENT_ENDED';

export type RoundStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface EventState {
  currentPhase: EventPhase;
  phaseLabel: string;
  roundNumber: number;
  status: RoundStatus;
  roundName: string;
  roundDescription: string;
  timer: {
    durationSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    serverTimestamp: number;
  };
  teamCounts: {
    total: number;
    active: number;
    nominated: number;
    eliminated: number;
    safe: number;
  };
  lastUpdated: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  score: number;
  status: 'ACTIVE' | 'NOMINATED' | 'EVICTED' | 'IMMUNE' | 'CAPTAIN';
  avatar?: string;
  rank: number;
}
