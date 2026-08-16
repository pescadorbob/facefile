# E-2.6: User Edits a Contact's Name or Photo

> Capability: [Adding and Managing People](../../../../README.md) - Function: [Person and Palace Management](../../README.md)

**As** a user who has already added a person to a palace
**I want to** correct or update that person's name or photo after the fact
**So that** my palace stays accurate without deleting and re-adding the contact and losing my review progress

## Acceptance Criteria (epic-level)

1. User can open an edit view for an existing contact, pre-filled with the current name and photo
2. Saving the edit form with a changed name updates the contact's name
3. Saving the edit form with a new photo replaces the contact's photo
4. Removing the current photo without choosing a new one reverts the contact to the placeholder silhouette
5. Submitting the edit form with the Name cleared is rejected, and the contact is not changed
6. Editing a contact's name or photo does not change the contact's review schedule
7. Editing a contact's name or photo does not change which palace or locus the contact is placed in

> Note: FaceFile stores a contact's name as a single field (no separate first/last/nickname split exists anywhere in the app yet — see `S-2.1.4` under E-2.1, which specifies that split but was never built). This epic edits that single Name field; splitting it into parts is out of scope here.

## Stories

| # | ID | Story | Why this order |
|---|----|-------|-----------------|
| 1 | S-2.6.1 | [User opens an edit view pre-filled with the contact's current name and photo](./stories/story-01-user-opens-edit-view-pre-filled-with-current-name-and-photo.md) | Nothing else in this epic is reachable without an entry point into editing. |
| 2 | S-2.6.2 | [User updates a contact's name](./stories/story-02-user-updates-a-contacts-name.md) | The most common correction (a typo) and the simplest edit to deliver. |
| 3 | S-2.6.3 | [User replaces a contact's photo](./stories/story-03-user-replaces-a-contacts-photo.md) | Second most common correction; mirrors the add-flow photo picker so it's low-risk to build next. |
| 4 | S-2.6.4 | [User removes a contact's photo and reverts to the placeholder](./stories/story-04-user-removes-a-contacts-photo-and-reverts-to-placeholder.md) | Edge case of the photo edit — worth its own story since it's a distinct outcome (no photo, not a new photo). |
| 5 | S-2.6.5 | [Clearing the Name blocks the update](./stories/story-05-clearing-the-name-blocks-the-update.md) | Validation boundary that protects stories 2–4 from producing an invalid contact. |
| 6 | S-2.6.6 | [Editing a contact leaves its review schedule untouched](./stories/story-06-editing-a-contact-leaves-review-schedule-untouched.md) | Protects the spaced-repetition investment already made in this contact; must hold true for every edit above. |
| 7 | S-2.6.7 | [Editing a contact leaves its palace and locus placement untouched](./stories/story-07-editing-a-contact-leaves-palace-and-locus-placement-untouched.md) | Confirms the edit is scoped to name/photo only — moving a contact is a separate, existing feature (locus conflict management). |
