# Stable Interval Indicator After Recovery

**As a** user, **I can** see a visual indicator when a previously lapsed contact reaches a stable review interval (>21 days), **so that** I know the encoding has finally taken and the repair worked.

## Acceptance Criteria

- [ ] A "Stable" badge or indicator appears on the contact detail page once the interval exceeds 21 days
- [ ] The indicator only appears if the contact has at least one prior lapse — newly stable contacts without lapses do not show it
- [ ] A brief celebratory message is shown the first time the stable threshold is crossed post-lapse
- [ ] The indicator disappears if the contact lapses again and the interval resets
