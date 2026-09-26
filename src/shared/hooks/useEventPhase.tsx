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
    return saved && PHASE_CONFIG[saved] ? saved : 'ROUND_1_ACTIVE';
  });

  const [targetEndTime, setTargetEndTimeState] = useState<number>(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    // Default 20 mins from now if not stored
    return saved ? Number(saved) : Date.now() + 20 * 60 * 1000;
  });

  const setPhase = (phase: EventPhase) => {
    setCurrentPhase(phase);
    localStorage.setItem(PHASE_STORAGE_KEY, phase);
  };

  const setTargetEndTime = (time: number) => {
    setTargetEndTimeState(time);
    localStorage.setItem(TIMER_STORAGE_KEY, String(time));
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
