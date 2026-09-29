import React, { createContext, useContext, useState } from 'react';
import { EventPhase, PhaseMetadata } from '../state-machine/types';
import { PHASE_CONFIG, ORDERED_PHASES } from '../state-machine/eventPhases';

interface EventPhaseContextType {
  currentPhase: EventPhase;
  currentMetadata: PhaseMetadata;
  setPhase: (phase: EventPhase) => void;
  advanceToNextPhase: () => void;
  revertToPreviousPhase: () => void;
  allPhases: EventPhase[];
  targetEndTime: number; // For timer countdown
  setTargetEndTime: (time: number) => void;
}

const EventPhaseContext = createContext<EventPhaseContextType | undefined>(undefined);

const PHASE_STORAGE_KEY = 'devhouse_current_phase';
const TIMER_STORAGE_KEY = 'devhouse_target_end_time';

export const EventPhaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPhase, setCurrentPhase] = useState<EventPhase>(() => {
    const saved = localStorage.getItem(PHASE_STORAGE_KEY) as EventPhase;
    return saved && PHASE_CONFIG[saved] ? saved : 'ROUND_0_ACTIVE';
  });

  const [targetEndTime, setTargetEndTimeState] = useState<number>(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    return saved ? Number(saved) : Date.now() + 20 * 60 * 1000;
  });

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
    };

    const handleCustomPhaseEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ phase?: EventPhase; endTime?: number }>;
      if (customEvent.detail?.phase) {
        setCurrentPhase(customEvent.detail.phase);
      }
      if (customEvent.detail?.endTime) {
        setTargetEndTimeState(customEvent.detail.endTime);
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
