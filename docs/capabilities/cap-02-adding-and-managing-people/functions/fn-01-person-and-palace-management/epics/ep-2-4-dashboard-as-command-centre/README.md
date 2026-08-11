# E-2.4: Dashboard as Command Centre

> Capability: [Adding and Managing People](../../../../README.md) - Function: [Person and Palace Management](../../README.md)

**As** a registered user who has selected their profile
**I want to** see a single screen that shows me where I am, what needs my attention, and where I can go next
**So that** I can start any activity — reviewing, teaching, building palaces, or managing my account — in one tap

## Overview

The dashboard is the primary hub of FaceFile. It opens immediately after profile selection and presents four distinct areas:

| Area | What it does |
|---|---|
| Metrics row | At-a-glance stats: people added, cards due, total quiz answers, accuracy percentage |
| Action banners | Contextual launch points: start quiz when cards are due, enter teach mode, open the tutorial, navigate to palaces |
| Names & faces inventory | Scrollable grid of every person stored under this profile — the raw material for name recall |
| Navigation shortcuts | Utility links: Admin (user management), Meetings (context capture), and Switch profile |

## Acceptance Criteria (epic-level)

1. The dashboard is unreachable without an active session — the profile guard redirects unauthenticated navigations to the profile picker.
2. The metrics row always shows current counts for this profile; the "due for review" tile is visually highlighted when `dueCount > 0`.
3. A quiz-prompt banner appears above the action banners when at least one card is due; tapping "Start Quiz →" navigates to `/quiz`.
4. The teach-mode, tutorial, and memory-palaces banners are always visible as standing launch points.
5. The names-and-faces inventory shows all contacts for this profile as photo cards, with an "Add person" shortcut card at the end.
6. When the inventory is empty a friendly empty-state prompt appears with a link to add the first person.
7. Admin and Meetings links are accessible from the header; they are visually distinct from primary actions.
8. "Switch profile" is accessible from the header; activating it clears the session and returns to the profile picker.
9. The inventory, metrics, and all data shown on the dashboard are scoped to the active profile — no contact, stat, or quiz card belonging to another profile is ever visible.

## Stories

| # | ID | Story | Why this order |
|---|----|-------|-----------------|
| 1 | S-2.4.1 | [Dashboard shows quiz readiness at a glance — metrics row and due-review banner](./stories/story-01-dashboard-shows-quiz-readiness-at-a-glance.md) | First thing a returning user needs: drives the core spaced-repetition loop. Must be visible before any other action is taken. |
| 2 | S-2.4.2 | [Dashboard shows names-and-faces inventory — contact grid with add shortcut](./stories/story-02-dashboard-shows-names-and-faces-inventory.md) | The raw content of the palace; needed before teach mode or quiz makes sense. |
| 3 | S-2.4.3 | [Dashboard action banners launch teach mode, tutorial, and palaces](./stories/story-03-dashboard-action-banners-launch-teach-mode-tutorial-and-palaces.md) | Learning entry points. Builds on S-2.4.1 (quiz banner) and S-2.4.2 (contacts exist). |
| 4 | S-2.4.4 | [Dashboard navigation shortcuts — Admin, Meetings, Switch profile](./stories/story-04-dashboard-navigation-shortcuts.md) | Utility layer. Depends on session (switch profile) and admin feature (admin link). Comes last because it doesn't affect the learning flow. |
