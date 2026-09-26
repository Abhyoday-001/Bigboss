import React from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { ParticipantNavbar } from '../components/ParticipantNavbar';
import { NeuronNetworkBackground } from '../components/NeuronNetworkBackground';
import { AmbientEyeBackground } from '../../shared/components/AmbientEyeBackground';
import { MOCK_TEAMS } from '../../shared/mocks/mockData';
import { Users, Shield, Award, Terminal, MapPin, CheckCircle, Crown, Eye } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { team } = useAuth();
  const activeTeam = team || MOCK_TEAMS[0];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <ParticipantNavbar />
      <AmbientEyeBackground position="bottom-right" />
      <NeuronNetworkBackground />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Header Card */}
        <div className="panel-card p-6 sm:p-8 border-l-4 border-l-accent-blue glow-blue-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-accent-blue/20">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-bg-primary border-2 border-accent-blue flex items-center justify-center glow-blue">
                <span className="font-display text-4xl text-accent-blue-glow">
                  {activeTeam.teamName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-xs font-mono text-accent-blue uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>HOUSE ID: {activeTeam.id}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-text-primary mt-1">
                  {activeTeam.teamName}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-text-secondary">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent-blue" />
                    {activeTeam.tableNumber || 'Station 01'}
                  </span>
                  <span>•</span>
                  <span>Cognito House Arena</span>
                </div>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="bg-bg-primary p-4 rounded-lg border border-accent-blue/30 text-center sm:text-right min-w-37.5">
              <div className="text-[10px] font-mono uppercase text-text-secondary">ACCUMULATED SCORE</div>
              <div className="font-mono text-3xl font-bold text-text-primary mt-1">
                {activeTeam.score.toLocaleString()}
                <span className="text-xs text-accent-blue ml-1">pts</span>
              </div>
              <div className="text-xs font-display text-accent-blue-glow mt-0.5">
                RANK #{activeTeam.rank} OVERALL
              </div>
            </div>
          </div>

          {/* Members Roster */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-blue" />
                <span>Registered Team Operatives</span>
              </h3>
              <span className="text-xs font-mono text-text-secondary">
                {activeTeam.members.length} Members Enrolled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeTeam.members.map((member, idx) => (
                <div
                  key={member.id}
                  className="bg-bg-primary p-4 rounded-lg border border-accent-blue/15 hover:border-accent-blue/40 transition-all flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-elevated border border-accent-blue/30 flex items-center justify-center font-display text-lg text-accent-blue">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-text-primary">
                      {member.name}
                    </div>
                    <div className="text-xs font-mono text-accent-blue-glow">
                      {member.role || 'Competitor'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tactical Badges & House Privileges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="panel-card p-6">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-blue" />
              <span>Current House Status & Perks</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-bg-primary border border-accent-blue/20 flex items-start gap-3">
                {activeTeam.isCaptain ? (
                  <Crown className="w-5 h-5 text-warning-amber shrink-0 mt-0.5" />
                ) : (
                  <Shield className="w-5 h-5 text-accent-blue shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold font-mono text-text-primary uppercase">
                    {activeTeam.isCaptain ? 'House Captain Designation' : 'Active Contender Status'}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {activeTeam.isCaptain
                      ? 'Holds immunity from direct nomination and tactical veto privilege in Round 3.'
                      : 'Subject to house nominations in Round 2. Competing for survival.'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-bg-primary border border-accent-blue/20 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-green shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold font-mono text-text-primary uppercase">
                    Surveillance Clearance Verified
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Telemetry connected to central score server. Automated anti-cheat audit active.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card p-6">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-blue" />
              <span>Telemetry Diagnostics</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-accent-blue/10">
                <span className="text-text-secondary">Auth Protocol</span>
                <span className="text-success-green">Bearer Token (256-bit)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-accent-blue/10">
                <span className="text-text-secondary">Heartbeat Latency</span>
                <span className="text-accent-blue">24ms (Local Mesh)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-accent-blue/10">
                <span className="text-text-secondary">Audit Stream</span>
                <span className="text-accent-blue-glow">COGNITO_SEMINAR_002</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">Anti-Tamper Status</span>
                <span className="text-success-green">SECURE / ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
