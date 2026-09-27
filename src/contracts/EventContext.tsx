import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EventPhase } from './types';

interface EventContextType {
  phase: EventPhase;
  setPhase: (phase: EventPhase) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<EventPhase>(EventPhase.ROUND_2_SECRET_TASK);

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
