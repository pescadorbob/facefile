# Reference: Story File Format and Directory Structure

## Story file format

```markdown
# [Story Title]

**As a** [role], **I can** [action], **so that** [outcome].

## Acceptance Criteria

- [ ] criterion 1
- [ ] criterion 2
- [ ] criterion 3
- [ ] criterion 4
```

## Directory structure

```
docs/capabilities/
  cap-XX-slug/
    README.md                          ← capability nav-hub
    functions/
      fn-XX-slug/
        README.md                      ← function nav-hub (breadcrumb → capability)
        epics/
          ep-X-X-slug/
            README.md                  ← epic README (user story + epic-level AC + stories table + refinement notes)
            stories/
              story-XX-slug.md         ← individual story file
```
