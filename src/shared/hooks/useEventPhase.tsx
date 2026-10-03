import React, { createContext, useContext, useState } from 'react';
import { EventPhase, PhaseMetadata } from '../state-machine/types';
import { PHASE_CONFIG, ORDERED_PHASES, getRoundForPhase } from '../state-machine/eventPhases';

export type RoundStatus = 'INACTIVE' | 'ACTIVE' | 'COMPLETED';
export type RoundStatuses = Record<number, RoundStatus>;

const ROUND_NUMBERS = [0, 1, 2, 3, 4];
const createInitialStatuses = (): RoundStatuses =>
  ROUND_NUMBERS.reduce((acc, n) => ({ ...acc, [n]: 'INACTIVE' as RoundStatus }), {} as RoundStatuses);

interface EventPhaseContextType {
  currentPhase: EventPhase;
  currentMetadata: PhaseMetadata;
  setPhase: (phase: EventPhase) => void;
  advanceToNextPhase: () => void;
  revertToPreviousPhase: () => void;
  allPhases: EventPhase[];
  targetEndTime: number; // For timer countdown
  setTargetEndTime: (time: number) => void;
  /** Per-round lifecycle (INACTIVE -> ACTIVE -> COMPLETED). Changed ONLY by the Tech Boss. */
  roundStatuses: RoundStatuses;
  /** The round currently ACTIVE (explicitly started by the Tech Boss), or null. */
  activeRound: number | null;
  /** Authoritative access check - true only while the Tech Boss has the round ACTIVE. */
  isRoundAccessible: (round: number) => boolean;
  /** Tech Boss action: explicitly start a round (any other ACTIVE round is completed). */
  startRound: (round: number, startPhase?: EventPhase) => void;
  /** Tech Boss action: explicitly end a round. Never advances into the next round. */
  endRound: (round: number, endPhase?: EventPhase) => void;
}

const EventPhaseContext = createContext<EventPhaseContextType | undefined>(undefined);

const PHASE_STORAGE_KEY = 'devhouse_current_phase';
const TIMER_STORAGE_KEY = 'devhouse_target_end_time';
const ROUND_STATUS_STORAGE_KEY = 'devhouse_round_statuses';

