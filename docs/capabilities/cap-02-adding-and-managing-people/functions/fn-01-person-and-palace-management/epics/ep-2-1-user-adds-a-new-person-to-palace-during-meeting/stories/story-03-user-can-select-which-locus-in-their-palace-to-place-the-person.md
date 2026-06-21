# User Can Select Which Locus in Their Palace to Place the Person

**As a** user adding a new contact, **I can** choose a palace and a specific locus within it, **so that** the person is anchored to a memorable spatial location.

## Acceptance Criteria

- [ ] The locus field shows a palace picker followed by a locus picker within that palace
- [ ] Changing the selected palace resets the locus selection and shows only loci belonging to the new palace
- [ ] If the user has no palaces, the field shows a prompt to create one first, and the form cannot be submitted until a locus is selected
- [ ] The selected palace name and locus name are both visible on the form before submission
- [ ] The user can change their selection at any point before saving without losing other field values
- [ ] Loci already occupied by another contact are shown with a visual indicator; the user can still choose them (conflict resolution is handled separately)
