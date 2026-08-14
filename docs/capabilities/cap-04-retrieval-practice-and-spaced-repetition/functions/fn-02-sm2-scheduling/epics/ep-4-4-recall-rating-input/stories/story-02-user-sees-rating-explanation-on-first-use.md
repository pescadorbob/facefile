# User Sees Rating Explanation on First Use

**As a** new user rating their recall for the first time, **I can** see a brief explanation of what each rating level means, **so that** I calibrate my ratings consistently from the start.

## Acceptance Criteria

- [ ] A tooltip or inline explainer appears the first time the rating buttons are shown
- [ ] Each rating label includes a one-line description (e.g., "Good — recalled with some effort")
- [ ] The explainer is dismissable and does not reappear after the first session
- [ ] A "?" help icon next to the rating row lets users re-read the explanation at any time

## Scenarios

Scenario: An explainer appears the first time the ratings are shown
GIVEN a user who has never rated their recall before
WHEN they reach the reveal screen for the first time
THEN the ratings are explained before they are asked to choose one

Scenario: Each rating carries a one-line description of its own
GIVEN a user on the reveal screen
WHEN they read the rating row
THEN each label explains what it means, for example "Good — recalled with some effort"

Scenario: The explainer can be dismissed and does not return on its own
GIVEN a two-question session with the explainer showing on the first reveal
WHEN the user dismisses it and reaches the next reveal
THEN it does not reappear

Scenario: The explainer does not return in a later session either
GIVEN a user who dismissed the explainer during their first session
WHEN they start a fresh session later
THEN the ratings are shown without the explainer

Scenario: The explanation can be re-read at any time from the help icon
GIVEN a user who has already dismissed the explainer
WHEN they tap the help icon beside the rating row
THEN the explanation is shown again
