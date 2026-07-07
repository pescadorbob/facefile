# Acceptance Test Driven Design

ATDD leverages Specification by Example to develop a product owner's product vision into working software with living documentation. In this document we'll approach everything you need to know to accomplish this goal.

## From Goals to running software with executable specifications and living documentation

You will learn more technical techniques that make it easy to write specifications like these that don't change as the system that you are building evolves and changes over time. These are true specifications that tell us what to build, but also act as excellent, extensive, regression tests, validating our systems, and allowing us to proceed quickly and with confidence.

Through a mix of theory and worked examples, this will demonstrate the practices and techniques of high-level automated functional testing using "Executable Specifications" as the model for the behavior of a system and use this as a guiding principle for the development process.

### Objectives

- To be able to build Acceptance Tests, as Executable Specifications, that are not compromised by changes in the system under test.
- To develop skills in the creation and use of "Acceptance Tests" in the form of "Executable Specifications".
- To practice effective story-writing using a combination of "Story Mapping" and "Specification by Example" techniques.
- To learn how to create and use a "Domain Specific Language" to support the creation and maintenance of "Executable Specifications".

## Starting point: Product Vision

Elevator Pitch Builder Prompt
Instructions: Answer each blank in plain language — no jargon, no internal acronyms, no implementation details. If you can't fill a blank in one simple sentence, the idea isn't clear enough yet.
For [specific target user or customer]

Who [has this problem / need / pain point]

Our widget/product/service is a [category — what kind of thing it is]

That [core value it delivers — the outcome the user actually cares about]

Unlike [the current alternative(s) — competitors, status quo, or manual workaround]

Our widget [does X, Y, and Z differently — the 2-3 things that actually matter to the user]

Example (filled in)

For small restaurant owners who struggle to track inventory and predict food waste, FreshTrack is a simple inventory app that shows exactly what to order and when, cutting food waste costs. Unlike spreadsheets or gut-feel ordering, FreshTrack automatically forecasts demand, alerts you before items expire, and syncs with your POS — no manual data entry required.


Guardrails while filling this in:

One sentence, one breath. If you need to pause to explain a term, cut it.
Value before features. Say what the user gets (less waste, more time, more revenue) before how it works.
Test it on the least technical person in the room. If they can repeat it back accurately after hearing it once, it's ready.
The "unlike" line is your differentiation — not a feature dump. Pick the 2-3 things that actually change the user's life, not everything the product does.


Take a moment to consider write the product vision that everyone agrees on. Create a readme doc in your project called "vision.md" and write down what you think the goal of this product is. It should be concise and business oriented, not technical. Share your 'Goal' with your instructor and ask them how well it aligns with their vision or wish for the product focused around the slice you are working in.

Now that you have a clear vision of what the product is, it's time to break it down into capabilities, features, epics and stories.

- Start with [event-storming](event-storming.md) to flesh out the broad strokes of your system
- Use [Story Mapping ](story-mapping.md) to organize your stories into capabilities, features, epics and stories

## User stories & use cases

User stories for a basic loyalty system:

1. In order to be able to do direct marketing of products to existing customers, as a marketing manager I want customers to register personal details by joining a VIP program.
2. In order to entice existing customers to register for the VIP program, as a marketing manager I want the system to offer free delivery on certain items to VIP customers.
3. In order to save money, as an existing customer I want to receive information on available special offers.

## Acceptance Criteria: Illustrate with key examples

So far, if you've reached this point, you have derived the scope from the goals in terms of user stories and use cases.

Your user story and use case descriptions should use the language of the business. It should describe **WHAT** the experience of the business is without describing **HOW** the system does it.

You can imagine that during the collaborative discussion, one of the developers asks the Product Owner, "So, what if a VIP customer adds 5 books and 5 washing machines. Does that customer get free delivery?"

In this exercise, we'll now take this abstract use case and illustrate our understanding of it with some key examples. E.g. if the scope of the system were around free delivery, the key examples could be:

### Key Examples:

- VIP customer with five books in the cart gets free delivery.
- VIP customer with four books in the cart doesn't get free delivery.
- Regular customer with five books in the cart doesn't get free delivery.
- VIP customer with a five washing machines in the cart doesn't get free delivery.
- VIP customer with five books and a washing machine in the cart doesn't get free delivery.

_— Specification by example (Gojko Adzic)_

These key examples help clarify the product owner's vision of the system and understand when the development of the system for this scope has completed.

Every key example is the acceptance criteria. Think through the different key examples that really highlight the business domain behaviors of the system.

**In the end, there will be at least one Acceptance Test per Acceptance Criteria**

## Good Examples

