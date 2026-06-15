# Skill: Write Acceptance Criteria

When asked to write or review acceptance criteria for any story file under `docs/capabilities/`, apply the rules below.

## Coverage check — confirm all of the following before writing

- All criteria are testable.
- At least one scenario exists per criterion.
- Positive, negative, and boundary behaviors are represented.
- No technical implementation language is present.
- No duplicate criteria or duplicate scenarios.

## Style requirements

- Keep statements short and concrete.
- Use consistent domain vocabulary (memory palace, locus, name image, SM-2, quiz session, review interval, recall rating).
- Avoid ambiguous words like *fast*, *proper*, *user-friendly* unless made measurable (e.g., "within 300ms", "fewer than 3 taps").
- Prefer observable outcomes — describe what the user or system can see, not what it internally does.

## If inputs are incomplete

Ask up to 5 targeted clarification questions before writing the final acceptance criteria. Do not guess at scope.

## Quality gate before finalizing

- **Concise:** No unnecessary words.
- **Accurate:** Exactly one business behavior per criterion.
- **Understandable:** Clear to non-technical stakeholders.
- **Durable:** Stable even if implementation changes.
