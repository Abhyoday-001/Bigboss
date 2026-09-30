import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { useAuth } from '../../shared/hooks/useAuth';
import { PHASE_CONFIG } from '../../shared/state-machine/eventPhases';
import { EventPhase } from '../../shared/state-machine/types';

export const ParticipantSyncNavigator: React.FC = () => {
  const { currentPhase } = useEventPhase();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const prevPhaseRef = useRef<EventPhase>(currentPhase);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip if user is on admin route
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const previousPhase = prevPhaseRef.current;
    prevPhaseRef.current = currentPhase;

    // Determine target route according to event state machine
    const meta = PHASE_CONFIG[currentPhase];
    if (!meta) return;

    const targetRoute = meta.participantRoute;

    // Only auto-navigate when the Admin actually starts or changes the phase from Admin panel
    if (!isFirstMount.current && previousPhase !== currentPhase) {
      // Don't auto-redirect landing/login if not authenticated
      if ((currentPhase === 'LANDING' || currentPhase === 'LOGIN') && !isAuthenticated) {
        return;
      }

      // If user is on dashboard or waiting, smoothly route them to the active round without annoying popups
      if (location.pathname === '/dashboard' || location.pathname === '/') {
        if (targetRoute && targetRoute !== '/dashboard') {
          navigate(targetRoute);
        }
      }
    }

    isFirstMount.current = false;
  }, [currentPhase, location.pathname, isAuthenticated, navigate]);

  // Completely eliminate the popup window on tab switching
  return null;
};
