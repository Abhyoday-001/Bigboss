import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEventPhase } from '../../shared/hooks/useEventPhase';

// Routes that participants are always allowed to be on
const PARTICIPANT_SAFE_ROUTES = ['/', '/landing', '/home', '/dashboard', '/login'];

// Round routes that participants should NOT be able to access directly (frontend-only guard)
const ROUND_ROUTES = [
  '/round-0',
  '/round-1',
  '/round-2',
  '/round-2-captaincy',
  '/round-2-secret-task',
  '/round-2-nominations',
  '/round-3',
  '/round-3-immunity',
  '/round-3-voting',
  '/round-3-eviction',
  '/round-4',
  '/round-4-features',
  '/round-4-submission',
  '/final-results',
  '/secret-mission',
  '/nomination-status',
  '/immunity-challenge',
  '/voting',
  '/eviction-reveal',
];

export const ParticipantSyncNavigator: React.FC = () => {
  const { currentPhase } = useEventPhase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Never interfere with Admin routes
    if (location.pathname.startsWith('/admin')) return;

    // If a participant manually navigates to a round URL, bounce them back to dashboard.
    // Rounds are only accessible once backend integration is live.
    const isOnRoundRoute = ROUND_ROUTES.some((r) => location.pathname === r);
    if (isOnRoundRoute) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Silent — no UI, no popups
  return null;
};
