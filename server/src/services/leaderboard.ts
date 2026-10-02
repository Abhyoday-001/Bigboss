import { prisma } from '../utils/db';

export class LeaderboardService {
  /**
   * Calculates the full leaderboard based on the append-only ScoreEntry ledger.
   * Returns sorted teams with rank.
   */
  static async getLeaderboard() {
    // In a real app with many score entries, we would group by in SQL.
    // For 50 teams, pulling active teams and aggregating in memory is very fast.
    const teams = await prisma.team.findMany({
      where: { status: { not: 'EVICTED' } },
      include: {
        scoreEntries: {
          select: { delta: true },
        },
      },
    });

    const leaderboard = teams.map((t) => {
      const score = t.scoreEntries.reduce((sum, entry) => sum + entry.delta, 0);
      return {
        id: t.id,
        teamName: t.name,
        score,
        avatarUrl: t.avatarUrl,
        isCaptain: t.isCaptain,
        isNominated: t.status === 'NOMINATED',
        isEliminated: t.status === 'EVICTED',
      };
    });

    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);

    // Assign rank
    return leaderboard.map((t, index) => ({
      ...t,
      rank: index + 1,
    }));
  }
}
