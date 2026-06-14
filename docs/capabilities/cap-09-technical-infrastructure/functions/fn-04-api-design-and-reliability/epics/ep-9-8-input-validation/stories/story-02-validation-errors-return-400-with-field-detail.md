# Validation Errors Return 400 with Field-Level Detail

**As a** developer, **I can** receive a 400 response with field-level error detail when a request body fails validation, **so that** the frontend can surface specific, actionable error messages next to the relevant fields.

## Acceptance Criteria

- [ ] The error response for a 400 includes a `fields` object mapping each invalid field name to its error message
- [ ] Multiple field errors are returned in a single response — not one at a time
- [ ] Field names in the error response match the field names in the request body exactly
- [ ] The Angular frontend handles the `fields` map by displaying errors inline next to the corresponding form controls
