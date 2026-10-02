import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SocketProvider, useSocket } from './SocketProvider';
import { eventOperationsService } from '../services/eventOperationsService';
import { useEventPhase } from '../hooks/useEventPhase';
import { PhaseTransitionOverlay } from '../components/PhaseTransitionOverlay';

const SocketSyncManager: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { setPhase, setTargetEndTime } = useEventPhase();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('state:snapshot', (snapshot) => {
      if (snapshot.phase) setPhase(snapshot.phase);
      if (snapshot.timer?.endTime) setTargetEndTime(snapshot.timer.endTime);
    });

    socket.on('phase:changed', (state) => {
      setPhase(state.phase);
      // Automatically handle sub-phases syncing
      if (state.phase === 'ROUND_0_ACTIVE') {
        eventOperationsService.updateRound0Config({ isActive: true });
      } else if (state.phase === 'ROUND_0_RESULTS') {
        eventOperationsService.updateRound0Config({ isActive: false });
      }
    });

    socket.on('timer:updated', (timer) => {
      setTargetEndTime(timer.endTime);
    });

    // Handle Secret Mission
    socket.on('secret:assigned', (mission) => {
      // Find a way to notify the UI without breaking current mocks.
      // E.g. we can store it in local storage or use an event bus.
      window.dispatchEvent(new CustomEvent('integration:secret:assigned', { detail: mission }));
    });

    return () => {
      socket.off('state:snapshot');
      socket.off('phase:changed');
      socket.off('timer:updated');
      socket.off('secret:assigned');
    };
  }, [socket, isConnected, setPhase, setTargetEndTime]);

  return null;
};

export const IntegrationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  
  // Decide namespace based on role
  const namespace = user?.role === 'ADMIN' || user?.role === 'JUDGE' ? '/admin' : '/participant';

  if (import.meta.env.VITE_USE_SOCKET !== 'true' || !token) {
    return <>{children}</>;
  }

  return (
    <SocketProvider namespace={namespace} token={token}>
      <SocketSyncManager />
      <PhaseTransitionOverlay />
      {children}
    </SocketProvider>
  );
};
