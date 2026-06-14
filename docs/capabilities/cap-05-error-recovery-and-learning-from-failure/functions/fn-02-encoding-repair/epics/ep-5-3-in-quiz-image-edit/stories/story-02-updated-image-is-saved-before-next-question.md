# Updated Image Is Saved Before Next Question

**As a** user who edited their name image mid-quiz, **I can** be certain the updated image is persisted before the next question loads, **so that** the repair is not lost if the session ends unexpectedly.

## Acceptance Criteria

- [ ] The save operation completes before the "Next" button navigates to the following question
- [ ] A brief save-confirmation indicator (e.g., a checkmark) is shown before advancing
- [ ] If the save fails, the user sees an error and the "Next" button remains disabled until the issue is resolved
- [ ] The updated image appears in the contact detail view immediately after the session ends
