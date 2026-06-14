# Deletion Summary Requires Explicit Confirmation

**As a** user initiating account deletion, **I can** see a clear summary of exactly what will be deleted before I confirm, **so that** the action is fully intentional and not accidental.

## Acceptance Criteria

- [ ] A confirmation dialog lists the specific data that will be deleted (contacts count, photos, review history records)
- [ ] The user must type a confirmation phrase (e.g., "DELETE") to enable the final delete button
- [ ] A "Cancel" option is clearly visible and returns the user to account settings without deleting anything
- [ ] The confirmation step is not bypassable — there is no API shortcut that skips it
