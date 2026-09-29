import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { ImmunityChallenge } from '../../modules/ImmunityChallenge/ImmunityChallenge';
import { Voting } from '../../modules/Voting/Voting';
import { EvictionReveal } from '../../modules/Eviction/EvictionReveal';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { RoundAccessGuard } from '../components/RoundAccessGuard';
import { ShieldCheck, Vote, Skull, ChevronLeft } from 'lucide-react';

interface Round3PageProps {
  initialTab?: 'immunity' | 'voting' | 'eviction';
}

export const Round3Page: React.FC<Round3PageProps> = ({ initialTab = 'immunity' }) => {
  const { currentPhase } = useEventPhase();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = (): 'immunity' | 'voting' | 'eviction' => {
    if (location.pathname.includes('voting') || location.pathname.includes('vote')) return 'voting';
    if (location.pathname.includes('eviction') || location.pathname.includes('reveal')) return 'eviction';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<'immunity' | 'voting' | 'eviction'>(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'immunity' | 'voting' | 'eviction') => {
    setActiveTab(tab);
    if (tab === 'immunity') navigate('/immunity-challenge');
    else if (tab === 'voting') navigate('/voting');
    else if (tab === 'eviction') navigate('/eviction-reveal');
  };

  const isR3Active =
    currentPhase === 'ROUND_3_IMMUNITY' ||
    currentPhase === 'ROUND_3_VOTING' ||
    currentPhase === 'ROUND_3_EVICTION_REVEAL';

  if (!isR3Active) {
    return (
      <RoundAccessGuard
        requiredPhase={['ROUND_3_IMMUNITY', 'ROUND_3_VOTING', 'ROUND_3_EVICTION_REVEAL']}
        roundName="Round 3: Immunity & House Eviction"
        roundNumber={3}
      >
        <div />
      </RoundAccessGuard>
    );
  }

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
            ROUND 03 • SURVIVAL PROTOCOL
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-bg-elevated/80 border border-accent-blue/20 rounded-xl backdrop-blur-md">
          <button
            onClick={() => handleTabChange('immunity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'immunity'
                ? 'bg-success-green text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Immunity Challenge</span>
          </button>

          <button
            onClick={() => handleTabChange('voting')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'voting'
                ? 'bg-accent-blue text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>House Ballot & Voting</span>
          </button>

          <button
            onClick={() => handleTabChange('eviction')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'eviction'
                ? 'bg-danger-red text-white font-bold shadow-glow-red'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span>Eviction Verdict Reveal</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'immunity' && (
            <div className="panel-card p-6 border-t-2 border-t-success-green">
              <div className="mb-6 pb-4 border-b border-success-green/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-success-green">
                    COALITION DEFENSE CHALLENGE
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Immunity Trial
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-success-green/10 border border-success-green/30 text-success-green">
                  Active Trial
                </div>
              </div>
              <ImmunityChallenge />
            </div>
          )}

          {activeTab === 'voting' && (
            <div className="panel-card p-6 border-t-2 border-t-accent-blue">
              <div className="mb-6 pb-4 border-b border-accent-blue/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                    CONFIDENTIAL BALLOT SYSTEM
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    House Eviction Ballot
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/30 text-accent-blue">
                  Encrypted Vote
                </div>
              </div>
              <Voting />
            </div>
          )}

          {activeTab === 'eviction' && (
            <div className="panel-card p-6 border-t-2 border-t-danger-red">
              <div className="mb-6 pb-4 border-b border-danger-red/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red">
                    THE EYE HAS SPOKEN
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Eviction Ceremony
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-danger-red/10 border border-danger-red/30 text-danger-red">
                  Irreversible
                </div>
              </div>
              <EvictionReveal />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
