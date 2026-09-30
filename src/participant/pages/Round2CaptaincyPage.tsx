import React, { useState, useEffect } from 'react';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import adminRoundService from '../../admin/services/adminRoundService';
import { Crown, Shield, Users, Radio, Lock } from 'lucide-react';

interface Round2CaptaincyPageProps {
  embedded?: boolean;
}

export const Round2CaptaincyPage: React.FC<Round2CaptaincyPageProps> = ({ embedded = false }) => {
  const { currentPhase } = useEventPhase();
  const [captaincyData, setCaptaincyData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isCaptaincyActive =
    currentPhase === 'ROUND_2_CAPTAINCY' ||
    currentPhase === 'ROUND_2_NOMINATIONS' ||
    currentPhase === 'ROUND_2_SECRET_TASK';

  const loadData = async () => {
    try {
      const [capStatus, teamsList] = await Promise.all([
        adminRoundService.getCaptaincyStatus(),
        adminRoundService.getTeams(),
      ]);
      setCaptaincyData(capStatus);
      setTeams(teamsList || []);
    } catch (e) {
      console.error('Failed to load captaincy status in participant panel', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Cross-tab synchronization when Admin updates captaincy
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dev_house_admin_spoorthi_state_v1') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Auto-poll every 3s during active round to pick up host reveals
    const interval = setInterval(loadData, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const isDeclaredAndRevealed = Boolean(
    captaincyData?.winnerId && (captaincyData?.revealedToParticipants || currentPhase === 'ROUND_2_NOMINATIONS')
  );

  const competitorIds = captaincyData?.competitors || ['team-1', 'team-2'];
  const activeChallengers = competitorIds.map((cId: string, idx: number) => {
    const t = teams.find((item) => item.id === cId || item.id === `team-0${idx + 1}`);
    return {
      teamId: cId,
      teamName: t ? t.name : `Contender Team ${idx + 1}`,
      rank: t?.rank || idx + 1,
    };
  });

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel-card p-6 border-l-4 border-l-warning-amber flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-warning-amber flex items-center gap-2">
            <Crown className="w-3.5 h-3.5" />
            <span>ROUND 02 • HOUSE LEADERSHIP PROTOCOL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
            The Captaincy Duel
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Top qualifying contenders duel in a rapid shootout. The winner claims absolute captaincy immunity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold border ${
              isDeclaredAndRevealed
                ? 'bg-success-green/15 text-success-green border-success-green/40'
                : 'bg-warning-amber/15 text-warning-amber border-warning-amber/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{isDeclaredAndRevealed ? 'CAPTAIN PROCLAIMED' : 'CAPTAINCY DELIBERATION'}</span>
          </div>
        </div>
      </div>

      {!isCaptaincyActive ? (
        <div className="panel-card p-12 text-center border-t-4 border-t-warning-amber space-y-4">
          <div className="w-16 h-16 rounded-full bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-center mx-auto text-warning-amber">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-warning-amber font-bold">
              CAPTAINCY PROTOCOL CONCEALED
            </span>
            <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
              Waiting for the Next Round...
            </h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto mt-2 leading-relaxed">
              The captaincy duel has been paused or is awaiting official host broadcast. Please stand by at your table pods.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Captain Reveal / Concealed Section */}
          <div className="panel-card p-8 text-center relative overflow-hidden border border-warning-amber/30 glow-blue">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,179,0,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-warning-amber/15 border-2 border-warning-amber flex items-center justify-center mb-4 glow-blue-sm">
                <Crown className="w-8 h-8 text-warning-amber animate-bounce" />
              </div>

              <span className="text-xs font-mono uppercase tracking-widest text-warning-amber font-bold">
                THE EYE PROCLAIMS
              </span>

              {isDeclaredAndRevealed ? (
                <div className="my-4 space-y-3">
                  <h2 className="text-4xl sm:text-6xl font-display uppercase tracking-wider text-text-primary">
                    <span className="bracket-framed text-warning-amber drop-shadow-[0_0_15px_rgba(255,179,0,0.5)]">
                      {captaincyData?.winnerName || captaincyData?.captainName || 'House Captain'}
                    </span>
                  </h2>
                  <div className="text-sm font-mono text-success-green font-bold tracking-wider uppercase">
                    ANOINTED AS HOUSE CAPTAIN
                  </div>
                </div>
              ) : (
                <div className="my-6 space-y-2">
                  <div className="text-xl sm:text-2xl font-display uppercase text-text-secondary">
                    CAPTAINCY VERDICT CONCEALED
                  </div>
                  <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                    The Surveillance Eye is reviewing challenge benchmarks. The official House Captain proclamation will be broadcast here once finalized by the Host.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-primary border border-warning-amber/30 text-[11px] font-mono text-warning-amber mt-2">
                    <Lock className="w-3 h-3" />
                    <span>Awaiting Host Verdict Broadcast</span>
                  </div>
                </div>
              )}

              {/* Captaincy Advantage Card */}
              <div className="mt-6 w-full p-4 rounded-xl bg-bg-primary/90 border border-warning-amber/30 text-left">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-warning-amber font-bold mb-1">
                  <Shield className="w-4 h-4" />
                  <span>EXECUTIVE CAPTAIN PRIVILEGES</span>
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                  {captaincyData?.advantage ||
                    'Immunity from direct Round 3 nomination + veto power over one immunity challenge pairing.'}
                </p>
              </div>
            </div>
          </div>

          {/* Contenders Arena Standings */}
          <div className="panel-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-accent-blue/20">
              <h3 className="font-display text-xl uppercase tracking-wider text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-blue" />
                <span>Contender Shootout Roster</span>
              </h3>
              <span className="text-xs font-mono text-text-secondary">
                {activeChallengers.length} Qualifying Contenders
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {activeChallengers.map((challenger: any, idx: number) => {
                const isWinner =
                  isDeclaredAndRevealed && challenger.teamId === captaincyData?.winnerId;

                return (
                  <div
                    key={challenger.teamId || idx}
                    className={`p-4 rounded-lg bg-bg-primary border transition-all ${
                      isWinner
                        ? 'border-warning-amber glow-blue-sm bg-warning-amber/5'
                        : 'border-accent-blue/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-text-secondary uppercase">
                        SLOT {idx + 1}
                      </span>
                      {isWinner ? (
                        <span className="text-[10px] font-mono uppercase bg-warning-amber text-black px-1.5 py-0.5 rounded font-bold">
                          DECLARED CAPTAIN
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                          {isDeclaredAndRevealed ? 'CONTENDER' : 'IN DUEL'}
                        </span>
                      )}
                    </div>
                    <div className="font-display text-2xl uppercase tracking-wider text-text-primary">
                      {challenger.teamName}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-text-secondary">Performance Benchmark:</span>
                      <span className="text-accent-blue font-bold text-xs">
                        {isDeclaredAndRevealed
                          ? isWinner
                            ? 'Ranked 1st in Duel'
                            : 'Evaluated'
                          : 'DELIBERATING...'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {content}
      </main>
    </div>
  );
};
