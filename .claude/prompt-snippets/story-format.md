# Reference: Story File Format and Directory Structure

## Story file format

```markdown
# [Story Title]

**As a** [role], **I can** [action], **so that** [outcome].

## Acceptance Criteria

- [ ] criterion 1
- [ ] criterion 2
- [ ] criterion 3

## Scenarios

Scenario: <short business-focused title>
GIVEN <context — the starting state>
WHEN <action or event>
THEN <expected business outcome>

Scenario: <short business-focused title>
GIVEN <context>
WHEN <action>
THEN <outcome>
```

Each criterion in `## Acceptance Criteria` must have at least one corresponding scenario in `## Scenarios`. See `.claude/skills/write-ac.md` for the full GIVEN/WHEN/THEN process.

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
