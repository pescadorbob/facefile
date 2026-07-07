# User Story Mapping

## Overview

User Story Mapping is an Agile technique, popularized by Jeff Patton, for organizing user stories into a visual, two-dimensional map. It preserves the "big picture" of a product's user journey, rather than reducing everything to a flat, prioritized backlog.

## Structure

### 1. Backbone (Horizontal Axis)

Map the user's journey as a sequence of high-level activities, arranged left to right in the order they naturally occur.

**Example:** `Browse Products → Add to Cart → Checkout → Track Order`

### 2. Details (Vertical Axis)

Under each backbone activity, stack the specific user stories/tasks required to support it, ordered top to bottom by priority or necessity.

| Browse Products | Add to Cart | Checkout | Track Order |
|---|---|---|---|
| Search by keyword | Adjust quantity | Enter shipping | View order status |
| Filter by category | Save for later | Apply promo code | Get email updates |
| View product detail | Remove item | Select payment | Contact support |

### 3. Slicing into Releases

Draw horizontal lines across the map to define a **"walking skeleton"** — the thinnest possible slice of each step that still delivers a complete, usable experience.

- **Top slice** = MVP / Release 1 (minimum viable end-to-end flow)
- **Deeper slices** = Release 2, Release 3, etc. (enhancements and edge cases)

## Why It's Useful

- Keeps the team focused on the **user's workflow**, not a disconnected feature list
- Surfaces **gaps or missing steps** in the journey early
- Enables prioritization by **value across the whole flow**, instead of fully building one feature before starting the next
- Works well as a **collaborative workshop exercise** (typically done with sticky notes)

## Typical Workshop Process

1. Identify the user/persona and their overall goal
2. Brainstorm and sequence the backbone activities
3. Brainstorm detailed tasks/stories under each activity
4. Prioritize vertically within each column
5. Draw release slice lines horizontally across the map
6. Use the map to drive backlog creation and sprint planning

## Relationship to Event Storming

Story Mapping pairs naturally with Event Storming:

| Technique | Focus | Output |
|---|---|---|
| **Event Storming** | Surfaces domain events, processes, and business logic | Shared domain understanding |
| **Story Mapping** | Organizes the user journey into a release plan | Prioritized, sequenced backlog |

A common flow: run Event Storming to understand the domain → run Story Mapping to translate that understanding into a user-centric roadmap.

## Reference

- [How to do User Story Mapping (YouTube)](https://www.youtube.com/watch?v=k_4SchJgAI4&t=468s)
- Jeff Patton, *User Story Mapping: Discover the Whole Story, Build the Right Product*