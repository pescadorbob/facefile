# C-4: Retrieval Practice and Spaced Repetition

The core learning loop: quiz the user on faces and names, score their recall, and schedule the next review at the optimal moment using SM-2. Retrieval — not re-exposure — is what makes names stick.

---

## F-4.1: Quiz Session Management

Deliver effective, randomized quiz sessions across both quiz modes.

### E-4.1.1: Face → Name Quiz Mode
- S-4.1.1.1: As a user, I am shown a contact's photo and must type or select their name so I practice the real-world face-first recall task
- S-4.1.1.2: As a user, I see confirmation of the correct name after answering so I can self-calibrate even when I'm right

### E-4.1.2: Name → Face Quiz Mode
- S-4.1.2.1: As a user, I am shown a contact's name and must select their photo from a set of options so I practice recognizing faces I've been told about
- S-4.1.2.2: As a user, the distractor photos are drawn from my actual contact list so the task stays challenging and realistic

### E-4.1.3: Mixed Mode Session
- S-4.1.3.1: As a user, my quiz sessions randomly mix Face → Name and Name → Face questions so both retrieval directions are practiced
- S-4.1.3.2: As a user, I can start a quiz session containing only contacts due for review so my time is spent where it matters most

---

## F-4.2: SM-2 Scheduling

Use the SM-2 algorithm to compute the next review interval based on the user's self-reported recall quality.

### E-4.2.1: Recall Rating Input
- S-4.2.1.1: As a user, I can rate my recall after each answer (Forgot / Hard / Good / Easy) so the algorithm has an accurate signal
- S-4.2.1.2: As a user, I see a brief explanation of what each rating means the first time so I calibrate consistently

### E-4.2.2: Interval Calculation and Storage
- S-4.2.2.1: As a system, I compute the next review date for each contact using SM-2 after every quiz answer so reviews are scheduled optimally
- S-4.2.2.2: As a system, I reset the interval to 1 day when a user rates a recall as "Forgot" so lapsed memories restart from the beginning

---

## F-4.3: Review Dashboard and Reminders

Surface the right reviews at the right time without the user having to think about scheduling.

### E-4.3.1: Due-Review Dashboard
- S-4.3.1.1: As a user, I see a dashboard showing how many contacts are due for review today when I log in so I know immediately where to start
- S-4.3.1.2: As a user, I can see the full list of upcoming reviews by date so I can plan ahead

### E-4.3.2: Scheduled Reminders
- S-4.3.2.1: As a user, I receive a push or email notification when I have reviews due so I don't forget to practice
- S-4.3.2.2: As a user, I can configure what time of day reminders arrive so they fit my routine
- S-4.3.2.3: As a user, I can disable reminders without losing my review schedule so I stay in control

---

## F-4.4: Immediate Post-Add Quiz

Trigger a retrieval attempt immediately after a new contact is added — before the image fades from working memory.

### E-4.4.1: Post-Add Retrieval Prompt
- S-4.4.1.1: As a user, I am automatically prompted to take a one-question quiz on a contact immediately after saving them so retrieval practice starts within the critical 10-60 second window
- S-4.4.1.2: As a user, I can skip the immediate quiz if I'm in a hurry so the flow never feels coercive
