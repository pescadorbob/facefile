# User Creates a Named Palace

**As a** user, **I can** create a named memory palace (e.g., "My Office", "Weekly Meeting Room"), **so that** I have a reusable spatial container for placing contacts.

## Acceptance Criteria

- [ ] A "New Palace" action is available from the palaces section of the app
- [ ] Submitting the new-palace form with a name of at least 2 characters creates the palace
- [ ] Submitting a name shorter than 2 characters is rejected with an inline error, and no palace is created
- [ ] Submitting a name that already belongs to one of the user's palaces is rejected with an inline error, and no duplicate palace is created
- [ ] A newly created palace appears in the palace list immediately, without a reload
- [ ] A newly created palace is offered as a placement option when a contact is assigned to a locus
- [ ] Loci can optionally be named while the palace is being created
- [ ] A palace created with loci holds them in the order they were entered
- [ ] A palace created without naming any loci is valid, and the palace list shows it as holding none
- [ ] Abandoning the new-palace form returns the user to the palace list with no palace created

## Scenarios

Scenario: Palaces section offers a way to create a palace
GIVEN the user is in the palaces section
WHEN the user views the palace list
THEN a "New Palace" action is offered

Scenario: Creating a palace adds it to the palace list
GIVEN the user has opened the new-palace form
WHEN the user enters the name "Weekly Meeting Room" and submits
THEN a palace named "Weekly Meeting Room" appears in the palace list without a reload

Scenario: Palace can be created with its loci named up front
GIVEN the user has opened the new-palace form
WHEN the user enters the name "My Office" together with the loci "Front doorstep", "Coat rack" and "Kitchen table", and submits
THEN a palace named "My Office" is created holding those three loci

Scenario: Loci keep the order they were entered
GIVEN the user has created a palace named "My Office" with the loci "Front doorstep", "Coat rack" and "Kitchen table"
WHEN the user views that palace
THEN its loci are listed in that same order

Scenario: Naming loci is optional
GIVEN the user has opened the new-palace form
WHEN the user enters the name "My Office", names no loci, and submits
THEN "My Office" is created and listed as holding no loci

Scenario: A new palace can be used for placement straight away
GIVEN the user has created a palace named "Weekly Meeting Room"
WHEN the user goes to place a contact into a locus
THEN "Weekly Meeting Room" is offered as a placement option

Scenario: Palace name must be at least two characters
GIVEN the user has opened the new-palace form
WHEN the user submits the name below
THEN the outcome below applies

| Name entered | Outcome                                             |
| ------------ | --------------------------------------------------- |
| (blank)      | rejected with an inline error, no palace created     |
| "A"          | rejected with an inline error, no palace created     |
| "Ox"         | the palace is created and appears in the palace list |

Scenario: Duplicate name blocks creation
GIVEN the user already has a palace named "My Office"
WHEN the user submits the new-palace form with the name "My Office"
THEN an inline error appears and no duplicate palace is created

Scenario: Abandoning the form creates nothing
GIVEN the user has opened the new-palace form and typed the name "Weekly Meeting Room"
WHEN the user cancels the form
THEN the user is returned to the palace list and no palace named "Weekly Meeting Room" has been created

## Notes — assumptions

- Palace names are unique **per user** — two different users may each have a palace named "My Office".
- Name matching for both the uniqueness and the minimum-length rules ignores leading and trailing spaces and is case-insensitive, mirroring profile-name matching in epic E-1.7. So `"  my office  "` collides with `"My Office"`, and `"  A  "` is a one-character name.
- Naming loci during creation is a convenience, not a requirement: a palace with no loci is an equally valid end state, and loci can still be added later when a contact is placed (story-02).
- Locus order is the walking order through the place, so it is preserved exactly as entered rather than sorted alphabetically.
- Rules on locus names themselves — minimum length, duplicates within one palace, reordering after the fact — are out of scope here; this story only covers naming them alongside the palace.
