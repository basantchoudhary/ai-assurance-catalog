# Realizations

**Informative. The only layer where products may be named.**

An obligation says *what must be true*. A realization says *what you would
actually build*, and it lists several options because there are always several —
at very different cost, effort and lock-in.

```yaml
AAC-0008:                        # cost per successful task
  options:
    - approach: in-house
      mechanism: M2
      tools: [a rate card in your repo, OpenTelemetry counters]
      how: Price token usage against a published rate card, tag with task
           outcome, divide by SUCCESSFUL tasks.
      caveat: The denominator is the whole obligation.
    - approach: gateway
      mechanism: M2
      tools: [LiteLLM, Portkey, Helicone, Cloudflare AI Gateway]
      how: Per-request cost attribution for every caller, including ones your
           instrumentation missed.
```

Currently: **the 32 core obligations, 88 concrete options.** These are the ones
every AI application owes regardless of shape, so they are the right slice to do
first. Archetype-specific realizations follow.

## Six approaches

`in-house` · `open-source` · `platform` · `gateway` · `cloud-native` · `human`

This axis answers **who provides the machinery**, and it is orthogonal to
mechanism (what computes the verdict) and stage (when it runs). The same
mechanism is usually available from four of the six, which is exactly the
picture a reader needs and exactly what a single "tool" column destroys.

Two of them earn a specific note:

**`gateway` is the only approach that can prevent rather than detect**, and the
only one that covers calls your application code forgot to route through the
wrapper. That makes it structurally different from the rest, not just another
vendor category.

**`in-house` is usually the strongest evidence** and is chronically
under-considered. Several obligations here — a canary corpus for injection, a
token-budget assertion for context growth, a cost comparison in CI — are a
dozen lines and beat any product, because they assert exactly what you meant
rather than what a product happens to measure.

## Rules this layer is held to

Informative does not mean unconstrained. The linter enforces:

- **Every case referenced must exist.** No realizations for obligations that
  were never written.
- **Every option states its mechanism.** That keeps the concrete layer tied to
  the spec instead of drifting into a tool directory.
- **A single-option entry is a warning.** Listing one way to build something is
  a recommendation by omission, and this layer exists to avoid making
  recommendations.

## Staleness is expected and visible

`checked: "2026-08"` is in the file header on purpose. Products appear,
disappear and change what they do far faster than an obligation does — which is
why this layer versions separately from `catalog/`, and why a vendor shipping a
new feature must never force a version bump in the normative layer.

**Verify before relying on any product claim.** Entries describe the kind of
capability a category of product typically offers. Specific feature
availability, naming and pricing change without notice, and a few entries here
will already be wrong by the time you read them.

Nothing here is an endorsement. Options are listed so a reader can see an
obligation is reachable several ways — not so they can be told which to pick.