const readStoredStatuses = (): RoundStatuses => {
  const initial = createInitialStatuses();
  try {
    const raw = localStorage.getItem(ROUND_STATUS_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Record<string, RoundStatus>;
    ROUND_NUMBERS.forEach((n) => {
      const s = parsed[n];
      if (s === 'ACTIVE' || s === 'COMPLETED' || s === 'INACTIVE') initial[n] = s;
    });
  } catch {
    // fall back to all INACTIVE
  }
  return initial;
};

export const EventPhaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPhase, setCurrentPhase] = useState<EventPhase>(() => {
    const saved = localStorage.getItem(PHASE_STORAGE_KEY) as EventPhase;
    return saved && PHASE_CONFIG[saved] ? saved : 'LOGIN';
  });

  const [targetEndTime, setTargetEndTimeState] = useState<number>(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    return saved ? Number(saved) : 0;
  });

  const [roundStatuses, setRoundStatuses] = useState<RoundStatuses>(readStoredStatuses);
  const statusesRef = React.useRef<RoundStatuses>(roundStatuses);

  const applyRemoteStatuses = (incoming?: Record<string, RoundStatus>) => {
    if (!incoming) return;
    const merged = createInitialStatuses();
    ROUND_NUMBERS.forEach((n) => {
      const s = incoming[n];
      if (s === 'ACTIVE' || s === 'COMPLETED' || s === 'INACTIVE') merged[n] = s;
    });
    statusesRef.current = merged;
    setRoundStatuses(merged);
  };

  // Cross-tab real-time synchronization via BroadcastChannel & Storage Event
  React.useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('techboss_event_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'PHASE_CHANGE' && event.data.phase) {
            setCurrentPhase(event.data.phase);
          }
          if (event.data?.type === 'TIMER_CHANGE' && event.data.endTime) {
            setTargetEndTimeState(event.data.endTime);
          }
          if (event.data?.type === 'ROUND_STATUS_CHANGE') {
            applyRemoteStatuses(event.data.roundStatuses);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PHASE_STORAGE_KEY && e.newValue) {
        const newPhase = e.newValue as EventPhase;
        if (PHASE_CONFIG[newPhase]) {
          setCurrentPhase(newPhase);
        }
      }
      if (e.key === TIMER_STORAGE_KEY && e.newValue) {
        setTargetEndTimeState(Number(e.newValue));
      }
      if (e.key === ROUND_STATUS_STORAGE_KEY && e.newValue) {
        try {
          applyRemoteStatuses(JSON.parse(e.newValue));
        } catch {
          // ignore malformed value
        }
      }
    };

    const handleCustomPhaseEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        phase?: EventPhase;
        endTime?: number;
        roundStatuses?: Record<string, RoundStatus>;
      }>;
      if (customEvent.detail?.phase) {
        setCurrentPhase(customEvent.detail.phase);
      }
      if (customEvent.detail?.endTime) {
        setTargetEndTimeState(customEvent.detail.endTime);
      }
      if (customEvent.detail?.roundStatuses) {
        applyRemoteStatuses(customEvent.detail.roundStatuses);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('techboss_phase_change', handleCustomPhaseEvent);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('techboss_phase_change', handleCustomPhaseEvent);
    };
  }, []);

  const setPhase = (phase: EventPhase) => {
    setCurrentPhase(phase);
    localStorage.setItem(PHASE_STORAGE_KEY, phase);

    // Broadcast cross-tab & in-window
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('techboss_event_channel');
        bc.postMessage({ type: 'PHASE_CHANGE', phase });
        bc.close();
      }
    } catch (e) {
      // Ignore broadcast fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('techboss_phase_change', { detail: { phase } }));
    }
  };

  const setTargetEndTime = (time: number) => {
    setTargetEndTimeState(time);
    localStorage.setItem(TIMER_STORAGE_KEY, String(time));

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('techboss_event_channel');
        bc.postMessage({ type: 'TIMER_CHANGE', endTime: time });
        bc.close();
      }
    } catch (e) {
      // Ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('techboss_phase_change', { detail: { endTime: time } }));
    }
  };

  const persistAndBroadcastStatuses = (next: RoundStatuses) => {
    statusesRef.current = next;
    setRoundStatuses(next);
    localStorage.setItem(ROUND_STATUS_STORAGE_KEY, JSON.stringify(next));

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('techboss_event_channel');
        bc.postMessage({ type: 'ROUND_STATUS_CHANGE', roundStatuses: next });
        bc.close();
      }
    } catch (e) {
      // Ignore broadcast fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('techboss_phase_change', { detail: { roundStatuses: next } })
      );
    }
  };

  /**
   * Tech Boss action. A round becomes ACTIVE only through this call.
   * Any other ACTIVE round is completed so only one round is live at a time.
   */
  const startRound = (round: number, startPhase?: EventPhase) => {
    const next: RoundStatuses = { ...statusesRef.current };
    ROUND_NUMBERS.forEach((n) => {
      if (n !== round && next[n] === 'ACTIVE') next[n] = 'COMPLETED';
    });
    next[round] = 'ACTIVE';
    persistAndBroadcastStatuses(next);
    if (startPhase) setPhase(startPhase);
  };

  /**
   * Tech Boss action. Marks the round COMPLETED. It never activates the next round;
   * `endPhase` is only applied when it belongs to the round being ended.
   */
  const endRound = (round: number, endPhase?: EventPhase) => {
    const next: RoundStatuses = { ...statusesRef.current, [round]: 'COMPLETED' };
    persistAndBroadcastStatuses(next);
    if (endPhase && getRoundForPhase(endPhase) === round) setPhase(endPhase);
  };

  const activeRound = ROUND_NUMBERS.find((n) => roundStatuses[n] === 'ACTIVE') ?? null;
  const isRoundAccessible = (round: number) => roundStatuses[round] === 'ACTIVE';

  const advanceToNextPhase = () => {
    const currentIndex = ORDERED_PHASES.indexOf(currentPhase);
    if (currentIndex < ORDERED_PHASES.length - 1) {
      setPhase(ORDERED_PHASES[currentIndex + 1]);
    }
  };


  const revertToPreviousPhase = () => {
    const currentIndex = ORDERED_PHASES.indexOf(currentPhase);
    if (currentIndex > 0) {
      setPhase(ORDERED_PHASES[currentIndex - 1]);
    }
  };

  return (
    <EventPhaseContext.Provider
      value={{
        currentPhase,
        currentMetadata: PHASE_CONFIG[currentPhase],
        setPhase,
        advanceToNextPhase,
        revertToPreviousPhase,
        allPhases: ORDERED_PHASES,
        targetEndTime,
        setTargetEndTime,
        roundStatuses,
        activeRound,
        isRoundAccessible,
        startRound,
        endRound,
      }}
    >
      {children}
    </EventPhaseContext.Provider>
  );
};

export const useEventPhase = () => {
  const context = useContext(EventPhaseContext);
  if (!context) {
    throw new Error('useEventPhase must be used within an EventPhaseProvider');
  }
  return context;
};
