import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEventPhase } from '../../shared/hooks/useEventPhase';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { RoundStatusBadge } from '../../shared/components/RoundStatusBadge';
import { TimerCountdown } from '../../shared/components/TimerCountdown';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import type { EventPhase } from '../../shared/state-machine/types';
import {
  Crown,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  ArrowRight,
  UserCheck,
  Terminal,
  Lock,
  Vote,
  Skull,
  Radio,
  Clock,
  Sparkles,
  Layers,
  Send,
  Eye,
  KeyRound,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { team } = useAuth();
  const { currentPhase, currentMetadata, targetEndTime } = useEventPhase();

  // Determine if this team qualifies for secret mission (1st, middle, or last on house roster)
  // In demo data: team-01 (#1), team-05 (#5), team-09 (#9)
  const isSecretMissionTeam =
    team?.id === 'team-01' ||
    team?.id === 'team-05' ||
    team?.id === 'team-09' ||
    team?.rank === 1 ||
    team?.rank === 5 ||
    team?.rank === 9;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Status & Timer Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1">
            <RoundStatusBadge />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 panel-card px-5 py-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                ROUND TIMER
              </div>
              <div className="text-xs text-accent-blue font-medium">
                {currentMetadata.isTimed ? 'Synchronized' : 'Host Controlled'}
              </div>
            </div>
            <TimerCountdown targetTimestamp={targetEndTime} size="md" />
          </div>
        </div>

        {/* Minimal Team Telemetry Card */}
        <div className="panel-card p-6 border-l-4 border-l-accent-blue glow-blue-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue">
                HOUSE TELEMETRY • {team?.tableNumber || 'POD 04'}
              </span>
              <h1 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-0.5">
                {team?.teamName || 'CyberNexus'}
              </h1>
              <div className="text-xs text-text-secondary mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-accent-blue" />
                  <span>{team?.members?.length || 2} Operatives</span>
                </span>
                <span className="text-text-secondary/40">•</span>
                <span className="font-mono text-accent-blue font-bold">
                  {team?.score ? team.score.toLocaleString() : 0} PTS
                </span>
              </div>
            </div>

            {/* Team Status Pill */}
            <div className="flex items-center gap-2">
              {team?.isCaptain && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-warning-amber/15 border border-warning-amber/40 text-warning-amber font-mono text-xs uppercase font-bold">
                  <Crown className="w-3.5 h-3.5" /> House Captain
                </span>
              )}
              {team?.isImmune && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-success-green/15 border border-success-green/40 text-success-green font-mono text-xs uppercase font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Immune From Eviction
                </span>
              )}
              {team?.isNominated && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-danger-red/15 border border-danger-red/40 text-danger-red font-mono text-xs uppercase font-bold glow-red">
                  <ShieldAlert className="w-3.5 h-3.5" /> Nominated for Eviction
                </span>
              )}
              {!team?.isCaptain && !team?.isNominated && !team?.isImmune && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent-blue/15 border border-accent-blue/40 text-accent-blue-glow font-mono text-xs uppercase">
                  Status: Safe & Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── STATE-DRIVEN ACTIVE ROUND / WAITING SECTION ── */}
        <div className="space-y-4">
          {/* 1. REGISTRATION / ROUND 0 */}
          {((currentPhase as string) === 'REGISTRATION' || (currentPhase as string) === 'NOT_STARTED' || (currentPhase as string) === 'LANDING' || (currentPhase as string) === 'LOGIN') && (
            <div className="panel-card p-8 border-t-4 border-t-accent-blue text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-accent-blue/15 border border-accent-blue/40 flex items-center justify-center mx-auto text-accent-blue">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-accent-blue">
                  SYSTEM INITIALIZED • ROUND 0
                </span>
                <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
                  Welcome to The Dev House
                </h2>
                <p className="text-xs text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
                  Terminal connections established. The Eye is calibrating house telemetry.
                  Review event protocols and stand by at your designated table pod.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-primary border border-accent-blue/20 text-xs font-mono text-accent-blue-glow">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Waiting for Round 1 to commence...</span>
              </div>
            </div>
          )}

          {/* 2. ROUND 1 ACTIVE */}
          {currentPhase === 'ROUND_1_ACTIVE' && (
            <div className="panel-card p-8 border-t-4 border-t-accent-blue space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5" /> ROUND 01 • ACTIVE CHALLENGE
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    Rapid Task Protocol Breach
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    Inspect the target system, fix failing unit test assertions, and submit your
                    solution vector to register initial points on the house ledger.
                  </p>
                </div>
                <Link
                  to="/round-1"
                  className="px-6 py-3 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-glow-blue transition-all shrink-0"
                >
                  <span>Launch Task Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 3. ROUND 1 EVALUATION / PAUSE (WAITING FOR NEXT ROUND) */}
          {(currentPhase === 'ROUND_1_RESULTS' || (currentPhase as string) === 'ROUND_1_EVALUATION') && (
            <div className="panel-card p-8 border-t-4 border-t-warning-amber text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-center mx-auto text-warning-amber">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-warning-amber">
                  ROUND 01 EVALUATION IN PROGRESS
                </span>
                <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
                  Scores Under Audit
                </h2>
                <p className="text-xs text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
                  Submissions are being cross-verified against test suites.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-primary border border-warning-amber/30 text-xs font-mono text-warning-amber">
                <span className="w-2 h-2 rounded-full bg-warning-amber animate-ping" />
                <span>Waiting for Round 2 (Captaincy Protocol)...</span>
              </div>
            </div>
          )}

          {/* 4. ROUND 2 CAPTAINCY */}
          {currentPhase === 'ROUND_2_CAPTAINCY' && (
            <div className="panel-card p-8 border-t-4 border-t-warning-amber space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-warning-amber flex items-center gap-1.5 font-bold">
                    <Crown className="w-3.5 h-3.5" /> ROUND 02 • CAPTAINCY ARENA
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    The Captaincy Duel
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    Contenders battle head-to-head for house leadership. The victor earns immunity
                    from eviction.
                  </p>
                </div>
                <Link
                  to="/round-2-captaincy"
                  className="px-6 py-3 rounded-lg bg-warning-amber hover:bg-amber-400 text-black font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
                >
                  <span>Enter Captaincy Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 5. ROUND 2 SECRET TASK (ONLY 3 TEAMS SEE IT, ALL OTHERS STANDBY) */}
          {currentPhase === 'ROUND_2_SECRET_TASK' && (
            <>
              {isSecretMissionTeam ? (
                <div className="panel-card p-8 border-t-4 border-t-danger-red space-y-5 bg-gradient-to-b from-danger-red/10 to-bg-elevated glow-red">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red flex items-center gap-1.5 font-bold">
                        <KeyRound className="w-3.5 h-3.5 animate-pulse" /> RESTRICTED CLASSIFIED TRANSMISSION
                      </span>
                      <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                        Secret Mission Assigned
                      </h2>
                      <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                        Your team has been singled out by the Eye for a clandestine directive.
                        Maintain absolute operational secrecy.
                      </p>
                    </div>
                    <Link
                      to="/secret-mission"
                      className="px-6 py-3 rounded-lg bg-danger-red hover:bg-red-600 text-white font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-glow-red transition-all shrink-0"
                    >
                      <span>Access Classified Briefing</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="panel-card p-8 border-t-4 border-t-accent-blue text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-accent-blue/15 border border-accent-blue/40 flex items-center justify-center mx-auto text-accent-blue">
                    <Eye className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-accent-blue">
                      HOUSE QUIET PERIOD
                    </span>
                    <h2 className="text-2xl font-display uppercase tracking-wider text-text-primary mt-1">
                      Surveillance Recalibrating
                    </h2>
                    <p className="text-xs text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
                      The host is reviewing house performance. Stand by for the upcoming eviction nominations.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-primary border border-accent-blue/20 text-xs font-mono text-accent-blue-glow">
                    <span>Waiting for next round...</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 6. ROUND 2 NOMINATIONS */}
          {currentPhase === 'ROUND_2_NOMINATIONS' && (
            <div className="panel-card p-8 border-t-4 border-t-danger-red space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" /> ROUND 02 • NOMINATIONS RECORDED
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    House Eviction Nominations
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    The Eye has selected teams facing risk of eviction. Check your house nomination status
                    and prepare for the Round 3 immunity challenge.
                  </p>
                </div>
                <Link
                  to="/nomination-status"
                  className="px-6 py-3 rounded-lg bg-danger-red hover:bg-red-600 text-white font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-glow-red transition-all shrink-0"
                >
                  <span>Check Nomination Ledger</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 7. ROUND 3 IMMUNITY (SAFE TEAM + NOMINATED TEAM PAIRING) */}
          {currentPhase === 'ROUND_3_IMMUNITY' && (
            <div className="panel-card p-8 border-t-4 border-t-success-green space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-success-green flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> ROUND 03 • IMMUNITY CHALLENGE
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    Safe vs Nominated Duel
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    Nominated teams duel their assigned safe team partners. Winning the challenge grants
                    instant immunity and overturns nomination status.
                  </p>
                </div>
                <Link
                  to="/immunity-challenge"
                  className="px-6 py-3 rounded-lg bg-success-green hover:bg-emerald-400 text-black font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
                >
                  <span>Enter Immunity Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 8. ROUND 3 VOTING */}
          {currentPhase === 'ROUND_3_VOTING' && (
            <div className="panel-card p-8 border-t-4 border-t-accent-blue space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-1.5 font-bold">
                    <Vote className="w-3.5 h-3.5" /> ROUND 03 • HOUSE BALLOT
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    Confidential Voting Booth
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    The voting window is now open. Cast your ballot to determine which nominated team
                    leaves the house.
                  </p>
                </div>
                <Link
                  to="/voting"
                  className="px-6 py-3 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-glow-blue transition-all shrink-0"
                >
                  <span>Cast Confidential Vote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 9. ROUND 3 EVICTION REVEAL */}
          {currentPhase === 'ROUND_3_EVICTION_REVEAL' && (
            <div className="panel-card p-8 border-t-4 border-t-danger-red space-y-5 bg-gradient-to-b from-danger-red/10 to-bg-elevated glow-red">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-danger-red flex items-center gap-1.5 font-bold">
                    <Skull className="w-3.5 h-3.5 animate-pulse" /> LIVE BROADCAST
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    Eviction Ceremony
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    The house vote is tallied. The Eye reveals who is evicted from The Dev House.
                  </p>
                </div>
                <Link
                  to="/eviction-reveal"
                  className="px-6 py-3 rounded-lg bg-danger-red hover:bg-red-600 text-white font-display tracking-wider text-base uppercase font-bold flex items-center justify-center gap-2 shadow-glow-red transition-all shrink-0"
                >
                  <span>Watch Eviction Reveal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 10. ROUND 4 CTF / VIBE CODING & SUBMISSION */}
          {(currentPhase === 'ROUND_4_FEATURES_REVEALED' ||
            currentPhase === 'ROUND_4_SUBMISSION' ||
            (currentPhase as string).includes('ROUND_4')) && (
            <div className="panel-card p-8 border-t-4 border-t-accent-blue space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-1.5 font-bold">
                    <Layers className="w-3.5 h-3.5" /> ROUND 04 • GRAND FINALE BUILD
                  </span>
                  <h2 className="text-3xl font-display uppercase tracking-wider text-text-primary mt-1">
                    Hidden Feature Specs & Build Submission
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
                    Implement the live revealed feature specifications, complete the challenge,
                    and submit your deployment link for final judging.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/round-4-features"
                    className="px-4 py-2.5 rounded-lg bg-bg-elevated hover:bg-accent-blue/20 border border-accent-blue/30 text-xs font-mono text-accent-blue uppercase transition-all"
                  >
                    View Specs
                  </Link>
                  <Link
                    to="/round-4-submission"
                    className="px-5 py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue-glow text-black font-display tracking-wider text-base uppercase font-bold shadow-glow-blue transition-all"
                  >
                    Submit Build
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 11. GRAND FINALE RESULTS */}
          {(currentPhase === 'FINAL_RESULTS' ||
            (currentPhase as string) === 'EVENT_CONCLUDED' ||
            (currentPhase as string) === 'EVENT_ENDED') && (
            <div className="panel-card p-8 border-t-4 border-t-success-green space-y-5 text-center bg-gradient-to-b from-success-green/10 to-bg-elevated glow-green">
              <div className="w-16 h-16 rounded-full bg-success-green/15 border-2 border-success-green flex items-center justify-center mx-auto text-success-green glow-green">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-success-green font-bold">
                  CHAMPIONSHIP CONCLUDED
                </span>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-text-primary mt-1">
                  The Dev House Champions
                </h2>
                <p className="text-xs text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
                  Final judging is complete. The ultimate winner has been crowned.
                </p>
              </div>
              <div>
                <Link
                  to="/final-results"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-success-green hover:bg-emerald-400 text-black font-display tracking-wider text-lg uppercase font-bold shadow-lg transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>View Grand Champions Podium</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

