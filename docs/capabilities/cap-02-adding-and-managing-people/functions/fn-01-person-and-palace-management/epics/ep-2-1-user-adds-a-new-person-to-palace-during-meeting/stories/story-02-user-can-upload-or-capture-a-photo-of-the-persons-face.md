# User Can Upload or Capture a Photo of the Person's Face

**As a** user adding a new contact, **I can** take a photo with my camera or choose one from my library, **so that** the person's face is stored alongside their name.

## Acceptance Criteria

- [ ] The photo field offers two actions: "Take Photo" (device camera) and "Choose from Library"
- [ ] A preview of the selected photo is shown on the form before the contact is saved
- [ ] The user can replace the photo by tapping the preview and choosing again
- [ ] Photos up to 5 MB in JPG or PNG format are accepted
- [ ] A photo larger than 5 MB is rejected with a message stating the size limit
- [ ] An unsupported file format is rejected with a message listing accepted formats
- [ ] A contact can be saved without a photo; a placeholder silhouette is displayed in place of the missing image
