# User Replaces a Contact's Photo

**As a** user, **I can** take a new photo or choose one from my library while editing a contact, **so that** an outdated or poor-quality photo can be swapped for a better one.

## Acceptance Criteria

- [ ] The edit view offers the same two photo actions as adding a contact: "Take Photo" and "Choose from Library"
- [ ] Choosing a new photo shows a preview in the edit view before saving
- [ ] Saving with a newly chosen photo replaces the contact's previously saved photo
- [ ] Photos up to 5 MB in JPG or PNG format are accepted, matching the add-contact rule
- [ ] A photo larger than 5 MB is rejected with a message stating the size limit, and the contact's existing photo is unchanged
- [ ] An unsupported file format is rejected with a message listing accepted formats, and the contact's existing photo is unchanged

## Scenarios

Scenario: User replaces an existing photo
GIVEN a contact has a saved photo
WHEN the user opens the edit view, chooses a new photo from their library, and saves
THEN the contact's photo is the newly chosen one

Scenario: User adds a photo to a contact that had none
GIVEN a contact has no saved photo and shows the placeholder silhouette
WHEN the user opens the edit view, takes a photo, and saves
THEN the contact's photo is the one just taken

Scenario: Oversized replacement photo is rejected
GIVEN a contact has a saved photo
WHEN the user chooses a replacement photo larger than 5 MB and attempts to save
THEN an error states the size limit and the contact's original photo remains unchanged

Scenario: Unsupported file format is rejected
GIVEN a contact has a saved photo
WHEN the user chooses a replacement file that is not JPG or PNG and attempts to save
THEN an error lists the accepted formats and the contact's original photo remains unchanged
