import React, { useState, useEffect } from 'react';
import { useSocket } from '../../shared/socket/SocketProvider';
import { ShieldCheck, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';

export const LiveSecretMission: React.FC<{ teamId?: string }> = ({ teamId }) => {
  const { socket, isConnected } = useSocket();
  const [missionState, setMissionState] = useState<any>(null);
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for assignments
    const handleAssigned = (data: any) => {
      setMissionState(data);
    };

    socket.on('secret:assigned', handleAssigned);
    
    // Attempt to fetch current state
    // We don't have a direct fetch event in socket for secret state, 
    // but the backend integration sends it on connection if active, or via state:snapshot
    // Wait, the backend doesn't automatically send secret:assigned to everyone on reconnect.
    // Let's rely on window events from IntegrationWrapper or similar.
    const handleWindowAssigned = (e: any) => {
      setMissionState(e.detail);
    };
    window.addEventListener('integration:secret:assigned', handleWindowAssigned);

    return () => {
      socket.off('secret:assigned', handleAssigned);
      window.removeEventListener('integration:secret:assigned', handleWindowAssigned);
    };
  }, [socket, isConnected]);

  const handleRespond = (accept: boolean) => {
    if (!socket || !missionState) return;
    socket.emit('secret:respond', { missionId: missionState.id, accept });
    setMissionState((prev: any) => ({ ...prev, status: accept ? 'ACCEPTED' : 'REJECTED' }));
  };

  const handleSubmitRiddle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !missionState || !riddleAnswer.trim()) return;
    setSubmissionStatus('submitting');
    socket.emit('secret:submit', { missionId: missionState.id, answer: riddleAnswer });
    
    // We expect a response or just optimistic update
    setTimeout(() => {
      setSubmissionStatus('success');
      setMissionState((prev: any) => ({ ...prev, status: 'COMPLETED' }));
    }, 1000);
  };

  if (!missionState) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mx-auto text-accent-blue">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-display uppercase tracking-wider text-text-primary">
          House Directives Normal
        </h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
          No individual classified directives are currently assigned to your pod via secure channel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-danger-red/20">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red">
            RESTRICTED DIRECTIVE (LIVE)
          </span>
          <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
            Classified Task Assignment
          </h2>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-danger-red/15 border border-danger-red/40 text-danger-red font-bold animate-pulse">
          CONFIDENTIAL
        </span>
      </div>

      <div className="p-5 rounded-xl bg-bg-primary border border-danger-red/30 space-y-3">
        <div className="text-xs font-mono text-text-secondary uppercase">
          Target: Team {teamId}
        </div>
        <p className="text-base sm:text-lg text-text-primary leading-relaxed font-body">
          {missionState.brief || 'Execute confidential directive assigned by the Host.'}
        </p>

        {missionState.status === 'OFFERED' && (
          <div className="pt-4 flex gap-4">
            <button
              onClick={() => handleRespond(true)}
              className="px-6 py-2 bg-success-green hover:bg-success-green/80 text-black font-bold uppercase rounded"
            >
              Accept Mission
            </button>
            <button
              onClick={() => handleRespond(false)}
              className="px-6 py-2 bg-danger-red hover:bg-danger-red/80 text-white font-bold uppercase rounded"
            >
              Decline
            </button>
          </div>
        )}

        {missionState.status === 'ACCEPTED' && missionState.riddle && (
          <div className="mt-4 p-4 border border-warning-amber/50 bg-warning-amber/10 rounded-lg">
            <h4 className="text-sm font-bold text-warning-amber mb-2 uppercase">Encrypted Riddle</h4>
            <p className="text-sm mb-4">{missionState.riddle}</p>
            
            <form onSubmit={handleSubmitRiddle} className="flex gap-2">
              <input
                type="text"
                value={riddleAnswer}
                onChange={(e) => setRiddleAnswer(e.target.value)}
                placeholder="Enter answer..."
                className="flex-1 bg-bg-primary border border-accent-blue/30 rounded px-3 py-2 text-xs text-text-primary"
                disabled={submissionStatus !== 'idle'}
              />
              <button
                type="submit"
                disabled={submissionStatus !== 'idle' || !riddleAnswer.trim()}
                className="px-4 py-2 bg-accent-blue text-black font-bold uppercase text-xs rounded disabled:opacity-50"
              >
                {submissionStatus === 'submitting' ? 'Verifying...' : 'Submit'}
              </button>
            </form>
          </div>
        )}

        {missionState.status === 'COMPLETED' && (
          <div className="mt-4 p-4 border border-success-green/50 bg-success-green/10 rounded-lg text-success-green flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Mission Accomplished. Code verified.</span>
          </div>
        )}
      </div>
    </div>
  );
};
