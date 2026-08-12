# E-1.7: User Selects Active Profile

> Capability: [User Onboarding and Learning](../../../../README.md) - Function: [User Session and Profile Selection](../../README.md)

**As** a registered user
**I want to** pick my profile when I open the app
**So that** everything I do — my palaces, contacts, and quiz cards — is saved under my name and no one else's

## Acceptance Criteria (epic-level)

1. Opening the app without an active session shows the profile picker, not the dashboard.
2. Navigating directly to any protected page (dashboard, palaces, contacts, quiz) without an active session redirects to the profile picker.
3. Selecting a profile starts a session and takes the user straight to the dashboard.
4. The session is stored in a cookie so the user is not asked again after a page refresh.
5. A user can switch profiles at any time; switching clears the current session and returns to the picker.
6. Returning within the persistent cookie lifetime skips the picker; an expired or invalid cookie redirects to it.
7. When no profile is selected — including when none exist yet — the picker prompts the visitor to create one, and creating it starts a session for that new profile.

## Stories

| # | ID | Story | Why this order |
|---|----|-------|-----------------|
| 1 | S-1.7.1 | [User sees the profile picker on launch, selects their name, and lands on the dashboard](./stories/story-01-user-sees-profile-picker-selects-name-lands-on-dashboard.md) | Foundation slice. Nothing else in the app is accessible without it; must ship first. |
| 2 | S-1.7.2 | [Session persists within the current browser session — refresh stays, switch profile ends it](./stories/story-02-session-persists-within-current-browser-session.md) | Delivers the core "don't interrupt me with the picker" guarantee for the current sitting. Builds directly on the session cookie set in S-1.7.1. |
| 3 | S-1.7.3 | [Session remembered across browser restarts via persistent cookie with optional "Remember me"](./stories/story-03-session-remembered-across-browser-restarts.md) | Temporal layer on top of S-1.7.2. Upgrades the session cookie from session-scoped to time-bounded; handles expiry and tampered-cookie edge cases. |
| 4 | S-1.7.4 | [Profile picker prompts the visitor to create a profile when none is selected or none exist](./stories/story-04-profile-picker-prompts-visitor-to-create-a-profile.md) | Closes the empty-state hole: on a fresh install the picker has nothing to tap. Independently demoable, but lower value than the sessions work once at least one profile is seeded. |
