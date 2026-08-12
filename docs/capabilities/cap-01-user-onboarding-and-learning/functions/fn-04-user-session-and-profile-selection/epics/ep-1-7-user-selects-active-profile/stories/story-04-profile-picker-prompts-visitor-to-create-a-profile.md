# Profile Picker Prompts the Visitor to Create a Profile When None Is Selected or None Exist

**As a** visitor with no active session, **I can** be prompted to create a profile from the profile picker, **so that** I can start using the app on a fresh install instead of facing an empty list with nothing to tap.

## Acceptance Criteria

- [ ] When no profiles exist, the profile picker shows a create-a-profile prompt instead of an empty list
- [ ] When profiles exist but none is selected, the profile picker offers a create-a-profile action alongside the listed names
- [ ] Submitting the create-a-profile prompt with a name creates a new profile and lists it in the picker
- [ ] Submitting the create-a-profile prompt with a blank name is rejected with an inline error, and no profile is created
- [ ] Submitting a name that already belongs to an existing profile is rejected with an inline error, and no duplicate profile is created
- [ ] After creating a profile, a session starts for the new profile and the visitor lands on that profile's dashboard
- [ ] Abandoning the create-a-profile prompt returns the visitor to the profile picker with no profile created

## Scenarios

Scenario: First launch with no profiles prompts creation
GIVEN no profiles exist
WHEN the visitor opens the app with no active session
THEN the profile picker shows a create-a-profile prompt rather than an empty list of names

Scenario: Picker with existing profiles still offers creation
GIVEN profiles exist for "Priya" and "Sam"
AND the visitor has no active session
WHEN the visitor opens the profile picker
THEN "Priya" and "Sam" are listed by name and a create-a-profile action is also offered

Scenario: Creating a profile adds it to the picker
GIVEN the visitor is on the create-a-profile prompt
WHEN the visitor enters the name "Priya" and submits
THEN a profile named "Priya" is created and appears in the profile picker

Scenario: Creating a profile starts a session and opens the dashboard
GIVEN the visitor is on the create-a-profile prompt with no active session
WHEN the visitor enters the name "Priya" and submits
THEN a session starts for Priya and the visitor lands on Priya's dashboard

Scenario: Blank name blocks creation
GIVEN the visitor is on the create-a-profile prompt
WHEN the visitor leaves the name blank and submits
THEN an inline error appears, no profile is created, and no session starts

Scenario: Duplicate name blocks creation
GIVEN a profile named "Priya" already exists
WHEN the visitor submits the create-a-profile prompt with the name "Priya"
THEN an inline error appears, no duplicate profile is created, and no session starts

Scenario: Abandoning creation leaves the picker unchanged
GIVEN profiles exist for "Priya" and "Sam"
AND the visitor has opened the create-a-profile prompt
WHEN the visitor cancels the prompt
THEN the visitor is returned to the profile picker showing "Priya" and "Sam", and no profile has been created

Scenario: Protected page with no profiles routes to the creation prompt
GIVEN no profiles exist
AND the visitor has no active session
WHEN the visitor navigates directly to the dashboard
THEN the visitor is taken to the profile picker showing the create-a-profile prompt

## Notes — assumptions

- Self-service profile creation asks only for a name; the administrator's create-user flow (name plus unique email, epic E-8.3) remains the route for accounts that need an email address.
- Profile names are treated as unique so the picker stays unambiguous; matching is case-insensitive and ignores leading and trailing spaces.
- A profile created here is active immediately — no approval step.
