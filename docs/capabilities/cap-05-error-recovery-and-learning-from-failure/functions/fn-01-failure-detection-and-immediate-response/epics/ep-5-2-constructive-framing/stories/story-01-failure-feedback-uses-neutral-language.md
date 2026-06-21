# Failure Feedback Uses Neutral Language

**As a** user who misses a name, **I can** receive feedback that uses neutral, factual language, **so that** I don't build a self-narrative of being "bad with names."

## Acceptance Criteria

- [ ] The reveal screen on a miss uses phrases like "Here's the cue" or "Not quite" — never "Wrong", "Failed", or "Incorrect"
- [ ] The UI does not use red color alone to signal failure — it must be accompanied by neutral copy
- [ ] A missed answer and a skipped answer use the same neutral framing
- [ ] Automated UI tests verify that prohibited negative words do not appear in quiz feedback copy
