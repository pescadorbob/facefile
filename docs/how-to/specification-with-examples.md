# Specification with Examples

Now that we have the key examples or acceptance criteria, we want to define the scenarios to refine them into something that is testable.

We refine the specification from the key examples and create a document that's self-explanatory and formatted in a way that will make it easy to automate the validation later (shown below). You may find yourself going between the key examples (making them more concise, removing duplicates) and the specification with examples. Although not required, many people find using the language of **"Given, When Then"** to be helpful.

Every acceptance criterion may have one or more scenarios tied to it. All the scenarios put together become your _executable specifications_.

## Example scenarios from key examples

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
