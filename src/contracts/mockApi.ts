export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------------------------
// Secret Mission Mock
// ---------------------------

export type MissionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface SecretMissionResponse {
  isAssigned: boolean;
  brief?: string;
  status?: MissionStatus;
}

// Dev toggle to test different states
export let MOCK_SCENARIO_SECRET_MISSION: 'ASSIGNED' | 'NOT_ASSIGNED_FLAG' | 'NOT_ASSIGNED_403' = 'ASSIGNED';

export const fetchSecretMission = async (teamId: string): Promise<SecretMissionResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_SCENARIO_SECRET_MISSION === 'NOT_ASSIGNED_403') {
        reject(new HttpError(403, 'Forbidden: Your team is not assigned a secret mission.'));
        return;
      }

      if (MOCK_SCENARIO_SECRET_MISSION === 'NOT_ASSIGNED_FLAG') {
        resolve({ isAssigned: false });
        return;
      }

      resolve({
        isAssigned: true,
        brief: 'INFILTRATE THE JUDGES PANEL. Find the hidden criteria for Round 4 without being detected by the other teams.',
        status: 'PENDING'
      });
    }, 1500); // simulate network delay
  });
};

// ---------------------------
// Nomination Mock
// ---------------------------
export interface NominationResponse {
  isNominated: boolean;
  reason?: string;
  nextSteps?: string;
}

export let MOCK_SCENARIO_NOMINATION: 'NOMINATED' | 'SAFE' = 'NOMINATED';

export const fetchNominationStatus = async (teamId: string): Promise<NominationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_SCENARIO_NOMINATION === 'NOMINATED') {
        resolve({
          isNominated: true,
          reason: 'Your team fell into the bottom 30% during the Round 1 build challenge.',
          nextSteps: 'Prepare for the Immunity Challenge. You will be paired with a Safe team.'
        });
      } else {
        resolve({
          isNominated: false,
          nextSteps: 'You are safe from eviction this round. You may be called upon to support a nominated team in the Immunity Challenge.'
        });
      }
    }, 1000);
  });
};

// ---------------------------
// Immunity Mock
// ---------------------------
export type ImmunityOutcome = 'PENDING' | 'WON' | 'LOST' | null;

export interface ImmunityResponse {
  isParticipating: boolean;
  pairedTeam?: { id: string; name: string; role: 'SAFE' | 'NOMINATED' };
  challenge?: { title: string; description: string };
  outcome?: ImmunityOutcome;
}

export let MOCK_SCENARIO_IMMUNITY: 'PENDING' | 'WON' | 'LOST' | 'NOT_PARTICIPATING' = 'PENDING';

export const fetchImmunityDetails = async (teamId: string): Promise<ImmunityResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_SCENARIO_IMMUNITY === 'NOT_PARTICIPATING') {
        resolve({ isParticipating: false });
        return;
      }
      resolve({
        isParticipating: true,
        pairedTeam: { id: 'team-3', name: 'Code Blooded', role: 'SAFE' },
        challenge: {
          title: 'Blind Pair Programming',
          description: 'The safe team member types, while the nominated team member dictates the solution. Only 15 minutes to solve the algorithm.'
        },
        outcome: MOCK_SCENARIO_IMMUNITY === 'PENDING' ? 'PENDING' : MOCK_SCENARIO_IMMUNITY
      });
    }, 1200);
  });
};

// ---------------------------
// Voting Mock
// ---------------------------
import { VoterRole, Team } from './types';

export interface VotingDataResponse {
  candidates: Team[];
  allowedRoles: VoterRole[];
  hasVoted: boolean;
}

// OPEN QUESTION: Who votes in Round 3? (This mock lets us test without hardcoding it in the UI)
export const MOCK_ALLOWED_VOTER_ROLES: VoterRole[] = ['PARTICIPANT', 'JUDGE']; 

let mockHasVoted = false;

export const fetchVotingData = async (teamId: string): Promise<VotingDataResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        candidates: [
          { id: 'team-5', name: 'Null Pointers', members: [] },
          { id: 'team-8', name: '404 Brain Not Found', members: [] },
          { id: 'team-12', name: 'Runtime Terrors', members: [] }
        ],
        allowedRoles: MOCK_ALLOWED_VOTER_ROLES,
        hasVoted: mockHasVoted
      });
    }, 1000);
  });
};

