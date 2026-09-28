import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { Round4Features } from '../../modules/Round4Features/Round4Features';
import { Round4Submission } from '../../modules/Round4Submission/Round4Submission';
import { FinalResults } from '../../modules/FinalResults/FinalResults';
import { Layers, Send, Trophy, ChevronLeft } from 'lucide-react';

interface Round4PageProps {
  initialTab?: 'features' | 'submission' | 'results';
}

export const Round4Page: React.FC<Round4PageProps> = ({ initialTab = 'features' }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
            <div className="panel-card p-6 border-t-2 border-t-warning-amber">
              <div className="mb-6 pb-4 border-b border-warning-amber/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-warning-amber">
                    JURY INSPECTION DISPATCH
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Production Build Submission
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-warning-amber/10 border border-warning-amber/30 text-warning-amber">
                  Code Freeze Gate
                </div>
              </div>
              <Round4Submission />
            </div>
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
