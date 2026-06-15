# E-1.1: User Learns Memory Palace Fundamentals

> Capability: [User Onboarding and Learning](../../../../README.md) — Function: [Memory Palace Education](../../README.md)

**As** a new user
**I want to** learn how a memory palace works for remembering names
**So that** I can start using the application effectively for real-world name recall.

## Acceptance Criteria (epic-level)

1. The application offers a fundamentals tutorial covering all 7 memory-palace steps.
2. The tutorial includes at least one visual example of palace structure and person placement.
3. A new user only sees a "fundamentals complete" confirmation after reaching the final step.
4. A new user can verify their understanding of the three core name-image techniques (sound-alike, meaning-based, split-name) before being marked complete.
5. A new user can leave the tutorial mid-way and return to the same step later.

## Stories

| # | ID | Story | Why this order |
|---|-----|---------|-----------------|
| 1 | [S-1.1.1](./stories/story-01-walk-through-the-7-step-tutorial.md) | New user walks through the 7-step fundamentals tutorial in one sitting and only sees completion at the end | Highest user value — without this nothing else in the epic exists for the user. Highest learning value — surfaces the real content questions early. |
| 2 | [S-1.1.2](./stories/story-02-pass-a-technique-identification-check.md) | New user passes a short check that asks them to identify the three name-image techniques | Second-highest user value — this is what proves onboarding actually worked. Independent of story 3. |
| 3 | [S-1.1.3](./stories/story-03-pause-and-resume-the-tutorial.md) | New user can leave the tutorial and return to the step they were on | Quality-of-life enhancement; lowest immediate user value. Independent slice — adds resume state to whatever tutorial scaffold exists. |

## Notes on what was changed during refinement

- **Lifted to an epic-level content rule (not a story):** "tutorial includes at least one visual example." This is a content quality criterion, not an independently shippable feature.
- **Dropped:** the original AC asking the user to "explain memory principles in plain language." A free-form spoken explanation is not testable inside the application; this remains a teaching goal but is not a story.
- **Merged:** the original AC about "user who stops does not receive completion" was the negative case of the completion-gating AC; both are covered by story 1's scenarios.
