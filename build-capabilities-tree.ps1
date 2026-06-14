$ErrorActionPreference = 'Stop'
$r = "c:\Users\bcfis\work\facefile\docs\capabilities"

function md($p) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
function wf($p, $c) { [System.IO.File]::WriteAllText($p, $c, [System.Text.Encoding]::UTF8) }

function story($ep, $n, $slug, $us, $crit) {
    md "$ep\stories"
    $t = (Get-Culture).TextInfo.ToTitleCase(($slug -replace '-', ' '))
    $cr = ($crit | ForEach-Object { "- [ ] $_" }) -join "`n"
    wf "$ep\stories\story-$n-$slug.md" "# $t`n`n$us`n`n## Acceptance Criteria`n`n$cr`n"
}

# ── Root README ──────────────────────────────────────────────────────────────
wf "$r\README.md" @'
# FaceFile Product Hierarchy

Product scope is organized in four levels:

1. **Capability** - a major area of value the product provides
2. **Function** - a coherent grouping of related epics within a capability
3. **Epic** - a meaningful slice of user value
4. **Story** - the smallest independently implementable unit (one acceptance criterion)

## Capabilities

- [C-1: User Onboarding and Learning](./cap-01-user-onboarding-and-learning)
- [C-2: Adding and Managing People](./cap-02-adding-and-managing-people)
- [C-3: Creating and Refining Name Images](./cap-03-creating-and-refining-name-images)
- [C-4: Retrieval Practice and Spaced Repetition](./cap-04-retrieval-practice-and-spaced-repetition)
- [C-5: Error Recovery and Learning from Failure](./cap-05-error-recovery-and-learning-from-failure)
- [C-6: Real-World Integration](./cap-06-real-world-integration)
- [C-7: Social and Gamification Features](./cap-07-social-and-gamification-features)
- [C-8: Administrative and Content Management](./cap-08-administrative-and-content-management)
- [C-9: Technical Infrastructure](./cap-09-technical-infrastructure)
- [C-10: Analytics and Insights](./cap-10-analytics-and-insights)
'@

# ════════════════════════════════════════════════════════════════════════════
# C-1: User Onboarding and Learning
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-01-user-onboarding-and-learning"
wf "$c\README.md" @'
# C-1: User Onboarding and Learning

Help new users understand the memory palace methodology and achieve their first successful recall within their first session.

## Functions

- [fn-01-memory-palace-education](./functions/fn-01-memory-palace-education)
- [fn-02-account-setup](./functions/fn-02-account-setup)
- [fn-03-first-contact-guided-experience](./functions/fn-03-first-contact-guided-experience)
'@

# fn-01
$f = "$c\functions\fn-01-memory-palace-education"; md $f
wf "$f\README.md" @'
# F-1.1: Memory Palace Education

Teach the memory palace system before the user adds their first contact so the methodology is understood from the start.

## Epics

- [ep-1-1-user-learns-memory-palace-fundamentals](./epics/ep-1-1-user-learns-memory-palace-fundamentals)
- [ep-1-2-user-creates-first-memory-palace](./epics/ep-1-2-user-creates-first-memory-palace)
- [ep-1-3-user-understands-name-to-image-conversion-techniques](./epics/ep-1-3-user-understands-name-to-image-conversion-techniques)
'@

$e = "$f\epics\ep-1-1-user-learns-memory-palace-fundamentals"; md "$e\stories"
wf "$e\README.md" "# ep-1-1: User Learns Memory Palace Fundamentals`n`nUser understands why spatial + image encoding solves the arbitrariness problem of names.`n"
$us = "**As a** new user, **I can** see an introduction explaining why names are arbitrary and hard to remember, **so that** I understand the core problem FaceFile solves."
story $e "01" "new-user-sees-intro-on-name-memorization" $us @("Intro screen appears on first login only","Explains that names have no inherent meaning to anchor memory to","Introduces the encode -> place -> interact -> retrieve loop","Get Started button advances to next onboarding step")
$us = "**As a** new user, **I can** see the four-step encode-place-interact-retrieve loop illustrated with an example, **so that** I know what each part of the app is for before I use it."
story $e "02" "new-user-understands-the-encoding-loop" $us @("Each of the four steps is shown with a brief visual example","Labels match the terminology used throughout the app UI","User can tap through examples at their own pace","Loop is referenced again when the user adds their first contact")

$e = "$f\epics\ep-1-2-user-creates-first-memory-palace"; md "$e\stories"
wf "$e\README.md" "# ep-1-2: User Creates First Memory Palace`n`nUser sets up a named palace with loci so they have a spatial container ready.`n"
$us = "**As a** new user, **I can** name and create my first memory palace (e.g. My Office), **so that** I have a spatial container ready to place people into."
story $e "01" "user-defines-a-named-palace" $us @("User enters a name for the palace","Palace is saved and appears in the palace list","User sees a brief explanation of what a palace is and why it helps")
$us = "**As a** new user, **I can** define specific loci within my palace (e.g. door, desk, window), **so that** I have named spots to anchor each person to."
story $e "02" "user-assigns-loci-to-palace" $us @("User can add multiple loci to a palace by name","Loci are stored in the order the user defines them","A default set of 5 suggested loci is offered as a starting point","User can rename or delete loci at any time")

$e = "$f\epics\ep-1-3-user-understands-name-to-image-conversion-techniques"; md "$e\stories"
wf "$e\README.md" "# ep-1-3: User Understands Name-to-Image Conversion Techniques`n`nUser learns the three encoding techniques before creating their first name image.`n"
$us = "**As a** new user, **I can** see the three name-to-image encoding techniques with examples, **so that** I know which approach to try when a name does not immediately suggest an image."
story $e "01" "user-sees-three-encoding-technique-types" $us @("Sound-alike shown with example (e.g. Ben -> bent beam)","Meaning-based shown with example (e.g. Baker -> baking bread)","Syllable-split shown with example (e.g. Anderson -> antler + son)","User can swipe through all three before proceeding")
$us = "**As a** new user, **I can** see worked examples for several common names, **so that** I have concrete models to imitate when creating my own images."
story $e "02" "user-sees-worked-examples-for-common-names" $us @("At least 6 common names are shown with full image descriptions","Examples span all three encoding techniques","Examples note that silly or bizarre images are effective","User can bookmark an example for reference later")

# fn-02
$f = "$c\functions\fn-02-account-setup"; md $f
wf "$f\README.md" @'
# F-1.2: Account Setup

Get a user from zero to a working, persistent account with secure authentication.

## Epics

- [ep-1-4-user-creates-an-account](./epics/ep-1-4-user-creates-an-account)
- [ep-1-5-user-recovers-access](./epics/ep-1-5-user-recovers-access)
'@

$e = "$f\epics\ep-1-4-user-creates-an-account"; md "$e\stories"
wf "$e\README.md" "# ep-1-4: User Creates an Account`n`nUser registers, verifies their email, and logs in so data persists across sessions.`n"
$us = "**As a** new user, **I can** register with an email address and password, **so that** I can access my personal contact list from any device."
story $e "01" "user-registers-with-email-and-password" $us @("Registration form requires email and password","Password must be 8+ characters with at least one number","Duplicate email addresses are rejected with a clear error","User is redirected to the onboarding flow after registration")
$us = "**As a** new user, **I can** verify my email address by clicking a link sent to my inbox, **so that** my account is tied to a real, accessible email."
story $e "02" "user-verifies-email-address" $us @("Verification email is sent immediately after registration","Link expires after 24 hours","Resend link is available if the email is not received","User can log in while unverified with a banner reminder")
$us = "**As a** returning user, **I can** log in with my email and password, **so that** I can resume my practice session where I left off."
story $e "03" "user-logs-in-with-credentials" $us @("Login form accepts email and password","Incorrect credentials return a generic error (no user enumeration)","Successful login redirects to the review dashboard","Session persists across browser refreshes")

$e = "$f\epics\ep-1-5-user-recovers-access"; md "$e\stories"
wf "$e\README.md" "# ep-1-5: User Recovers Access`n`nUser can regain account access after forgetting their password.`n"
$us = "**As a** user who forgot my password, **I can** request a reset email, **so that** I can regain access without creating a new account."
story $e "01" "user-requests-password-reset-email" $us @("Password reset form accepts an email address","Reset email is sent within 60 seconds","Response is identical whether or not the email exists","Reset link expires after 1 hour")
$us = "**As a** user with a valid reset link, **I can** set a new password, **so that** my account is secured with credentials I can remember."
story $e "02" "user-sets-new-password-from-reset-link" $us @("Reset page requires new password and confirmation","New password must meet the same strength requirements as registration","Successful reset logs the user in and invalidates other sessions","Expired links show a clear error with a retry option")

# fn-03
$f = "$c\functions\fn-03-first-contact-guided-experience"; md $f
wf "$f\README.md" @'
# F-1.3: First Contact Guided Experience

Walk the user through their first add-quiz cycle so the workflow becomes intuitive immediately.

## Epics

- [ep-1-6-user-adds-first-contact-with-guidance](./epics/ep-1-6-user-adds-first-contact-with-guidance)
- [ep-1-7-user-completes-immediate-first-quiz](./epics/ep-1-7-user-completes-immediate-first-quiz)
'@

$e = "$f\epics\ep-1-6-user-adds-first-contact-with-guidance"; md "$e\stories"
wf "$e\README.md" "# ep-1-6: User Adds First Contact with Guidance`n`nUser is walked step-by-step through their first contact add, including creating a name image.`n"
$us = "**As a** new user, **I can** add my first contact through a step-by-step guided flow with prompts at each field, **so that** the full process is clear before I do it on my own."
story $e "01" "user-guided-through-first-contact-add" $us @("Guided flow highlights each field in sequence with a tooltip","Prompts explain why each field matters","User cannot accidentally skip the name image step in guided mode","Progress indicator shows how many steps remain")
$us = "**As a** new user adding my first contact, **I can** be prompted to create a name image before saving, **so that** the encoding habit starts with my very first contact."
story $e "02" "user-prompted-to-create-name-image-before-saving" $us @("Name image prompt appears after the name field is filled","Three technique options are offered as starting points","User can type a free-form image description","Saving is gated on the image field being non-empty in guided mode")

$e = "$f\epics\ep-1-7-user-completes-immediate-first-quiz"; md "$e\stories"
wf "$e\README.md" "# ep-1-7: User Completes Immediate First Quiz`n`nUser is taken directly into a one-question quiz after adding their first contact.`n"
$us = "**As a** new user who just added their first contact, **I can** be automatically taken into a one-question quiz, **so that** I experience retrieval practice within the critical 60-second encoding window."
story $e "01" "user-auto-prompted-to-quiz-after-first-contact" $us @("Quiz prompt appears immediately after the contact is saved","Quiz contains exactly one Face -> Name question on the contact just added","User can skip the quiz with a clearly labelled option","SM-2 parameters are initialized after this first attempt")
$us = "**As a** new user after my first quiz attempt, **I can** receive encouraging feedback regardless of whether I got it right, **so that** I feel motivated to continue."
story $e "02" "user-receives-encouraging-feedback-after-attempt" $us @("Correct answer shows a congratulatory message referencing the name image","Incorrect answer shows the correct name with the image cue","Neither outcome uses negative language","A Next Step prompt guides the user to add another contact or go to the dashboard")

# ════════════════════════════════════════════════════════════════════════════
# C-2: Adding and Managing People
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-02-adding-and-managing-people"
wf "$c\README.md" @'
# C-2: Adding and Managing People

