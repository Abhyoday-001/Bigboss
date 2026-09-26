import { EventState, EventPhase } from '../shared/types/event';

export const INITIAL_EVENT_STATE: EventState = {
  currentPhase: 'ROUND_1_TASK',
  phaseLabel: 'ROUND 01 // SURVEILLANCE TASK',
  roundNumber: 1,
  status: 'RUNNING',
  roundName: 'The Surveillance Code Test',
  roundDescription: 'Teams must decrypt the CCTV log streams and submit the correct verification hashes within the allotted timeframe.',
  timer: {
    durationSeconds: 1800, // 30 minutes
    remainingSeconds: 1540,
    isRunning: true,
    serverTimestamp: Date.now(),
  },
  teamCounts: {
    total: 16,
    active: 14,
    nominated: 2,
    eliminated: 0,
    safe: 14,
  },
  lastUpdated: new Date().toLocaleTimeString(),
};

export const PHASE_METADATA: Record<EventPhase, { label: string; name: string; description: string; roundNumber: number }> = {
  NOT_STARTED: {
    label: 'PRE-EVENT // WAITING ROOM',
    name: 'Event Briefing & Team Check-in',
    description: 'Participants are arriving and logging into their terminals. Awaiting Admin activation.',
    roundNumber: 0,
  },
  ROUND_1_TASK: {
    label: 'ROUND 01 // TASK ROUND',
    name: 'Task Round: Hack the House',
    description: 'Algorithmic problem-solving and rapid terminal verification under time pressure.',
    roundNumber: 1,
  },
  ROUND_2_CAPTAINCY: {
    label: 'ROUND 02 // CAPTAINCY BATTLE',
    name: 'Captaincy Challenge',
    description: 'Top teams compete for House Captain immunity and nomination privileges.',
    roundNumber: 2,
  },
  ROUND_2_SECRET_TASK: {
    label: 'ROUND 02 // SECRET MISSIONS',
    name: 'Covert Operations',
    description: 'Secret tasks assigned to rank 1, middle, and bottom teams without others knowing.',
    roundNumber: 2,
  },
  ROUND_2_NOMINATIONS: {
    label: 'ROUND 02 // NOMINATION CEREMONY',
    name: 'House Nominations',
    description: 'Captains and teams finalize nomination targets for eviction danger.',
    roundNumber: 2,
  },
  ROUND_3_IMMUNITY: {
    label: 'ROUND 03 // IMMUNITY CLASH',
    name: 'Immunity & Safe Pairing Challenge',
    description: 'Nominated teams battle alongside safe allies to escape the eviction ballot.',
    roundNumber: 3,
  },
  ROUND_3_VOTING: {
    label: 'ROUND 03 // EVICTION VOTING',
    name: 'House Eviction Vote',
    description: 'Live voting window open. Housemates and jury cast their survival votes.',
    roundNumber: 3,
  },
  ROUND_3_EVICTION: {
    label: 'ROUND 03 // EVICTION REVEAL',
    name: 'Dramatic Eviction Ceremony',
    description: 'Live reveal of eliminated teams. Eye animation and house departure sequence.',
    roundNumber: 3,
  },
  ROUND_4_FINALE: {
    label: 'ROUND 04 // THE FINALE BUILD',
    name: 'Vibe Coding & Hidden Feature Sprint',
    description: 'Surviving teams build against live-revealed hidden feature specifications for the Judges.',
    roundNumber: 4,
  },
  EVENT_ENDED: {
    label: 'POST-EVENT // WINNER ANNOUNCED',
    name: 'Grand Finale & Prize Distribution',
    description: 'Event has concluded. Final leaderboard locked.',
    roundNumber: 4,
  },
};
