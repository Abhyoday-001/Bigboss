/**
 * API Contracts & Data Types for Spoorthi's Modules (Rounds 2, 3, 4 Admin Tools)
 * Derived strictly from spoorthi.md and PRD.md
 */

export const RoundPhases = {
  ROUND_2_CAPTAINCY: 'ROUND_2_CAPTAINCY',
  ROUND_2_NOMINATIONS: 'ROUND_2_NOMINATIONS',
  ROUND_2_SECRET_TASK: 'ROUND_2_SECRET_TASK',
  ROUND_3_IMMUNITY: 'ROUND_3_IMMUNITY',
  ROUND_3_VOTING: 'ROUND_3_VOTING',
  ROUND_3_EVICTION_REVEAL: 'ROUND_3_EVICTION_REVEAL',
  ROUND_4_FEATURES_REVEALED: 'ROUND_4_FEATURES_REVEALED',
  ROUND_4_SUBMISSION: 'ROUND_4_SUBMISSION',
  ROUND_4_JUDGING: 'ROUND_4_JUDGING',
  FINAL_RESULTS: 'FINAL_RESULTS',
};

export const MissionStatuses = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const TeamStatuses = {
  ACTIVE: 'active',
  SAFE: 'safe',
  NOMINATED: 'nominated',
  IMMUNE: 'immune',
  EVICTED: 'evicted',
};

export const VoterRoles = {
  JUDGES: 'judges',
  PARTICIPANTS: 'participants',
  AUDIENCE: 'audience',
  MIXED: 'mixed',
};
