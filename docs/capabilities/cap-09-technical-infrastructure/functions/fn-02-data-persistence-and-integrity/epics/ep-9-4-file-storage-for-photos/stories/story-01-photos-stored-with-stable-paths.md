# Photos Stored with Stable Paths

**As a** system, **I can** store uploaded photos at stable, predictable paths on disk or object storage, **so that** they remain accessible across application restarts and deployments.

## Acceptance Criteria

- [ ] Each photo is stored at a path derived from the user ID and a UUID, not the contact name (which could change)
- [ ] The stored path is saved in the contacts table so the file can always be located
- [ ] Application restarts do not move or rename stored files
- [ ] Storage location is configurable via environment variable so local and production paths differ without code changes