- Precise & testable
- A true specification, not just a script
- About business function, not software design

**Key Mistake:** Key non-technical contributors (Domain Experts) to adopt a sort of pseudo-technical view of the system and how it's specified.

## Specification with examples

Now that we have the key examples or acceptance criteria, we want to define the scenarios to refine them into something that is testable.

We refine the specification from the key examples and create a document that's self-explanatory and formatted in a way that will make it easy to automate the validation later (shown below). You may find yourself going between the key examples (making them more concise, removing duplicates) and the specification with examples. Although not required, many people find using the language of **"Given, When Then"** to be helpful.

Every acceptance criterion may have one or more scenarios tied to it. All the scenarios put together become your _executable specifications_.

### Example scenarios from key examples:

If your acceptance criteria read:

- VIP customer with five books in the cart gets free delivery.

Then your scenario could read:

Scenario: Free delivery VIP customer with five books in the cart gets free delivery.

- _GIVEN_ customer is VIP
- _WHEN_ cart contains 5 books
- _THEN_ delivery is free

You pick another acceptance criteria:

- VIP customer with four books in the cart doesn't get free delivery.

Scenario: VIP customer with four books in the cart doesn't get free delivery.

- _GIVEN_ customer is VIP
- _WHEN_ cart contains 4 books
- _THEN_ delivery is standard

And yet a third:

Scenario: Regular customer with five books in the cart doesn't get free delivery.

- _GIVEN_ customer is Regular
- _WHEN_ cart contains 5 books
- _THEN_ delivery is standard

and so on.

Scenario: VIP customer with a five washing machines in the cart doesn't get free delivery.

- _GIVEN_ customer is VIP
- _WHEN_ cart contains 5 washing machines
- _THEN_ delivery is standard

Scenario: VIP customer with five books and a washing machine in the cart doesn't get free delivery.

- _GIVEN_ customer is VIP
- _WHEN_ cart contains 5 books and 5 washing machines
- _THEN_ delivery is standard

After considering all the scenarios, you notice a pattern and think about how easy it would be to combine these together, if they really are similar enough.

**Note:** Don't force the scenarios into a scenario outline that can run multiple unless they truly are the same. It's OK to have lots of scenarios, rather than one scenario outline.

## Refine to a table 🔗

In general, you could say the following:

Free delivery is offered to VIP customers once they purchase a certain number of books.

Free delivery is not offered to regular customers or VIP customers buying anything other than books.

Given that the minimum number of books to get free delivery is five, then we expect the following:

- Given customer is _\<\<customer type>>_
- When cart contains _\<\<cart contents>>_
- Then delivery is _\<\<delivery>>_

| Customer type | Cart contents              | Delivery       |
| ------------- | -------------------------- | -------------- |
| VIP           | 5 books                    | Free, Standard |
| VIP           | 4 books                    | Standard       |
| Regular       | 10 books                   | Standard       |
| VIP           | 5 washing machines         | Standard       |
| VIP           | 5 books, 1 washing machine | Standard       |

_-- Specification with examples (Gojko Adzic)_

Now armed with your scenarios and/or scenario outlines, you are ready to turn these into executable specifications.

Keep these 4 elements in mind. If you proceed past this point, without scenarios that are **concise, accurate, understandable and durable**, then your tests will be less optimum, will require changes as the implementation changes and be too long to keep the reader's attention.

The description should be:

- **Concise** - So that they are quick and easy to create.
- **Accurate** - so that they specify _something specific_ that we can evaluate for correctness
- **Understandable** - so that everyone can understand the intent of the test, and so understand what the system is meant to do.
- **Durable** - robust in the face of change, so that they act as a defense against mistakes when we need to change things.

If your specifications and scenarios pass those qualifiers, it's now time to make them executable!

## Executable specification

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

### 4 layer architecture [3]

_(Diagram: Test Cases sit at the top, feeding down into a Domain Specific Language layer. The DSL layer feeds down into a set of drivers — UI Protocol Driver, REST Protocol Driver, and two Stub Drivers. Those drivers connect down into the System Under Test, which in turn connects to External System Stubs.)_

You started with a specification that could be applied manually with validations. But once the validation is automated, the specification becomes executable!

## Living documentation

There are two popular models today for looking at Specification by Example: the acceptance-testing-centric model (ATDD) and the system-behavior-specification model (BDD).

- **ATDD** focuses on automated tests, providing clear development targets and preventing functional regression. It's useful for teams with many functional quality issues.
- **BDD** emphasizes specifying system behavior scenarios, fostering collaboration and shared understanding among stakeholders. It's beneficial for explaining short-term and mid-term software delivery activities.

