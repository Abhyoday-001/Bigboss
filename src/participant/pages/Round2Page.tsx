import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { Round2CaptaincyPage } from './Round2CaptaincyPage';
import { SecretMission } from '../../modules/SecretMission/SecretMission';
import { NominationStatus } from '../../modules/NominationStatus/NominationStatus';
import { Crown, KeyRound, ShieldAlert, ChevronLeft } from 'lucide-react';

interface Round2PageProps {
  initialTab?: 'captaincy' | 'secret-mission' | 'nominations';
}

export const Round2Page: React.FC<Round2PageProps> = ({ initialTab = 'captaincy' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = (): 'captaincy' | 'secret-mission' | 'nominations' => {
    if (location.pathname.includes('secret') || location.pathname.includes('mission')) return 'secret-mission';
    if (location.pathname.includes('nomination')) return 'nominations';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<'captaincy' | 'secret-mission' | 'nominations'>(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'captaincy' | 'secret-mission' | 'nominations') => {
    setActiveTab(tab);
    if (tab === 'captaincy') navigate('/round-2-captaincy');
    else if (tab === 'secret-mission') navigate('/secret-mission');
    else if (tab === 'nominations') navigate('/nomination-status');
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
            ROUND 02 • HOUSE OPERATIONS
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-bg-elevated/80 border border-accent-blue/20 rounded-xl backdrop-blur-md">
          <button
            onClick={() => handleTabChange('captaincy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'captaincy'
                ? 'bg-warning-amber text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Captaincy Duel</span>
          </button>

          <button
            onClick={() => handleTabChange('secret-mission')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'secret-mission'
                ? 'bg-accent-blue text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Classified Secret Mission</span>
          </button>

          <button
            onClick={() => handleTabChange('nominations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'nominations'
                ? 'bg-danger-red text-white font-bold shadow-glow-red'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Nomination Status</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'captaincy' && (
            <div className="-mt-8">
              {/* Render Captaincy duel directly */}
              <Round2CaptaincyPage />
            </div>
          )}

          {activeTab === 'secret-mission' && (
            <div className="panel-card p-6 border-t-2 border-t-accent-blue">
              <div className="mb-6 pb-4 border-b border-accent-blue/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                    RESTRICTED CLEARANCE ONLY
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Classified Directive Protocol
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/30 text-accent-blue">
                  Confidential
                </div>
              </div>
              <SecretMission />
            </div>
          )}

          {activeTab === 'nominations' && (
            <div className="panel-card p-6 border-t-2 border-t-danger-red">
              <div className="mb-6 pb-4 border-b border-danger-red/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red">
                    THE HOUSE VERDICT
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Eviction Risk Assessment
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-danger-red/10 border border-danger-red/30 text-danger-red">
                  Official Record
                </div>
              </div>
              <NominationStatus />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
