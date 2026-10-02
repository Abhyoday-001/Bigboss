# Contract Audit Report

## Frontend API Expectations (Derived from `src/contracts/mockApi.ts` and `src/shared/types`)

The frontend currently uses mock implementations for all API calls. There are no direct `fetch` or `axios` calls in the application code, but the `mockApi.ts` file outlines the expected response structures.

### Expected REST Endpoints & Data Shapes

**1. Secret Mission**
- **Expected Endpoint:** `GET /api/team/me/secret-mission` (Inferred)
- **Response Shape:**
  ```typescript
  {
    isAssigned: boolean;
    brief?: string;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  }
  ```

**2. Nomination Status**
- **Expected Endpoint:** `GET /api/team/me/nomination` (Inferred)
- **Response Shape:**
  ```typescript
  {
    isNominated: boolean;
    reason?: string;
    nextSteps?: string;
  }
  ```

**3. Immunity Details**
- **Expected Endpoint:** `GET /api/team/me/immunity` (Inferred)
- **Response Shape:**
  ```typescript
  {
    isParticipating: boolean;
    pairedTeam?: { id: string; name: string; role: 'SAFE' | 'NOMINATED' };
    challenge?: { title: string; description: string };
    outcome?: 'PENDING' | 'WON' | 'LOST' | null;
  }
  ```

**4. Voting Data**
- **Expected Endpoint:** `GET /api/voting/data` (Inferred)
- **Response Shape:**
  ```typescript
  {
    candidates: Team[]; // See Team interface below
    allowedRoles: ('PARTICIPANT' | 'JUDGE' | 'AUDIENCE')[];
    hasVoted: boolean;
  }
  ```

**5. Submit Vote**
- **Expected Endpoint:** `POST /api/voting/vote` (Inferred)
- **Request Body:** `{ candidateId: string }`
- **Response Shape:** `{ success: boolean }`

**6. Eviction Result**
- **Expected Endpoint:** `GET /api/eviction/result` (Inferred)
- **Response Shape:**
  ```typescript
  {
    status: 'SAFE' | 'EVICTED' | 'PENDING';
    message?: string;
  }
  ```

**7. Hidden Features**
- **Expected Endpoint:** `GET /api/features` (Inferred)
- **Response Shape:** Array of:
  ```typescript
  {
    id: string;
    title: string;
    type: 'REQUIRED' | 'BONUS';
    isRevealed: boolean;
    description: string;
  }
  ```

**8. Final Submission**
- **Expected Endpoints:** `GET /api/final/submission`, `POST /api/final/submission` (Inferred)
- **GET Response Shape:**
  ```typescript
  {
    submitted: boolean;
    url?: string;
    status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'SCORED';
    submittedAt?: string;
  }
  ```
- **POST Request Body:** `{ url: string }`
- **POST Response Shape:** `{ success: boolean }`

**9. Final Results**
- **Expected Endpoint:** `GET /api/results/final` (Inferred)
- **Response Shape:**
  ```typescript
  {
    winner: { id: string; name: string; score: number; rank: number; };
    rankings: { id: string; name: string; score: number; rank: number; }[];
  }
  ```

### Shared Types

**Event State (`src/shared/types/event.ts`)**
```typescript
{
  currentPhase: string;
  phaseLabel: string;
  roundNumber: number;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  roundName: string;
  roundDescription: string;
  timer: {
    durationSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    serverTimestamp: number;
  };
  teamCounts: { total: number; active: number; nominated: number; eliminated: number; safe: number; };
  lastUpdated: string;
}
```

**Team (`src/shared/state-machine/types.ts`)**
```typescript
{
  id: string;
  teamName: string;
  avatarUrl?: string;
  members: { id?: string; name: string; role?: string; usn?: string; }[];
  score: number;
  rank: number;
  previousRank?: number;
  isCaptain?: boolean;
  isNominated?: boolean;
  isEliminated?: boolean;
  isImmune?: boolean;
  hasSecretMission?: boolean;
  tableNumber?: string;
}
```

### Conflicts & Ambiguities

1. **Phase Enum Mismatch:**
   - The PRD lists: `LANDING`, `LOGIN`, `ROUND_1_ACTIVE`, `ROUND_1_RESULTS`, `ROUND_2_CAPTAINCY`, `ROUND_2_NOMINATIONS`, `ROUND_2_SECRET_TASK`, `ROUND_3_IMMUNITY`, `ROUND_3_VOTING`, `ROUND_3_EVICTION_REVEAL`, `ROUND_4_FEATURES_REVEALED`, `ROUND_4_SUBMISSION`, `ROUND_4_JUDGING`, `FINAL_RESULTS`.
   - `src/shared/state-machine/types.ts` defines: Same as PRD, but adds `ROUND_0_ACTIVE` and `ROUND_0_RESULTS`.
   - `src/shared/types/event.ts` defines: `NOT_STARTED`, `ROUND_0_ACTIVE`, `ROUND_0_RESULTS`, `ROUND_1_TASK`, `ROUND_2_CAPTAINCY`, `ROUND_2_SECRET_TASK`, `ROUND_2_NOMINATIONS`, `ROUND_3_IMMUNITY`, `ROUND_3_VOTING`, `ROUND_3_EVICTION`, `ROUND_4_FINALE`, `EVENT_ENDED`.
   - **Resolution:** The backend will adopt the phases from `src/shared/state-machine/types.ts` as it's directly used for routing in the frontend, per the prompt's instruction ("the frontend wins for REST response shapes"). `EventContext.tsx` handles some mapping (e.g. mapping `ROUND_3_VOTING` to `ROUND_3_VOTING_OPEN`).

2. **Leaderboard API Endpoint:**
   - We must provide `/api/leaderboard` which the frontend expects to poll. The returned array should match the `Team` interface.

3. **REST endpoints:**
   - Because the frontend currently uses only mocks (`mockApi.ts`), the exact URL paths are derived from the PRD and standard REST practices. We will ensure the backend routing matches the provided REST specifications in the prompt.
