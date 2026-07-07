# Executable Specification

When our developers start working on the feature described in the specification with the example created above, the test based on this specification will initially fail because it's not yet automated and the feature isn't yet implemented. The developers will implement the relevant feature and connect it to the test automation framework. They'll use a test automation framework which pulls the inputs from the specification and validates the expected outputs without requiring them to actually change the specification document. This could be plain old java with JUnit, or something like Gherkin and Cucumber. It is up to the team implementing. I personally prefer plain old java, but teams may choose whatever they find the most expressive.

_A full working example can be seen here._

Ideas and practices such as the following will help automate the specification efficiently:

- Run the System Under Test (SUT) as production like as possible, without running it end to end.
- Simulate external systems with system stubs.
- Create a Domain Specific Language (DSL) layer to turn the plain language of the business, i.e. the "HOW" into complete test fixtures for each example.
  - Consider using a DSL in the native language (Java)
  - Consider using a DSL using Gherkin or Cucumber
- Create **temporal isolation** in the DSL using aliases for potential test constraint conflicts.
- Use a **Protocol driver** to drive the tests at the layer of abstraction desired. E.g. a UI protocol driver or REST API driver.
- Use the DSL to control the external systems that stubs the System Under Test (SUT) uses as part of the Component Test.
- The test calls the DSL. The DSL calls the driver. The protocol driver translates the instructions to the protocol required to connect to the system.
- Relentlessly focus the language on the end user in the language of the domain, understood without implementation details.
- Find ways to skip the tests until they are implemented but allow them to be executed individually as needed during development.

## 4 Layer Architecture

_(Diagram: Test Cases sit at the top, feeding down into a Domain Specific Language layer. The DSL layer feeds down into a set of drivers — UI Protocol Driver, REST Protocol Driver, and two Stub Drivers. Those drivers connect down into the System Under Test, which in turn connects to External System Stubs.)_

You started with a specification that could be applied manually with validations. But once the validation is automated, the specification becomes executable!
