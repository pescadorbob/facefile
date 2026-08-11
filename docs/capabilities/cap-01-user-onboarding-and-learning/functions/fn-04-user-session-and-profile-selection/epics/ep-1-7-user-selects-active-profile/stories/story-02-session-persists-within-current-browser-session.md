# Session Persists Within the Current Browser Session — Refresh Stays, Switch Profile Ends It

**As a** registered user with an active session, **I can** refresh or navigate the app without being asked to pick my profile again, **so that** I'm not interrupted mid-task, while still being able to deliberately switch to a different profile when I need to.

## Acceptance Criteria

- [ ] Refreshing the page while a session is active keeps the user on their current profile without showing the profile picker
- [ ] Navigating between protected pages while a session is active does not show the profile picker
- [ ] Switching profiles clears the current session
- [ ] After switching profiles, the user is returned to the profile picker

## Scenarios

Scenario: Refresh does not re-prompt for a profile
GIVEN the user has an active session as "Priya"
WHEN the user refreshes the page
THEN the user remains on Priya's session without seeing the profile picker

Scenario: Navigating between pages keeps the session
GIVEN the user has an active session as "Priya"
WHEN the user navigates from the dashboard to palaces and then to contacts
THEN the user stays on Priya's session throughout, with no profile picker shown

Scenario: Switching profile clears the session
GIVEN the user has an active session as "Priya"
WHEN the user activates "Switch profile"
THEN Priya's session is cleared and the user is returned to the profile picker

Scenario: Selecting a new profile after switching starts a fresh session
GIVEN the user has switched profiles and is viewing the profile picker
WHEN the user taps "Sam"
THEN a new session starts for Sam and the user lands on Sam's dashboard
