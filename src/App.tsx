import React from 'react';
import { EventProvider, useEventContext } from './contracts/EventContext';
import { AuthProvider } from './contracts/AuthContext';
import { Shell } from './components/Shell';
import { EventPhase } from './contracts/types';
import { SecretMission } from './modules/SecretMission/SecretMission';
import { NominationStatus } from './modules/NominationStatus/NominationStatus';
import { ImmunityChallenge } from './modules/ImmunityChallenge/ImmunityChallenge';
import { Voting } from './modules/Voting/Voting';
import { EvictionReveal } from './modules/Eviction/EvictionReveal';
import { Round4Features } from './modules/Round4Features/Round4Features';
import { Round4Submission } from './modules/Round4Submission/Round4Submission';
import { FinalResults } from './modules/FinalResults/FinalResults';

const ActiveModule: React.FC = () => {
  const { phase } = useEventContext();

  switch (phase) {
    case EventPhase.ROUND_2_SECRET_TASK:
      return <SecretMission />;
    case EventPhase.ROUND_2_NOMINATIONS:
      return <NominationStatus />;
    case EventPhase.ROUND_3_IMMUNITY:
      return <ImmunityChallenge />;
    case EventPhase.ROUND_3_VOTING_OPEN:
    case EventPhase.ROUND_3_VOTING_CLOSED:
      return <Voting />;
    case EventPhase.ROUND_3_EVICTION_REVEAL:
      return <EvictionReveal />;
    case EventPhase.ROUND_4_FEATURES_REVEALED:
      return <Round4Features />;
    case EventPhase.ROUND_4_SUBMISSION:
      return <Round4Submission />;
    case EventPhase.FINAL_RESULTS:
      return <FinalResults />;
    default:
      return <div className="text-center text-text-secondary py-12">Waiting for event to begin... ({phase})</div>;
  }
};

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Shell>
          <ActiveModule />
        </Shell>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
