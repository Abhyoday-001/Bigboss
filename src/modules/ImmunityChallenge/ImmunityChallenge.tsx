import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { fetchImmunityDetails, ImmunityResponse, HttpError } from '../../contracts/mockApi';

export const ImmunityChallenge: React.FC = () => {
  const { team } = useAuth();
  const [data, setData] = useState<ImmunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!team) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchImmunityDetails(team.id);
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
        <span className="uppercase tracking-widest text-sm">Loading Challenge Details...</span>
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

  if (!data.isParticipating) {
    return (
      <div className="text-center py-20 opacity-50">
        <p className="tracking-widest text-text-secondary uppercase">You are not participating in the Immunity Challenge</p>
      </div>
    );
  }

  const isWon = data.outcome === 'WON';
  const isLost = data.outcome === 'LOST';

  return (
    <div className="flex flex-col items-center">
      <div className="bracket-frame mb-8">
        <h2 className="text-3xl text-text-primary font-display tracking-widest text-center">IMMUNITY CHALLENGE</h2>
      </div>

      <div className="panel max-w-3xl w-full border-accent-blue/30 relative">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between border-b border-accent-blue/20 pb-8">
          <div className="text-center flex-1">
            <div className="uppercase text-xs tracking-widest text-text-secondary mb-2">Your Team</div>
            <div className="font-bold text-xl">{team?.name}</div>
          </div>
          
          <div className="text-accent-blue font-display text-2xl px-4 py-2 bg-accent-blue/10 rounded">
            VS
          </div>
          
          <div className="text-center flex-1">
            <div className="uppercase text-xs tracking-widest text-text-secondary mb-2">Paired Team ({data.pairedTeam?.role})</div>
            <div className="font-bold text-xl">{data.pairedTeam?.name}</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="uppercase tracking-widest text-accent-blue text-sm mb-2 font-bold">Challenge Directive: {data.challenge?.title}</h3>
          <p className="text-text-primary leading-relaxed bg-bg-primary p-4 rounded border border-accent-blue/10">
            {data.challenge?.description}
          </p>
        </div>

        <div className={`p-4 rounded text-center font-bold tracking-widest uppercase transition-all ${
          isWon ? 'bg-success-green/20 text-success-green border border-success-green' :
          isLost ? 'bg-danger-red/20 text-danger-red border border-danger-red' :
          'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 animate-pulse'
        }`}>
          {isWon && 'CHALLENGE WON - IMMUNITY GRANTED'}
          {isLost && 'CHALLENGE LOST - STILL NOMINATED'}
          {data.outcome === 'PENDING' && 'OUTCOME PENDING - CHALLENGE IN PROGRESS'}
        </div>
      </div>
    </div>
  );
};
