/**
 * Admin Round Service
 * Consumes REST APIs from Railway backend (configured via VITE_API_BASE_URL)
 * Provides contract-compliant fallback mocks when backend is offline/unreachable
 * per spoorthi.md specifications.
 */

const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  '';

// Default mock state for testing & offline integration
const INITIAL_TEAMS = [
  { id: 'team-1', name: 'CyberSentinels', members: ['Alice', 'Bob'], score: 145, status: 'active', rank: 1, prevRank: 1 },
  { id: 'team-2', name: 'KernelPanics', members: ['Charlie', 'Dave'], score: 130, status: 'active', rank: 2, prevRank: 3 },
  { id: 'team-3', name: 'ByteBandits', members: ['Elena', 'Frank'], score: 115, status: 'active', rank: 3, prevRank: 2 },
  { id: 'team-4', name: 'NullPointers', members: ['Grace', 'Heidi'], score: 95, status: 'active', rank: 4, prevRank: 4 },
  { id: 'team-5', name: 'BinaryBeasts', members: ['Ivan', 'Judy'], score: 85, status: 'active', rank: 5, prevRank: 6 },
  { id: 'team-6', name: 'SyntaxStrikers', members: ['Mallory', 'Niaj'], score: 70, status: 'active', rank: 6, prevRank: 5 },
  { id: 'team-7', name: 'GlitchHunters', members: ['Oscar', 'Peggy'], score: 60, status: 'active', rank: 7, prevRank: 7 },
];

class AdminRoundService {
  constructor() {
    this.storageKey = 'dev_house_admin_spoorthi_state_v1';
    this.state = this._loadState();
  }

