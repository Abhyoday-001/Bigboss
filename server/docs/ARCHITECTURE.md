# Backend Architecture (Phase B)

## 1. Folder Structure

```text
/server
├── prisma/
│   └── schema.prisma         # Database schema and migrations
├── src/
│   ├── config/               # Env validation (Zod), defaults
│   ├── services/             # Core business logic (state machine, scoring, round logic)
│   ├── routes/               # REST API controllers
│   ├── sockets/              # Socket.IO handlers, namespaces, auth
│   ├── utils/                # Logger (pino), error handling, DTO serializers
│   └── index.ts              # Express + Socket.IO server initialization
├── test/                     # Vitest test suite (unit, integration, leak tests)
├── scripts/                  # Seeding, CSV import/export, load test scripts
├── package.json
├── tsconfig.json
└── .env.example
```

## 2. Prisma Data Model

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  role         Role     // ADMIN | JUDGE
}

enum Role {
  ADMIN
  JUDGE
}

model Team {
  id               String   @id @default(cuid())
  code             String   @unique // Login ID
  name             String
  passwordHash     String
  avatarUrl        String?
  status           TeamStatus @default(ACTIVE)
  isCaptain        Boolean    @default(false)
  createdAt        DateTime   @default(now())
  
  members          TeamMember[]
  submissions      Submission[]
  scoreEntries     ScoreEntry[]
}

enum TeamStatus {
  ACTIVE
  NOMINATED
  EVICTED
}

model TeamMember {
  id      String  @id @default(cuid())
  teamId  String
  team    Team    @relation(fields: [teamId], references: [id])
  name    String
  email   String?
  phone   String?
}

model EventState {
  id              Int      @id @default(1) // Singleton
  phase           String
  previousPhase   String?
  paused          Boolean  @default(false)
  frozen          Boolean  @default(false)
  roundStartedAt  DateTime?
  seq             Int      @default(1)
  updatedAt       DateTime @updatedAt
}

model EventConfig {
  id      Int      @id @default(1) // Singleton
  config  Json     // Configurable settings
  version Int      @default(1)
}

model Timer {
  id               String      @id @default(cuid())
  scope            String      // GLOBAL | ROUND | TASK
  label            String
  endsAt           DateTime?
  pausedRemainingMs Int?
  status           TimerStatus @default(RUNNING)
}

enum TimerStatus {
  RUNNING
  PAUSED
  ENDED
}

model Task {
  id         String    @id @default(cuid())
  round      String
  title      String
  brief      String
  maxPoints  Int
  opensAt    DateTime?
  closesAt   DateTime?
  visibility String    // VISIBLE | HIDDEN
}

model TaskAnswerKey {
  id         String @id @default(cuid())
  taskId     String @unique
  answerHash String // HMAC
}

model Submission {
  id            String   @id @default(cuid())
  teamId        String
  taskId        String
  team          Team     @relation(fields: [teamId], references: [id])
  payload       Json
  status        String   // PENDING | SUBMITTED | SCORED
  awardedPoints Int?
  idempotencyKey String  @unique
  createdAt     DateTime @default(now())
}

model ScoreEntry {
  id         String   @id @default(cuid())
  teamId     String
  team       Team     @relation(fields: [teamId], references: [id])
  delta      Int
  reason     String
  source     String   // TASK | ADMIN | JUDGE | PENALTY | SECRET | CAPTAIN
  refId      String?
  actorId    String
  createdAt  DateTime @default(now())
}

model Captaincy {
  round        String @id
  winnerTeamId String?
  revealed     Boolean @default(false)
  decidedBy    String?
}

model Nomination {
  id        String   @id @default(cuid())
  teamId    String
  round     String
  reason    String
  createdBy String
}

model SecretMission {
  id             String  @id @default(cuid())
  title          String
  brief          String
  reward         Int
  penalty        Int
  assignedTeamId String?
  slot           String  // FIRST | MIDDLE | LAST
  status         String  // PENDING | COMPLETED | FAILED
  completedAt    DateTime?
}

