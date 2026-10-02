# Leaks Report

This is a read-only leak audit of the existing frontend codebase in the `/Users/abhyoday/My personal/BB/Bigboss` directory.

### 1. `DEMO_CREDENTIALS.md`
- **Exposes:** Plaintext passwords for both participants and admins.
  - Participant Passcode: `devhouse`
  - Admin Username/Passcode: `admin` / `admin123` (or `devhouse`)
- **Severity:** HIGH
- **Recommended Fix:** The backend will generate its own random passwords for real teams and admins. Since this file is already committed to the repository, these credentials must NEVER be reused in production. The organizing team should ensure the live environment variables (`ADMIN_BOOTSTRAP_PASSWORD`, etc.) differ completely from these.

### 2. `src/contracts/mockApi.ts`
- **Exposes:** Hardcoded mock answers, tasks, and secret missions.
  - Line 39: `brief: 'INFILTRATE THE JUDGES PANEL. Find the hidden criteria for Round 4 without being detected by the other teams.'`
  - Line 102: `challenge: { title: 'Blind Pair Programming', description: 'The safe team member types, while the nominated team member dictates the solution. Only 15 minutes to solve the algorithm.' }`
  - Line 203: Round 4 features are hardcoded (e.g., "Implement Dark Mode Toggle", "Real-time Chat Integration", "Easter Egg: Konami Code", "Analytics Dashboard").
- **Severity:** MEDIUM (as it's only mock data, but could spoil actual event tasks if these are the real tasks intended for the event).
- **Recommended Fix:** If these are the actual tasks for the event, they have been leaked to any participant who inspects the frontend bundle. The organizers must change the actual secret missions, immunity challenges, and Round 4 features in the production backend database configuration.

### 3. `src/mocks/mockTeams.ts`
- **Exposes:** Hardcoded mock teams, member names, scores, and audit reasons.
- **Severity:** LOW
- **Recommended Fix:** No technical fix needed, assuming this data is purely fictional. The real teams will be sourced from the backend.

### Summary
The frontend repository is public, which means the contents of `DEMO_CREDENTIALS.md` and any hardcoded tasks in `mockApi.ts` are exposed. It is highly recommended that the event organizers:
1. Generate entirely new passwords for the real event.
2. Alter the specific tasks, secret missions, and Round 4 features if the ones in `mockApi.ts` were intended to be real.