  _loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return this._getInitialState();
  }

  _saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      }
    } catch {
      // ignore
    }
  }

  _getInitialState() {
    return {
      teams: [...INITIAL_TEAMS],
      captaincy: {
        active: false,
        competitors: ['team-1', 'team-2'],
        challenge: 'Surveillance Blindspot: Decrypt the hidden CCTV camera IP stream within 10 minutes.',
        winnerId: null,
        winnerName: null,
        captainName: null,
        advantage: 'Immunity shield usable in Round 3 for either themselves or an ally.',
        revealedToParticipants: false,
      },
      nominations: {
        maxCount: 3,
        nominatedTeamIds: ['team-6', 'team-7'],
        notes: {
          'team-6': 'Lowest task score in Round 1.',
          'team-7': 'Failed security benchmark.',
        },
        locked: false,
      },
      secretMissions: {
        assigned: false,
        brief: 'Shadow Protocol: Covertly inject a backdoor feature into the opponent codebase without alert triggers.',
        assignments: [], // [{ teamId, teamName, position: 'first'|'middle'|'last', rank, status: 'pending'|'completed'|'failed', points: 25 }]
      },
      pairings: [
        { id: 'pair-1', nominatedTeamId: 'team-6', safeTeamId: 'team-1', status: 'pending', winnerId: null },
        { id: 'pair-2', nominatedTeamId: 'team-7', safeTeamId: 'team-2', status: 'pending', winnerId: null },
      ],
      immunity: {
        active: false,
        challengeName: 'Firewall Overclock Duel: Rapid-fire algorithmic puzzle solve.',
        results: {},
      },
      voting: {
        isOpen: false,
        voterRole: 'mixed', // 'judges' | 'participants' | 'audience' | 'mixed'
        votes: {
          'team-6': 18,
          'team-7': 29,
        },
        totalVotes: 47,
      },
      eviction: {
        evictedTeamIds: [],
        revealed: false,
        timestamp: null,
      },
      hiddenFeatures: [
        {
          id: 'feat-1',
          title: 'Real-time WebSocket Live Ticker',
          description: 'A glowing surveillance telemetry ticker showing house heartbeat and ping latency.',
          category: 'required',
          points: 30,
          revealed: true,
          revealedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'feat-2',
          title: 'Biometric Voice/Face Access Simulation',
          description: 'A mock retinal or fingerprint scanner component with CSS canvas scanlines.',
          category: 'required',
          points: 25,
          revealed: true,
          revealedAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'feat-3',
          title: 'Bigg Boss Panic Button with Audio Trigger',
          description: 'An alert mechanism playing an ominous synthesized klaxon with screen glitch FX.',
          category: 'bonus',
          points: 15,
          revealed: false,
          revealedAt: null,
        },
        {
          id: 'feat-4',
          title: 'Encrypted Confession Room Messenger',
          description: 'Direct encrypted channel simulating secret one-on-one confessionals with Big Boss.',
          category: 'bonus',
          points: 20,
          revealed: false,
          revealedAt: null,
        },
      ],
      submissions: [
        {
          id: 'sub-1',
          teamId: 'team-1',
          teamName: 'CyberSentinels',
          repoUrl: 'https://github.com/cybersentinels/dev-house-finale',
          liveDemoUrl: 'https://cybersentinels-devhouse.vercel.app',
          submittedAt: new Date(Date.now() - 1200000).toISOString(),
          status: 'submitted',
        },
        {
          id: 'sub-2',
          teamId: 'team-2',
          teamName: 'KernelPanics',
          repoUrl: 'https://github.com/kernelpanics/vibe-code-finale',
          liveDemoUrl: 'https://kernelpanics-house.netlify.app',
          submittedAt: new Date(Date.now() - 900000).toISOString(),
          status: 'submitted',
        },
        {
          id: 'sub-3',
          teamId: 'team-3',
          teamName: 'ByteBandits',
          repoUrl: 'https://github.com/bytebandits/house-defense',
          liveDemoUrl: 'https://bytebandits-portal.vercel.app',
          submittedAt: new Date(Date.now() - 600000).toISOString(),
          status: 'submitted',
        },
      ],
      judgeScores: {}, // { [teamId]: { featureScores: { [featId]: points }, notes: '', totalAwarded: number } }
      penalties: [
        {
          id: 'pen-1',
          teamId: 'team-2',
          teamName: 'KernelPanics',
          deductionPoints: 10,
          outOfScopeFeature: 'Unapproved 3D Three.js Game Engine Integration',
          reason: 'Violated feature scope constraints by importing unauthorized heavy 3D assets.',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        }
      ],
      finalResults: {
        winnerRevealed: false,
        standings: [],
      }
    };
  }

  resetAllState() {
    this.state = this._getInitialState();
    this._saveState();
    return this.state;
  }

  async _request(endpoint, options = {}) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          ...options,
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`[adminRoundService] Backend call to ${endpoint} failed. Using mock fallback.`, err);
      }
    }
    return null;
  }

  // ==================== TEAMS & LEADERBOARD ====================
  async getTeams() {
    const remote = await this._request('/api/teams');
    if (remote) return remote;
    return [...this.state.teams];
  }

  async getLeaderboard() {
    const remote = await this._request('/api/leaderboard');
    if (remote) return remote;
    return [...this.state.teams].sort((a, b) => b.score - a.score).map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));
  }

  // ==================== ROUND 2: CAPTAINCY ====================
  async getCaptaincyStatus() {
    const remote = await this._request('/api/admin/round2/captaincy');
    if (remote) return remote;
    return { ...this.state.captaincy };
  }

  async startCaptaincyCompetition(competitorIds, challengeBrief) {
    const payload = { competitorIds, challengeBrief };
    const remote = await this._request('/api/admin/round2/captaincy/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.captaincy.active = true;
    this.state.captaincy.competitors = competitorIds;
    if (challengeBrief) this.state.captaincy.challenge = challengeBrief;
    this.state.captaincy.winnerId = null;
    this.state.captaincy.revealedToParticipants = false;
    this._saveState();
    return { ...this.state.captaincy };
  }

  async setCaptainWinner(teamId, captainName, advantageDetails) {
    const payload = { teamId, captainName, advantageDetails };
    const remote = await this._request('/api/admin/round2/captaincy/winner', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    const team = this.state.teams.find(t => t.id === teamId);
    this.state.captaincy.winnerId = teamId;
    this.state.captaincy.winnerName = team ? team.name : 'Unknown Team';
    this.state.captaincy.captainName = captainName || (team ? team.members[0] : 'Leader');
    if (advantageDetails) this.state.captaincy.advantage = advantageDetails;
    this._saveState();
    return { ...this.state.captaincy };
  }

  async revealCaptain(revealed = true) {
    const payload = { revealed };
    const remote = await this._request('/api/admin/round2/captaincy/reveal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.captaincy.revealedToParticipants = revealed;
    this._saveState();
    return { ...this.state.captaincy };
  }

  // ==================== ROUND 2: NOMINATIONS ====================
  async getNominations() {
    const remote = await this._request('/api/admin/round2/nominations');
    if (remote) return remote;
    return { ...this.state.nominations };
  }

  async setNominationConfig(count) {
    const payload = { maxCount: Number(count) };
    const remote = await this._request('/api/admin/round2/nominations/config', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.nominations.maxCount = Number(count);
    this._saveState();
    return { ...this.state.nominations };
  }

  async submitNominations(nominatedTeamIds, notesMap = {}) {
    const payload = { nominatedTeamIds, notes: notesMap };
    const remote = await this._request('/api/admin/round2/nominations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.nominations.nominatedTeamIds = nominatedTeamIds;
    this.state.nominations.notes = notesMap;
    this.state.nominations.locked = true;

    // Update team statuses in state
    this.state.teams = this.state.teams.map(t => ({
      ...t,
      status: nominatedTeamIds.includes(t.id) ? 'nominated' : (t.status === 'evicted' ? 'evicted' : 'safe')
    }));

    this._saveState();
    return { ...this.state.nominations };
  }

  // ==================== ROUND 2: SECRET MISSION ====================
  async getSecretMissionStatus() {
    const remote = await this._request('/api/admin/round2/secret-mission');
    if (remote) return remote;
    return { ...this.state.secretMissions };
  }

  async assignSecretMissions(missionBrief) {
    const payload = { brief: missionBrief };
    const remote = await this._request('/api/admin/round2/secret-mission/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    // Must calculate First, Middle, and Last from LIVE leaderboard order per spoorthi.md
    const sorted = [...this.state.teams].sort((a, b) => b.score - a.score);
    if (sorted.length < 3) throw new Error("At least 3 teams required to assign first, middle, and last secret missions.");

    const firstIndex = 0;
    const middleIndex = Math.floor(sorted.length / 2);
    const lastIndex = sorted.length - 1;

    const firstTeam = sorted[firstIndex];
    const middleTeam = sorted[middleIndex];
    const lastTeam = sorted[lastIndex];

    this.state.secretMissions.brief = missionBrief || this.state.secretMissions.brief;
    this.state.secretMissions.assigned = true;
    this.state.secretMissions.assignments = [
      {
        teamId: firstTeam.id,
        teamName: firstTeam.name,
        position: 'First on Leaderboard',
        rank: 1,
        status: 'pending',
        points: 25,
      },
      {
        teamId: middleTeam.id,
        teamName: middleTeam.name,
        position: 'Middle on Leaderboard',
        rank: middleIndex + 1,
        status: 'pending',
        points: 25,
      },
      {
        teamId: lastTeam.id,
        teamName: lastTeam.name,
        position: 'Last on Leaderboard',
        rank: sorted.length,
        status: 'pending',
        points: 25,
      },
    ];

    this._saveState();
    return { ...this.state.secretMissions };
  }

  async updateSecretMissionStatus(teamId, status, pointsAwarded = 25) {
    const payload = { teamId, status, pointsAwarded };
    const remote = await this._request('/api/admin/round2/secret-mission/status', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    const mission = this.state.secretMissions.assignments.find(m => m.teamId === teamId);
    if (mission) {
      mission.status = status;
      mission.pointsAwarded = status === 'completed' ? pointsAwarded : 0;
      if (status === 'completed') {
        const team = this.state.teams.find(t => t.id === teamId);
        if (team) team.score += pointsAwarded;
      }
    }
    this._saveState();
    return { ...this.state.secretMissions };
  }

  // ==================== ROUND 3: TEAM PAIRINGS ====================
  async getNominatedAndSafeTeams() {
    const remoteNom = await this._request('/api/admin/round3/teams/nominated');
    const remoteSafe = await this._request('/api/admin/round3/teams/safe');
    if (remoteNom && remoteSafe) {
      return { nominatedTeams: remoteNom, safeTeams: remoteSafe };
    }

    const nominatedTeams = this.state.teams.filter(t => this.state.nominations.nominatedTeamIds.includes(t.id));
    const safeTeams = this.state.teams.filter(t => !this.state.nominations.nominatedTeamIds.includes(t.id) && t.status !== 'evicted');
    return { nominatedTeams, safeTeams };
  }

  async getPairings() {
    const remote = await this._request('/api/admin/round3/pairings');
    if (remote) return remote;
    return [...this.state.pairings];
  }

  async savePairings(pairingsList) {
    const payload = { pairings: pairingsList };
    const remote = await this._request('/api/admin/round3/pairings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.pairings = pairingsList;
    this._saveState();
    return [...this.state.pairings];
  }

  // ==================== ROUND 3: IMMUNITY CONTROL ====================
  async getImmunityStatus() {
    const remote = await this._request('/api/admin/round3/immunity/status');
    if (remote) return remote;
    return { ...this.state.immunity, pairings: this.state.pairings };
  }

  async startImmunityChallenge(challengeName) {
    const payload = { challengeName };
    const remote = await this._request('/api/admin/round3/immunity/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.immunity.active = true;
    if (challengeName) this.state.immunity.challengeName = challengeName;
    this._saveState();
    return { ...this.state.immunity };
  }

  async resolveImmunityDuel(pairingId, winnerId, immunityGranted) {
    const payload = { pairingId, winnerId, immunityGranted };
    const remote = await this._request('/api/admin/round3/immunity/resolve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    const pair = this.state.pairings.find(p => p.id === pairingId);
    if (pair) {
      pair.status = 'resolved';
      pair.winnerId = winnerId;
      pair.immunityGranted = immunityGranted;

      // If nominated team won immunity, update their status to safe / immune
      if (immunityGranted && pair.nominatedTeamId === winnerId) {
        this.state.nominations.nominatedTeamIds = this.state.nominations.nominatedTeamIds.filter(id => id !== winnerId);
        const team = this.state.teams.find(t => t.id === winnerId);
        if (team) team.status = 'immune';
      }
    }
    this._saveState();
    return { ...this.state.immunity, pairings: this.state.pairings };
  }

  // ==================== ROUND 3: VOTING CONTROL ====================
  async getVotingStatus() {
    const remote = await this._request('/api/admin/round3/voting/results');
    if (remote) return remote;
    return { ...this.state.voting };
  }

  async toggleVotingWindow(isOpen, voterRole = 'mixed') {
    const payload = { isOpen, voterRole };
    const remote = await this._request('/api/admin/round3/voting/toggle', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.voting.isOpen = isOpen;
    this.state.voting.voterRole = voterRole;
    this._saveState();
    return { ...this.state.voting };
  }

  // ==================== ROUND 3: EVICTION REVEAL ====================
  async getEvictionStatus() {
    const remote = await this._request('/api/admin/round3/eviction/result');
    if (remote) return remote;
    return { ...this.state.eviction };
  }

  async triggerEviction(evictedTeamIds) {
    const payload = { evictedTeamIds };
    const remote = await this._request('/api/admin/round3/eviction/trigger', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.eviction.evictedTeamIds = evictedTeamIds;
    this.state.eviction.revealed = true;
    this.state.eviction.timestamp = new Date().toISOString();

    // Mark teams evicted
    this.state.teams = this.state.teams.map(t => ({
      ...t,
      status: evictedTeamIds.includes(t.id) ? 'evicted' : (t.status === 'evicted' ? 'evicted' : 'safe')
    }));

    this._saveState();
    return { ...this.state.eviction };
  }

  // ==================== ROUND 4: HIDDEN FEATURES ====================
  async getHiddenFeatures() {
    const remote = await this._request('/api/admin/round4/features');
    if (remote) return remote;
    return [...this.state.hiddenFeatures];
  }

  async createHiddenFeature(featureData) {
    const remote = await this._request('/api/admin/round4/features', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
    if (remote) return remote;

    const newFeature = {
      id: `feat-${Date.now()}`,
      title: featureData.title,
      description: featureData.description,
      category: featureData.category || 'required',
      points: Number(featureData.points) || 10,
      revealed: Boolean(featureData.revealed),
      revealedAt: featureData.revealed ? new Date().toISOString() : null,
    };
    this.state.hiddenFeatures.push(newFeature);
    this._saveState();
    return newFeature;
  }

  async updateHiddenFeature(id, featureData) {
    const remote = await this._request(`/api/admin/round4/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(featureData),
    });
    if (remote) return remote;

    const idx = this.state.hiddenFeatures.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.state.hiddenFeatures[idx] = {
        ...this.state.hiddenFeatures[idx],
        ...featureData,
        points: Number(featureData.points) || this.state.hiddenFeatures[idx].points,
      };
      this._saveState();
      return this.state.hiddenFeatures[idx];
    }
    throw new Error(`Feature with id ${id} not found.`);
  }

  async deleteHiddenFeature(id) {
    const remote = await this._request(`/api/admin/round4/features/${id}`, {
      method: 'DELETE',
    });
    if (remote) return remote;

    this.state.hiddenFeatures = this.state.hiddenFeatures.filter(f => f.id !== id);
    this._saveState();
    return { success: true };
  }

  async toggleFeatureReveal(id, isRevealed) {
    const remote = await this._request(`/api/admin/round4/features/${id}/reveal`, {
      method: 'PATCH',
      body: JSON.stringify({ revealed: isRevealed }),
    });
    if (remote) return remote;

    const feature = this.state.hiddenFeatures.find(f => f.id === id);
    if (feature) {
      feature.revealed = isRevealed;
      feature.revealedAt = isRevealed ? new Date().toISOString() : null;
      this._saveState();
      return feature;
    }
    throw new Error(`Feature with id ${id} not found.`);
  }

  // ==================== ROUND 4: SUBMISSIONS ====================
  async getSubmissions() {
    const remote = await this._request('/api/admin/round4/submissions');
    if (remote) return remote;
    return [...this.state.submissions];
  }

  // ==================== ROUND 4: JUDGE SCORING ====================
  async getJudgeScores() {
    const remote = await this._request('/api/admin/round4/scores');
    if (remote) return remote;
    return { ...this.state.judgeScores };
  }

  async submitJudgeScore(teamId, featureScores, notes = '') {
    const totalAwarded = Object.values(featureScores).reduce((sum, pts) => sum + Number(pts || 0), 0);
    const payload = { teamId, featureScores, notes, totalAwarded };

    const remote = await this._request('/api/admin/round4/scores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.judgeScores[teamId] = {
      featureScores,
      notes,
      totalAwarded,
      submittedAt: new Date().toISOString(),
    };

    // Recalculate team total score
    const team = this.state.teams.find(t => t.id === teamId);
    if (team) {
      team.score += totalAwarded;
    }

    this._saveState();
    return this.state.judgeScores[teamId];
  }

  // ==================== ROUND 4: PENALTIES ====================
  async getPenalties() {
    const remote = await this._request('/api/admin/round4/penalties');
    if (remote) return remote;
    return [...this.state.penalties];
  }

  async applyPenalty(teamId, deductionPoints, outOfScopeFeature, reason) {
    const payload = { teamId, deductionPoints: Number(deductionPoints), outOfScopeFeature, reason };
    const remote = await this._request('/api/admin/round4/penalties', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    const team = this.state.teams.find(t => t.id === teamId);
    const newPenalty = {
      id: `pen-${Date.now()}`,
      teamId,
      teamName: team ? team.name : 'Unknown Team',
      deductionPoints: Number(deductionPoints),
      outOfScopeFeature,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.state.penalties.unshift(newPenalty);
    if (team) {
      team.score = Math.max(0, team.score - Number(deductionPoints));
    }

    this._saveState();
    return newPenalty;
  }

  // ==================== ROUND 4 / FINALE: FINAL RESULTS ====================
  async getFinalResults() {
    const remote = await this._request('/api/final-results');
    if (remote) return remote;

    const standings = [...this.state.teams]
      .filter(t => t.status !== 'evicted')
      .sort((a, b) => b.score - a.score)
      .map((t, index) => {
        const teamPenalties = this.state.penalties.filter(p => p.teamId === t.id);
        const penaltyTotal = teamPenalties.reduce((sum, p) => sum + p.deductionPoints, 0);
        const judgeData = this.state.judgeScores[t.id];
        return {
          ...t,
          finalRank: index + 1,
          penaltyDeductions: penaltyTotal,
          round4Score: judgeData ? judgeData.totalAwarded : 0,
        };
      });

    return {
      winnerRevealed: this.state.finalResults.winnerRevealed,
      winner: standings[0] || null,
      standings,
      evictedTeams: this.state.teams.filter(t => t.status === 'evicted'),
    };
  }

  async revealWinner(isRevealed = true) {
    const payload = { revealed: isRevealed };
    const remote = await this._request('/api/admin/finale/reveal-winner', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (remote) return remote;

    this.state.finalResults.winnerRevealed = isRevealed;
    this._saveState();
    return await this.getFinalResults();
  }
}

export const adminRoundService = new AdminRoundService();
export default adminRoundService;