Give users a fast, frictionless way to capture the people they want to remember.

## Functions

- [fn-01-contact-creation](./functions/fn-01-contact-creation)
- [fn-02-contact-organization](./functions/fn-02-contact-organization)
- [fn-03-contact-editing-and-removal](./functions/fn-03-contact-editing-and-removal)
'@

$f = "$c\functions\fn-01-contact-creation"; md $f
wf "$f\README.md" @'
# F-2.1: Contact Creation

Capture the core data needed to build a memory: name, face, and personal context.

## Epics

- [ep-2-1-user-enters-contact-details](./epics/ep-2-1-user-enters-contact-details)
- [ep-2-2-user-adds-a-photo](./epics/ep-2-2-user-adds-a-photo)
'@

$e = "$f\epics\ep-2-1-user-enters-contact-details"; md "$e\stories"
wf "$e\README.md" "# ep-2-1: User Enters Contact Details`n`nUser captures name, notes, and contextual fields for a new contact.`n"
$us = "**As a** user, **I can** create a new contact by entering a first and last name, **so that** the person is added to my learning list."
story $e "01" "user-creates-contact-with-name" $us @("Contact form has separate first and last name fields","First name is required; last name is optional","Contact appears in the contact list immediately after saving","Name is displayed as full name throughout the app")
$us = "**As a** user, **I can** add free-form personal notes (role, how we met, shared interests) to a contact, **so that** I have rich context cues beyond the name alone."
story $e "02" "user-adds-personal-notes-to-contact" $us @("Notes field accepts multi-line plain text","Notes are shown during quiz sessions as an optional hint","Notes are searchable from the contact list search")
$us = "**As a** user, **I can** save a contact without attaching a photo, **so that** I am not blocked when I do not have an image available."
story $e "03" "user-saves-contact-without-photo" $us @("Photo field is optional on the contact form","Contacts without a photo show a default avatar placeholder","Photo can be added at any later time","Name -> Face quiz questions are skipped for contacts without photos")

$e = "$f\epics\ep-2-2-user-adds-a-photo"; md "$e\stories"
wf "$e\README.md" "# ep-2-2: User Adds a Photo`n`nUser attaches a face photo to a contact via upload or camera.`n"
$us = "**As a** user, **I can** upload a photo from my device when adding a contact, **so that** the person's face is attached to their record for quiz use."
story $e "01" "user-uploads-photo-from-device" $us @("Upload button opens the device file picker filtered to image types","Accepted formats: JPEG, PNG, WEBP","File size limit of 10MB with a clear error if exceeded","Uploaded image is displayed immediately in the contact form")
$us = "**As a** user, **I can** take a photo with my device camera directly in the app, **so that** I can capture someone in the moment without leaving FaceFile."
story $e "02" "user-takes-photo-with-camera" $us @("Camera button triggers the device camera API","Captured photo loads into the contact form for cropping before saving","Camera permission is requested with a clear explanation","Graceful fallback to file upload if camera permission is denied")
$us = "**As a** user, **I can** crop the uploaded photo so the face is prominently centred in the quiz image."
story $e "03" "user-crops-and-adjusts-photo" $us @("Crop tool appears after a photo is selected or captured","Crop area is constrained to a square aspect ratio","User can drag and zoom to position the face","Cropped image is saved; original is discarded")

$f = "$c\functions\fn-02-contact-organization"; md $f
wf "$f\README.md" @'
# F-2.2: Contact Organization

Keep the contact list navigable and contextually organized as it grows.

## Epics

- [ep-2-3-user-groups-contacts](./epics/ep-2-3-user-groups-contacts)
- [ep-2-4-user-searches-and-filters-contacts](./epics/ep-2-4-user-searches-and-filters-contacts)
'@

$e = "$f\epics\ep-2-3-user-groups-contacts"; md "$e\stories"
wf "$e\README.md" "# ep-2-3: User Groups Contacts`n`nUser organizes contacts into named social groups that mirror real-world contexts.`n"
$us = "**As a** user, **I can** assign a contact to a named group (e.g. Work, Neighbors), **so that** my contact list mirrors my socially organized memory palace structure."
story $e "01" "user-assigns-contact-to-group" $us @("Group selector appears on the contact form","User can choose from existing groups or create a new one inline","Assigned group is shown as a tag on the contact list card","Group assignment is optional")
$us = "**As a** user, **I can** create new groups and rename existing ones, **so that** the grouping structure reflects my actual social contexts over time."
story $e "02" "user-creates-and-renames-groups" $us @("New group can be created from the contact form or a groups screen","Group names must be unique","Renaming a group updates the label on all contacts assigned to it","Empty groups can be deleted")
$us = "**As a** user, **I can** assign a contact to multiple groups, **so that** people who appear in overlapping contexts show up in both group views."
story $e "03" "user-assigns-contact-to-multiple-groups" $us @("Group selector allows multi-select","Contact shows all assigned group tags on its card","Filtering by a group shows all contacts in that group regardless of other groups")

$e = "$f\epics\ep-2-4-user-searches-and-filters-contacts"; md "$e\stories"
wf "$e\README.md" "# ep-2-4: User Searches and Filters Contacts`n`nUser can find any contact quickly as the list grows.`n"
$us = "**As a** user, **I can** search my contacts by name, **so that** I can find a specific person quickly without scrolling the full list."
story $e "01" "user-searches-contacts-by-name" $us @("Search bar is always visible at the top of the contact list","Results filter in real time as the user types","Search matches on first name, last name, and notes","No results state shows a clear message and an Add Contact shortcut")
$us = "**As a** user, **I can** filter my contact list by group, **so that** I only see people from a specific social context."
story $e "02" "user-filters-contacts-by-group" $us @("Group filter options appear as chips below the search bar","Selecting a chip filters the list to that group","Multiple groups can be active at once (OR logic)","Active filters are visually indicated and easy to clear")
$us = "**As a** user, **I can** sort my contact list by date added or date last reviewed, **so that** I can find recently added contacts or identify neglected ones."
story $e "03" "user-sorts-contacts-by-date-or-last-reviewed" $us @("Sort control is accessible from the contact list header","Available sorts: Alphabetical, Date Added (newest), Last Reviewed (oldest first)","Selected sort persists across sessions","Last Reviewed sort surfaces contacts with no review yet at the top")

$f = "$c\functions\fn-03-contact-editing-and-removal"; md $f
wf "$f\README.md" @'
# F-2.3: Contact Editing and Removal

Keep the contact list accurate and manageable over time.

## Epics

- [ep-2-5-user-edits-a-contact](./epics/ep-2-5-user-edits-a-contact)
- [ep-2-6-user-archives-or-deletes-a-contact](./epics/ep-2-6-user-archives-or-deletes-a-contact)
'@

$e = "$f\epics\ep-2-5-user-edits-a-contact"; md "$e\stories"
wf "$e\README.md" "# ep-2-5: User Edits a Contact`n`nUser can update any field on an existing contact to keep the record accurate.`n"
$us = "**As a** user, **I can** edit any field on an existing contact, **so that** the record stays accurate as my knowledge of that person deepens."
story $e "01" "user-edits-contact-field" $us @("Edit button is accessible from the contact detail view","All fields from the creation form are editable","Changes are saved on explicit Save action","Unsaved changes prompt a discard confirmation if the user navigates away")
$us = "**As a** user, **I can** replace a contact's photo with a better one, **so that** the quiz image is always the most recognizable likeness available."
story $e "02" "user-replaces-contact-photo" $us @("Replace Photo button is available on the contact edit screen","New photo goes through the same crop flow as initial upload","Old photo is replaced and not retained after the new one is saved","Review history and SM-2 state are unaffected by a photo change")

$e = "$f\epics\ep-2-6-user-archives-or-deletes-a-contact"; md "$e\stories"
wf "$e\README.md" "# ep-2-6: User Archives or Deletes a Contact`n`nUser can remove a contact from active review without necessarily losing the record.`n"
$us = "**As a** user, **I can** archive a contact, **so that** they leave my active review queue without being permanently deleted."
story $e "01" "user-archives-contact" $us @("Archive option is available in the contact detail view","Archived contacts no longer appear in the review dashboard or quiz queue","Archived contacts are accessible from an Archived tab","Contact can be unarchived at any time to resume reviews")
$us = "**As a** user, **I can** permanently delete a contact, **so that** my list only includes people still relevant to my life."
story $e "02" "user-permanently-deletes-contact" $us @("Delete option is available in the contact detail view","Permanent delete removes the contact record, photo, and all review history","Action is irreversible and clearly communicated to the user","Deleted contacts do not appear in the archived contacts list")
$us = "**As a** user, **I can** see a confirmation dialog before a contact is permanently deleted, **so that** I cannot lose a contact record by accident."
story $e "03" "user-confirms-before-deletion" $us @("Confirmation dialog names the contact being deleted","Dialog has explicit Confirm Delete and Cancel buttons","The default focused button is Cancel to prevent accidental confirmation","Dialog cannot be dismissed by clicking outside it")

# ════════════════════════════════════════════════════════════════════════════
# C-3: Creating and Refining Name Images
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-03-creating-and-refining-name-images"
wf "$c\README.md" @'
# C-3: Creating and Refining Name Images

The heart of the memory palace method: turning an arbitrary name into a vivid, retrievable image and anchoring it to a stable locus.

## Functions

- [fn-01-name-to-image-encoding](./functions/fn-01-name-to-image-encoding)
- [fn-02-locus-assignment](./functions/fn-02-locus-assignment)
- [fn-03-interaction-encoding](./functions/fn-03-interaction-encoding)
'@

$f = "$c\functions\fn-01-name-to-image-encoding"; md $f
wf "$f\README.md" @'
# F-3.1: Name-to-Image Encoding

Help users convert arbitrary names into vivid, retrievable mental images.

## Epics

- [ep-3-1-user-creates-a-name-image](./epics/ep-3-1-user-creates-a-name-image)
- [ep-3-2-user-receives-ai-image-suggestion](./epics/ep-3-2-user-receives-ai-image-suggestion)
'@

$e = "$f\epics\ep-3-1-user-creates-a-name-image"; md "$e\stories"
wf "$e\README.md" "# ep-3-1: User Creates a Name Image`n`nUser manually encodes a contact's name into a concrete, imageable cue.`n"
$us = "**As a** user adding a contact, **I can** be guided to create a name image using a sound-alike, meaning-based, or syllable-split technique, **so that** I have a systematic starting point."
story $e "01" "user-prompted-to-create-image-with-three-techniques" $us @("Name image field shows a prompt with the three technique options","Tapping a technique shows a brief example relevant to the contact's name","User can freely type their own image description","Name image field is clearly distinct from the notes field")
$us = "**As a** user, **I can** type a free-form description of my name image (e.g. bent beam for Ben), **so that** the encoding is saved and reviewable during future quiz recovery."
story $e "02" "user-types-free-form-image-description" $us @("Name image field accepts up to 500 characters","Saved image is displayed on the contact detail screen","Image description is shown as a hint during quiz failure reveals","Field can be left blank if the user prefers not to use this feature")
$us = "**As a** user, **I can** see worked example encodings for common names, **so that** I have concrete models when my own ideas are slow to come."
story $e "03" "user-sees-worked-examples-for-common-names" $us @("An Examples link is visible next to the name image field","At least 10 common names with full image descriptions are shown","Examples span all three encoding techniques","Examples include a note that bizarreness improves recall")

