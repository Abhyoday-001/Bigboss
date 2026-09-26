export type TeamStatus = 'ACTIVE' | 'NOMINATED' | 'EVICTED' | 'IMMUNE' | 'CAPTAIN';

export interface ScoreAuditEntry {
  id: string;
  timestamp: string;
  round: string;
  delta: number;
  newTotal: number;
  reason: string;
  adjustedBy: string;
}

export interface TeamRecord {
  id: string;
  teamCode: string;
  name: string;
  leader: string;
  members: string[];
  status: TeamStatus;
  score: number;
  rank: number;
  avatarUrl?: string;
  registeredAt: string;
  roundScores: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
  };
  scoreHistory: ScoreAuditEntry[];
  notes?: string;
}

export const INITIAL_MOCK_TEAMS: TeamRecord[] = [
  {
    id: 'team-01',
    teamCode: 'DEV-101',
    name: 'Cyber Sentinels',
    leader: 'Aarav Sharma',
    members: ['Aarav Sharma', 'Pooja Nair', 'Rohan Mehta'],
    status: 'CAPTAIN',
    score: 340,
    rank: 1,
    registeredAt: '2026-10-07 08:30',
    roundScores: { round1: 180, round2: 160, round3: 0, round4: 0 },
    scoreHistory: [
      {
        id: 'aud-1',
        timestamp: '09:45 AM',
        round: 'Round 1',
        delta: +180,
        newTotal: 180,
        reason: 'Decrypted main hash challenge with top accuracy',
        adjustedBy: 'Dilraj (Admin)',
      },
      {
        id: 'aud-2',
        timestamp: '11:15 AM',
        round: 'Round 2',
        delta: +160,
        newTotal: 340,
        reason: 'Won Captaincy speed sprint battle',
        adjustedBy: 'Dilraj (Admin)',
      },
    ],
    notes: 'Current House Captain with immunity.',
  },
  {
    id: 'team-02',
    teamCode: 'DEV-102',
    name: 'Binary Beasts',
    leader: 'Siddharth Rao',
    members: ['Siddharth Rao', 'Neha Verma', 'Aditya Sen'],
    status: 'ACTIVE',
    score: 310,
    rank: 2,
    registeredAt: '2026-10-07 08:32',
    roundScores: { round1: 160, round2: 150, round3: 0, round4: 0 },
    scoreHistory: [
      {
        id: 'aud-3',
        timestamp: '09:50 AM',
        round: 'Round 1',
        delta: +160,
        newTotal: 160,
        reason: 'Submitted 4/4 algorithmic tasks successfully',
        adjustedBy: 'Dilraj (Admin)',
      },
      {
        id: 'aud-4',
        timestamp: '11:20 AM',
        round: 'Round 2',
        delta: +150,
        newTotal: 310,
        reason: 'Completed secret task stealth sequence',
        adjustedBy: 'Dilraj (Admin)',
      },
    ],
  },
  {
    id: 'team-03',
    teamCode: 'DEV-103',
    name: 'Quantum Hackers',
    leader: 'Ananya Iyer',
    members: ['Ananya Iyer', 'Karan Patel', 'Meera Joshi'],
    status: 'IMMUNE',
    score: 295,
    rank: 3,
    registeredAt: '2026-10-07 08:35',
    roundScores: { round1: 150, round2: 145, round3: 0, round4: 0 },
    scoreHistory: [
      {
        id: 'aud-5',
        timestamp: '09:52 AM',
        round: 'Round 1',
        delta: +150,
        newTotal: 150,
        reason: 'Fastest Round 1 terminal submission',
        adjustedBy: 'Dilraj (Admin)',
      },
    ],
  },
  {
    id: 'team-04',
    teamCode: 'DEV-104',
    name: 'Null Pointers',
    leader: 'Vikram Singh',
    members: ['Vikram Singh', 'Tanvi Gupta', 'Harsh Vardhan'],
    status: 'NOMINATED',
    score: 240,
    rank: 4,
    registeredAt: '2026-10-07 08:40',
    roundScores: { round1: 130, round2: 110, round3: 0, round4: 0 },
    scoreHistory: [
      {
        id: 'aud-6',
        timestamp: '09:55 AM',
        round: 'Round 1',
        delta: +130,
        newTotal: 130,
        reason: 'Round 1 checkpoint completed',
        adjustedBy: 'Dilraj (Admin)',
      },
    ],
    notes: 'Nominated by Captain in Round 2 ceremony.',
  },
  {
    id: 'team-05',
    teamCode: 'DEV-105',
    name: 'Syntax Strikers',
    leader: 'Rahul Deshmukh',
    members: ['Rahul Deshmukh', 'Divya Nair', 'Aryan Saxena'],
    status: 'NOMINATED',
    score: 220,
    rank: 5,
    registeredAt: '2026-10-07 08:42',
    roundScores: { round1: 120, round2: 100, round3: 0, round4: 0 },
    scoreHistory: [
      {
        id: 'aud-7',
        timestamp: '10:00 AM',
        round: 'Round 1',
        delta: +120,
        newTotal: 120,
        reason: 'Round 1 partial solutions verified',
        adjustedBy: 'Dilraj (Admin)',
      },
    ],
    notes: 'Nominated via peer house vote.',
  },
  {
    id: 'team-06',
    teamCode: 'DEV-106',
    name: 'Code Crusaders',
    leader: 'Ishaan Roy',
    members: ['Ishaan Roy', 'Sneha Paul', 'Devansh Kumar'],
    status: 'ACTIVE',
    score: 210,
    rank: 6,
    registeredAt: '2026-10-07 08:45',
    roundScores: { round1: 110, round2: 100, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-07',
    teamCode: 'DEV-107',
    name: 'Algorithm Avengers',
    leader: 'Priyanka Sen',
    members: ['Priyanka Sen', 'Manish Reddy', 'Swati Mishra'],
    status: 'ACTIVE',
    score: 205,
    rank: 7,
    registeredAt: '2026-10-07 08:47',
    roundScores: { round1: 110, round2: 95, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-08',
    teamCode: 'DEV-108',
    name: 'Glitch Busters',
    leader: 'Abhinav Ghosh',
    members: ['Abhinav Ghosh', 'Kavita Chawla', 'Tarun Jain'],
    status: 'ACTIVE',
    score: 190,
    rank: 8,
    registeredAt: '2026-10-07 08:49',
    roundScores: { round1: 100, round2: 90, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-09',
    teamCode: 'DEV-109',
    name: 'Stack Overlords',
    leader: 'Varun Bhat',
    members: ['Varun Bhat', 'Ananya Soni', 'Rishi Menon'],
    status: 'ACTIVE',
    score: 180,
    rank: 9,
    registeredAt: '2026-10-07 08:50',
    roundScores: { round1: 90, round2: 90, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-10',
    teamCode: 'DEV-110',
    name: 'Logic Legends',
    leader: 'Sanjana Pillai',
    members: ['Sanjana Pillai', 'Gaurav Kulkarni', 'Kirti Rathi'],
    status: 'ACTIVE',
    score: 175,
    rank: 10,
    registeredAt: '2026-10-07 08:52',
    roundScores: { round1: 85, round2: 90, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-11',
    teamCode: 'DEV-111',
    name: 'Debug Dynasty',
    leader: 'Yashwardhan',
    members: ['Yashwardhan', 'Simran Kaur', 'Akash Tripathi'],
    status: 'ACTIVE',
    score: 160,
    rank: 11,
    registeredAt: '2026-10-07 08:55',
    roundScores: { round1: 80, round2: 80, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-12',
    teamCode: 'DEV-112',
    name: 'Neural Knights',
    leader: 'Chirag Agarwal',
    members: ['Chirag Agarwal', 'Nidhi Hegde', 'Pranav Das'],
    status: 'ACTIVE',
    score: 150,
    rank: 12,
    registeredAt: '2026-10-07 08:57',
    roundScores: { round1: 80, round2: 70, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-13',
    teamCode: 'DEV-113',
    name: 'Byte Bandits',
    leader: 'Samarth Jain',
    members: ['Samarth Jain', 'Shreya Bose', 'Naveen Raj'],
    status: 'ACTIVE',
    score: 140,
    rank: 13,
    registeredAt: '2026-10-07 09:00',
    roundScores: { round1: 70, round2: 70, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-14',
    teamCode: 'DEV-114',
    name: 'Pixel Pioneers',
    leader: 'Ritika Sharma',
    members: ['Ritika Sharma', 'Aakash Verma', 'Deepak Tiwari'],
    status: 'ACTIVE',
    score: 130,
    rank: 14,
    registeredAt: '2026-10-07 09:02',
    roundScores: { round1: 65, round2: 65, round3: 0, round4: 0 },
    scoreHistory: [],
  },
  {
    id: 'team-15',
    teamCode: 'DEV-115',
    name: 'Shadow Censors (Pending)',
    leader: 'TBA (Pending)',
    members: ['Member 1', 'Member 2', 'Member 3'],
    status: 'ACTIVE',
    score: 0,
    rank: 15,
    registeredAt: '2026-10-07 09:05',
    roundScores: { round1: 0, round2: 0, round3: 0, round4: 0 },
    scoreHistory: [],
    notes: 'Placeholder slot ready for live event walk-in registration.',
  },
  {
    id: 'team-16',
    teamCode: 'DEV-116',
    name: 'Omega Squad (Pending)',
    leader: 'TBA (Pending)',
    members: ['Member 1', 'Member 2', 'Member 3'],
    status: 'ACTIVE',
    score: 0,
    rank: 16,
    registeredAt: '2026-10-07 09:05',
    roundScores: { round1: 0, round2: 0, round3: 0, round4: 0 },
    scoreHistory: [],
    notes: 'Placeholder slot ready for live event walk-in registration.',
  },
];
