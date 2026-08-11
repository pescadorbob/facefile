# Dashboard Action Banners Launch Teach Mode, Tutorial, and Palaces

**As a** registered user who has selected their profile, **I can** see standing launch points for teach mode, the tutorial, and my memory palaces on the dashboard, **so that** I can start any of these activities in one tap regardless of my current quiz-readiness state.

## Acceptance Criteria

- [ ] The teach-mode banner is always visible on the dashboard, regardless of whether cards are due
- [ ] The tutorial banner is always visible on the dashboard, regardless of whether cards are due
- [ ] The memory-palaces banner is always visible on the dashboard, regardless of whether cards are due
- [ ] Tapping the teach-mode banner starts teach mode
- [ ] Tapping the tutorial banner opens the tutorial
- [ ] Tapping the memory-palaces banner navigates to the palaces view

## Scenarios

Scenario: Standing banners are visible with no cards due
GIVEN the active profile has 0 cards due for review
WHEN the user views the dashboard
THEN the teach-mode, tutorial, and memory-palaces banners are all visible

Scenario: Standing banners are visible with cards due
GIVEN the active profile has cards due for review and the quiz-prompt banner is showing
WHEN the user views the dashboard
THEN the teach-mode, tutorial, and memory-palaces banners are still all visible

Scenario: Launching teach mode
GIVEN the dashboard is visible
WHEN the user taps the teach-mode banner
THEN teach mode starts

Scenario: Opening the tutorial
GIVEN the dashboard is visible
WHEN the user taps the tutorial banner
THEN the tutorial opens

Scenario: Navigating to palaces
GIVEN the dashboard is visible
WHEN the user taps the memory-palaces banner
THEN the user is taken to the palaces view