$e = "$f\epics\ep-3-2-user-receives-ai-image-suggestion"; md "$e\stories"
wf "$e\README.md" "# ep-3-2: User Receives AI Image Suggestion`n`nApp generates a suggested name image when the user is stuck.`n"
$us = "**As a** user who cannot think of an image for a name, **I can** request an AI-generated suggestion, **so that** I am never permanently blocked by an unfamiliar name."
story $e "01" "user-requests-suggested-name-image" $us @("Suggest button appears next to the name image field","Suggestion is generated within 3 seconds","Suggestion follows one of the three standard encoding techniques","Suggestion is specific to the contact's name, not generic")
$us = "**As a** user, **I can** accept, modify, or reject a suggested name image, **so that** I stay in control of my own encoding."
story $e "02" "user-accepts-modifies-or-rejects-suggestion" $us @("Suggestion appears in an editable text field, not as read-only","User can edit the suggestion before accepting","Reject clears the field and offers to generate a new suggestion","Accept saves the suggestion as the name image")

$f = "$c\functions\fn-02-locus-assignment"; md $f
wf "$f\README.md" @'
# F-3.2: Locus Assignment

Anchor each contact to a specific, stable location in a named memory palace.

## Epics

- [ep-3-3-user-assigns-contact-to-a-palace-locus](./epics/ep-3-3-user-assigns-contact-to-a-palace-locus)
- [ep-3-4-user-manages-locus-conflicts](./epics/ep-3-4-user-manages-locus-conflicts)
'@

$e = "$f\epics\ep-3-3-user-assigns-contact-to-a-palace-locus"; md "$e\stories"
wf "$e\README.md" "# ep-3-3: User Assigns Contact to a Palace Locus`n`nUser places a contact at a specific locus within a named palace to spatially anchor the encoding.`n"
$us = "**As a** user, **I can** assign a contact to a specific locus within a named palace (e.g. door in My Office), **so that** my encoding is spatially anchored and the palace can be mentally walked."
story $e "01" "user-assigns-contact-to-locus-in-palace" $us @("Palace and locus selectors appear on the contact form","Only palaces and loci defined by the user are shown","Assignment is optional; contacts without a locus still function normally","Locus assignment is visible on the contact detail screen")
$us = "**As a** user, **I can** view all contacts placed in a given palace in their locus order, **so that** I can mentally walk the palace before an event."
story $e "02" "user-views-contacts-placed-in-palace" $us @("Palace detail view lists all assigned contacts by locus","Loci with no contact assigned are shown as empty slots","User can reorder loci within a palace","Tapping a contact in the palace view opens their detail screen")

$e = "$f\epics\ep-3-4-user-manages-locus-conflicts"; md "$e\stories"
wf "$e\README.md" "# ep-3-4: User Manages Locus Conflicts`n`nUser is warned when two contacts occupy the same palace locus.`n"
$us = "**As a** user, **I can** be warned before assigning a contact to a locus that is already occupied, **so that** spatial collisions do not create confusion during recall."
story $e "01" "user-warned-of-locus-conflict" $us @("Warning appears inline when an occupied locus is selected","Warning names the contact currently at that locus","User can proceed and override, or choose a different locus","Both contacts show a conflict indicator if the override is accepted")
$us = "**As a** user, **I can** move a contact to a different locus, **so that** I can resolve conflicts and optimize my palace organization."
story $e "02" "user-moves-contact-to-different-locus" $us @("Locus field is editable on the contact edit screen","Changing the palace or locus does not affect SM-2 review history","Empty loci in the target palace are clearly indicated","Move is saved only on explicit Save action")

$f = "$c\functions\fn-03-interaction-encoding"; md $f
wf "$f\README.md" @'
# F-3.3: Interaction Encoding

Capture the dynamic scene connecting the name image to the locus — the elaboration that makes static images stick.

## Epics

- [ep-3-5-user-captures-an-interaction](./epics/ep-3-5-user-captures-an-interaction)
- [ep-3-6-user-refines-image-after-failure](./epics/ep-3-6-user-refines-image-after-failure)
'@

$e = "$f\epics\ep-3-5-user-captures-an-interaction"; md "$e\stories"
wf "$e\README.md" "# ep-3-5: User Captures an Interaction`n`nUser writes the dynamic scene connecting their name image to the locus.`n"
$us = "**As a** user, **I can** write a brief interaction description (e.g. Sarah's sari catches on the door handle), **so that** the elaboration is saved and reviewable."
story $e "01" "user-writes-interaction-description" $us @("Interaction field appears below the name image field on the contact form","Field accepts up to 500 characters","Saved interaction is shown during quiz failure reveals","Field is optional but a tooltip explains why interactions outperform static images")
$us = "**As a** user, **I can** be prompted to include motion or emotion in my interaction, **so that** the scene is vivid enough to be recalled days later."
story $e "02" "user-prompted-to-include-motion-or-emotion" $us @("Prompt appears as placeholder text in the interaction field","Prompt gives an example with motion (e.g. catching, throwing, falling)","User is not blocked from saving a static description","Motion tip is shown once and then dismissible")

$e = "$f\epics\ep-3-6-user-refines-image-after-failure"; md "$e\stories"
wf "$e\README.md" "# ep-3-6: User Refines Image After Failure`n`nUser updates a weak name image after a failed quiz recall.`n"
$us = "**As a** user who misses a name in a quiz, **I can** edit the name image immediately within the quiz flow, **so that** I repair the encoding while the failure context is fresh."
story $e "01" "user-updates-name-image-after-failed-quiz" $us @("Edit Image link appears on the quiz failure reveal screen","Tapping it opens an inline edit field without leaving the quiz","Updated image is saved before the next question loads","Updated image is used in subsequent failure reveals for that contact")
$us = "**As a** user during a quiz, **I can** flag an image as weak without stopping to edit it, **so that** it surfaces for repair in my next session."
story $e "02" "user-flags-image-as-weak-during-quiz" $us @("Flag as Weak button appears on every quiz answer screen","Flagged contacts appear in a Needs Attention list on the dashboard","Flagging does not affect the SM-2 interval","Flag can be removed once the image has been updated")

# ════════════════════════════════════════════════════════════════════════════
# C-4: Retrieval Practice and Spaced Repetition
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-04-retrieval-practice-and-spaced-repetition"
wf "$c\README.md" @'
# C-4: Retrieval Practice and Spaced Repetition

The core learning loop: quiz the user on faces and names, score recall, and schedule the next review at the optimal moment using SM-2.

## Functions

- [fn-01-quiz-session-management](./functions/fn-01-quiz-session-management)
- [fn-02-sm2-scheduling](./functions/fn-02-sm2-scheduling)
- [fn-03-review-dashboard-and-reminders](./functions/fn-03-review-dashboard-and-reminders)
- [fn-04-immediate-post-add-quiz](./functions/fn-04-immediate-post-add-quiz)
'@

$f = "$c\functions\fn-01-quiz-session-management"; md $f
wf "$f\README.md" @'
# F-4.1: Quiz Session Management

Deliver effective randomized quiz sessions across both quiz directions.

## Epics

- [ep-4-1-user-takes-face-to-name-quiz](./epics/ep-4-1-user-takes-face-to-name-quiz)
- [ep-4-2-user-takes-name-to-face-quiz](./epics/ep-4-2-user-takes-name-to-face-quiz)
- [ep-4-3-user-takes-mixed-session](./epics/ep-4-3-user-takes-mixed-session)
'@

$e = "$f\epics\ep-4-1-user-takes-face-to-name-quiz"; md "$e\stories"
wf "$e\README.md" "# ep-4-1: User Takes Face-to-Name Quiz`n`nUser is shown a face and must recall the name — the primary real-world recall task.`n"
$us = "**As a** user, **I can** be shown a contact's photo and type or select their name, **so that** I practice the real-world face-first recall task."
story $e "01" "user-shown-photo-and-types-name" $us @("Quiz screen shows only the contact photo with no name hint","User can type the name freely or choose from multiple options","Partial matches prompt the user to add the last name","Answer is submitted on Enter or a Submit button")
$us = "**As a** user, **I can** see the correct name confirmed after I answer, **so that** I can self-calibrate even when I am right."
story $e "02" "user-sees-correct-name-after-answering" $us @("Correct answer screen shows name prominently alongside photo","Name image cue is displayed to reinforce the encoding","Incorrect answer screen shows the correct name and the user's answer","Both screens show the recall rating selector before advancing")

$e = "$f\epics\ep-4-2-user-takes-name-to-face-quiz"; md "$e\stories"
wf "$e\README.md" "# ep-4-2: User Takes Name-to-Face Quiz`n`nUser is shown a name and must select the matching face from a set of options.`n"
$us = "**As a** user, **I can** be shown a contact's name and select their photo from a set of options, **so that** I practice recognizing faces I have been told about."
story $e "01" "user-shown-name-and-selects-photo" $us @("Quiz screen shows only the contact name with no photo hint","User selects from a grid of 4 face photos","Only one photo is correct; the others are drawn from the contact list","Selection is confirmed immediately with correct/incorrect feedback")
$us = "**As a** user, **I can** have distractor photos drawn from my actual contact list, **so that** the Name-to-Face task remains challenging and realistic."
story $e "02" "distractors-drawn-from-contact-list" $us @("Distractor photos are selected from contacts in the same group where possible","Distractors are never contacts already due in the same session","If fewer than 3 other contacts exist distractors are selected from the full list","Distractors are randomized on each quiz attempt")

$e = "$f\epics\ep-4-3-user-takes-mixed-session"; md "$e\stories"
wf "$e\README.md" "# ep-4-3: User Takes Mixed Quiz Session`n`nUser takes a session that randomly mixes both quiz directions.`n"
$us = "**As a** user, **I can** take a quiz session that randomly mixes Face-to-Name and Name-to-Face questions, **so that** both retrieval directions are practiced in every session."
story $e "01" "quiz-randomly-mixes-both-directions" $us @("Mixed mode is the default for all review sessions","Direction is randomized per question, not alternating","Session end screen breaks down accuracy by quiz direction","User can opt into a single-direction mode from quiz preferences")
$us = "**As a** user, **I can** start a quiz session containing only contacts due for review today, **so that** my practice time is spent on the names most at risk of being forgotten."
story $e "02" "user-starts-session-with-only-due-contacts" $us @("Start Review button on the dashboard launches a session filtered to due contacts","Due contacts are ordered by urgency (most overdue first)","Session size is capped at the user-configured maximum (default 20)","User is informed of the total due count before starting")

$f = "$c\functions\fn-02-sm2-scheduling"; md $f
wf "$f\README.md" @'
# F-4.2: SM-2 Scheduling

Use the SM-2 algorithm to compute optimal next-review intervals based on recall quality.

## Epics

- [ep-4-4-user-rates-recall-quality](./epics/ep-4-4-user-rates-recall-quality)
- [ep-4-5-system-calculates-next-review](./epics/ep-4-5-system-calculates-next-review)
'@

