# Dashboard Shows Names-and-Faces Inventory

**As a** registered user who has selected their profile, **I can** see every person stored in my palace as a scrollable grid of photo cards on the dashboard, **so that** I have the raw material for name recall in one place and can add a new person without leaving the screen.

## Acceptance Criteria

- [ ] The names-and-faces inventory shows every contact belonging to the active profile as a photo card
- [ ] An "Add person" shortcut card appears at the end of the inventory grid
- [ ] Tapping the "Add person" shortcut card starts the add-person flow
- [ ] When the active profile has no contacts, a friendly empty-state prompt appears in place of the grid, with a link to add the first person
- [ ] The inventory shows only contacts belonging to the active profile — never a contact belonging to another profile

## Scenarios

Scenario: Inventory shows all contacts for the active profile
GIVEN the active profile has 5 people stored
WHEN the user views the dashboard
THEN the names-and-faces inventory shows all 5 people as photo cards

Scenario: Add-person shortcut appears at the end of the grid
GIVEN the active profile has 1 or more people stored
WHEN the user views the names-and-faces inventory
THEN an "Add person" shortcut card appears after the last contact card

Scenario: Add-person shortcut starts the add-person flow
GIVEN the names-and-faces inventory is visible
WHEN the user taps the "Add person" shortcut card
THEN the add-person flow starts

Scenario: Empty inventory shows a friendly prompt
GIVEN the active profile has no people stored
WHEN the user views the dashboard
THEN a friendly empty-state prompt appears instead of the grid, with a link to add the first person

Scenario: Inventory excludes other profiles' contacts
GIVEN another profile has people stored that the active profile does not have
WHEN the user views the dashboard for the active profile
THEN none of the other profile's contacts appear in the inventory
