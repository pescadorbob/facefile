# How to Isolate Acceptance Tests

Okay, let's talk about isolation. This is one of those things that seems like a small detail until it isn't — a flaky test suite is almost always an isolation problem wearing a disguise. I'm going to walk you through four approaches, each one fixing a weakness in the last, so you can see why we end up where we end up.

## 1. Dedicated system per test

Let's start with the dream version, just so you know what you're aiming for.

1. Deploy a fresh copy of your system under test, just for one test.
2. Run that single test against it.
3. Throw the copy away.
4. Do this for every test — and since each one has its own copy, you can run them all at the same time.

Here's the thing: this is genuinely the fastest feedback you could ever get. The math is simple — deploy time, plus startup time, plus your slowest test, plus a bit to gather the results. But be honest with yourself about the cost. Standing up a whole system per test is extravagant for most teams. Still, keep this picture in your head — it tells you where your real speed limits are: how long it takes you to deploy, how long it takes to start up, and whether you're tolerating slow tests you shouldn't be.

## 2. Shared system, sequential, with teardown

Now here's what most people reach for next, and I want you to notice why it's a trap.

1. Deploy the system once.
2. Run your tests one at a time against it.
3. After each one, clean up — delete what it created, roll back a transaction, whatever it takes.
4. Move on to the next test.

I've watched teams build elaborate machinery for step 3 — transaction rollbacks, custom teardown scripts, all sorts of clever tricks. Don't. It's intrusive: you end up reaching inside your system to clean it up, which means your test environment quietly stops looking like production. And it's slow, because now every single test is paying a cleanup tax. You're buying shared infrastructure and paying for it in fragility.

## 3. Functional isolation

Here's the better idea, and it's simpler than it sounds: stop cleaning up, and instead make it so there's never anything to clean up.

1. Look at your domain and find the natural boundary that already separates one user's stuff from another's — an account, a hospital, a store, whatever it is for you.
2. At the start of every test, create a brand-new instance of that boundary through the system itself — register a new user, open a new hospital, whatever fits.
3. Do all your setup and all your actual test behavior inside that one instance.
4. And then just... don't tidy up. Let it sit there. When the whole run is done, throw away or overwrite the entire system and start clean next time.

Think about testing an online bookstore — each test registers its own user and adds its own book. Testing an auction site — each test creates its own buyer, its own seller, its own auction. Nobody's test can see anybody else's data, because nobody's sharing an entity. And here's the bonus you get almost for free: once tests can't interfere with each other, you're no longer stuck running them one at a time. You can run them in parallel.

## 4. Temporal isolation

Functional isolation gets you most of the way, but there's a gap — what happens when you run the exact same test twice against the exact same system?

1. See the problem first. A test creates "a book called Continuous Delivery." Run it once, fine. Run it again, and now it collides with what it left behind last time — the price might be different now, or it's out of stock — and your test breaks for reasons that have nothing to do with what you're actually testing.
2. Fix it by refusing to write the literal value the test asked for. Swap in a run-specific variant behind the scenes instead — "Continuous Delivery" quietly becomes "Continuous Delivery 1234."
3. Make that substitution invisible to the test. Whenever the test writes "Continuous Delivery" or checks for it, your test infrastructure transparently maps it to that same run-specific variant, every time, both directions.
4. Make sure every run gets its own variant, so two runs of the same test — even run back to back — never step on each other.

## Put them together

Here's how it all fits. Functional isolation scopes a test's data to something it creates for itself. Temporal isolation makes sure that something is unique, even if you run the exact same test a hundred times in a row. Do both, and a single test case only ever sees its own data — whether it runs alone, runs twice, or runs shoulder-to-shoulder with every other test you've got.

So, practically, here's your checklist:

1. Draw a clear line around what counts as your system under test.
2. Fake out anything outside that line — third-party systems, external services.
3. Find the functional isolation entities that make sense for your domain.
4. Make every test create its own instance of that entity — no sharing, ever.
5. Layer temporal isolation on top — every value a test writes and later checks gets a run-specific twist, handled transparently by your test infrastructure so the test itself never has to think about it.

Do this, and intermittent tests stop being a mystery you chase down at 2am. It costs you almost nothing to set up, and it pays for itself the very first time it saves you from a flaky failure.
