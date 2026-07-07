# Refine to a Table 🔗

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
