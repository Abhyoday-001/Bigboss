import React from 'react';
import { usePolling } from '../../contracts/usePolling';
import { fetchHiddenFeatures, Feature, HttpError } from '../../contracts/mockApi';

export const Round4Features: React.FC = () => {
  // Use polling to automatically refresh features every 3 seconds
  const { data: features, loading, error } = usePolling<Feature[]>(fetchHiddenFeatures, 3000, []);

  // Show a full loading state only if we have NO data. 
  // If we have data and it's polling, keep showing the old data to avoid flicker.
  if (loading && !features) {
    return (
      <div className="flex justify-center py-12 text-accent-blue">
        <div className="w-6 h-6 rounded-full border-2 border-accent-blue border-t-transparent animate-spin mr-3"></div>
        <span className="uppercase tracking-widest text-sm">Intercepting Directives...</span>
      </div>
    );
  }

  if (error && !features) {
    return (
      <div className="panel border-danger-red/50 text-center">
        <h2 className="text-danger-red mb-2">COMMUNICATION FAILURE</h2>
        <p className="text-sm text-text-secondary">{error?.message}</p>
      </div>
    );
  }

  const revealedFeatures = features?.filter(f => f.isRevealed) || [];
  const requiredFeatures = revealedFeatures.filter(f => f.type === 'REQUIRED');
  const bonusFeatures = revealedFeatures.filter(f => f.type === 'BONUS');

  return (
    <div className="flex flex-col items-center">
      <div className="bracket-frame mb-8">
        <h2 className="text-3xl text-text-primary font-display tracking-widest text-center">FINAL BUILD DIRECTIVES</h2>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Required Features */}
        <section>
          <div className="flex items-center gap-4 mb-4 border-b border-accent-blue/30 pb-2">
            <h3 className="text-xl font-display tracking-widest text-accent-blue">REQUIRED TASKS</h3>
            <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded uppercase font-bold tracking-widest">
              {requiredFeatures.length} Revealed
            </span>
          </div>

          {requiredFeatures.length === 0 ? (
            <div className="panel text-center text-text-secondary border-accent-blue/10 animate-pulse">
              Awaiting transmission...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requiredFeatures.map(feature => (
                <div key={feature.id} className="panel border-accent-blue/30 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue"></div>
                  <h4 className="font-bold text-lg mb-2 text-text-primary">{feature.title}</h4>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bonus Features */}
        <section>
          <div className="flex items-center gap-4 mb-4 border-b border-success-green/30 pb-2 mt-12">
            <h3 className="text-xl font-display tracking-widest text-success-green">BONUS / OPTIONAL</h3>
            <span className="text-xs bg-success-green/20 text-success-green px-2 py-0.5 rounded uppercase font-bold tracking-widest">
              {bonusFeatures.length} Revealed
            </span>
          </div>

          {bonusFeatures.length === 0 ? (
            <div className="panel text-center text-text-secondary border-success-green/10 opacity-50">
              No bonus objectives available yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bonusFeatures.map(feature => (
                <div key={feature.id} className="panel border-success-green/30 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-success-green/50"></div>
                  <h4 className="font-bold text-lg mb-2 text-text-primary">{feature.title}</h4>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center mt-12 text-xs uppercase tracking-widest text-text-secondary opacity-50 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-accent-blue rounded-full animate-ping"></div>
          Monitoring for new directives...
        </div>
      </div>
    </div>
  );
};
