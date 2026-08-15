# S-2.5.1: User Steps Through the Wizard to Add a New Person

**As** a user who wants to build a strong memory for a new person
**I want** a step-by-step guided experience that walks me through the name-image and association-scene techniques
**So that** I add the person with a proper mnemonic anchor rather than just storing a name

## Acceptance Criteria

- [ ] The wizard has exactly five steps: (1) Name & photo, (2) Palace placement, (3) Name image, (4) Association scene, (5) Review & save
- [ ] A progress bar shows which step the user is on
- [ ] The user cannot advance past step 1 without entering a name
- [ ] Step 2 shows only palaces belonging to the logged-in user; choosing a palace reveals its loci
- [ ] If the user has no palaces when reaching step 2 (or on opening the wizard, if palace ownership is known up front), the wizard redirects to palace creation (see `docs/capabilities/cap-03-creating-and-refining-name-images/functions/fn-02-locus-assignment/epics/ep-3-3-palace-and-locus-selection/stories/story-01-user-creates-a-named-palace.md`) with guidance that a palace is needed first, and directs the user back to resume adding the person once a palace exists
- [ ] Step 3 shows the chosen locus name, shows the person's name prominently and offers three guided technique hints (sound-alike, meaning, personal association) to spark a name image
- [ ] Step 4 shows the chosen locus name, shows the person's name and name image, and prompts the user to write a vivid association scene
- [ ] Step 5 shows a summary of all captured details before the user saves
- [ ] On save the contact is stored with `nameImage` and `associationScene` alongside the usual fields
- [ ] After saving, the user is taken to the quiz to reinforce the memory

## Scenarios

```gherkin
Scenario 1: User completes all five steps and saves
  GIVEN a registered user with at least one memory palace
  WHEN the user opens the guided wizard, completes all five steps, and saves
  THEN the contact is saved with name, palace placement, name image, and association scene
  AND the user is taken to the quiz

Scenario 2: User cannot advance past step 1 without a name
  GIVEN a registered user on step 1 of the guided wizard
  WHEN the user clicks Next without entering a name
  THEN an error is shown and the user stays on step 1

Scenario 3: Step 3 shows name-image technique hints
  GIVEN a registered user who has entered "Brian" as the name
  WHEN the user reaches step 3 of the wizard
  THEN the step displays "Brian" prominently
  AND shows technique hints for sound-alike, meaning, and personal association

Scenario 4: Step 2 only shows the logged-in user's own palaces
  GIVEN two users (Alice and Bob), each with their own palace
  WHEN Bob opens the guided wizard and reaches step 2
  THEN only Bob's palace appears in the palace picker
  AND Alice's palace does NOT appear

Scenario 5: User can navigate back to a previous step
  GIVEN a registered user on step 3 of the guided wizard
  WHEN the user clicks Back
  THEN the user is returned to step 2 with their previously entered name image preserved

Scenario 6: User with no palaces is sent to create one before continuing
  GIVEN a registered user who has no memory palaces
  WHEN the user reaches step 2 of the guided wizard
  THEN the user is taken to the new-palace form
  AND guidance explains that a palace is needed before a person can be placed
  AND once a palace is created, the user is returned to resume the guided wizard
```