$e = "$f\epics\ep-4-4-user-rates-recall-quality"; md "$e\stories"
wf "$e\README.md" "# ep-4-4: User Rates Recall Quality`n`nUser self-reports how easily they recalled a name so SM-2 has an accurate signal.`n"
$us = "**As a** user, **I can** rate my recall after each quiz answer on a Forgot / Hard / Good / Easy scale, **so that** the algorithm receives an accurate signal."
story $e "01" "user-rates-recall-forgot-hard-good-easy" $us @("Rating selector appears on the answer reveal screen after every question","Four options are shown: Forgot, Hard, Good, Easy","Rating must be selected before the next question loads","Default selection is None so the user must make an active choice")
$us = "**As a** new user, **I can** see a brief explanation of what each recall rating means the first time I rate, **so that** I calibrate consistently from the start."
story $e "02" "user-sees-rating-explanation-on-first-use" $us @("Tooltip appears on the first quiz rating screen only","Forgot: completely blank. Hard: slow or unsure. Good: clear recall. Easy: instant.","Explanation can be dismissed and accessed again from quiz settings","Rating definitions are consistent across all quiz modes")

$e = "$f\epics\ep-4-5-system-calculates-next-review"; md "$e\stories"
wf "$e\README.md" "# ep-4-5: System Calculates Next Review`n`nSystem applies SM-2 after each quiz answer to set the next review date.`n"
$us = "**As a** system, **I can** compute the next review date using SM-2 after every rated quiz answer, **so that** reviews are scheduled at the optimal moment."
story $e "01" "system-computes-next-review-using-sm2" $us @("SM-2 parameters (ease factor, interval, repetitions) are stored per contact","Algorithm is applied immediately when the user submits a rating","Next review date is displayed on the contact detail screen","Algorithm is documented in the codebase for auditability")
$us = "**As a** system, **I can** reset a contact's review interval to 1 day when the user rates recall as Forgot, **so that** lapsed memories restart from the beginning."
story $e "02" "system-resets-interval-on-forgot-rating" $us @("Forgot rating sets repetitions to 0 and interval to 1 day","Ease factor is reduced but not below the SM-2 minimum of 1.3","Contact appears in the due review queue on the following day","Lapse event is logged for analytics purposes")

$f = "$c\functions\fn-03-review-dashboard-and-reminders"; md $f
wf "$f\README.md" @'
# F-4.3: Review Dashboard and Reminders

Surface the right reviews at the right time without the user having to think about scheduling.

## Epics

- [ep-4-6-user-sees-due-reviews](./epics/ep-4-6-user-sees-due-reviews)
- [ep-4-7-user-receives-reminders](./epics/ep-4-7-user-receives-reminders)
'@

$e = "$f\epics\ep-4-6-user-sees-due-reviews"; md "$e\stories"
wf "$e\README.md" "# ep-4-6: User Sees Due Reviews`n`nUser lands on a dashboard that tells them immediately how many contacts are due for review.`n"
$us = "**As a** user, **I can** see a dashboard showing how many contacts are due for review when I log in, **so that** I know immediately where to start."
story $e "01" "user-sees-dashboard-with-due-review-count" $us @("Dashboard is the landing page after login","Due count is prominently displayed with a Start Review button","Count updates in real time if reviews come due during a session","Zero due state shows an encouraging message and the next review date")
$us = "**As a** user, **I can** see the full list of upcoming reviews organized by date, **so that** I can plan my practice schedule."
story $e "02" "user-sees-upcoming-reviews-by-date" $us @("Upcoming reviews list is accessible from the dashboard","Contacts are grouped by date: Today, Tomorrow, This Week, Later","Each entry shows the contact name, photo thumbnail, and scheduled date","List extends at least 14 days into the future")

$e = "$f\epics\ep-4-7-user-receives-reminders"; md "$e\stories"
wf "$e\README.md" "# ep-4-7: User Receives Reminders`n`nUser is notified when reviews are due so the habit is maintained.`n"
$us = "**As a** user, **I can** receive a notification when I have reviews due, **so that** I do not rely on remembering to open the app."
story $e "01" "user-receives-notification-when-reviews-due" $us @("Notification is sent at the user's configured reminder time","Notification body includes the due review count","Tapping the notification opens the app directly to the review session","Notification is not sent on days with zero due reviews")
$us = "**As a** user, **I can** configure the time of day I receive review reminders, **so that** they arrive when I am most likely to act on them."
story $e "02" "user-configures-reminder-time" $us @("Time picker is available in notification settings","Default reminder time is 8:00 AM local time","Change takes effect from the next scheduled send","Time is stored and applied in the user's local timezone")
$us = "**As a** user, **I can** disable reminders entirely without losing my review schedule, **so that** I stay in control of when the app contacts me."
story $e "03" "user-disables-reminders-without-losing-schedule" $us @("Toggle to disable all reminders is available in notification settings","Disabling reminders does not affect SM-2 schedule or due review counts","Reminders can be re-enabled at any time","Disabled state is clearly indicated in settings")

$f = "$c\functions\fn-04-immediate-post-add-quiz"; md $f
wf "$f\README.md" @'
# F-4.4: Immediate Post-Add Quiz

Trigger retrieval practice within 60 seconds of adding a new contact.

## Epics

- [ep-4-8-user-quizzed-immediately-after-adding-contact](./epics/ep-4-8-user-quizzed-immediately-after-adding-contact)
'@

$e = "$f\epics\ep-4-8-user-quizzed-immediately-after-adding-contact"; md "$e\stories"
wf "$e\README.md" "# ep-4-8: User Quizzed Immediately After Adding Contact`n`nUser is prompted to recall a contact immediately after saving them.`n"
$us = "**As a** user, **I can** be automatically prompted to quiz myself immediately after saving a contact, **so that** retrieval practice starts within the critical 60-second encoding window."
story $e "01" "user-auto-prompted-to-quiz-after-saving" $us @("Quiz prompt appears automatically after a contact is saved","Prompt contains a single Face -> Name question on the contact just added","SM-2 parameters are initialized after this first quiz attempt","User is returned to the contact list or dashboard after the question")
$us = "**As a** user in a hurry, **I can** skip the immediate post-add quiz, **so that** the workflow never feels coercive."
story $e "02" "user-can-skip-immediate-quiz" $us @("Skip option is clearly labelled on the post-add quiz prompt","Skipping schedules the first review for the following day","Skip preference can be set as the default in quiz settings","Skipped contacts still appear in the normal due review queue")

# ════════════════════════════════════════════════════════════════════════════
# C-5: Error Recovery and Learning from Failure
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-05-error-recovery-and-learning-from-failure"
wf "$c\README.md" @'
# C-5: Error Recovery and Learning from Failure

Forgetting is signal. This capability turns missed recalls into stronger memories through reconstruction rather than passive re-exposure.

## Functions

- [fn-01-failure-detection-and-response](./functions/fn-01-failure-detection-and-response)
- [fn-02-encoding-repair](./functions/fn-02-encoding-repair)
- [fn-03-interval-reset-and-recovery-scheduling](./functions/fn-03-interval-reset-and-recovery-scheduling)
'@

$f = "$c\functions\fn-01-failure-detection-and-response"; md $f
wf "$f\README.md" @'
# F-5.1: Failure Detection and Response

Detect missed recalls at the moment they happen and respond constructively — not punitively.

## Epics

- [ep-5-1-user-sees-post-failure-reveal](./epics/ep-5-1-user-sees-post-failure-reveal)
- [ep-5-2-user-receives-constructive-framing](./epics/ep-5-2-user-receives-constructive-framing)
'@

$e = "$f\epics\ep-5-1-user-sees-post-failure-reveal"; md "$e\stories"
wf "$e\README.md" "# ep-5-1: User Sees Post-Failure Reveal`n`nUser immediately sees the correct name and their encoding cues after a miss.`n"
$us = "**As a** user who forgets a name, **I can** immediately see the correct name together with the contact's photo, **so that** I can reconnect the face and name right at the point of failure."
story $e "01" "user-sees-correct-name-and-photo-after-miss" $us @("Failure reveal shows the correct name in large text directly below the photo","Reveal appears within 200ms of submitting an incorrect answer","Correct name is visually highlighted","User must acknowledge the reveal before advancing to the next question")
$us = "**As a** user who forgets, **I can** see my saved name image and interaction description on the failure reveal screen, **so that** I can identify why the encoding failed."
story $e "02" "user-sees-name-image-on-failure-reveal" $us @("Name image description is shown below the correct name","Interaction description is shown if one exists","If no image exists the reveal prompts the user to create one","Edit Image link on this screen opens the inline image edit flow")

$e = "$f\epics\ep-5-2-user-receives-constructive-framing"; md "$e\stories"
wf "$e\README.md" "# ep-5-2: User Receives Constructive Framing`n`nThe app's language around failure is neutral and productive, never punitive.`n"
$us = "**As a** user who forgets a name, **I can** see neutral, factual feedback rather than negative language, **so that** I do not build a self-narrative of being bad at names."
story $e "01" "user-sees-neutral-feedback-not-negative-language" $us @("Failure feedback uses language like Not quite rather than Wrong or Failed","Streak counter does not visually break on a single miss","No red colour is used exclusively to denote failure","UX copy is reviewed against a tone guide that bans self-deprecating framing")
$us = "**As a** user after a failed recall, **I can** be prompted to actively reconstruct the name image rather than just re-read it, **so that** the repair involves active retrieval."
story $e "02" "user-prompted-to-reconstruct-not-reread-image" $us @("Failure reveal shows a Close your eyes and visualize prompt above the image description","A Reconstructed button appears after a brief pause","Tapping Reconstructed logs an active repair event","Passive scrolling is not blocked but the prompt remains visible")

$f = "$c\functions\fn-02-encoding-repair"; md $f
wf "$f\README.md" @'
# F-5.2: Encoding Repair

Give users tools to fix a weak image right at the point of failure.

## Epics

- [ep-5-3-user-edits-image-during-quiz](./epics/ep-5-3-user-edits-image-during-quiz)
- [ep-5-4-user-manages-weak-image-queue](./epics/ep-5-4-user-manages-weak-image-queue)
'@

$e = "$f\epics\ep-5-3-user-edits-image-during-quiz"; md "$e\stories"
wf "$e\README.md" "# ep-5-3: User Edits Image During Quiz`n`nUser can update a broken encoding immediately within the quiz flow.`n"
$us = "**As a** user who missed a name, **I can** edit the name image immediately within the quiz flow, **so that** I repair the encoding while the failure context is fresh."
story $e "01" "user-edits-name-image-within-quiz-flow" $us @("Edit Image link on the failure reveal screen opens an inline edit field","User can update the name image and interaction description without leaving the quiz","Changes are saved on a Save button; Cancel discards and returns to the reveal","Updated image is used immediately in any subsequent reveal for that contact")
$us = "**As a** user who edited an image during a quiz, **I can** have the updated image saved before the next question loads, **so that** the repair persists without a separate save step."
story $e "02" "updated-image-saved-before-next-question" $us @("Save in the inline edit field auto-advances to the next question","No separate save step is required outside the edit field","Saving shows a brief confirmation toast before advancing","If the session is abandoned before the next question the edit is still persisted")

$e = "$f\epics\ep-5-4-user-manages-weak-image-queue"; md "$e\stories"
wf "$e\README.md" "# ep-5-4: User Manages Weak Image Queue`n`nMissed contacts are surfaced in a dedicated repair list.`n"
$us = "**As a** user, **I can** see missed contacts automatically surfaced in a Needs Attention list, **so that** I have a focused queue for encoding repair sessions."
story $e "01" "missed-contacts-auto-tagged-for-priority-review" $us @("Contacts that receive a Forgot rating are automatically added to Needs Attention","Needs Attention list is accessible from the dashboard","List is ordered by most recent miss date","Contacts are removed once they receive a Good or Easy rating")
$us = "**As a** user, **I can** view a list of my most frequently missed contacts with their miss counts, **so that** I know which encodings need structural repair."
story $e "02" "user-views-needs-work-list" $us @("Needs Work section ranks contacts by total Forgot ratings","Each entry shows name, photo, miss count, and current name image","Tapping an entry opens the contact detail with the image edit form pre-expanded","List can be filtered to contacts missed more than N times")