model ImmunityPairing {
  id              String  @id @default(cuid())
  nominatedTeamId String
  safeTeamId      String
  status          String
  outcome         String?
}

model VotingWindow {
  id       String    @id @default(cuid())
  round    String
  status   String    // CLOSED | OPEN | TALLIED
  opensAt  DateTime?
  closesAt DateTime?
}

model Vote {
  id           String @id @default(cuid())
  windowId     String
  voterType    String // PARTICIPANT | JUDGE | AUDIENCE
  voterId      String
  targetTeamId String
  weight       Int    @default(1)

  @@unique([windowId, voterType, voterId])
}

model Eviction {
  id         String    @id @default(cuid())
  teamId     String
  round      String
  revealed   Boolean   @default(false)
  revealedAt DateTime?
}

model Feature {
  id                 String   @id @default(cuid())
  title              String
  description        String
  points             Int
  penaltyIfOutOfScope Int
  revealAt           DateTime?
  revealed           Boolean  @default(false)
}

model FinalSubmission {
  id          String    @id @default(cuid())
  teamId      String    @unique
  url         String
  notes       String?
  submittedAt DateTime  @default(now())
  lockedAt    DateTime?
}

model FeatureScore {
  id           String @id @default(cuid())
  submissionId String
  featureId    String
  judgeId      String
  awarded      Int
  notes        String?
}

model Penalty {
  id           String @id @default(cuid())
  submissionId String
  points       Int
  reason       String
  judgeId      String
}

model AuditLog {
  id       String   @id @default(cuid())
  ts       DateTime @default(now())
  actorType String  // SYSTEM | ADMIN | PARTICIPANT
  actorId  String
  action   String
  entity   String
  entityId String
  before   Json?
  after    Json?
  ip       String?
}
```

## 3. REST API Routes (Mirroring Frontend Polling Expectations)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/team/login` | None | Participant login, returns short-lived JWT |
| POST | `/api/auth/admin/login` | None | Admin/Judge login, returns short-lived JWT |
| GET | `/api/auth/me` | Valid JWT | Returns current authenticated profile |
| GET | `/api/event/state` | Valid JWT | Global state: phase, timers, frozen flag |
| GET | `/api/leaderboard` | Valid JWT | Aggregated scores & ranks |
| GET | `/api/team/me` | Team | Detailed current team status |
| GET | `/api/team/me/nomination` | Team | Returns `isNominated` and context |
| GET | `/api/team/me/secret-mission` | Team | Restricted; identical 200/403 for existence cloaking |
| GET | `/api/team/me/immunity` | Team | Participant pairings & challenge |
| GET | `/api/voting/data` | Valid JWT | Current candidates, voter status |
| POST | `/api/voting/vote` | Voter | Submits vote securely (idempotent) |
| GET | `/api/eviction/result` | Valid JWT | Returns revealed evictions only |
| GET | `/api/features` | Valid JWT | Round 4 revealed features |
| GET | `/api/final/submission` | Team | Current submission status |
| POST | `/api/final/submission` | Team | Idempotent URL submission |
| GET | `/api/results/final` | Valid JWT | Final standings (when revealed) |
| * | `/api/admin/*` | Admin/Judge | Full CRUD + Round Control, Audited |
| GET | `/health` / `/ready` | None | Infrastructure checks |

## 4. Socket.IO Real-time Catalog

**Namespaces:**
- `/participant` (Requires `role: TEAM`)
- `/admin` (Requires `role: ADMIN | JUDGE`)

**Server -> Client (Broadcasts):**
- `state:snapshot`: Reconciled state delivered on connection/reconnection.
- `phase:changed`: Global phase transitions.
- `timer:updated` / `timer:ended`: Pushed only on timer state changes.
- `leaderboard:updated`: Debounced array of teams + ranks.
- `team:updated`: Sent to `team:{id}` room on individual updates.
- `round:status`: Round progression updates.
- `nomination:updated`, `captain:revealed`, `immunity:updated`, `voting:status`, `eviction:revealed`, `feature:revealed`, `submission:result`, `results:final`
- `secret:assigned`, `secret:updated`: Targeted ONLY to assigned `team:{id}`.
- `server:notice`: Admin-originated alerts.
- `server:freeze`: Instructs clients to disable mutations.

