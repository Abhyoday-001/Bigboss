import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { fetchNominationStatus, NominationResponse, HttpError } from '../../contracts/mockApi';

export const NominationStatus: React.FC = () => {
  const { team } = useAuth();
  const [data, setData] = useState<NominationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!team) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchNominationStatus(team.id);
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err instanceof HttpError ? err : new HttpError(500, 'Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [team]);

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-accent-blue">
        <div className="w-6 h-6 rounded-full border-2 border-accent-blue border-t-transparent animate-spin mr-3"></div>
        <span className="uppercase tracking-widest text-sm">Retrieving Status...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel border-danger-red/50 text-center">
        <h2 className="text-danger-red mb-2">ERROR RETRIEVING STATUS</h2>
        <p className="text-sm text-text-secondary">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bracket-frame mb-8">
        <h2 className="text-2xl text-text-primary font-display tracking-widest text-center">NOMINATION STATUS</h2>
      </div>

      <div className={`panel max-w-lg w-full text-center relative overflow-hidden transition-all duration-500 ${
        data.isNominated ? 'border-danger-red/40 shadow-glow' : 'border-success-green/40'
      }`}>
        {data.isNominated && (
          <div className="absolute inset-0 bg-danger-red/5 pointer-events-none"></div>
        )}

        <div className="mb-6 relative z-10">
          <span className={`badge text-lg px-6 py-2 ${data.isNominated ? 'badge-nominated' : 'badge-safe'}`}>
            {data.isNominated ? 'NOMINATED FOR EVICTION' : 'SAFE'}
          </span>
        </div>

        <div className="space-y-4 relative z-10">
          {data.reason && (
            <div className="text-sm border border-danger-red/20 bg-danger-red/10 p-4 rounded text-left">
              <span className="text-danger-red font-bold uppercase tracking-widest text-xs block mb-1">REASON:</span>
              <p className="text-text-primary">{data.reason}</p>
            </div>
          )}
          
          {data.nextSteps && (
            <div className="text-sm text-left p-4">
              <span className="text-text-secondary font-bold uppercase tracking-widest text-xs block mb-1">NEXT STEPS:</span>
              <p className="text-text-primary">{data.nextSteps}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
