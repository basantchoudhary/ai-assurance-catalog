# Realization

Every case carries three advisory tags — `mechanisms`, `stages`, `tool_class` —
that say how the obligation can be physically discharged. This document is what
those tags mean and what they deliberately do not.

Definitions live in [taxonomy/realization.yaml](../taxonomy/realization.yaml);
this is the reasoning behind them.

## Advisory, not normative

The obligation is normative. The realization is not.

A case says *the system must not leak personal data in its output*. It does not
say how you prove that. The tags name the classes of machinery that plausibly
can, so an architect has somewhere to start and a reviewer has something to
check the plan against. An adopter who discharges an obligation by some other
mechanism is conformant.

This matters because the same obligation is realized differently at different
stages. Output redaction is a deterministic detector in CI, a blocking filter at
the gateway, and a sampled model-graded check in production — one sentence,
three realizations, three different tools. Cases therefore list *all* the
mechanisms and stages that apply, and an adopter picks.

## The axes are orthogonal on purpose

**Mechanism** answers *what computes the verdict*. **Stage** answers *when and
where it runs*. **Gate** answers *what happens on failure*.

Fusing them would force a vendor choice before the design was finished — the
exact failure that makes most testing guidance unusable, because it arrives
already committed to somebody's product.

## Tool class, never a product

`tool_class` names a category: *eval platform*, *gateway*, *test runner*,
*tracing backend*, *guardrail engine*, *red-team harness*, *annotation tool*.

Never a product. Two reasons, and the second is the one that matters:

1. Products date. The market moves faster than a quarterly catalog.
2. Naming one turns a neutral catalog into a recommendation, and a catalog that
   recommends cannot also be the vocabulary competitors claim coverage in.

The linter enforces the narrow version of this: a product name in a case's
`title` or `statement` fails the build. Products may appear only in informative
realization examples, which version separately and are expected to go stale.

## Choosing a mechanism

Rough ordering, strongest signal first, when more than one applies:

1. **Execute it** (M1). If the output can be parsed, compiled or run, do that.
   Free, unambiguous, and it catches a surprising share of failures. This is why
   A8 is the best-covered archetype in the catalog.
2. **Measure it** (M2). If there is labelled data, a number you can threshold
   and trend beats a judgement.
3. **Assert the path** (M5). For anything about *how* a system reached its
   answer — trajectory, termination, tool selection, span completeness — trace
   assertions are the only mechanism that works. Output-only scoring is blind
   to all of it.
4. **Judge it** (M3, M4). The only practical mechanism for open-ended quality,
   and the most expensive to trust. Reference-based (M4) is more stable than
   reference-free (M3) because the judge has an anchor. Any model-graded scorer
   owes the A10 obligations — an unvalidated judge makes every metric built on
   it decorative.
5. **Attack it** (M7). Coverage grows over time. Every production incident
   should become a case here.
6. **Ask a human** (M6). Ground truth for everything above, and it does not
   scale — so spend it on the calibration set that keeps your judges honest,
   not on volume.

## Choosing a stage

The constraint is usually cost and determinism, not preference.

- **S2 (CI)** must be cheap and deterministic. Mock the model wherever the test
  is about plumbing rather than about the model — schema handling, retry logic,
  seam contracts, termination. Most A5 obligations belong here and cost nothing.
- **S3 (pre-release)** is where real model calls and real spend live, and where
  release gates belong.
- **S4 (gateway)** is the only stage that can *prevent* rather than detect, and
  it is on the user's latency path. Reserve it for obligations where detection
  after the fact is worthless.
- **S5 (production)** is the only stage that sees the real input distribution.
  It never blocks, so it produces alerts and evidence, not gates.
- **S6 (scheduled)** exists for drift with nothing changed on your side —
  provider model updates, corpus staleness.

A case tagged `gate: true` must run at a stage that can actually block. The
linter rejects a gate tagged only S5 or S6, because neither ever stops anything.

## Realization examples

Executable skeletons per case — a runner assertion, a metric definition, a trace
query — are **informative** and version separately from the catalog. They are
expected to reference real products and to go stale. Nothing in `catalog/` may
depend on them.

They arrive with the Phase 3 adapters; see [../README.md](../README.md).
