# Acceptance Criteria: Illustrate with Key Examples

So far, if you've reached this point, you have derived the scope from the goals in terms of user stories and use cases.

Your user story and use case descriptions should use the language of the business. It should describe **WHAT** the experience of the business is without describing **HOW** the system does it.

You can imagine that during the collaborative discussion, one of the developers asks the Product Owner, "So, what if a VIP customer adds 5 books and 5 washing machines. Does that customer get free delivery?"

In this exercise, we'll now take this abstract use case and illustrate our understanding of it with some key examples. E.g. if the scope of the system were around free delivery, the key examples could be:

## Key Examples

- VIP customer with five books in the cart gets free delivery.
- VIP customer with four books in the cart doesn't get free delivery.
- Regular customer with five books in the cart doesn't get free delivery.
- VIP customer with a five washing machines in the cart doesn't get free delivery.
- VIP customer with five books and a washing machine in the cart doesn't get free delivery.

_— Specification by example (Gojko Adzic)_

These key examples help clarify the product owner's vision of the system and understand when the development of the system for this scope has completed.

Every key example is the acceptance criteria. Think through the different key examples that really highlight the business domain behaviors of the system.

**In the end, there will be at least one Acceptance Test per Acceptance Criteria**
