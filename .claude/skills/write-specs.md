# Skill: Write Executable Specifications (Component Tests)

When asked to write or generate executable specifications from story acceptance criteria, apply the rules below.

## System under test

- Run the SUT as production-like as possible without running it end to end.
- Simulate external systems with system stubs — not mocks of internal units.

## DSL layer

- Create a Domain Specific Language (DSL) layer that turns the plain business language (the "HOW") into complete test fixtures for each example.
- Write the DSL in the native language of the application (TypeScript for this project) so test fixtures can be executed as part of the build process.
- Alternatively consider Gherkin / Cucumber if the team prefers a separate business-readable layer.
- Create temporal isolation in the DSL using aliases to prevent test constraint conflicts between scenarios.
- Relentlessly focus DSL language on the end user and the domain — never on implementation details.

## Protocol driver

- Use a protocol driver to drive the tests at the desired layer of abstraction (UI protocol driver or REST API driver).
- The test calls the DSL. The DSL calls the driver. The driver translates instructions into the protocol required to connect to the SUT.
- Use the DSL to control the external system stubs the SUT depends on as part of each component test.

## Skipping and incremental delivery

- Find ways to skip tests until they are implemented, but allow them to be executed individually as needed during development.
- A skipped spec should still be visible in the test report so nothing is silently dropped.
