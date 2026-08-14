# User Sees Due Count on Login

**As a** user logging in, **I can** immediately see how many contacts are due for review today, **so that** I know exactly where to start without navigating through menus.

## Acceptance Criteria

- [ ] The dashboard shows a prominent due-count badge or card on the home screen after login
- [ ] The count updates in real time if new contacts become due while the user is active
- [ ] Zero due contacts shows a positive message ("You're caught up!") with the next due date
- [ ] Tapping the count launches a review session with the due contacts pre-loaded

## Scenarios

Scenario: The due count is shown prominently on the home screen
GIVEN the user has three contacts due for review
WHEN they land on the dashboard
THEN the count of contacts due is on the screen, and highlighted

Scenario: The count reflects reviews completed since it was first shown
GIVEN a dashboard showing two contacts due
WHEN one of them is reviewed while the user is still active
THEN the dashboard settles on the new count without the user reloading it

Scenario: A caught-up user is told so, with the next due date
GIVEN a user whose only contact has just been reviewed
WHEN they view the dashboard
THEN they see "You're caught up!" and when the next review lands

Scenario: No caught-up message is shown while reviews are still waiting
GIVEN the user has a contact due
WHEN they view the dashboard
THEN they are not told they are caught up

Scenario: Tapping the count launches a session pre-loaded with the due contacts
GIVEN a dashboard showing one contact due and one already reviewed
WHEN the user taps the count
THEN a session opens holding just the due contact, with no start screen in between