**Client -> Server (Mutations - Ack Callback `{ ok, data, code, message }`):**
- `time:ping`: Returns `{ serverNow }`.
- `sync:request`: Explicit fetch of `state:snapshot`.
- `task:submit`, `captaincy:submit`, `secret:progress`, `immunity:submit`, `vote:cast`, `final:submit` (Requires `idempotencyKey`).

**Admin -> Server:**
- `phase:advance`, `phase:set` (requires `confirmToken`).
- `round:start|pause|resume|end`.
- `timer:set|pause|resume|extend`.
- `score:adjust`, `team:create|update|resetPassword|setStatus`.
- `captain:set|reveal`, `nominations:set`, `secret:assign|complete`, `pairing:set`.
- `immunity:start|resolve`, `voting:open|close|tally`, `votes:reveal`, `eviction:reveal`.
- `feature:create|update|reveal`, `judge:score`, `penalty:apply`, `results:publish`.
- `config:update`, `announce`, `freeze:toggle`, `resync:force`.

## 5. State-Machine Transition Table

Controlled via a transactional Service that records audit logs and bumps the `seq` identifier on every successful move.

```text
LANDING -> LOGIN -> ROUND_0_ACTIVE -> ROUND_0_RESULTS 
  -> ROUND_1_ACTIVE -> ROUND_1_RESULTS 
  -> ROUND_2_CAPTAINCY -> ROUND_2_NOMINATIONS -> ROUND_2_SECRET_TASK 
  -> ROUND_3_IMMUNITY -> ROUND_3_VOTING -> ROUND_3_EVICTION_REVEAL 
  -> ROUND_4_FEATURES_REVEALED -> ROUND_4_SUBMISSION -> ROUND_4_JUDGING 
  -> FINAL_RESULTS
```

## 6. Configuration Schema (`EventConfig`)

JSON payload stored in the database, modifiable by Admin at runtime.

```json
{
  "evictionCount": 3,
  "nominationPercent": 0.3,
  "voterRoles": ["PARTICIPANT", "JUDGE"],
  "captainPerks": {
    "bonusPoints": 50,
    "hasImmunity": true,
    "nominationPower": 2
  },
  "secretMissionRewards": {
    "FIRST": { "points": 100, "penalty": -50 },
    "MIDDLE": { "points": 150, "penalty": -25 },
    "LAST": { "points": 200, "penalty": 0 }
  },
  "round4PointsPerFeature": 50,
  "round4PenaltyPerOutOfScope": 25,
  "round1MaxAttempts": 3,
  "round1AttemptCooldownMs": 60000
}
```

## 7. Timer Design

- Postgres tracks `endsAt` (UTC absolute time) or `pausedRemainingMs`. 
- Sockets broadcast changes, NOT intervals. 
- A server-side clock calculates `remaining = endsAt - Date.now()`.
- Clients periodically emit `time:ping` to measure their local `clockOffset`, guaranteeing all 50 screens display identically synced countdowns regardless of device latency.

## 8. Test Plan

1. **Unit Tests (Vitest):** Validate `State Machine` transitions (ensure backward phases throw exceptions), test `Score Ledger` aggregate logic, and verify `idempotency` guards on submissions.
2. **Integration Tests (Supertest + Socket.IO-Client):** Simulate a client connecting, getting a snapshot, disconnecting, and reconnecting to assert gap recovery. Verify the **Zero-Trust Rule**: `secret:assigned` events must NEVER arrive on a non-assigned team's socket. 
3. **Leak Test:** A custom suite that combs through every valid REST GET and Socket broadcast to assert that answer keys, passwords, and admin configuration secrets are stripped out of all participant-facing Serializer outputs.
4. **Load & Reconnect Storms:** Spin up 60 sockets simultaneously, trigger `phase:changed`, process a burst of 50 simultaneous votes, verify Postgres transactions correctly serialize them, and ensure Socket p95 broadcast latency stays under 300ms.
