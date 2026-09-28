import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventPhase } from './types';
import { useEventPhase } from '../shared/hooks/useEventPhase';

interface EventContextType {
  phase: EventPhase;
  setPhase: (phase: EventPhase) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  let primaryPhaseContext: any = null;
  try {
    primaryPhaseContext = useEventPhase();
  } catch (e) {
    // In case used outside EventPhaseProvider
  }

  const [phase, setPhaseState] = useState<EventPhase>(EventPhase.ROUND_2_SECRET_TASK);

  // Sync with global event phase
  useEffect(() => {
    if (primaryPhaseContext?.currentPhase) {
      const p = primaryPhaseContext.currentPhase;
      if (p in EventPhase) {
        setPhaseState(p as unknown as EventPhase);
      } else if (p === 'ROUND_3_VOTING') {
        setPhaseState(EventPhase.ROUND_3_VOTING_OPEN);
      }
    }
  }, [primaryPhaseContext?.currentPhase]);

  const setPhase = (newPhase: EventPhase) => {
    setPhaseState(newPhase);
    if (primaryPhaseContext?.setPhase) {
      if (newPhase === EventPhase.ROUND_3_VOTING_OPEN || newPhase === EventPhase.ROUND_3_VOTING_CLOSED) {
        primaryPhaseContext.setPhase('ROUND_3_VOTING');
      } else {
        primaryPhaseContext.setPhase(newPhase);
      }
    }
  };

  return (
    <EventContext.Provider value={{ phase, setPhase }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
