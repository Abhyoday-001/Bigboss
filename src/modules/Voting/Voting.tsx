import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { useEventContext } from '../../contracts/EventContext';
import { fetchVotingData, submitVote, VotingDataResponse, HttpError } from '../../contracts/mockApi';
import { EventPhase } from '../../contracts/types';

export const Voting: React.FC = () => {
  const { team, voterRole } = useAuth();
  const { phase } = useEventContext();
  const [data, setData] = useState<VotingDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);
  
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!team) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchVotingData(team.id);
        if (mounted) {
          setData(result);
          setHasVoted(result.hasVoted);
        }
      } catch (err) {
        if (mounted) setError(err instanceof HttpError ? err : new HttpError(500, 'Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [team]);

  const handleVote = async () => {
    if (!team || !selectedCandidateId) return;
    try {
      setIsSubmitting(true);
      await submitVote(team.id, selectedCandidateId);
      setHasVoted(true);
    } catch (err) {
      alert('Error casting vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-accent-blue">
        <div className="w-6 h-6 rounded-full border-2 border-accent-blue border-t-transparent animate-spin mr-3"></div>
        <span className="uppercase tracking-widest text-sm">Loading Candidate Records...</span>
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

  // Check eligibility dynamically (resolves OPEN QUESTION from PRD)
  const isEligible = data.allowedRoles.includes(voterRole);

  if (!isEligible) {
    return (
      <div className="text-center py-20 opacity-50">
        <p className="tracking-widest text-text-secondary uppercase">
          Your assigned role ({voterRole}) is not eligible to vote in this round.
        </p>
      </div>
    );
  }

  if (phase === EventPhase.ROUND_3_VOTING_CLOSED) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-16 h-16 rounded-full bg-danger-red/20 border border-danger-red flex items-center justify-center mb-6">
          <div className="w-3 h-3 bg-danger-red rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-2xl text-text-primary font-display tracking-widest mb-2">VOTING CLOSED</h2>
        <p className="text-text-secondary uppercase tracking-widest text-sm">Awaiting Eviction Reveal</p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-16 h-16 rounded-full bg-success-green/20 border border-success-green flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl text-text-primary font-display tracking-widest mb-2">VOTE RECORDED</h2>
        <p className="text-text-secondary uppercase tracking-widest text-sm">The house is processing the results.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bracket-frame mb-8">
        <h2 className="text-3xl text-text-primary font-display tracking-widest text-center">EVICTION VOTE</h2>
      </div>

      <div className="panel max-w-2xl w-full border-accent-blue/30">
        <p className="text-text-secondary uppercase tracking-widest text-xs mb-6 text-center">
          Select one team to evict from the house.
        </p>

        <div className="space-y-4 mb-8">
          {data.candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => setSelectedCandidateId(candidate.id)}
              className={`w-full text-left p-4 rounded border transition-all flex items-center justify-between ${
                selectedCandidateId === candidate.id 
                  ? 'bg-danger-red/20 border-danger-red text-text-primary shadow-glow-red' 
                  : 'bg-bg-primary border-accent-blue/20 hover:border-accent-blue/50 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div>
                <div className="font-bold text-lg">{candidate.name}</div>
                <div className="text-xs uppercase tracking-widest opacity-60">Team ID: {candidate.id}</div>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedCandidateId === candidate.id ? 'border-danger-red' : 'border-accent-blue/30'
              }`}>
                {selectedCandidateId === candidate.id && <div className="w-2.5 h-2.5 rounded-full bg-danger-red"></div>}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            className="btn-destructive w-full md:w-auto"
            onClick={handleVote}
            disabled={!selectedCandidateId || isSubmitting}
          >
            {isSubmitting ? 'TRANSMITTING...' : 'CONFIRM EVICTION'}
          </button>
        </div>
      </div>
    </div>
  );
};
