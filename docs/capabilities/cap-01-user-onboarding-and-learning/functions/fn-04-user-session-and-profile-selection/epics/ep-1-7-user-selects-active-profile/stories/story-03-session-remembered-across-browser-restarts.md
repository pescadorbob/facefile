# Session Remembered Across Browser Restarts via Persistent Cookie with Optional "Remember Me"

**As a** registered user, **I can** choose to be remembered across browser restarts, **so that** I don't have to pick my profile every time I open the app on my own device, while an expired or invalid session still safely returns me to the picker.

## Acceptance Criteria

- [ ] The profile picker offers a "Remember me" option when selecting a profile
- [ ] Selecting a profile with "Remember me" enabled keeps the session active across browser restarts, within the persistent session's lifetime
- [ ] Selecting a profile without "Remember me" does not survive a browser restart
- [ ] Reopening the app within the persistent session's lifetime skips the profile picker and goes straight to the dashboard
- [ ] Reopening the app after the persistent session has expired shows the profile picker
- [ ] Reopening the app with an invalid session shows the profile picker

## Scenarios

Scenario: Remember me option is available at selection
GIVEN the profile picker is showing
WHEN the user views the options for selecting "Priya"
THEN a "Remember me" option is offered

Scenario: Remembered session survives a browser restart
GIVEN the user selected "Priya" with "Remember me" enabled
WHEN the user closes and reopens the browser within the persistent session's lifetime
THEN the app opens directly to Priya's dashboard without showing the profile picker

Scenario: Session without Remember me does not survive a browser restart
GIVEN the user selected "Priya" without enabling "Remember me"
WHEN the user closes and reopens the browser
THEN the profile picker is shown again

Scenario: Expired persistent session returns to the picker
GIVEN the user selected "Priya" with "Remember me" enabled and the persistent session's lifetime has since elapsed
WHEN the user reopens the app
THEN the profile picker is shown

Scenario: Invalid session returns to the picker
GIVEN the user's stored session is invalid or has been tampered with
WHEN the user opens the app
THEN the profile picker is shown
