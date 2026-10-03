import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { Round2CaptaincyPage } from './Round2CaptaincyPage';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { RoundAccessGuard } from '../components/RoundAccessGuard';
import adminRoundService from '../../admin/services/adminRoundService';
import {
  Crown,
  KeyRound,
  ShieldAlert,
  ChevronLeft,
  Lock,
  ShieldCheck,
  Radio,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { LiveSecretMission } from '../components/LiveSecretMission';

interface Round2PageProps {
  initialTab?: 'captaincy' | 'secret-mission' | 'nominations';
}

export const Round2Page: React.FC<Round2PageProps> = ({ initialTab = 'captaincy' }) => {
  const { team } = useAuth();
  const { currentPhase } = useEventPhase();
  const location = useLocation();
  const navigate = useNavigate();

  // State from Admin Round Service
  const [missionData, setMissionData] = useState<any>(null);
  const [nominationData, setNominationData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const loadOperationalState = async () => {
    try {
      const [mStatus, nStatus, lb] = await Promise.all([
        adminRoundService.getSecretMissionStatus(),
        adminRoundService.getNominations(),
        adminRoundService.getLeaderboard(),
      ]);
      setMissionData(mStatus);
      setNominationData(nStatus);
      setLeaderboard(lb || []);
    } catch (e) {
      console.warn('Failed to load Round 2 operational state', e);
    }
  };

  useEffect(() => {
    loadOperationalState();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dev_house_admin_spoorthi_state_v1') {
        loadOperationalState();
      }
    };
    window.addEventListener('storage', handleStorage);
    const timer = setInterval(loadOperationalState, 3500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(timer);
    };
  }, []);

  // Determine if this team is assigned a secret mission
  const teamAssignment = missionData?.assignments?.find(
    (a: any) => a.teamId === team?.id || a.teamName?.toLowerCase() === team?.teamName?.toLowerCase()
  );

  const hasSecretMissionAssigned = Boolean(missionData?.assigned && teamAssignment);

  const getActiveTabFromPath = (): 'captaincy' | 'secret-mission' | 'nominations' => {
    if (location.pathname.includes('secret') || location.pathname.includes('mission')) {
      return 'secret-mission';
    }
    if (location.pathname.includes('nomination')) {
      return 'nominations';
    }
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<'captaincy' | 'secret-mission' | 'nominations'>(
    getActiveTabFromPath()
  );

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'captaincy' | 'secret-mission' | 'nominations') => {
    setActiveTab(tab);
    if (tab === 'captaincy') navigate('/round-2-captaincy');
    else if (tab === 'secret-mission') navigate('/secret-mission');
    else if (tab === 'nominations') navigate('/nomination-status');
  };

  const isR2Active =
    currentPhase === 'ROUND_2_CAPTAINCY' ||
    currentPhase === 'ROUND_2_NOMINATIONS' ||
    currentPhase === 'ROUND_2_SECRET_TASK';

  if (!isR2Active) {
    return (
      <RoundAccessGuard
        requiredPhase={['ROUND_2_CAPTAINCY', 'ROUND_2_NOMINATIONS', 'ROUND_2_SECRET_TASK']}
        roundName="Round 2: Captaincy Battle & Nominations"
        roundNumber={2}
      >
        <div />
      </RoundAccessGuard>
    );
  }

  // Check if team is nominated in current state
  const isNominated = Boolean(
    nominationData?.nominatedTeamIds?.includes(team?.id) ||
      nominationData?.nominatedTeamIds?.includes(team?.id?.replace('team-0', 'team-')) ||
      team?.isNominated
  );

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
          <div className="text-[11px] font-mono uppercase text-accent-blue tracking-widest flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-accent-blue" />
            <span>ROUND 02 • HOUSE OPERATIONS</span>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-bg-elevated/80 border border-accent-blue/20 rounded-xl backdrop-blur-md">
          <button
            onClick={() => handleTabChange('captaincy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'captaincy'
                ? 'bg-warning-amber text-black font-bold shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Captaincy Duel</span>
          </button>

          {/* Secret Mission Tab — Strictly visible ONLY when assigned to this team */}
          {hasSecretMissionAssigned && (
            <button
              onClick={() => handleTabChange('secret-mission')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'secret-mission'
                  ? 'bg-danger-red text-white font-bold shadow-glow-red'
                  : 'text-danger-red hover:bg-danger-red/10 border border-danger-red/30'
              }`}
            >
              <KeyRound className="w-4 h-4 animate-pulse" />
              <span>Special Directive</span>
            </button>
          )}

          <button
            onClick={() => handleTabChange('nominations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'nominations'
                ? 'bg-accent-blue text-black font-bold shadow-glow'
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
            <div>
              <Round2CaptaincyPage embedded />
            </div>
          )}

          {activeTab === 'secret-mission' && (
            <div className="panel-card p-6 border-t-2 border-t-danger-red">
              {import.meta.env.VITE_USE_SOCKET === 'true' ? <LiveSecretMission teamId={team?.id} /> : null}
              <div style={{ display: import.meta.env.VITE_USE_SOCKET === 'true' ? 'none' : 'block' }}>
              {hasSecretMissionAssigned ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-danger-red/20">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red">
                        RESTRICTED DIRECTIVE
                      </span>
                      <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                        Classified Task Assignment
                      </h2>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded bg-danger-red/15 border border-danger-red/40 text-danger-red font-bold animate-pulse">
                      CONFIDENTIAL
                    </span>
                  </div>

                  <div className="p-5 rounded-xl bg-bg-primary border border-danger-red/30 space-y-3">
                    <div className="text-xs font-mono text-text-secondary uppercase">
                      Direct Target: Team {team?.teamName || teamAssignment?.teamName}
                    </div>
                    <p className="text-base sm:text-lg text-text-primary leading-relaxed font-body">
                      {missionData?.brief || 'Execute confidential directive assigned by the Host.'}
                    </p>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <span className="text-text-secondary">Execution Stakes:</span>
                      <span className="text-success-green font-bold">Confidential Reward</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mx-auto text-accent-blue">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-display uppercase tracking-wider text-text-primary">
                    House Directives Normal
                  </h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    No individual classified directives are currently assigned to your pod. Maintain standard house operations and stand by for the next round.
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {activeTab === 'nominations' && (
            <div className="panel-card p-6 border-t-2 border-t-accent-blue">
              <div className="mb-6 pb-4 border-b border-accent-blue/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                    THE HOUSE VERDICT
                  </span>
                  <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                    Eviction Risk Assessment
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/30 text-accent-blue">
                  Official Record
                </div>
              </div>

              {currentPhase === 'ROUND_2_CAPTAINCY' ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-center mx-auto text-warning-amber">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-display uppercase tracking-wider text-text-primary">
                    Nominations In Deliberation
                  </h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    Eviction nominations have not been announced yet. The House Captain duel is actively underway. Once the Captain is crowned and delivers recommendations to the Host, official nominations will be published here.
                  </p>
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-6">
                  <div
                    className={`p-6 rounded-xl border text-center space-y-4 ${
                      isNominated
                        ? 'bg-danger-red/10 border-danger-red/50 shadow-glow-red'
                        : 'bg-success-green/10 border-success-green/50'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                        isNominated
                          ? 'bg-danger-red/20 text-danger-red border border-danger-red/40'
                          : 'bg-success-green/20 text-success-green border border-success-green/40'
                      }`}
                    >
                      {isNominated ? (
                        <ShieldAlert className="w-7 h-7 animate-pulse" />
                      ) : (
                        <ShieldCheck className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <span
                        className={`text-xs font-mono uppercase tracking-widest font-bold block mb-1 ${
                          isNominated ? 'text-danger-red' : 'text-success-green'
                        }`}
                      >
                        OFFICIAL STATUS
                      </span>
                      <h3 className="text-2xl font-display uppercase tracking-wider text-text-primary">
                        {isNominated ? 'Nominated for Eviction' : 'Safe from Eviction'}
                      </h3>
                    </div>

                    <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                      {isNominated
                        ? 'Your team has been nominated for potential eviction. You will be scheduled to compete in the Round 3 Immunity Duel to secure house safety.'
                        : 'Your team is currently safe from eviction in this cycle. Prepare for upcoming house challenges and support assignments.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Round2Page;
