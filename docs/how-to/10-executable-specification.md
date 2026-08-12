# Executable Specification

**You're not just learning a testing practice today. You're experiencing what development looks like from here on out: spec-driven development.**

The industry is converging on a single realization — the bottleneck in AI-assisted development was never the code generation. It's the specification. Agents write code faster than any of us can review it; what they can't do is decide what "correct" means. That's the job that doesn't go away, and it's the job you just did when you wrote that example.

Here's what makes it real, and it's the most powerful move you'll take away today: **you can hand an AI a failing test it is structurally incapable of cheating.**

The spec and example we just built are about to become executable. The test derived from them fails right now — no automation, no feature. That failing test is what you give the agent, and it beats any prompt you could write, because the specification document *is* the fixture. The automation pulls inputs and expected outputs straight out of the spec, so the agent can't quietly loosen an assertion or rewrite an expectation to turn the bar green. The only path to passing is building the feature the business actually asked for.

That's the inversion. You stop prompting and reviewing whatever comes back. You define "done" first, in business language, in a document your domain experts can read and your automation can execute — then let the agent grind against it until it's satisfied. The spec becomes the interface between human intent and machine output.

How you bind the spec to the code is a detail. Plain Java with JUnit or javascript with jest works. So does Gherkin and Cucumber. I prefer plain Java or Jest, but pick whatever your team finds most expressive — the leverage is in the specification being the single source of truth, not in the framework you wire it with.

Ideas and practices such as the following will help automate the specification efficiently:

- Run the System Under Test (SUT) as production like as possible, without running it end to end.
- Simulate external systems with system stubs.
- Create a Domain Specific Language (DSL) layer to turn the plain language of the business, i.e. the "HOW" into complete test fixtures for each example.
  - Consider using a DSL in the native language (TypeScript, Java, etc.)
  - Consider using a DSL using Gherkin or Cucumber
- Create **temporal isolation** in the DSL using aliases for potential test constraint conflicts.
- Use a **Protocol driver** to drive the tests at the layer of abstraction desired. E.g. a UI protocol driver or REST API driver.
- Use the DSL to control the external systems that stubs the System Under Test (SUT) uses as part of the Component Test.
- The test calls the DSL. The DSL calls the driver. The protocol driver translates the instructions to the protocol required to connect to the system.
- Relentlessly focus the language on the end user in the language of the domain, understood without implementation details.
- Find ways to skip the tests until they are implemented but allow them to be executed individually as needed during development.

## 4 Layer Architecture

![Test Cases sit at the top, feeding down into a Domain Specific Language layer. The DSL layer feeds down into a set of drivers — UI Protocol Driver, REST Protocol Driver, and two Stub Drivers. Those drivers connect down into the System Under Test, which in turn connects to External System Stubs.](image-7.png)

You started with a specification that could be applied manually with validations. But once the validation is automated, the specification becomes executable!

I've heard most developers and managers in the industry these days say things like:

"Brent, it's too expensive to write tests like this."

to which I say, "How much does it cost to maintain your software without it?"

And especially today, you can train your AI on a model repos, such as Dave Farley's, add that to your skills and agents, and your AI will do it for you.

[github.com/davef77/atdd-course-examples](https://github.com/davef77/atdd-course-examples)

Additionally, I have ported this 4 layer architecture here, along with functional examples that run against an application built this way.

![1786567053951](image/10-executable-specification/1786567053951.png)

Additionally, you can copy the claude skills, hooks and prompt-snippets to ask claude to do it for you!

![1786567208251](image/10-executable-specification/1786567208251.png)

For this assignment, I challenge you to try at least one or two tests like this. I find that when my projects maintain the code with these tests, I'm much more able to add features by myself, and AI is able to take these into context as well to maintain a system that continues to function according to the product vision and user goals.

[See More from Dave Farley himself:]()![1786567924634](image/10-executable-specification/1786567924634.png)

[I]()f you really want to learn more, you can take his courses, which I highly recommend.

[courses.cd.training/courses/take/atdd-from-stories-to-executable-specifications](https://courses.cd.training/courses/take/atdd-from-stories-to-executable-specifications)
