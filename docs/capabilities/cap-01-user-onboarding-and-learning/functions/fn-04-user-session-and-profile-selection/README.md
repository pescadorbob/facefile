# F-1.4: User Session and Profile Selection

> Capability: [User Onboarding and Learning](../../README.md)

Allow a user to identify which profile they are acting as before accessing any part of the application, so that their data, palaces, and quiz progress are always scoped to them.

## How it works

FaceFile does not use passwords or traditional credentials. Selecting a user is more like choosing a Netflix profile than logging in: the app presents a list of registered users, the user taps their name, and the app enters a session scoped to that user. No username/password prompt, no two-factor code — just a single tap.

**This is not a multi-tenant authentication system.** It is a shared-device profile switcher designed for personal or small-group use.

## Session behaviour

- An active session is required before accessing any page. The dashboard, palaces, contacts, and quiz all redirect to the profile picker if no session exists.
- A session cookie (`facefile_user_id`) stores the selected user ID so the user is not asked again after a page refresh or a browser restart until they explicitly switch profiles.
- Switching profiles clears the current session and returns the user to the profile picker.

## Technical notes

| Concern | Decision |
|---|---|
| Session storage | Server-issued `HttpOnly` session cookie (`facefile_user_id`). Not stored in `localStorage` (avoids XSS exposure of the selected ID). |
| Cookie lifetime | Session cookie (expires when the browser is closed) by default; "Remember me" option upgrades to a 30-day persistent cookie. |
| Guard | A functional Angular route guard (`profileGuard`) checks for an active session on every navigation. Unauthenticated navigations redirect to `/select-profile`. |
| Backend | Every API request reads the user ID from the session cookie (falling back to the `userId` query param for backward-compatibility during the migration period). |
| Profile picker data | `GET /api/admin/users?status=active` — returns `id`, `name`, and `avatarUrl` (or initials fallback). |

## Epics

- [E-1.7: User Selects Active Profile](./epics/ep-1-7-user-selects-active-profile/README.md)
