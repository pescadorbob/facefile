# Creating Documentation from Your Executable Specifications

## Native JUnit

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

## Maven Site Plugin

Why not just create HTML reports of the acceptance tests, published to a documentation website (DevDocs) with every build? Running **mvn site** against a build that has completed the failsafe tests results in:

### Test Cases

[Summary] [Package List] [Test Cases]

#### Schedule Event

☀️ should schedule an event given no conflicts

## Cucumber

There are many who preferred to use cucumber and gherkin. Cucumber is able to produce very readable documentation. Additionally, there are tools such as relish that can build documentation websites from executable specifications.

www.relishapp.com

_(Screenshot of a Relish documentation page showing a test case named "Sucker" with an accompanying illustration.)_

## Pitfalls to Avoid

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
