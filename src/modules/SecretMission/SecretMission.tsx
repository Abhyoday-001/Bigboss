import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { fetchSecretMission, SecretMissionResponse, HttpError } from '../../contracts/mockApi';

export const SecretMission: React.FC = () => {
  const { team } = useAuth();
  const [data, setData] = useState<SecretMissionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!team) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchSecretMission(team.id);
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) {
          if (err instanceof HttpError) {
            setError(err);
          } else {
            setError(new HttpError(500, 'Unknown error'));
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [team]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-accent-blue space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin"></div>
        <p className="tracking-widest uppercase text-sm animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  // Error State: 403 (Not assigned via backend rejection) or 404
  if (error) {
    if (error.status === 403) {
      // Access control: strictly hidden or subtle message
      return (
        <div className="text-center py-20 opacity-50">
          <p className="tracking-widest text-text-secondary uppercase">No Active Directives</p>
        </div>
      );
    }
    // Generic error
    return (
      <div className="panel border-danger-red/50 text-center">
        <h2 className="text-danger-red mb-2">CONNECTION INTERRUPTED</h2>
        <p className="text-sm text-text-secondary">{error.message}</p>
      </div>
    );
  }

  // Not assigned flag
  if (data && !data.isAssigned) {
    return (
      <div className="text-center py-20 opacity-50">
        <p className="tracking-widest text-text-secondary uppercase">No Active Directives</p>
      </div>
    );
  }

  // Populated State (Assigned)
  return (
    <div className="flex flex-col items-center">
      <div className="bracket-frame mb-8">
        <h2 className="text-3xl text-danger-red font-display tracking-widest text-center shadow-glow-red">RESTRICTED DIRECTIVE</h2>
      </div>

      <div className="panel max-w-2xl w-full border-accent-blue/40 shadow-glow relative overflow-hidden group">
        {/* CCTV scanning line effect */}
        <div className="absolute inset-0 bg-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="uppercase tracking-widest text-xs text-text-secondary mb-4 border-b border-accent-blue/20 pb-2">
          Target: Team {team?.name}
        </div>
        
        <p className="text-xl leading-relaxed font-body mb-8">
          {data?.brief}
        </p>

        <div className="flex justify-between items-center border-t border-accent-blue/20 pt-4 mt-8">
          <div className="text-sm uppercase tracking-widest text-text-secondary">
            Status: <span className="text-accent-blue font-bold">{data?.status}</span>
          </div>
          
          <button className="btn-primary">
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
