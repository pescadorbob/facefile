# Successful Practices

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
