# User Sees the Profile Picker on Launch, Selects Their Name, and Lands on the Dashboard

**As a** registered user with no active session, **I can** see a profile picker when I open the app and tap my name, **so that** I land straight on my own dashboard without a username or password prompt.

## Acceptance Criteria

- [ ] Opening the app with no active session shows the profile picker, not the dashboard
- [ ] The profile picker lists registered users by name
- [ ] Navigating directly to a protected page (dashboard, palaces, contacts, or quiz) with no active session redirects to the profile picker instead of showing that page
- [ ] Tapping a name in the profile picker starts a session for that user
- [ ] After selecting a profile, the user is taken straight to their dashboard

## Scenarios

Scenario: App launch with no session shows the profile picker
GIVEN the user has no active session
WHEN the user opens the app
THEN the profile picker is shown instead of the dashboard

Scenario: Protected page is unreachable without a session
GIVEN the user has no active session
WHEN the user navigates directly to the dashboard, palaces, contacts, or quiz
THEN the user is redirected to the profile picker

Scenario: Profile picker lists registered users
GIVEN two users, "Priya" and "Sam", are registered
WHEN the user opens the profile picker
THEN both "Priya" and "Sam" are listed by name

Scenario: Selecting a profile starts a session and opens the dashboard
GIVEN the profile picker is showing "Priya" and "Sam"
WHEN the user taps "Priya"
THEN a session starts for Priya and the user lands on Priya's dashboard
