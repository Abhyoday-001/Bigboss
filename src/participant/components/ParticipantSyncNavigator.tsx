import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { useAuth } from '../../shared/hooks/useAuth';
import { PHASE_CONFIG } from '../../shared/state-machine/eventPhases';
import { EventPhase } from '../../shared/state-machine/types';
import { Zap, Radio, Bell, ArrowRight, ShieldCheck } from 'lucide-react';

export const ParticipantSyncNavigator: React.FC = () => {
  const { currentPhase } = useEventPhase();
  const { team, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    targetRoute: string;
  } | null>(null);

  const prevPhaseRef = useRef<EventPhase>(currentPhase);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip if user is on admin route or not authenticated in participant space
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const previousPhase = prevPhaseRef.current;
    prevPhaseRef.current = currentPhase;

    // Determine target route according to event state machine
    const meta = PHASE_CONFIG[currentPhase];
    if (!meta) return;

    const targetRoute = meta.participantRoute;

    // Check if phase actually changed (or first mount while on dashboard)
    if (!isFirstMount.current && previousPhase !== currentPhase) {
      // Don't auto-redirect landing/login if not authenticated
      if ((currentPhase === 'LANDING' || currentPhase === 'LOGIN') && !isAuthenticated) {
        return;
      }

      // If already on the target route, don't trigger re-navigation
      if (location.pathname !== targetRoute) {
        setNotification({
          title: `Control Room Command: ${meta.roundTitle}`,
          description: `Host activated "${meta.subPhaseTitle}". Your terminal is auto-launching...`,
          targetRoute,
        });

        const timer = setTimeout(() => {
          navigate(targetRoute);
          setNotification(null);
        }, 1200);

        return () => clearTimeout(timer);
      }
    }

    isFirstMount.current = false;
  }, [currentPhase, location.pathname, isAuthenticated, navigate]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 md:right-8 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-bg-elevated/95 backdrop-blur-md border border-accent-blue/50 p-4 rounded-xl shadow-glow-blue flex items-start gap-3.5 text-text-primary">
        <div className="w-9 h-9 rounded-lg bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue flex-shrink-0 animate-pulse">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-accent-blue">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>HOST BROADCAST SYNCHRONIZED</span>
          </div>
          <h4 className="text-sm font-bold text-text-primary truncate mt-0.5">
            {notification.title}
          </h4>
          <p className="text-xs text-text-secondary mt-0.5 leading-snug">
            {notification.description}
          </p>
        </div>
      </div>
    </div>
  );
};