export const submitVote = async (teamId: string, candidateId: string): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockHasVoted = true;
      resolve({ success: true });
    }, 800);
  });
};

// ---------------------------
// Eviction Mock
// ---------------------------
export type EvictionStatus = 'SAFE' | 'EVICTED' | 'PENDING';

export interface EvictionResponse {
  status: EvictionStatus;
  message?: string;
}

export let MOCK_SCENARIO_EVICTION: EvictionStatus = 'EVICTED';

export const fetchEvictionResult = async (teamId: string): Promise<EvictionResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_SCENARIO_EVICTION === 'PENDING') {
        resolve({ status: 'PENDING' });
      } else if (MOCK_SCENARIO_EVICTION === 'EVICTED') {
        resolve({
          status: 'EVICTED',
          message: 'The house has spoken. Your journey in Tech Boss ends here.'
        });
      } else {
        resolve({
          status: 'SAFE',
          message: 'You survived the vote. Prepare for Round 4.'
        });
      }
    }, 2000); // 2s delay for dramatic tension
  });
};

// ---------------------------
// Round 4 Features Mock
// ---------------------------
export interface Feature {
  id: string;
  title: string;
  type: 'REQUIRED' | 'BONUS';
  isRevealed: boolean;
  description: string;
}

// Simulate progressive reveal
let revealCount = 1;
setInterval(() => {
  if (revealCount < 4) revealCount++;
}, 10000); // reveals a new feature every 10 seconds to test polling

export const fetchHiddenFeatures = async (): Promise<Feature[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allFeatures: Feature[] = [
        {
          id: 'f-1',
          title: 'Implement Dark Mode Toggle',
          type: 'REQUIRED',
          isRevealed: revealCount >= 1,
          description: 'The app must support a seamless switch between light and dark themes.'
        },
        {
          id: 'f-2',
          title: 'Real-time Chat Integration',
          type: 'REQUIRED',
          isRevealed: revealCount >= 2,
          description: 'Users must be able to send and receive messages instantly using WebSockets.'
        },
        {
          id: 'f-3',
          title: 'Easter Egg: Konami Code',
          type: 'BONUS',
          isRevealed: revealCount >= 3,
          description: 'Triggering the Konami code should display a hidden message or animation.'
        },
        {
          id: 'f-4',
          title: 'Analytics Dashboard',
          type: 'BONUS',
          isRevealed: revealCount >= 4,
          description: 'Provide an admin view showing basic usage metrics in charts.'
        }
      ];
      resolve(allFeatures);
    }, 500);
  });
};

// ---------------------------
// Round 4 Submission Mock
// ---------------------------
export interface SubmissionStatusResponse {
  submitted: boolean;
  url?: string;
  status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'SCORED';
  submittedAt?: string;
}

let mockSubmissionStatus: SubmissionStatusResponse = {
  submitted: false
};

export const fetchSubmissionStatus = async (teamId: string): Promise<SubmissionStatusResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...mockSubmissionStatus });
    }, 800);
  });
};

export const submitFinalBuild = async (teamId: string, url: string): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockSubmissionStatus = {
        submitted: true,
        url,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
      };
      resolve({ success: true });
    }, 1500);
  });
};

// ---------------------------
// Final Results Mock
// ---------------------------
export interface TeamResult {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export interface FinalResultsResponse {
  winner: TeamResult;
  rankings: TeamResult[];
}

export const fetchFinalResults = async (): Promise<FinalResultsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        winner: { id: 'team-1', name: 'Byte Me', score: 9850, rank: 1 },
        rankings: [
          { id: 'team-1', name: 'Byte Me', score: 9850, rank: 1 },
          { id: 'team-7', name: 'Git Commit Suicide', score: 9200, rank: 2 },
          { id: 'team-3', name: 'Code Blooded', score: 8750, rank: 3 },
          { id: 'team-9', name: 'Drop Table Teams', score: 8100, rank: 4 }
        ]
      });
    }, 2000); // 2s suspense delay
  });
};