$f = "$c\functions\fn-03-interval-reset-and-recovery-scheduling"; md $f
wf "$f\README.md" @'
# F-5.3: Interval Reset and Recovery Scheduling

Ensure the SM-2 schedule responds aggressively to lapses.

## Epics

- [ep-5-5-system-resets-on-lapse](./epics/ep-5-5-system-resets-on-lapse)
- [ep-5-6-user-sees-recovery-progress](./epics/ep-5-6-user-sees-recovery-progress)
'@

$e = "$f\epics\ep-5-5-system-resets-on-lapse"; md "$e\stories"
wf "$e\README.md" "# ep-5-5: System Resets on Lapse`n`nThe scheduling algorithm resets aggressively when a contact is forgotten.`n"
$us = "**As a** system, **I can** reset a contact's review interval to 1 day when the user rates recall as Forgot, **so that** lapsed memories restart accumulating evidence from scratch."
story $e "01" "system-resets-interval-to-one-day-on-forgot" $us @("Forgot rating sets SM-2 interval to 1 and repetitions to 0","Ease factor is reduced by 0.2 but clamped to a minimum of 1.3","Contact reappears in the due queue the following day","Reset is applied atomically with the rating save")
$us = "**As a** system, **I can** log each lapse event with a timestamp, **so that** per-contact lapse history is available for analytics."
story $e "02" "system-logs-each-lapse-event" $us @("Each Forgot rating is stored as a lapse event with contact ID and timestamp","Lapse events are accessible via the per-contact history API","Lapse count is visible on the contact detail screen","Lapse log is included in data exports")

$e = "$f\epics\ep-5-6-user-sees-recovery-progress"; md "$e\stories"
wf "$e\README.md" "# ep-5-6: User Sees Recovery Progress`n`nUser can track whether a previously difficult contact has finally been stabilized.`n"
$us = "**As a** user, **I can** see the lapse history for any contact, **so that** I understand how many times I have needed to rebuild a particular encoding."
story $e "01" "user-sees-contact-lapse-history" $us @("Contact detail screen shows a Lapses count","Tapping Lapses shows a timeline of all lapse dates","Timeline also shows any image edits made after a lapse","History is presented in reverse chronological order")
$us = "**As a** user, **I can** see a visual indicator when a previously lapsed contact reaches a stable review interval, **so that** I know the encoding has finally been consolidated."
story $e "02" "user-sees-indicator-when-lapsed-contact-stabilizes" $us @("Stable is defined as an SM-2 interval exceeding 21 days","A Stabilized badge appears on the contact card once reached","Dashboard shows a count of contacts that stabilized this week","Badge is removed if the contact lapses again")

# ════════════════════════════════════════════════════════════════════════════
# C-6: Real-World Integration
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-06-real-world-integration"
wf "$c\README.md" @'
# C-6: Real-World Integration

Bridge the gap between in-app learning and using names in real conversations.

## Functions

- [fn-01-pre-event-preparation](./functions/fn-01-pre-event-preparation)
- [fn-02-in-context-name-recall](./functions/fn-02-in-context-name-recall)
- [fn-03-post-interaction-reinforcement](./functions/fn-03-post-interaction-reinforcement)
'@

$f = "$c\functions\fn-01-pre-event-preparation"; md $f
wf "$f\README.md" @'
# F-6.1: Pre-Event Preparation

Help users review relevant contacts before walking into a meeting or social event.

## Epics

- [ep-6-1-user-reviews-group-before-event](./epics/ep-6-1-user-reviews-group-before-event)
- [ep-6-2-user-creates-event-review-set](./epics/ep-6-2-user-creates-event-review-set)
'@

$e = "$f\epics\ep-6-1-user-reviews-group-before-event"; md "$e\stories"
wf "$e\README.md" "# ep-6-1: User Reviews Group Before Event`n`nUser rehearses the names of people they are about to see.`n"
$us = "**As a** user, **I can** launch a quick review session filtered to a specific group, **so that** I rehearse exactly the right people before an event."
story $e "01" "user-launches-group-filtered-review" $us @("Start Review option on the group detail screen launches a session scoped to that group","Session includes all contacts in the group regardless of their due date","Session is marked as Pre-Event and does not advance SM-2 intervals","Contact count and estimated session time are shown before starting")
$us = "**As a** user, **I can** view contacts in a palace in their locus order before an event, **so that** I can mentally walk the palace as a spatial rehearsal."
story $e "02" "user-mentally-walks-palace-in-locus-order" $us @("Palace detail screen lists all assigned contacts in defined locus order","Each entry shows photo, name, and name image description","User can step through loci one by one in a guided walk mode","Walk mode does not record ratings")

$e = "$f\epics\ep-6-2-user-creates-event-review-set"; md "$e\stories"
wf "$e\README.md" "# ep-6-2: User Creates Event Review Set`n`nUser creates a temporary contact set for a one-time event.`n"
$us = "**As a** user, **I can** create a temporary review set for a one-time event (e.g. Industry Conference), **so that** I can prepare without modifying my permanent group structure."
story $e "01" "user-creates-temporary-event-review-set" $us @("Create Event Set option is available from the Groups screen","User names the set and adds any existing contacts to it","Event sets appear separately from regular groups","Event sets support all quiz and palace walk features that regular groups support")
$us = "**As a** user after an event concludes, **I can** archive or dissolve an event review set, **so that** my active lists stay clean."
story $e "02" "user-archives-event-set-after-conclusion" $us @("Archive option is available on the event set detail screen","Archiving removes the set from active views but preserves contacts and SM-2 history","Dissolve removes the set; contacts return to their permanent groups","Archived event sets can be viewed and restored from an archive screen")

$f = "$c\functions\fn-02-in-context-name-recall"; md $f
wf "$f\README.md" @'
# F-6.2: In-Context Name Recall

Provide lightweight lookup support when the user draws a blank in a real conversation.

## Epics

- [ep-6-3-user-looks-up-name-in-the-moment](./epics/ep-6-3-user-looks-up-name-in-the-moment)
'@

$e = "$f\epics\ep-6-3-user-looks-up-name-in-the-moment"; md "$e\stories"
wf "$e\README.md" "# ep-6-3: User Looks Up a Name in the Moment`n`nUser can discreetly find a name and their encoding cue while in a live conversation.`n"
$us = "**As a** user in a conversation, **I can** quickly search for a person by partial name or descriptor, **so that** I can retrieve their full name discreetly in the moment."
story $e "01" "user-searches-by-partial-name-or-descriptor" $us @("Search is accessible from the app home screen with a single tap","Search matches on first name, last name, and notes in real time","Results load within 200ms (offline capable)","Search history is not stored to protect privacy in shared-screen scenarios")
$us = "**As a** user who locates a contact, **I can** view their name image in a quick-glance view, **so that** I can reconstruct the cue on the spot and recall the name."
story $e "02" "user-views-name-image-in-quick-glance" $us @("Quick-glance view shows photo, full name, and name image in a compact modal","View is dismissible with a swipe or tap outside","Interaction description is shown if one exists","Viewing in quick-glance does not trigger a quiz or rating prompt")

$f = "$c\functions\fn-03-post-interaction-reinforcement"; md $f
wf "$f\README.md" @'
# F-6.3: Post-Interaction Reinforcement

Capture real-world recall performance and feed it back into the learning system.

## Epics

- [ep-6-4-user-logs-post-event-recall](./epics/ep-6-4-user-logs-post-event-recall)
- [ep-6-5-user-recovers-from-real-world-failure](./epics/ep-6-5-user-recovers-from-real-world-failure)
'@

$e = "$f\epics\ep-6-4-user-logs-post-event-recall"; md "$e\stories"
wf "$e\README.md" "# ep-6-4: User Logs Post-Event Recall`n`nUser records which names they successfully used so real-world performance feeds the SM-2 schedule.`n"
$us = "**As a** user after a meeting, **I can** log which names I remembered and which I forgot, **so that** my real-world performance is reflected in the review schedule."
story $e "01" "user-logs-post-event-recall-outcomes" $us @("Post-event log is accessible from the group or event set detail screen","User marks each contact as Remembered or Forgot","Log entries generate SM-2 ratings equivalent to Easy and Forgot respectively","Log can be completed within 30 seconds for a group of 10")
$us = "**As a** user who successfully used a name in conversation, **I can** have that count as an Easy rating so their review interval advances."
story $e "02" "real-world-recall-rated-easy-to-advance-interval" $us @("Marking Remembered applies an Easy rating to the SM-2 record","Interval advances as if the user aced a formal quiz question","Rating timestamp reflects the event date not the log entry date","User can override the automatic Easy rating with a different rating")

$e = "$f\epics\ep-6-5-user-recovers-from-real-world-failure"; md "$e\stories"
wf "$e\README.md" "# ep-6-5: User Recovers from Real-World Failure`n`nUser can immediately repair an encoding after blanking on a name in conversation.`n"
$us = "**As a** user who drew a blank during a conversation, **I can** look up the person and rebuild the image immediately, **so that** the real-world failure becomes a repair session."
story $e "01" "user-rebuilds-image-after-real-world-blank" $us @("Quick-glance view includes a Rebuild Image shortcut when a miss is logged","Rebuild Image opens the inline image edit flow","Updated image is saved with a note linking it to the real-world failure event","Contact is added to Needs Attention if not already there")
$us = "**As a** user who forgot someone out of context, **I can** note the context in which I forgot them, **so that** I can adjust the encoding to be more context-independent."
story $e "02" "user-notes-context-of-forgetting" $us @("Post-event log includes an optional context note field","Context note is stored with the lapse event and visible in contact history","App suggests adding a context-independent detail to the encoding if context is noted","Context notes are included in data exports")

# ════════════════════════════════════════════════════════════════════════════
# C-7: Social and Gamification Features
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-07-social-and-gamification-features"
wf "$c\README.md" @'
# C-7: Social and Gamification Features

Build momentum through streaks, achievements, and optional social accountability — without turning learning into a game that rewards the wrong behaviors.

## Functions

- [fn-01-streaks-and-habit-building](./functions/fn-01-streaks-and-habit-building)
- [fn-02-achievement-system](./functions/fn-02-achievement-system)
- [fn-03-social-accountability](./functions/fn-03-social-accountability)
'@

$f = "$c\functions\fn-01-streaks-and-habit-building"; md $f
wf "$f\README.md" @'
# F-7.1: Streaks and Habit Building

Reward consistent daily practice without incentivizing the wrong behaviors.

## Epics

- [ep-7-1-user-builds-a-daily-streak](./epics/ep-7-1-user-builds-a-daily-streak)
- [ep-7-2-user-recovers-a-broken-streak](./epics/ep-7-2-user-recovers-a-broken-streak)
'@

