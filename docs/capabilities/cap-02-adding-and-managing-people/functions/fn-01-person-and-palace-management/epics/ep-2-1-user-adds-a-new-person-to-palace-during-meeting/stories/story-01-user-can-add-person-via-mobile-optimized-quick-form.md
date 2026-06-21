# User Can Add Person via Mobile-Optimized Quick Form

**As a** user at a meeting, **I can** open a quick-add form and fill it in on my phone without friction, **so that** I can capture a new contact before the moment passes.

## Acceptance Criteria

- [ ] A "Add Person" action is reachable in one tap from the main view
- [ ] All form fields are large enough to tap accurately without zooming on a standard phone screen
- [ ] The form fits a single viewport width — no horizontal scrolling at any step
- [ ] Required fields are limited to first name, photo, and palace locus
- [ ] The save button is visible without scrolling once all required fields are filled
- [ ] Submitting with a missing required field surfaces an inline error on that field, not a generic alert

## Scenarios

Scenario: User opens quick-add form from main view
GIVEN the user is on the main view of the app
WHEN the user taps "Add Person"
THEN the quick-add form opens without navigating to a separate screen

Scenario: Form fields are tappable without zooming
GIVEN the quick-add form is open on a standard phone screen
WHEN the user views the form at default zoom
THEN every input field and button is large enough to tap without pinching to zoom

Scenario: Form does not scroll horizontally
GIVEN the quick-add form is open on a standard phone screen
WHEN the user views any step of the form
THEN all content fits within the viewport width with no horizontal scrollbar or overflow

Scenario: Only required fields block submission
GIVEN the quick-add form is open
WHEN the user taps Save with only first name, photo, and locus filled in
THEN the contact is saved successfully without requiring last name, nickname, or context notes

Scenario: Save button is visible after required fields are filled
GIVEN the user has filled in first name, photo, and palace locus
WHEN the user views the form without scrolling
THEN the Save button is visible on screen

Scenario: Missing required field shows inline error
GIVEN the quick-add form is open with first name left blank
WHEN the user taps Save
THEN an error message appears directly below the First Name field and the form is not submitted

Scenario: Missing locus shows inline error
GIVEN the quick-add form is open with no locus selected
WHEN the user taps Save
THEN an error message appears on the locus field and the form is not submitted
