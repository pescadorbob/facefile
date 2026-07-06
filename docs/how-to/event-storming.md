# Event Storming

[*Based on Alberto Brandolini's talk "Event Storming" (wroc_love.rb 2015)*](https://www.youtube.com/watch?v=veTVAN0oEkQ)

## What It Is

EventStorming is a workshop technique for quickly mapping out how a business process actually works, using nothing but a big roll of paper and colored sticky notes. No slides, no software, no formal notation — just a room, a wall, and the people who know the domain.

It was invented by **Alberto Brandolini** in 2013 as a lightweight alternative to heavier modeling techniques like UML, in the context of **Domain-Driven Design (DDD)**.

## How It Works

- Developers and domain experts (business people, product owners) get in a room together.
- Everyone writes **domain events** — things that happened, in past tense (e.g. `OrderPlaced`, `PaymentReceived`) — on **orange sticky notes**, and places them on a timeline across the wall.
- Once the events are laid out, the group adds more layers:
  - **Commands** (blue) — the actions that trigger those events
  - **Actors** (yellow) — who issues the commands
  - **Aggregates** — the business rules/objects that process commands
  - **External systems** (pink) — third parties like payment gateways or shipping providers
  - **Views / read models** — what users look at to make decisions
  - **Issues / questions** (red or purple) — flags for anything unclear or broken

The process runs "backwards" from the usual approach: instead of starting with data models or class diagrams, you start with what *happens* in the business.

## Why It's Useful

- Surfaces a shared understanding fast — often within hours, versus weeks of traditional requirements-gathering or UML diagramming.
- Disagreements and confusion (people picturing the process differently) become visible immediately — often the most valuable part of the exercise.
- Sets up later work in Domain-Driven Design naturally, since events/commands/aggregates map directly onto DDD building blocks.
- Pairs well with event-driven architectures and event sourcing.

## Origin Note

This particular talk is one of the earlier public explanations of the method, before it became a widely-adopted practice in the DDD and software architecture community.