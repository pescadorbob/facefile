# Request Bodies Validated Against Schemas

**As a** system, **I can** validate all incoming request bodies against defined schemas before any processing begins, **so that** invalid data never reaches the database or business logic layer.

## Acceptance Criteria

- [ ] All POST and PUT endpoints use a schema validation library (e.g., Zod or Joi) applied before the handler runs
- [ ] Schema definitions are co-located with their respective route files
- [ ] Validation failures short-circuit the request and return a 400 before any database calls are made
- [ ] Schema definitions serve as the source of truth for both validation and API documentation
