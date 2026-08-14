# User Can Skip the Immediate Quiz

**As a** user who has just saved a new contact, **I can** skip the immediate quiz prompt, **so that** the flow never feels coercive when I'm adding multiple contacts quickly.

## Acceptance Criteria

- [ ] A "Skip for now" option is clearly visible on the immediate quiz prompt
- [ ] Skipping navigates the user back to the contact list or wherever they were before adding
- [ ] Skipping does not remove the contact from the upcoming review schedule
- [ ] The contact appears in the regular due-review queue on the next scheduled date

## Scenarios

Scenario: A skip option is clearly offered on the prompt
GIVEN a user who has just saved a new contact
WHEN the quiz prompt appears
THEN they can decline it

Scenario: Skipping returns the user to where they were before adding
GIVEN a user on the post-add quiz prompt
WHEN they skip for now
THEN they are back on the dashboard with their contacts

Scenario: Skipping leaves the contact in the review queue
GIVEN a user who has just added a contact
WHEN they skip the prompt
THEN the contact is still waiting to be reviewed, with no answer recorded

Scenario: A skipped contact comes round again in a due-review session
GIVEN a user who skipped the prompt for a newly added contact
WHEN they later start a session of the contacts that are due
THEN the skipped contact is among them

Scenario: A regular session offers no skip option
GIVEN a user in an ordinary review session rather than the post-add prompt
WHEN the session starts
THEN there is nothing to skip
