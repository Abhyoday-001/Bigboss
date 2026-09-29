import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { fetchFinalResults, FinalResultsResponse, HttpError } from '../../contracts/mockApi';

export const FinalResults: React.FC = () => {
  const { team } = useAuth();
  const [data, setData] = useState<FinalResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);
  const [revealWinner, setRevealWinner] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchFinalResults();
        if (mounted) {
          setData(result);
          // Add a slight extra delay after data loads before flashing the winner
          setTimeout(() => {
            if (mounted) setRevealWinner(true);
          }, 1000);
        }
      } catch (err) {
        if (mounted) setError(err instanceof HttpError ? err : new HttpError(500, 'Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-2 border-accent-blue rounded-full animate-ping"></div>
          <div className="w-full h-full border-4 border-accent-blue/50 rounded-full animate-spin border-t-accent-blue-glow"></div>
        </div>
        <p className="text-xl font-display tracking-widest text-accent-blue uppercase animate-pulse">
          Compiling Final Standings
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-12">
      <div className="bracket-frame mb-12">
        <h2 className="text-4xl md:text-5xl distressed-text font-display tracking-widest text-center">TECH BOSS: FINALE</h2>
      </div>

      <div className={`w-full max-w-4xl transition-all duration-1000 transform ${revealWinner ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Winner Hero Section */}
        <div className="relative mb-16 group">
          {/* Background spotlight */}
          <div className="absolute -inset-4 bg-accent-blue/20 blur-2xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
          
          <div className="panel border-accent-blue shadow-glow relative z-10 text-center py-12 bg-bg-elevated/90 backdrop-blur">
            <div className="uppercase tracking-widest text-accent-blue mb-4 font-bold">The Ultimate Survivors</div>
            <h3 className="text-5xl md:text-7xl font-display text-text-primary drop-shadow-[0_0_15px_rgba(79,195,255,0.8)] mb-2">
              {data.winner.name}
            </h3>
            <div className="text-xl md:text-2xl font-body text-text-secondary mt-4">
              Final Score: <span className="text-accent-blue font-bold">{data.winner.score}</span>
            </div>
          </div>
        </div>

        {/* Full Rankings Table */}
        <div className="panel border-accent-blue/20">
          <h4 className="text-lg font-display tracking-widest text-text-secondary mb-6 border-b border-accent-blue/20 pb-4">FINAL RANKINGS</h4>
          
          <div className="space-y-3">
            {data.rankings.map((teamResult) => {
              const isCurrentTeam = team?.id === teamResult.id;
              
              return (
                <div 
                  key={teamResult.id} 
                  className={`flex items-center justify-between p-4 rounded ${
                    isCurrentTeam 
                      ? 'bg-accent-blue/10 border border-accent-blue shadow-glow' 
                      : 'bg-bg-primary border border-accent-blue/10'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="font-display text-2xl w-8 text-center text-text-secondary">
                      #{teamResult.rank}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{teamResult.name}</div>
                      {isCurrentTeam && <div className="text-xs text-accent-blue uppercase tracking-widest font-bold">Your Team</div>}
                    </div>
                  </div>
                  
                  <div className="font-display text-2xl tracking-wider text-accent-blue">
                    {teamResult.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
