import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { PHASE_CONFIG } from '../../shared/state-machine/eventPhases';

export const ParticipantSyncNavigator: React.FC = () => {
  const { currentPhase } = useEventPhase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Never interfere with Admin routes
    if (location.pathname.startsWith('/admin')) return;

    const meta = PHASE_CONFIG[currentPhase];
    if (!meta) return;

    // Only redirect to dashboard when phase is truly pre-event (LOGIN / LANDING)
    // and the participant is somehow on a round page
    const isPreEvent = currentPhase === 'LOGIN' || currentPhase === 'LANDING';
    const isOnRootOrDashboard =
      location.pathname === '/' ||
      location.pathname === '/dashboard' ||
      location.pathname === '/landing' ||
      location.pathname === '/home';

    if (isPreEvent && !isOnRootOrDashboard) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentPhase, location.pathname, navigate]);

  return null;
};
