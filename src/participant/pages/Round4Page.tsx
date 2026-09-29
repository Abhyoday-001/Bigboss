import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { Round4Features } from '../../modules/Round4Features/Round4Features';
import { Round4Submission } from '../../modules/Round4Submission/Round4Submission';
import { FinalResults } from '../../modules/FinalResults/FinalResults';
import { useAuth } from '../../shared/hooks/useAuth';
import { Layers, Send, Trophy, ChevronLeft, ShieldAlert } from 'lucide-react';

interface Round4PageProps {
  initialTab?: 'features' | 'submission' | 'results';
}

export const Round4Page: React.FC<Round4PageProps> = ({ initialTab = 'features' }) => {
  const { team } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Round 4 CTF is exclusively for the top 3 qualifying teams
  const isFinalist = !team?.rank || team.rank <= 3 || team.id === 'team-01' || team.id === 'team-02' || team.id === 'team-03';

  const getActiveTabFromPath = (): 'features' | 'submission' | 'results' => {
    if (location.pathname.includes('submission') || location.pathname.includes('submit')) return 'submission';
    if (location.pathname.includes('result') || location.pathname.includes('winner') || location.pathname.includes('champion')) return 'results';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<'features' | 'submission' | 'results'>(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'features' | 'submission' | 'results') => {
    setActiveTab(tab);
    if (tab === 'features') navigate('/round-4-features');
    else if (tab === 'submission') navigate('/round-4-submission');
    else if (tab === 'results') navigate('/final-results');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-accent-blue-glow transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK TO DASHBOARD</span>
          </Link>
          <div className="text-[11px] font-mono uppercase text-accent-blue tracking-widest">
            ROUND 04 • GRAND FINALE BUILD
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-bg-elevated/80 border border-accent-blue/20 rounded-xl backdrop-blur-md">
          <button
            onClick={() => handleTabChange('features')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'features'
                ? 'bg-accent-blue text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Hidden Feature Specs</span>
          </button>

          <button
            onClick={() => handleTabChange('submission')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'submission'
                ? 'bg-warning-amber text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Final Build Submission</span>
          </button>

          <button
            onClick={() => handleTabChange('results')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'results'
                ? 'bg-success-green text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Grand Champions Reveal</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'features' && (
            <div className="panel-card p-6 border-t-2 border-t-accent-blue">
              <div className="mb-6 pb-4 border-b border-accent-blue/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                    UNLOCKED ARCHITECTURE SPECIFICATIONS
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Live Feature Requirements
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/30 text-accent-blue">
                  Real-time Reveal
                </div>
              </div>
              <Round4Features />
            </div>
          )}

          {activeTab === 'submission' && (
            <>
              {isFinalist ? (
                <div className="panel-card p-6 border-t-2 border-t-warning-amber">
                  <div className="mb-6 pb-4 border-b border-warning-amber/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-warning-amber">
                        FINAL STAGE SUBMISSION
                      </span>
                      <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                        Transmitting Deployment Vector
                      </h2>
                    </div>
                    <div className="text-xs font-mono px-3 py-1 rounded bg-warning-amber/15 border border-warning-amber/40 text-warning-amber font-bold">
                      TOP 3 FINALIST QUALIFIED
                    </div>
                  </div>
                  <Round4Submission />
                </div>
              ) : (
                <div className="panel-card p-12 text-center border-t-2 border-t-warning-amber space-y-3">
                  <div className="w-12 h-12 rounded-full bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-center mx-auto text-warning-amber">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-text-primary">
                    SPECTATOR STATUS • ROUND 4 CTF FINALE
                  </h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    Submission vectors in Round 4 are restricted to the 3 advancing finalist teams.
                    Monitor the live specs feed and standby for the Grand Champions Reveal!
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'results' && (
            <div className="panel-card p-6 border-t-2 border-t-success-green">
              <div className="mb-6 pb-4 border-b border-success-green/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-success-green">
                    THE DEV HOUSE 2026 VERDICT
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Grand Finale Podium
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-success-green/10 border border-success-green/30 text-success-green">
                  Final Standings
                </div>
              </div>
              <FinalResults />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
