import { Team, TaskRound1, CaptaincyState } from '../state-machine/types';

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-01',
    teamName: 'CyberNexus',
    score: 850,
    rank: 1,
    previousRank: 2,
    tableNumber: 'T-01',
    isCaptain: true,
    hasSecretMission: true, // First on leaderboard (Round 2 rule)
    members: [
      { id: 'm1', name: 'Aryan Sharma', role: 'Fullstack Lead' },
      { id: 'm2', name: 'Rohan V.', role: 'Systems Engineer' },
      { id: 'm3', name: 'Neha Rao', role: 'UI/UX Architect' },
    ],
  },
  {
    id: 'team-02',
    teamName: 'NullPointers',
    score: 820,
    rank: 2,
    previousRank: 1,
    tableNumber: 'T-02',
    members: [
      { id: 'm4', name: 'Anjishth Kumar', role: 'Backend Specialist' },
      { id: 'm5', name: 'Devika Nair', role: 'Algorithm Lead' },
    ],
  },
  {
    id: 'team-03',
    teamName: 'ByteForce',
    score: 740,
    rank: 3,
    previousRank: 4,
    tableNumber: 'T-03',
    members: [
      { id: 'm6', name: 'Dilraj Singh', role: 'Security & DevOps' },
      { id: 'm7', name: 'Pooja K.', role: 'Frontend Eng' },
    ],
  },
  {
    id: 'team-04',
    teamName: 'GlitchHunters',
    score: 710,
    rank: 4,
    previousRank: 3,
    tableNumber: 'T-04',
    members: [
      { id: 'm8', name: 'Spoorthi Gowda', role: 'Fullstack' },
      { id: 'm9', name: 'Kiran Patel', role: 'QA Lead' },
    ],
  },
  {
    id: 'team-05',
    teamName: 'ZeroDay Protocol',
    score: 660,
    rank: 5,
    previousRank: 5,
    tableNumber: 'T-05',
    hasSecretMission: true, // Middle on leaderboard (Round 2 rule)
    members: [
      { id: 'm10', name: 'Tanmay Joshi', role: 'Kernel Dev' },
      { id: 'm11', name: 'Rhea Sen', role: 'Product Strategist' },
    ],
  },
  {
    id: 'team-06',
    teamName: 'QuantumLeap',
    score: 590,
    rank: 6,
    previousRank: 8,
    tableNumber: 'T-06',
    isNominated: true,
    members: [
      { id: 'm12', name: 'Aditya Raj', role: 'Lead Architect' },
      { id: 'm13', name: 'Sneha M.', role: 'Data Analyst' },
    ],
  },
  {
    id: 'team-07',
    teamName: 'KernelPanic',
    score: 520,
    rank: 7,
    previousRank: 6,
    tableNumber: 'T-07',
    isNominated: true,
    members: [
      { id: 'm14', name: 'Varun Reddy', role: 'Backend' },
      { id: 'm15', name: 'Ananya S.', role: 'Frontend' },
    ],
  },
  {
    id: 'team-08',
    teamName: 'BitShift Orbit',
    score: 430,
    rank: 8,
    previousRank: 7,
    tableNumber: 'T-08',
    isNominated: true,
    members: [
      { id: 'm16', name: 'Sameer Khan', role: 'Systems Dev' },
      { id: 'm17', name: 'Isha Verma', role: 'Designer' },
    ],
  },
  {
    id: 'team-09',
    teamName: 'SyntaxErrors',
    score: 310,
    rank: 9,
    previousRank: 9,
    tableNumber: 'T-09',
    hasSecretMission: true, // Last on leaderboard (Round 2 rule)
    isNominated: true,
    members: [
      { id: 'm18', name: 'Manish Das', role: 'Frontend' },
      { id: 'm19', name: 'Divya P.', role: 'Backend' },
    ],
  },
];

export const MOCK_ROUND_1_TASK: TaskRound1 = {
  id: 'task-r1-01',
  title: 'Protocol Breach: The Surveillance Bypass',
  brief:
    'The Dev House central system has locked all outgoing telemetry. Your team must construct a fault-tolerant heartbeat monitor service that ingests streaming node logs, filters out encrypted honeypot pings, and calculates the live system integrity index in O(N log N) or better.',
  instructions: [
    'Implement the core algorithm in your preferred stack or submission repo.',
    'Handle payload jitter and corrupted frames without unhandled exceptions.',
    'Submit your live repo URL or verifiable output hash before the countdown expires.',
    'Verified submissions instantly lock in +300 house points.',
  ],
  maxPoints: 300,
  deadlineTimestamp: Date.now() + 25 * 60 * 1000, // 25 mins from now
  status: 'PENDING',
};

export const MOCK_CAPTAINCY_STATE: CaptaincyState = {
  activeChallengers: [
    { teamId: 'team-01', teamName: 'CyberNexus', score: 92, completed: true },
    { teamId: 'team-02', teamName: 'NullPointers', score: 88, completed: true },
    { teamId: 'team-03', teamName: 'ByteForce', score: 79, completed: false },
  ],
  captainTeamId: 'team-01',
  captainTeamName: 'CyberNexus',
  isRevealed: true,
  advantageDescription:
    'Immunity from direct Round 3 nomination + veto power over one immunity challenge pairing.',
};
