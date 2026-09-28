import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { fetchEvictionResult, EvictionResponse, HttpError } from '../../contracts/mockApi';

export const EvictionReveal: React.FC = () => {
  const { team } = useAuth();
  const [data, setData] = useState<EvictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!team) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchEvictionResult(team.id);
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err instanceof HttpError ? err : new HttpError(500, 'Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    
    // In a real implementation with usePolling, this would automatically re-fetch 
    // when the admin triggers the reveal.

    return () => { mounted = false; };
  }, [team]);

  if (loading || data?.status === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6">
        <div className="bracket-frame">
          <h2 className="text-xl text-accent-blue font-display tracking-widest text-center animate-pulse">AWAITING RESULTS</h2>
        </div>
        
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Eye motif placeholder rotating */}
          <div className="absolute inset-0 border border-accent-blue rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 border-r border-l border-accent-blue/50 rounded-full animate-spin"></div>
          <div className="w-4 h-4 bg-accent-blue-glow rounded-full shadow-glow animate-pulse"></div>
        </div>
        
        <p className="text-xs uppercase tracking-widest text-text-secondary">The House is deciding...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel border-danger-red/50 text-center">
        <h2 className="text-danger-red mb-2">ERROR</h2>
        <p className="text-sm text-text-secondary">{error?.message}</p>
      </div>
    );
  }

  const isEvicted = data.status === 'EVICTED';

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] transition-colors duration-1000 ${
      isEvicted ? 'bg-danger-red/5' : ''
    }`}>
      <div className="bracket-frame mb-12">
        <h2 className={`text-4xl md:text-6xl font-display tracking-widest text-center uppercase drop-shadow-lg ${
          isEvicted ? 'text-danger-red shadow-glow-red' : 'text-success-green'
        }`}>
          {isEvicted ? 'EVICTED' : 'SAFE'}
        </h2>
      </div>

      <div className="text-center max-w-lg mx-auto">
        <p className={`text-lg md:text-xl font-body mb-8 ${isEvicted ? 'text-text-primary' : 'text-text-secondary'}`}>
          {data.message}
        </p>

        {isEvicted && (
          <div className="uppercase tracking-widest text-xs text-danger-red/70 mt-12 border-t border-danger-red/20 pt-4">
            System Access Revoked
          </div>
        )}
      </div>
    </div>
  );
};
