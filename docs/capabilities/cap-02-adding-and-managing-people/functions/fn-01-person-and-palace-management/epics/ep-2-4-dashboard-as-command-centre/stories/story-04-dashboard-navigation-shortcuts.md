# Dashboard Navigation Shortcuts — Admin, Meetings, Switch Profile

**As a** registered user who has selected their profile, **I can** reach Admin, Meetings, and Switch profile from the dashboard header, **so that** I can manage my account or capture meeting context without hunting through the app, while keeping these utility actions visually separate from my primary learning actions.

## Acceptance Criteria

- [ ] The Admin link is accessible from the dashboard header
- [ ] The Meetings link is accessible from the dashboard header
- [ ] The Admin and Meetings links are visually distinct from the primary action banners
- [ ] "Switch profile" is accessible from the dashboard header
- [ ] Activating "Switch profile" clears the current session and returns the user to the profile picker
- [ ] The user can start a quiz from the dashboard even when no reviews are currently due

## Scenarios

Scenario: Admin link is reachable from the header
GIVEN the user is on the dashboard
WHEN the user looks at the header
THEN an Admin link is visible and selectable

Scenario: Meetings link is reachable from the header
GIVEN the user is on the dashboard
WHEN the user looks at the header
THEN a Meetings link is visible and selectable

Scenario: Header links are visually distinct from primary actions
GIVEN the user is on the dashboard
WHEN the user compares the header links to the action banners
THEN the Admin and Meetings links are styled distinctly from the primary action banners

Scenario: Switching profile clears the session
GIVEN the user is on the dashboard with an active profile session
WHEN the user activates "Switch profile"
THEN the session is cleared and the user is returned to the profile picker

Scenario: Starting a quiz when nothing is due
GIVEN the user is on the dashboard with no reviews currently due
WHEN the user chooses to start a quiz
THEN a quiz session begins using the user's contacts rather than being blocked by there being nothing due
