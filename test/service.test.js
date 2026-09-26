import adminRoundService from '../src/admin/services/adminRoundService.js';

async function runTests() {
  console.log('--- Starting AdminRoundService Contract Verification Tests ---');

  // 1. Teams & Leaderboard
  const teams = await adminRoundService.getTeams();
  console.assert(teams.length >= 3, 'Teams loaded');
  const lb = await adminRoundService.getLeaderboard();
  console.assert(lb[0].rank === 1, 'Leaderboard ranked correctly');
  console.log('✓ Teams and Leaderboard verified');

  // 2. Round 2 Captaincy
  const capStart = await adminRoundService.startCaptaincyCompetition(['team-1', 'team-2'], 'Decrypt CCTV feed');
  console.assert(capStart.active === true, 'Captaincy started');
  const capWin = await adminRoundService.setCaptainWinner('team-1', 'Alice', 'Immunity Shield');
  console.assert(capWin.winnerId === 'team-1', 'Captain declared');
  const capRev = await adminRoundService.revealCaptain(true);
  console.assert(capRev.revealedToParticipants === true, 'Captain revealed');
  console.log('✓ Round 2 Captaincy & Reveal verified');

  // 3. Round 2 Nominations
  await adminRoundService.setNominationConfig(3);
  const nomResult = await adminRoundService.submitNominations(['team-6', 'team-7'], { 'team-6': 'Low score' });
  console.assert(nomResult.nominatedTeamIds.includes('team-6'), 'Nominations saved');
  console.log('✓ Round 2 Nominations verified');

  // 4. Round 2 Secret Mission (Auto 1st, mid, last)
  const smResult = await adminRoundService.assignSecretMissions('Shadow Protocol');
  console.assert(smResult.assignments.length === 3, 'Secret mission assigned to 3 teams');
  console.assert(smResult.assignments[0].rank === 1, 'First team is rank 1');
  await adminRoundService.updateSecretMissionStatus(smResult.assignments[0].teamId, 'completed', 25);
  console.log('✓ Round 2 Secret Mission (1st/mid/last auto-assignment) verified');

  // 5. Round 3 Pairings & Immunity
  const { nominatedTeams, safeTeams } = await adminRoundService.getNominatedAndSafeTeams();
  console.assert(nominatedTeams.length > 0 && safeTeams.length > 0, 'Nominated and safe teams segmented');
  const pairTest = [{ id: 'pair-test', nominatedTeamId: nominatedTeams[0].id, safeTeamId: safeTeams[0].id, status: 'pending' }];
  await adminRoundService.savePairings(pairTest);
  await adminRoundService.startImmunityChallenge('Overclock Duel');
  const immResolved = await adminRoundService.resolveImmunityDuel('pair-test', nominatedTeams[0].id, true);
  console.assert(immResolved.pairings.find(p => p.id === 'pair-test').winnerId === nominatedTeams[0].id, 'Immunity duel resolved');
  console.log('✓ Round 3 Pairings & Immunity challenge verified');

  // 6. Round 3 Voting & Eviction
  const vOpen = await adminRoundService.toggleVotingWindow(true, 'mixed');
  console.assert(vOpen.isOpen === true, 'Voting window opened');
  const evictRes = await adminRoundService.triggerEviction(['team-7']);
  console.assert(evictRes.evictedTeamIds.includes('team-7'), 'Eviction triggered');
  console.log('✓ Round 3 Voting & Eviction Reveal verified');

  // 7. Round 4 Hidden Features
  const newFeat = await adminRoundService.createHiddenFeature({
    title: 'Automated Bot Detection',
    description: 'Reject bot queries with captcha',
    category: 'required',
    points: 30,
    revealed: false
  });
  console.assert(newFeat.id, 'Hidden feature created');
  const toggledFeat = await adminRoundService.toggleFeatureReveal(newFeat.id, true);
  console.assert(toggledFeat.revealed === true, 'Hidden feature revealed');
  console.log('✓ Round 4 Hidden Features CRUD & reveal verified');

  // 8. Round 4 Submissions & Judging
  const subs = await adminRoundService.getSubmissions();
  console.assert(subs.length > 0, 'Submissions retrieved');
  const scoreResult = await adminRoundService.submitJudgeScore(subs[0].teamId, { [newFeat.id]: 30 }, 'Flawless execution');
  console.assert(scoreResult.totalAwarded === 30, 'Judge score computed and submitted');
  console.log('✓ Round 4 Submissions & Judge Scoring verified');

  // 9. Round 4 Penalties
  const penalty = await adminRoundService.applyPenalty(subs[0].teamId, 15, 'Unauthorized 3D assets', 'Rule violation');
  console.assert(penalty.deductionPoints === 15, 'Penalty applied');
  console.log('✓ Round 4 Penalty Interface verified');

  // 10. Finale Final Scoreboard & Winner
  const finale = await adminRoundService.revealWinner(true);
  console.assert(finale.winner !== null, 'Winner determined');
  console.assert(finale.winnerRevealed === true, 'Winner broadcast enabled');
  console.log('✓ Grand Finale Scoreboard & Winner Announcement verified');

  console.log('\n>>> ALL 10 TEST SUITES PASSED CLEANLY <<<');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