$e = "$f\epics\ep-7-1-user-builds-a-daily-streak"; md "$e\stories"
wf "$e\README.md" "# ep-7-1: User Builds a Daily Streak`n`nUser sees a streak counter that rewards showing up every day.`n"
$us = "**As a** user, **I can** see a streak counter showing how many consecutive days I have completed at least one review, **so that** daily practice feels tangibly rewarding."
story $e "01" "user-sees-streak-counter" $us @("Streak counter is visible on the dashboard","Counter increments after the first quiz answer each day","Streak resets to 0 if no review is completed by midnight local time","Longest streak is stored separately and never resets")
$us = "**As a** user who has not practiced by late afternoon, **I can** receive a gentle nudge, **so that** my streak is protected without being nagged aggressively."
story $e "02" "user-receives-nudge-if-not-practiced" $us @("Nudge notification is sent at a fixed time (e.g. 5 PM) if no review that day","Nudge is suppressed if the user has already completed a review","Nudge frequency respects the user's overall notification settings","Nudge copy is encouraging, not guilt-inducing")

$e = "$f\epics\ep-7-2-user-recovers-a-broken-streak"; md "$e\stories"
wf "$e\README.md" "# ep-7-2: User Recovers a Broken Streak`n`nUser is not permanently demoralized by a single missed day.`n"
$us = "**As a** user who missed a day, **I can** see how close I was to a streak milestone, **so that** the loss feels specific and motivating rather than total."
story $e "01" "user-sees-closeness-to-milestone-before-miss" $us @("Streak break screen shows the broken streak length alongside the nearest milestone","Example: You were 3 days from a 30-day milestone","Screen shows the next milestone target and days remaining","Screen is shown once and does not repeat on subsequent logins")
$us = "**As a** user, **I can** earn one streak freeze grace day per month, **so that** a single unavoidable miss does not destroy a long streak."
story $e "02" "user-earns-monthly-streak-freeze" $us @("One freeze is automatically granted on the first day of each month","Freeze is used automatically on the first missed day of the month","Freeze usage is shown in the streak history","Freeze does not carry over to the next month if unused")

$f = "$c\functions\fn-02-achievement-system"; md $f
wf "$f\README.md" @'
# F-7.2: Achievement System

Recognize meaningful milestones that reflect real learning progress.

## Epics

- [ep-7-3-user-earns-learning-milestones](./epics/ep-7-3-user-earns-learning-milestones)
- [ep-7-4-user-views-achievement-gallery](./epics/ep-7-4-user-views-achievement-gallery)
'@

$e = "$f\epics\ep-7-3-user-earns-learning-milestones"; md "$e\stories"
wf "$e\README.md" "# ep-7-3: User Earns Learning Milestones`n`nUser earns achievements for genuine learning outcomes, not just usage volume.`n"
$us = "**As a** user, **I can** earn an achievement when 10 of my contacts reach a stable recall interval (> 21 days), **so that** memory consolidation is concretely celebrated."
story $e "01" "user-earns-achievement-for-10-stable-contacts" $us @("Achievement is granted automatically when the 10th contact exceeds a 21-day interval","Notification and in-app toast appear at the moment of unlock","Achievement card shows the names of the 10 contacts that triggered it","Achievement is permanent and not revoked if contacts later lapse")
$us = "**As a** user, **I can** earn an achievement for completing 30 consecutive days of practice, **so that** long-term habit formation is recognized."
story $e "02" "user-earns-achievement-for-30-day-streak" $us @("Achievement is granted on day 30 of an unbroken streak","Streak freeze days count toward the 30 days","Achievement is displayed on the user profile","Repeat achievements (60 days, 90 days) are granted for continued streaks")
$us = "**As a** user, **I can** earn an achievement for successfully recalling someone after a 30-day gap, **so that** long-term retention is explicitly rewarded."
story $e "03" "user-earns-achievement-for-30-day-recall" $us @("Achievement is granted on the first quiz where a contact's interval was >= 30 days and the rating is Good or Easy","Achievement names the contact and the interval achieved","Achievement is repeatable for each unique contact that hits the milestone","A cumulative achievement exists for 10 contacts recalled after 30+ days")

$e = "$f\epics\ep-7-4-user-views-achievement-gallery"; md "$e\stories"
wf "$e\README.md" "# ep-7-4: User Views Achievement Gallery`n`nUser can see all earned and locked achievements to understand their progress.`n"
$us = "**As a** user, **I can** view all earned and locked achievements in a gallery, **so that** I have visibility into what milestones exist and which ones I have reached."
story $e "01" "user-views-all-earned-and-locked-achievements" $us @("Achievement gallery is accessible from the user profile","Earned achievements are shown in full colour with the unlock date","Locked achievements are shown in greyscale","Gallery is sorted by unlock date with locked ones at the end")
$us = "**As a** user, **I can** see a hint for each locked achievement, **so that** I know what to aim for without having the goal fully spoiled."
story $e "02" "locked-achievements-show-hint" $us @("Each locked achievement shows a short hint","Hint is vague enough not to fully reveal the threshold","Tapping a locked achievement expands the hint but never reveals the exact number","Achieved achievements show the full description and exact criteria")

$f = "$c\functions\fn-03-social-accountability"; md $f
wf "$f\README.md" @'
# F-7.3: Social Accountability

Optional social features that create accountability without pressure or privacy risk.

## Epics

- [ep-7-5-user-shares-progress](./epics/ep-7-5-user-shares-progress)
- [ep-7-6-user-challenges-a-friend](./epics/ep-7-6-user-challenges-a-friend)
'@

$e = "$f\epics\ep-7-5-user-shares-progress"; md "$e\stories"
wf "$e\README.md" "# ep-7-5: User Shares Progress`n`nUser can share a summary of their learning progress publicly, fully opt-in.`n"
$us = "**As a** user, **I can** share a summary image of my learning progress (e.g. 47 names learned in 30 days), **so that** I can celebrate publicly if I choose."
story $e "01" "user-shares-learning-summary-image" $us @("Share option is available from the dashboard and achievement gallery","Summary image includes streak, contact count, and retention rate","Image is shared via the OS share sheet","No contact names or photos are included in the shared image")
$us = "**As a** user, **I can** be confident that my progress is never shared automatically, **so that** I am in full control of my public data."
story $e "02" "sharing-is-always-opt-in" $us @("No social sharing happens without an explicit user action","No progress data is posted to external services automatically","Share option requires explicit action and is not a default post-achievement CTA","Privacy policy clearly states what is shared and what is not")

$e = "$f\epics\ep-7-6-user-challenges-a-friend"; md "$e\stories"
wf "$e\README.md" "# ep-7-6: User Challenges a Friend`n`nUser can invite a friend to a name-learning challenge for mutual accountability.`n"
$us = "**As a** user, **I can** invite a friend to a 30-day name-learning challenge, **so that** we create mutual accountability."
story $e "01" "user-invites-friend-to-30-day-challenge" $us @("Challenge invite is sent via a shareable link","Recipient creates an account or logs in to join","Challenge starts from the day both parties accept","Challenge shows a shared leaderboard of practice days completed")
$us = "**As a** user in a challenge, **I can** see my friend's streak and contact count but not their contact names or photos, **so that** accountability is maintained without privacy compromise."
story $e "02" "user-sees-friends-streak-and-count-not-names" $us @("Challenge leaderboard shows display name, streak, and total contacts learned","No contact names, photos, or notes are visible to the other party","Friend can set a display name specifically for the challenge","Challenge can be ended by either party at any time")

# ════════════════════════════════════════════════════════════════════════════
# C-8: Administrative and Content Management
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-08-administrative-and-content-management"
wf "$c\README.md" @'
# C-8: Administrative and Content Management

Give users control over their account, data, and preferences.

## Functions

- [fn-01-user-settings-and-preferences](./functions/fn-01-user-settings-and-preferences)
- [fn-02-data-portability](./functions/fn-02-data-portability)
- [fn-03-account-management](./functions/fn-03-account-management)
'@

$f = "$c\functions\fn-01-user-settings-and-preferences"; md $f
wf "$f\README.md" @'
# F-8.1: User Settings and Preferences

Let users tailor the app to their workflow and learning style.

## Epics

- [ep-8-1-user-configures-notifications](./epics/ep-8-1-user-configures-notifications)
- [ep-8-2-user-configures-quiz-preferences](./epics/ep-8-2-user-configures-quiz-preferences)
'@

$e = "$f\epics\ep-8-1-user-configures-notifications"; md "$e\stories"
wf "$e\README.md" "# ep-8-1: User Configures Notifications`n`nUser controls when and how the app notifies them about due reviews.`n"
$us = "**As a** user, **I can** set the time of day I receive review reminders, **so that** they arrive when I am most likely to act on them."
story $e "01" "user-sets-reminder-time-of-day" $us @("Time picker is available in the Notifications settings screen","Default is 8:00 AM in the user's local timezone","Change takes effect from the next scheduled notification","Current setting is shown clearly before the picker is opened")
$us = "**As a** user, **I can** choose to receive reminders by email, push notification, or both, **so that** I stay informed through my preferred channel."
story $e "02" "user-chooses-notification-channel" $us @("Channel selector offers: Email, Push, or Both","Email notifications require a verified email address","Push notifications require device permission","Each channel can be toggled independently")
$us = "**As a** user, **I can** pause all notifications for a defined period, **so that** I am not nagged when I am unavailable."
story $e "03" "user-pauses-all-reminders" $us @("Pause Reminders option is available in notification settings","User can select a pause duration (1 day, 1 week, custom)","Pause end date is shown clearly in settings","Notifications resume automatically at the end of the pause period")

$e = "$f\epics\ep-8-2-user-configures-quiz-preferences"; md "$e\stories"
wf "$e\README.md" "# ep-8-2: User Configures Quiz Preferences`n`nUser adjusts quiz behavior to match their available time and learning goals.`n"
$us = "**As a** user, **I can** set the maximum number of questions per quiz session, **so that** sessions fit my available time."
story $e "01" "user-sets-max-questions-per-session" $us @("Session length setting is available in quiz preferences","Options: 5, 10, 20, 30, or Unlimited","Default is 20","Setting applies to all quiz sessions")
$us = "**As a** user, **I can** bias my quiz sessions toward Face-to-Name or Name-to-Face, **so that** I can focus on my weaker retrieval direction."
story $e "02" "user-biases-toward-preferred-quiz-direction" $us @("Direction preference setting: Mixed (default), Face-to-Name only, Name-to-Face only","Mixed mode is recommended and visually highlighted as the default","Setting is applied to all review sessions","Post-add quizzes are always Face-to-Name regardless of preference")
$us = "**As a** user, **I can** disable the immediate post-add quiz, **so that** the workflow fits my pace when adding multiple contacts quickly."
story $e "03" "user-enables-or-disables-post-add-quiz" $us @("Post-add quiz toggle is available in quiz preferences","Disabling skips the quiz prompt but still initializes SM-2 with tomorrow as first review","Setting is remembered across sessions","Re-enabling restores the prompt for all subsequent contact adds")

$f = "$c\functions\fn-02-data-portability"; md $f
wf "$f\README.md" @'
# F-8.2: Data Portability

Let users own their data and move it freely.

## Epics

- [ep-8-3-user-exports-data](./epics/ep-8-3-user-exports-data)
- [ep-8-4-user-imports-data](./epics/ep-8-4-user-imports-data)
'@

