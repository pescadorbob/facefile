# Dashboard Shows Quiz Readiness at a Glance

**As a** registered user who has selected their profile, **I can** see my quiz readiness at a glance on the dashboard, **so that** I know immediately whether I have cards due for review and can start reviewing in one tap.

## Acceptance Criteria

- [ ] The dashboard is unreachable without an active profile session — navigating to it without one redirects to the profile picker
- [ ] The metrics row shows current counts for the active profile: people added, cards due, total quiz answers, and accuracy percentage
- [ ] The "due for review" tile is visually highlighted when the due count is greater than zero
- [ ] A quiz-prompt banner appears above the action banners when at least one card is due
- [ ] The quiz-prompt banner does not appear when no cards are due
- [ ] Tapping "Start Quiz →" on the quiz-prompt banner navigates to the quiz screen
- [ ] All metrics shown are scoped to the active profile only

## Scenarios

Scenario: Unauthenticated navigation redirects to profile picker
GIVEN no profile session is active
WHEN the user navigates to the dashboard
THEN the user is redirected to the profile picker

Scenario: Metrics row reflects current profile counts
GIVEN the active profile has 12 people added, 3 cards due, 40 total quiz answers, and 85% accuracy
WHEN the user views the dashboard
THEN the metrics row shows those exact counts

Scenario: Due-review tile is highlighted when cards are due
GIVEN the active profile has 3 cards due for review
WHEN the user views the dashboard
THEN the "due for review" tile is visually highlighted

Scenario: Due-review tile is not highlighted when nothing is due
GIVEN the active profile has 0 cards due for review
WHEN the user views the dashboard
THEN the "due for review" tile is not visually highlighted

Scenario: Quiz-prompt banner appears when cards are due
GIVEN the active profile has at least 1 card due for review
WHEN the user views the dashboard
THEN a quiz-prompt banner appears above the action banners

Scenario: Quiz-prompt banner is absent when nothing is due
GIVEN the active profile has 0 cards due for review
WHEN the user views the dashboard
THEN no quiz-prompt banner appears

Scenario: Starting quiz from the banner
GIVEN the quiz-prompt banner is visible
WHEN the user taps "Start Quiz →"
THEN the user is taken to the quiz screen

Scenario: Metrics are scoped to the active profile
GIVEN another profile has different people, due cards, and quiz history
WHEN the user views the dashboard for the active profile
THEN only the active profile's counts are shown, never another profile's data
