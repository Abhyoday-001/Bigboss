import React, { useState } from 'react';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { MOCK_CAPTAINCY_STATE } from '../../shared/mocks/mockData';
import { Crown, Shield, Users, Radio, Power } from 'lucide-react';

export const Round2CaptaincyPage: React.FC = () => {
  const [captaincyData, setCaptaincyData] = useState(MOCK_CAPTAINCY_STATE);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCaptaincyActive, setIsCaptaincyActive] = useState(true);

  const handleTriggerReveal = () => {
    setIsRevealing(true);
    setTimeout(() => {
      setIsRevealing(false);
      setCaptaincyData((prev) => ({ ...prev, isRevealed: true }));
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header with On/Off Toggle */}
        <div className="panel-card p-6 border-l-4 border-l-warning-amber flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-warning-amber flex items-center gap-2">
              <Crown className="w-3.5 h-3.5" />
              <span>ROUND 02 • HOUSE LEADERSHIP PROTOCOL</span>
            </div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
              The Captaincy Duel
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Top qualifying contenders duel in a rapid shootout. The winner claims absolute captaincy immunity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCaptaincyActive(!isCaptaincyActive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all border ${
                isCaptaincyActive
                  ? 'bg-success-green/15 text-success-green border-success-green/40 hover:bg-success-green/20'
                  : 'bg-danger-red/15 text-danger-red border-danger-red/40 hover:bg-danger-red/20'
              }`}
              title="Toggle Captaincy Status"
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isCaptaincyActive ? 'CAPTAINCY: ACTIVE (ON)' : 'CAPTAINCY: PAUSED (OFF)'}</span>
            </button>
          </div>
        </div>

        {/* If Inactive / OFF, show waiting state */}
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
            {/* Dramatic Captain Reveal Section with Bracket Framing */}
        <div className="panel-card p-8 text-center relative overflow-hidden border border-warning-amber/30 glow-blue">
          {/* Background glowing aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,179,0,0.08)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-warning-amber/15 border-2 border-warning-amber flex items-center justify-center mb-4 glow-blue-sm">
              <Crown className="w-8 h-8 text-warning-amber animate-bounce" />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-warning-amber font-bold">
              THE EYE PROCLAIMS
            </span>

            {isRevealing ? (
              <div className="my-6 space-y-2">
                <div className="text-2xl font-mono text-accent-blue-glow animate-pulse">
                  CALCULATING METRICS...
                </div>
                <div className="text-xs font-mono text-text-secondary">
                  Surveillance feeds cross-referencing final times
                </div>
              </div>
            ) : captaincyData.isRevealed ? (
              <div className="my-4 space-y-3">
                <h2 className="text-4xl sm:text-6xl font-display uppercase tracking-wider text-text-primary">
                  <span className="bracket-framed text-warning-amber drop-shadow-[0_0_15px_rgba(255,179,0,0.5)]">
                    {captaincyData.captainTeamName}
                  </span>
                </h2>
                <div className="text-sm font-mono text-success-green font-bold tracking-wider uppercase">
                  ANOINTED AS HOUSE CAPTAIN
                </div>
              </div>
            ) : (
              <div className="my-6">
                <div className="text-2xl font-display uppercase text-text-secondary">
                  CAPTAINCY VERDICT CONCEALED
                </div>
                <button
                  onClick={handleTriggerReveal}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-warning-amber hover:bg-amber-400 text-black font-display text-lg uppercase tracking-wider font-bold transition-all shadow-lg"
                >
                  Reveal Captain
                </button>
              </div>
            )}

            {/* Captaincy Advantage Card */}
            <div className="mt-6 w-full p-4 rounded-xl bg-bg-primary/90 border border-warning-amber/30 text-left">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-warning-amber font-bold mb-1">
                <Shield className="w-4 h-4" />
                <span>EXECUTIVE CAPTAIN PRIVILEGES</span>
              </div>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                {captaincyData.advantageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Contenders Arena Standings */}
        <div className="panel-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-accent-blue/20">
            <h3 className="font-display text-xl uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-blue" />
              <span>Contender Shootout Performance</span>
            </h3>
            <span className="text-xs font-mono text-text-secondary">3 Finalists</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {captaincyData.activeChallengers.map((challenger, idx) => {
              const isWinner = challenger.teamId === captaincyData.captainTeamId && captaincyData.isRevealed;
              return (
                <div
                  key={challenger.teamId}
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
                    {isWinner && (
                      <span className="text-[10px] font-mono uppercase bg-warning-amber text-black px-1.5 py-0.5 rounded font-bold">
                        WINNER
                      </span>
                    )}
                  </div>
                  <div className="font-display text-2xl uppercase tracking-wider text-text-primary">
                    {challenger.teamName}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary">Duel Score:</span>
                    <span className="text-accent-blue-glow font-bold text-sm">
                      {challenger.score} / 100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
};
