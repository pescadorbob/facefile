# User Rates Recall Quality After Each Answer

**As a** user after answering a quiz question, **I can** rate my recall quality (Forgot / Hard / Good / Easy), **so that** the SM-2 algorithm has an accurate signal to schedule the next review.

## Acceptance Criteria

- [ ] Four rating buttons (Forgot, Hard, Good, Easy) appear on the reveal screen
- [ ] Selecting a rating immediately records the response and advances to the next question
- [ ] The rating is stored with a timestamp in the review history for that contact
- [ ] The selected rating is reflected in the updated next-review date shown at session end

## Scenarios

Scenario: All four ratings are offered on the reveal screen
GIVEN the user has answered a question
WHEN the reveal screen is shown
THEN Forgot, Hard, Good and Easy are all available

Scenario: Choosing a rating advances straight to the next question
GIVEN a two-question session with the first card revealed
WHEN the user rates their recall
THEN the next question is shown, with no further step in between

Scenario: The rating is recorded in the contact's review history with a timestamp
GIVEN the user has answered a question about Priya
WHEN they rate their recall as Hard
THEN that rating is on her review history, stamped with when it happened

Scenario: The chosen rating is reflected in the next review date at session end
GIVEN the user has answered the only question in the session
WHEN they rate their recall and the session ends
THEN the summary shows the newly computed next review date for that contact
