# Skill: Write Acceptance Criteria

When asked to write or review acceptance criteria for any story file under `docs/capabilities/`, follow the process below to produce testable criteria and GIVEN/WHEN/THEN scenarios.

---

## Core rules

1. Use business-domain terms only (memory palace, locus, name image, SM-2, quiz session, review interval, recall rating).
2. Describe WHAT outcome is expected — not HOW the system works.
3. Do not mention technical design, APIs, database behavior, classes, services, or internal logic.
4. Each key example is a separate acceptance criterion.
5. Every acceptance criterion must have at least one GIVEN/WHEN/THEN scenario.
6. Prefer many clear scenarios over forcing unrelated cases into one scenario outline.
7. Include boundary and negative examples that clarify the rule.
8. Keep writing concise, accurate, understandable, and durable.

---

## Process

### 1. Identify scope
Summarize the business capability being specified in 1–3 sentences before writing anything else.

### 2. Derive business rules
List the explicit rules implied by the story. If something must be assumed, state it as an assumption — do not silently bake assumptions into criteria.

### 3. Write acceptance criteria
- Provide a numbered list.
- Make each criterion precise and testable.
- Avoid ambiguous words like *fast*, *proper*, or *user-friendly* unless made measurable (e.g., "within 300 ms", "fewer than 3 taps").
- Prefer observable outcomes — what the user or system visibly does, not what it internally computes.
- Exactly one business behavior per criterion; no compound rules.

### 4. Write GIVEN/WHEN/THEN scenarios
Create one or more scenarios per criterion. Format each exactly as:

```
Scenario: <short business-focused title>
GIVEN <context — the starting state>
WHEN <action or event>
THEN <expected business outcome>
```

Rules:
- Do not combine scenarios that represent different business rules.
- If multiple scenarios share the same GIVEN/WHEN structure but differ only in data, consolidate them into a scenario table (see step 5).
- Always include at least one negative or boundary scenario per criterion where applicable.

### 5. Consolidate where appropriate
If two or more scenarios share the same GIVEN/WHEN/THEN structure and differ only in input values, replace them with a scenario table:

```
Scenario: <title>
GIVEN <context>
WHEN the user provides <input>
THEN <outcome>

| Input         | Outcome          |
|---------------|------------------|
| <value 1>     | <result 1>       |
| <value 2>     | <result 2>       |
```

Do not consolidate scenarios that represent different business rules — keep those separate.

---

## Required output format

When writing acceptance criteria in response to a request, produce output in this order:

**Section 1 — Scope Summary**
One to three sentences describing the capability being specified.

**Section 2 — Business Rules**
Numbered list of explicit rules (plus any assumptions called out separately).

**Section 3 — Acceptance Criteria**
Numbered list; each item is a complete, testable statement.

**Section 4 — GIVEN/WHEN/THEN Scenarios**
One or more scenarios per criterion, using the exact format above.

**Section 5 — Scenario Table (optional)**
Only when consolidation applies (step 5).

**Section 6 — Coverage Check**
Confirm:
- [ ] All criteria are testable
- [ ] At least one scenario exists per criterion
- [ ] Positive, negative, and boundary behaviors are represented
- [ ] No technical implementation language is present
- [ ] No duplicate criteria or duplicate scenarios

---

## Story file format

When writing criteria directly into a story file under `docs/capabilities/`, use this structure:

```markdown
# [Story Title]

**As a** [role], **I can** [action], **so that** [outcome].

## Acceptance Criteria

- [ ] criterion 1
- [ ] criterion 2
- [ ] criterion 3

## Scenarios

Scenario: <title>
GIVEN <context>
WHEN <action>
THEN <outcome>

Scenario: <title>
GIVEN <context>
WHEN <action>
THEN <outcome>
```

---

## If inputs are incomplete

Ask up to 5 targeted clarification questions before writing the final acceptance criteria. Do not guess at scope.

---

## Quality gate before finalizing

- **Concise:** No unnecessary words.
- **Accurate:** Exactly one business behavior per criterion.
- **Understandable:** Clear to non-technical stakeholders.
- **Durable:** Stable even if implementation changes.