$e = "$f\epics\ep-8-3-user-exports-data"; md "$e\stories"
wf "$e\README.md" "# ep-8-3: User Exports Data`n`nUser can download a full copy of their contacts, review history, and palace structure.`n"
$us = "**As a** user, **I can** export all my contacts including names, notes, name images, and review history as a JSON file, **so that** I have an offline backup."
story $e "01" "user-exports-contacts-as-json" $us @("Export option is available from account settings","Export includes: name, notes, name image, interaction description, group, and SM-2 parameters","Export file is downloaded to the device","Photos are excluded by default with a separate option for photo export")
$us = "**As a** user, **I can** export my palace structure including all palace names and locus assignments, **so that** the spatial organization is preserved outside the app."
story $e "02" "user-exports-palace-structure" $us @("Palace export is included in the main JSON export by default","Each palace entry includes palace name, loci list, and assigned contact IDs","A separate palace-only export option is available","Exported locus assignments reference contacts by name and ID for readability")

$e = "$f\epics\ep-8-4-user-imports-data"; md "$e\stories"
wf "$e\README.md" "# ep-8-4: User Imports Data`n`nUser can restore contacts from a previously exported file.`n"
$us = "**As a** user, **I can** import a previously exported JSON file to restore my contacts, **so that** I can migrate between accounts or devices without starting over."
story $e "01" "user-imports-previously-exported-file" $us @("Import option is available from account settings","Import accepts the JSON format produced by the FaceFile export","Import progress is shown with a count of contacts processed","Successful import shows a summary of contacts added and skipped")
$us = "**As a** user importing data, **I can** be shown conflicts (duplicate names) before the import finalizes, **so that** I do not overwrite good data with stale records."
story $e "02" "import-conflicts-flagged-before-finalizing" $us @("Conflicts are detected by matching full name (first + last)","User is shown a list of conflicts with options: Skip, Overwrite, or Keep Both","Default action for conflicts is Skip to protect existing data","Import proceeds for all non-conflicting records regardless of conflict resolution")

$f = "$c\functions\fn-03-account-management"; md $f
wf "$f\README.md" @'
# F-8.3: Account Management

Core account hygiene: profile, security, and full account deletion.

## Epics

- [ep-8-5-user-manages-profile](./epics/ep-8-5-user-manages-profile)
- [ep-8-6-user-deletes-account](./epics/ep-8-6-user-deletes-account)
'@

$e = "$f\epics\ep-8-5-user-manages-profile"; md "$e\stories"
wf "$e\README.md" "# ep-8-5: User Manages Profile`n`nUser can update their account details and maintain security over time.`n"
$us = "**As a** user, **I can** update my display name and email address, **so that** my account reflects my current identity."
story $e "01" "user-updates-display-name-and-email" $us @("Profile settings screen has editable fields for display name and email","Email change triggers a verification email to the new address","Old email remains active until the new one is verified","Display name change takes effect immediately")
$us = "**As a** user, **I can** change my password from within the app, **so that** I can maintain account security without going through a reset flow."
story $e "02" "user-changes-password" $us @("Password change form requires the current password for verification","New password must meet strength requirements","Successful change logs out all other active sessions","Confirmation email is sent to the account email after a password change")

$e = "$f\epics\ep-8-6-user-deletes-account"; md "$e\stories"
wf "$e\README.md" "# ep-8-6: User Deletes Account`n`nUser can permanently remove their account and all associated data.`n"
$us = "**As a** user, **I can** permanently delete my account and all associated data, **so that** I can fully leave the service with no data retained."
story $e "01" "user-permanently-deletes-account-and-data" $us @("Delete Account option is available in account settings","Deletion removes: user record, all contacts, photos, review history, SM-2 data","Deletion is processed immediately and is irreversible","User receives a confirmation email after deletion is complete")
$us = "**As a** user, **I can** see a clear summary of what will be deleted and confirm my intent, **so that** the action is fully intentional."
story $e "02" "user-sees-summary-and-confirms-before-deletion" $us @("Deletion confirmation screen lists every data category that will be removed","User must type their email address to confirm","Confirmation screen has a Cancel option as the primary action","No dark patterns such as pre-ticked checkboxes or confusingly labelled buttons")

# ════════════════════════════════════════════════════════════════════════════
# C-9: Technical Infrastructure
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-09-technical-infrastructure"
wf "$c\README.md" @'
# C-9: Technical Infrastructure

The platform-level capabilities that make the product reliable, secure, and scalable.

## Functions

- [fn-01-authentication-and-security](./functions/fn-01-authentication-and-security)
- [fn-02-data-persistence-and-integrity](./functions/fn-02-data-persistence-and-integrity)
- [fn-03-scheduled-jobs](./functions/fn-03-scheduled-jobs)
- [fn-04-api-design-and-reliability](./functions/fn-04-api-design-and-reliability)
'@

$f = "$c\functions\fn-01-authentication-and-security"; md $f
wf "$f\README.md" @'
# F-9.1: Authentication and Security

Protect user accounts and ensure only authorized access to personal contact data.

## Epics

- [ep-9-1-system-manages-sessions](./epics/ep-9-1-system-manages-sessions)
- [ep-9-2-system-isolates-user-data](./epics/ep-9-2-system-isolates-user-data)
'@

$e = "$f\epics\ep-9-1-system-manages-sessions"; md "$e\stories"
wf "$e\README.md" "# ep-9-1: System Manages Sessions`n`nSystem issues and refreshes JWT tokens to maintain secure, persistent sessions.`n"
$us = "**As a** system, **I can** issue JWT tokens on login and validate them on every protected request, **so that** unauthenticated access is rejected at the API layer."
story $e "01" "system-issues-jwt-tokens-on-login" $us @("Login endpoint returns a signed JWT with a 15-minute expiry","A refresh token with a 7-day expiry is stored in an httpOnly cookie","All protected API endpoints reject requests without a valid JWT","Invalid or expired tokens return 401 with a consistent error body")
$us = "**As a** system, **I can** refresh JWT tokens transparently before expiry, **so that** users are not unexpectedly logged out during an active session."
story $e "02" "system-refreshes-tokens-transparently" $us @("Client refreshes the access token when it has less than 2 minutes remaining","Refresh uses the httpOnly cookie refresh token","Refresh failure redirects the user to the login screen","Refresh endpoint is rate-limited to prevent abuse")

$e = "$f\epics\ep-9-2-system-isolates-user-data"; md "$e\stories"
wf "$e\README.md" "# ep-9-2: System Isolates User Data`n`nEvery data access is scoped to the authenticated user's records.`n"
$us = "**As a** system, **I can** scope every database query to the authenticated user's ID, **so that** no user can read or write another user's data."
story $e "01" "all-queries-scoped-to-authenticated-user" $us @("All Prisma queries include a where userId clause derived from the verified JWT","userId is never accepted as a request body parameter","Authorization tests verify that user A cannot access user B's resources","Data isolation is enforced at the service layer, not just the route layer")
$us = "**As a** system, **I can** store uploaded photos with access-controlled paths, **so that** contact images cannot be accessed without a valid authenticated session."
story $e "02" "photos-stored-with-access-controlled-urls" $us @("Photos are stored with UUID-based filenames","Photo serving endpoint validates the requesting user owns the contact","Direct static file access is disabled; all photos are served through the API","Photo URLs are not embedded in public HTML")

$f = "$c\functions\fn-02-data-persistence-and-integrity"; md $f
wf "$f\README.md" @'
# F-9.2: Data Persistence and Integrity

Ensure contact, image, and review data is stored reliably.

## Epics

- [ep-9-3-system-stores-relational-data](./epics/ep-9-3-system-stores-relational-data)
- [ep-9-4-system-manages-file-storage](./epics/ep-9-4-system-manages-file-storage)
'@

$e = "$f\epics\ep-9-3-system-stores-relational-data"; md "$e\stories"
wf "$e\README.md" "# ep-9-3: System Stores Relational Data`n`nContacts, reviews, SM-2 parameters, and palaces are persisted in a normalized schema.`n"
$us = "**As a** system, **I can** store contacts, review history, and SM-2 parameters in a normalized Prisma schema, **so that** data relationships are consistent and queryable."
story $e "01" "data-stored-in-normalized-schema" $us @("Schema includes tables for User, Contact, Review, SMParams, Palace, Locus, Group","Foreign keys enforce referential integrity","All tables include createdAt and updatedAt timestamps","Schema is documented in the Prisma schema file with field-level comments")
$us = "**As a** system, **I can** manage schema changes via Prisma migrations, **so that** changes are versioned, reversible, and applied without data loss."
story $e "02" "migrations-managed-via-prisma" $us @("All schema changes are captured in migration files in prisma/migrations","Migrations are applied automatically on server startup in development","Migration files are committed to version control","Destructive migrations include a safety check in CI")

$e = "$f\epics\ep-9-4-system-manages-file-storage"; md "$e\stories"
wf "$e\README.md" "# ep-9-4: System Manages File Storage`n`nUploaded photos are stored reliably and orphaned files are cleaned up.`n"
$us = "**As a** system, **I can** store uploaded contact photos with stable UUID-based paths, **so that** photo references in the database remain valid across server restarts."
story $e "01" "photos-stored-with-stable-paths" $us @("Each uploaded photo is stored with a UUID filename in a configurable upload directory","The full relative path is stored in the Contact record","Upload directory is excluded from version control but documented","Path format is consistent and does not change between environments")
$us = "**As a** system, **I can** clean up orphaned photo files on a scheduled job, **so that** storage does not grow unbounded when contacts are deleted."
story $e "02" "orphaned-photos-cleaned-up-on-schedule" $us @("A scheduled job runs daily to find photo files not referenced by any Contact record","Orphaned files older than 24 hours are deleted","Job logs the count of files deleted and any errors","Orphan cleanup can be run manually via a CLI command")

$f = "$c\functions\fn-03-scheduled-jobs"; md $f
wf "$f\README.md" @'
# F-9.3: Scheduled Jobs

Run time-sensitive background tasks reliably without blocking user-facing requests.

## Epics

- [ep-9-5-system-runs-sm2-review-scheduler](./epics/ep-9-5-system-runs-sm2-review-scheduler)
- [ep-9-6-system-dispatches-notifications](./epics/ep-9-6-system-dispatches-notifications)
'@

$e = "$f\epics\ep-9-5-system-runs-sm2-review-scheduler"; md "$e\stories"
wf "$e\README.md" "# ep-9-5: System Runs SM-2 Review Scheduler`n`nA cron job marks contacts as due for review when their scheduled date arrives.`n"
$us = "**As a** system, **I can** run a cron job hourly that marks contacts whose next review date has passed as due, **so that** the dashboard due count is always accurate."
story $e "01" "cron-job-marks-due-reviews-hourly" $us @("node-cron schedules the job to run every hour on the hour","Job queries contacts where nextReviewDate <= now and isDue = false","Matching contacts are updated to isDue = true in a single batch query","Job completes within 5 seconds under normal load")
$us = "**As a** system, **I can** log the scheduler's run time and record count, **so that** failures or unexpected zero counts are detectable."
story $e "02" "scheduler-logs-run-time-and-record-count" $us @("Each scheduler run logs: start time, end time, records marked due, any errors","Logs are written to the application log at INFO level","Zero records updated is logged at DEBUG level","Scheduler errors are logged at ERROR level")