Both models aim to prevent functional regression through test automation, but the long-term benefits of Specification by Example come from its value as documentation. Teams using it for over five years found its artifacts valuable for long-term business process documentation, ensuring effective maintenance and support. Living documentation is a key benefit of Specification by Example when implemented efficiently.

Using your ATDD results as documentation flips one of the Agile Manifesto's principles on its head:

_-- **Working software over** comprehensive documentation_

This approach ties your documentation to your working software. Your documentation will always describe accurately what the working software does. They are always consistent. Your working software **produces** comprehensive documentation that can be trusted.

## Creating documentation from your executable specifications

### Native JUnit

Many teams have mentioned that JUnit could only be used for unit tests, but it's my preferred tool for Acceptance Tests written as Out-of-process Component Tests.

Even the simplest reports from your executable specifications are better than a word document. Are you creating your specifications using plain old Junit tests (my preference)? Using the **DisplayName** annotation could provide very readable executable specifications right from your IDE or the **Maven Site plugin**. E.g. consider the living documentation from **Listing 1**:

```java
@DisplayName("Schedule Event")
public abstract class ScheduleEventComponentTestIT extends Dsl {

    @Test
    @DisplayName("should schedule an event given no conflicts")
    void shouldScheduleEvent_givenNoConflicts(){
        ...
    }
}
```

**Listing 1:** This test uses a readable Display Name to tell you all the functionality of the Schedule event feature.

When running this test in the IDE, you could see some very readable, living domain language specifications as in **Figure 1**!

```
✓ Schedule Event (com.fmr.swe.coe.calendar.core.usecases.schedul...  397 ms
    ✓ should schedule an event given no conflicts                    397 ms
```

**Figure 1:** Reading left to right in tree hierarchy, the high-level use case Schedule Event shows that it "should schedule an event given no conflicts".

### Maven site Plugin

Why not just create HTML reports of the acceptance tests, published to a documentation website (DevDocs) with every build? Running **mvn site** against a build that has completed the failsafe tests results in:

## Test Cases

[Summary] [Package List] [Test Cases]

### Schedule Event

☀️ should schedule an event given no conflicts

### Cucumber

There are many who preferred to use cucumber and gherkin. Cucumber is able to produce very readable documentation. Additionally, there are tools such as relish that can build documentation websites from executable specifications.

www.relishapp.com

_(Screenshot of a Relish documentation page showing a test case named "Sucker" with an accompanying illustration.)_

### Pitfalls to avoid

A living documentation is more than a directory full of executable specification files. To experience the benefits of living documentation, we have to organize specifications so they make sense together and add relevant contextual information that will allow us to understand individual parts.

Ideally, a living documentation system should help us understand what our system does, which means that the information must be

- Easy to understand
- Consistent
- Organized for easy access

As such, avoid these pitfalls:

- Don't create long specifications
  - Specifications that are long aren't read!
  - Can it be broken down into several similar functions
  - Make sure you focus on **WHAT** the system is supposed to do, not **how** it's done
  - Does it contain a lot of unnecessary contextual information?
- Don't use many small specifications to describe a single feature
  - If someone has to read 10 different specifications to understand how a feature works, it's time to think about reorganizing the documentation.
  - Look for higher-level concepts
- Avoid using technical automation concepts in tests

## Successful practices

Living documentation is probably the longest living artifact of a project. Technologies will come and go, code will be replaced with other code, but the living documentation system describes how the business works. We'll add content to it over several months or years and we need to be able to understand it later. One of the biggest challenges for many teams was keeping the structure and the language of their living documentation **consistent**.

Positive practices:

- Evolve a language
- Base the specification language on personas
- Collaborate on defining the language
- Document your building blocks
  - E.g. consider having a page with all the personas. (Needs example) It doesn't have any assertions, but instead shows which specification building blocks are already available. The page is built from the underlying automation code, creating a living dictionary of the living documentation.
- Continuously reorganize for easy access
- Organize current work by stories
- Reorganize stories by functional areas

_(Diagram: A hierarchical map rooted at "Homepage," branching out into feature areas such as Payments, Card processing, User management, Reporting, Current iteration, and Known regression issues — each with sub-nodes like MasterCard, Visa, Verified by Visa, Authorization, Refunds, New registrations, Registration, Story #729: Enhanced registration, Email integration, Age verification, Payout transfer, and BO user report.)_

- Pay attention to it... **listen** to your living documentation and the people who read it.
  - Use the same language in your executable specification as your ubiquitous language and domain models.
- Long setups for your executable specifications signal bad API design...
  - If your API design is bad, what experience are your users having? Consider redesigning for exuberant consumers.
