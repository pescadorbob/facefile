# C-9: Technical Infrastructure

The platform-level capabilities that make the product reliable, secure, and scalable — invisible to users when working correctly, painful when not.

---

## F-9.1: Authentication and Security

Protect user accounts and ensure only authorized access to personal contact data.

### E-9.1.1: Session Management
- S-9.1.1.1: As a system, I issue JWT tokens on login and validate them on every protected request so unauthenticated access is rejected
- S-9.1.1.2: As a system, I refresh tokens transparently before expiry so users are not unexpectedly logged out during a session

### E-9.1.2: Data Isolation
- S-9.1.2.1: As a system, every database query is scoped to the authenticated user's ID so no user can access another user's contacts
- S-9.1.2.2: As a system, uploaded photos are stored with access-controlled URLs so images cannot be accessed without authentication

---

## F-9.2: Data Persistence and Integrity

Ensure contact, image, and review data is stored reliably and can survive application restarts.

### E-9.2.1: Relational Data Model (Prisma + SQLite)
- S-9.2.1.1: As a system, I store contacts, review history, and SM-2 parameters in a normalized schema so data relationships are consistent
- S-9.2.1.2: As a system, database migrations are managed via Prisma so schema changes are versioned and reversible

### E-9.2.2: File Storage for Photos
- S-9.2.2.1: As a system, uploaded photos are stored on disk or object storage with stable paths so they remain accessible across restarts
- S-9.2.2.2: As a system, orphaned photo files (from deleted contacts) are cleaned up on a scheduled job so storage doesn't grow unbounded

---

## F-9.3: Scheduled Jobs and Background Processing

Run time-sensitive tasks reliably without blocking user-facing requests.

### E-9.3.1: SM-2 Review Scheduler
- S-9.3.1.1: As a system, a cron job runs hourly to identify contacts whose review date has passed and marks them as due so the dashboard is always current
- S-9.3.1.2: As a system, the scheduler logs its run time and record count so failures are detectable in application logs

### E-9.3.2: Notification Dispatch
- S-9.3.2.1: As a system, reminder notifications are sent at user-configured times via email or push so delivery is personalized
- S-9.3.2.2: As a system, failed notification deliveries are retried once and then logged so persistent failures are visible without spamming users

---

## F-9.4: API Design and Reliability

Provide a consistent, well-structured API that the Angular frontend can depend on.

### E-9.4.1: RESTful Endpoints
- S-9.4.1.1: As a developer, all resource endpoints follow REST conventions (GET/POST/PUT/DELETE) so the API is predictable
- S-9.4.1.2: As a developer, all endpoints return consistent error shapes (status code, message, field errors) so the frontend can handle failures uniformly

### E-9.4.2: Input Validation
- S-9.4.2.1: As a system, all incoming request bodies are validated against schemas before processing so invalid data never reaches the database
- S-9.4.2.2: As a system, validation errors return a 400 with field-level detail so the frontend can surface specific error messages to the user