$e = "$f\epics\ep-9-6-system-dispatches-notifications"; md "$e\stories"
wf "$e\README.md" "# ep-9-6: System Dispatches Notifications`n`nNotifications are sent reliably at user-configured times.`n"
$us = "**As a** system, **I can** send reminder notifications at user-configured times, **so that** delivery is personalized."
story $e "01" "reminders-sent-at-user-configured-times" $us @("Notification job queries users whose reminder time falls within the current hour","Only users with at least one due review receive a reminder","Notification body includes the due count and a direct link","Job runs hourly and handles timezone conversion")
$us = "**As a** system, **I can** retry failed notification deliveries once and log persistent failures, **so that** transient errors are handled without spamming users."
story $e "02" "failed-deliveries-retried-once-then-logged" $us @("Failed delivery is retried after a 5-minute delay","Second failure is logged at WARN level with user ID and failure reason","No further retries are attempted to prevent spam","Delivery failure does not affect the SM-2 schedule or due review count")

$f = "$c\functions\fn-04-api-design-and-reliability"; md $f
wf "$f\README.md" @'
# F-9.4: API Design and Reliability

Provide a consistent, well-structured API that the Angular frontend can depend on.

## Epics

- [ep-9-7-system-provides-restful-endpoints](./epics/ep-9-7-system-provides-restful-endpoints)
- [ep-9-8-system-validates-input](./epics/ep-9-8-system-validates-input)
'@

$e = "$f\epics\ep-9-7-system-provides-restful-endpoints"; md "$e\stories"
wf "$e\README.md" "# ep-9-7: System Provides RESTful Endpoints`n`nAll API endpoints follow REST conventions for predictability.`n"
$us = "**As a** developer, **I can** rely on all resource endpoints following REST conventions, **so that** the API is predictable and requires no custom documentation to navigate."
story $e "01" "all-endpoints-follow-rest-conventions" $us @("Resource collections are at /api/v1/<resource>","Individual resources are at /api/v1/<resource>/:id","HTTP methods map to CRUD: GET=read POST=create PUT=replace PATCH=update DELETE=remove","Non-CRUD actions use POST with a descriptive sub-path")
$us = "**As a** developer, **I can** rely on all endpoints returning a consistent error shape, **so that** the frontend handles failures uniformly."
story $e "02" "all-endpoints-return-consistent-error-shapes" $us @("All errors follow { status, message, errors?: FieldError[] }","4xx errors include a human-readable message","5xx errors return a generic message and log the full error server-side","Error shape is documented and enforced by a response helper")

$e = "$f\epics\ep-9-8-system-validates-input"; md "$e\stories"
wf "$e\README.md" "# ep-9-8: System Validates Input`n`nAll incoming request data is validated before reaching the database.`n"
$us = "**As a** system, **I can** validate all incoming request bodies against schemas before processing, **so that** invalid data never reaches the database."
story $e "01" "all-request-bodies-validated-against-schemas" $us @("A validation middleware runs before all route handlers","Schemas are defined using a validation library (Zod or Joi)","Unknown fields are stripped from requests before processing","Validation is applied to query params and path params as well as request bodies")
$us = "**As a** system, **I can** return a 400 response with field-level error detail when validation fails, **so that** the Angular frontend can surface specific error messages per field."
story $e "02" "validation-errors-return-400-with-field-detail" $us @("Validation failure returns HTTP 400","Response body includes an errors array with field name and message per violation","Field names in errors match the names used in the frontend form","Multiple field errors are returned in a single response")

# ════════════════════════════════════════════════════════════════════════════
# C-10: Analytics and Insights
# ════════════════════════════════════════════════════════════════════════════
$c = "$r\cap-10-analytics-and-insights"
wf "$c\README.md" @'
# C-10: Analytics and Insights

Show users how their memory is improving over time and surface what needs attention.

## Functions

- [fn-01-personal-learning-progress](./functions/fn-01-personal-learning-progress)
- [fn-02-per-contact-performance](./functions/fn-02-per-contact-performance)
- [fn-03-usage-and-habit-insights](./functions/fn-03-usage-and-habit-insights)
'@

$f = "$c\functions\fn-01-personal-learning-progress"; md $f
wf "$f\README.md" @'
# F-10.1: Personal Learning Progress

Give users a clear picture of how their overall recall is improving over time.

## Epics

- [ep-10-1-user-views-retention-rate](./epics/ep-10-1-user-views-retention-rate)
- [ep-10-2-user-views-contact-stability](./epics/ep-10-2-user-views-contact-stability)
'@

$e = "$f\epics\ep-10-1-user-views-retention-rate"; md "$e\stories"
wf "$e\README.md" "# ep-10-1: User Views Retention Rate`n`nUser sees their overall quiz accuracy trend across time windows.`n"
$us = "**As a** user, **I can** see my overall retention rate over the last 7, 30, and 90 days, **so that** I understand whether my memory is improving over time."
story $e "01" "user-sees-retention-rate-over-multiple-windows" $us @("Retention rate is shown as a percentage with a trend arrow","Three windows shown side by side: 7 days, 30 days, 90 days","Retention = (Good + Easy ratings) / all rated attempts","Windows with fewer than 5 attempts show an Insufficient data placeholder")
$us = "**As a** user, **I can** see how my retention rate changes as my contact list grows, **so that** I understand whether scaling up is affecting my performance."
story $e "02" "user-sees-retention-vs-contact-count" $us @("A chart plots retention rate against total active contact count over time","Chart is accessible from the Insights screen","Trend line shows whether retention degrades as list grows","Chart data covers the user's full history")

$e = "$f\epics\ep-10-2-user-views-contact-stability"; md "$e\stories"
wf "$e\README.md" "# ep-10-2: User Views Contact Stability`n`nUser understands how many of their contacts are truly consolidated versus still fragile.`n"
$us = "**As a** user, **I can** see my contacts grouped by review interval bucket, **so that** I know how many names are stable versus still fragile."
story $e "01" "user-sees-contacts-by-review-interval-bucket" $us @("Stability overview shows counts in buckets: < 7 days, 7-30 days, > 30 days","Each bucket is colour-coded from fragile to stable","Tapping a bucket shows the contacts in that range","Archived and deleted contacts are excluded")
$us = "**As a** user, **I can** see the average time it takes me to move a new contact into a stable interval, **so that** I can set realistic expectations."
story $e "02" "user-sees-average-time-to-stabilize" $us @("Average days to first stable interval (>= 21 days) is shown on the Insights screen","Average is calculated only over contacts that have reached the stable threshold","Value is shown alongside a comparison to the previous month","Contacts still in progress are excluded from the average")

$f = "$c\functions\fn-02-per-contact-performance"; md $f
wf "$f\README.md" @'
# F-10.2: Per-Contact Performance

Drill into individual contacts to understand where effort is concentrated.

## Epics

- [ep-10-3-user-views-contact-review-history](./epics/ep-10-3-user-views-contact-review-history)
- [ep-10-4-user-views-hardest-contacts](./epics/ep-10-4-user-views-hardest-contacts)
'@

$e = "$f\epics\ep-10-3-user-views-contact-review-history"; md "$e\stories"
wf "$e\README.md" "# ep-10-3: User Views Contact Review History`n`nUser can inspect the full review timeline for any contact.`n"
$us = "**As a** user, **I can** view the full review history (dates, ratings, and intervals) for a specific contact, **so that** I can see exactly how difficult they have been to consolidate."
story $e "01" "user-views-full-review-history-for-contact" $us @("Review history is accessible from the contact detail screen","History shows each event: date, rating, interval before and after","History is ordered chronologically oldest to newest","History includes the initial post-add quiz result as the first entry")
$us = "**As a** user, **I can** see how many times I have lapsed on a contact, **so that** I know when to consider a structural encoding repair."
story $e "02" "user-sees-lapse-count-for-contact" $us @("Total lapse count is shown prominently on the contact detail screen","Lapse dates are shown in the review history timeline","A message appears if lapses > 3 suggesting the user rebuild the image","Lapse count resets as a milestone if the contact achieves a stable interval")

$e = "$f\epics\ep-10-4-user-views-hardest-contacts"; md "$e\stories"
wf "$e\README.md" "# ep-10-4: User Views Hardest Contacts`n`nUser sees a ranked list of the contacts most difficult to retain.`n"
$us = "**As a** user, **I can** see a ranked list of my most-missed contacts, **so that** I know where to focus encoding repair sessions."
story $e "01" "user-sees-ranked-list-of-most-missed-contacts" $us @("Hardest Contacts list is accessible from the Insights screen","List ranks contacts by total Forgot ratings, descending","Each entry shows name, photo, miss count, and current name image","List is capped at 10 entries to keep it actionable")
$us = "**As a** user, **I can** have the hardest contacts list update automatically after quiz sessions, **so that** it always reflects current trouble spots."
story $e "02" "hardest-contacts-updates-after-sessions" $us @("List recalculates after every quiz session completes","Contacts not missed recently fall lower over time","A recently resolved indicator shows contacts that are improving","List shows a last updated timestamp")

$f = "$c\functions\fn-03-usage-and-habit-insights"; md $f
wf "$f\README.md" @'
# F-10.3: Usage and Habit Insights

Help users understand their practice patterns so they can optimize their routine.

## Epics

- [ep-10-5-user-sees-practice-frequency](./epics/ep-10-5-user-sees-practice-frequency)
- [ep-10-6-user-sees-backlog-awareness](./epics/ep-10-6-user-sees-backlog-awareness)
'@

$e = "$f\epics\ep-10-5-user-sees-practice-frequency"; md "$e\stories"
wf "$e\README.md" "# ep-10-5: User Sees Practice Frequency`n`nUser can see when they practice and identify consistency gaps.`n"
$us = "**As a** user, **I can** see a calendar heatmap of my practice days, **so that** I can identify gaps in my practice habit at a glance."
story $e "01" "user-sees-calendar-heatmap-of-practice-days" $us @("Heatmap shows the last 90 days of practice activity","Days with at least one quiz are filled; days with none are empty","Intensity of fill reflects question count","Heatmap is accessible from the Insights screen")
$us = "**As a** user, **I can** see the time of day I most often practice, **so that** I can confirm my reminder timing is well-matched to my actual behavior."
story $e "02" "user-sees-peak-practice-time-of-day" $us @("Peak practice time shown as an hour range (e.g. Usually between 7-9 AM)","Based on timestamps of completed sessions over the last 30 days","Shown alongside the user's current reminder time for easy comparison","Displays N/A if fewer than 5 sessions have been completed")

$e = "$f\epics\ep-10-6-user-sees-backlog-awareness"; md "$e\stories"
wf "$e\README.md" "# ep-10-6: User Sees Backlog Awareness`n`nUser can see overdue reviews and plan for upcoming review volume.`n"
$us = "**As a** user, **I can** see how many contacts are overdue, **so that** I understand the size of my backlog and can prioritize."
story $e "01" "user-sees-count-of-overdue-contacts" $us @("Overdue count is shown on the dashboard below the due-today count","Overdue = isDue = true and nextReviewDate < today - 1 day","Tapping the count filters the upcoming reviews list to overdue contacts","Zero overdue state shows a positive message")
$us = "**As a** user, **I can** see a projection of upcoming review volume per day over the next two weeks, **so that** I can anticipate heavy days and review early."
story $e "02" "user-sees-upcoming-reviews-projection" $us @("14-day bar chart shows projected review count per day","Projection is based on current SM-2 next-review dates","Days with more than the session-length cap are highlighted as heavy","Chart updates daily as SM-2 schedules evolve")

Write-Host "Tree creation complete."
$count = (Get-ChildItem -Recurse $r | Measure-Object).Count
Write-Host "Total items created: $count"
