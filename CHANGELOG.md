# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning rules — and what counts as breaking for a catalog rather than for
code — are in [docs/VERSIONING.md](docs/VERSIONING.md).

Releases are quarterly on a published date, whether or not there is much to
ship. A quarter with no changes ships a release note saying so.

## [Unreleased]

**Phase 1 — remaining crosswalks:** NIST AI RMF, ISO/IEC 42001, EU AI Act.
OWASP shipped in 0.5.0.

**Phase 5 — ecosystem plugs.** An OpenTelemetry span-attribute convention for
`aac.case_id`, a CI action, a coverage badge. Plus the remaining crosswalks.

**Content work is paused**, as recorded in 0.5.0. The remaining obligations
(two pattern gaps, thin `latency` coverage) are additive and invalidate nothing.
They wait until Phase 4 has produced a report with real failures in it.

## [0.8.0] — 2026-08-16

Phase 4. A real repository now emits a real report from its own test suite.

### Reference implementation

[spark-cost-agent](https://github.com/basantchoudhary/spark-cost-agent/tree/main/aac)
— a hand-written tool-calling agent over Spark event logs and Delta transaction
logs, classified `A6` + `A10`, with 172 offline tests.

```
spark-cost-agent stage-8-online-eval  [A6 A10]  catalog 0.7.0
  applicable      50
  covered         23
  accepted risk   3
  not applicable  5
  not covered     19
  uncovered MUSTs 12
  uncovered gates 10
```

**Nineteen blind spots, and that is the useful part.** A first real subject
producing an all-green report would have meant the catalog was too easy or the
mapping was dishonest. The uncovered set clusters informatively: multi-model
evaluation (several providers are selectable by environment variable, but the
eval suite only ever runs against one), release gating on cost, and runtime
enforcement.

`A2` was deliberately not claimed for that subject — its product is prose with
grounded figures, not a typed record consumed by code. Inflating the archetype
list would have inflated the applicable set with obligations it does not owe,
which is the easiest way to make a coverage number meaningless.

### Added — mapping files

A `map:` option on the junit source, so a suite that predates the catalog can
make a claim without annotating 40 tests in one diff. This is the on-ramp most
adopters actually need.

It is weaker evidence than an in-band marker and the tooling says so: every
mapping pattern that matches no test is reported. That is what makes a rename
loud instead of silent.

### Fixed — both found by running against real output

- The junit reference normaliser collapsed `/` and `.` but not `::`, so **no**
  mapping pattern ever matched. Caught immediately by the unmatched-pattern
  warning, which found its own bug on first use.
- Parametrised tests were unmatchable, because pytest appends `[case]` to the
  name. A mapping entry naming the function now matches every parametrisation,
  with worst-outcome-wins folding them into one verdict.

Neither would have surfaced against synthetic fixtures. That is the argument for
Phase 4 existing at all.

## [0.7.0] — 2026-08-16

Phase 3. First functional code — and all of it is translation.

### Added — adapters

- `adapters/junit.js` — junit XML from any runner
- `adapters/promptfoo.js` — promptfoo JSON output
- `tools/build-report.js` and `npm run build-report`
- `docs/ADAPTERS.md`
- `examples/aac.config.yaml`, `examples/fixtures/`

Two adapters, built together rather than sequentially, because
[docs/VERSIONING.md](docs/VERSIONING.md) requires two independent
implementations before `1.0.0`. A format proven by one implementation silently
encodes that implementation's assumptions as normative, and you find out when
the second arrives.

### The example report is now a build artifact

`examples/coverage-report.example.json` is no longer hand-written. It is
produced by the real adapters from real fixtures, and CI rebuilds it on every
push and fails on any diff — so fixture, adapter, merge and schema stay provably
connected instead of drifting into documentation.

Rebuilding it against the actual pipeline moved the numbers, which is the point:
28/43 covered rather than 31, and 8 not-covered rather than 5. **Those eight are
not listed anywhere.** They appear because `build-report` found no adapter
evidence and no declaration and wrote the row anyway. A blind spot cannot be
hidden by omitting it, which is the only reason a coverage number means
anything.

The resulting shape is recognisable: solid contract testing, a real eval suite,
and cost and latency observability not yet wired up — `AAC-0007`, `AAC-0008`,
`AAC-0100`, `AAC-0107`.

### Merge rules

- **Worst outcome wins.** One failing check makes the obligation failing; four
  tests with one failure is not 75% passing.
- **Declarations override adapters** for `accepted-risk` and `not-applicable`.
  A deliberate decision outranks an incidental test result.
- **Everything else becomes `not-covered`**, explicitly.

A missing source file and a declaration for an obligation the subject does not
owe are both reported rather than passed over — the second almost always means
the archetype classification is wrong.

### Design note

Adapters read output that already exists. They run nothing and score nothing,
which is the strategy rather than modesty: an adapter makes the tool it reads
more valuable and makes this project visibly dependent on it, turning a
potential rival into a beneficiary. Shipping our own scorer would acquire six
competitors overnight.

Mechanism is declared, never inferred — a passing test could be a schema
assertion or a trace assertion and only the author knows, so `aac.config.yaml`
carries per-source defaults and tests override per case.

## [0.6.0] — 2026-08-16

**The specification is complete.** Phases 0–2 done; everything after this is
translation code and proof.

### Added — the coverage report

- `schema/coverage-report.schema.json` — the machine-readable conformance claim
- `docs/REPORT.md` — what a claim means, and what it deliberately is not
- `examples/coverage-report.example.json` — a complete, deliberately imperfect
  report; 43 obligations for an `A1`+`A2` subject
- `tools/validate-report.js` and `npm run validate-report`

### Three decisions in the format

**Coverage and outcome are separate fields.** `status` answers *does a check
exist* — the auditor's question. `outcome` answers *did it pass* — the release
gate's question. A `covered` obligation with `outcome: fail` is a working
control reporting a real problem, materially better than one nobody checks.
Merging them into a single red/green field would make the healthier of the two
look worse.

**Silence is not an answer.** Every applicable obligation needs a row, and the
validator fails a report that omits one. `not-covered` is a first-class status,
because the alternative is people quietly dropping the rows they cannot answer.

**The summary cannot lie.** `summary` is derived; the validator recomputes every
field from `results` and rejects a mismatch. For an artifact intended to reach a
release review or an auditor, a headline its own rows do not support is the
failure mode worth engineering against.

The validator deliberately exits 0 with uncovered MUSTs present. Whether a claim
is good enough to ship belongs to the release owner; the tool's job is to make
the numbers true and legible, not to make the judgement.

### Fixed

- `docs/REALIZATION.md` was referenced by the trailer comment in **all 108**
  catalog files and did not exist. Written: what the advisory tags mean, why the
  axes stay orthogonal, and how to choose a mechanism and a stage.

### Changed

- CI validates the example report on every push, so it stays an executable
  specification of the format rather than documentation that drifts
- `npm test` runs lint plus report validation

## [0.5.0] — 2026-08-16

Additive. Phase 1 opens: first crosswalk, plus the three obligations it found
missing.

### Added — `crosswalks/owasp-llm.yaml`

All 10 entries of the OWASP Top 10 for LLM Applications (2025), mapped to 35
distinct obligations.

OWASP is organised by **threat**; this catalog is organised by **application
shape**. The mapping is many-to-many by construction, and that is the value — a
single threat lands on several obligations across several archetypes, which is
exactly what a threat list alone cannot tell an architect. `LLM01` alone
resolves to three separate injection vectors: direct, via retrieved documents,
and via tool output.

Every mapping records a `relation` — `tests-for`, `evidence-for` or `partial` —
and the linter rejects any other value. The field exists to prevent the claim
that discredits a crosswalk fastest: that a test obligation is *equivalent* to a
governance control rather than evidence a process operated.

### Added — three obligations the crosswalk found missing

- `AAC-0106` The system prompt is not a security boundary (`LLM07`, which had
  no obligation at all). Deliberately two halves: extraction is tested, and
  separately no capability may depend on the prompt staying hidden. Testing
  extraction alone measures the wrong thing, because the prompt will eventually
  leak.
- `AAC-0107` Serving artifacts are the ones that were evaluated (`LLM03`).
  Model version, adapters, embedding model, prompt revision and third-party
  components pinned by identifier or digest, verified at the release gate.
- `AAC-0108` Corpus ingestion is controlled and auditable (`LLM04`, A3). One
  poisoned document silently changes answers for every user who retrieves it,
  and no generation-side evaluation will surface it.

`LLM03` and `LLM04` remain marked `partial`: training-pipeline and training-data
concerns are model-level rather than application-level and stay out of scope per
`docs/NON-GOALS.md`. Saying so in the crosswalk is more useful than claiming
coverage we do not have.

### Changed

- Linter validates crosswalk `relation` values, requires every entry to map at
  least one case, and reports per-framework coverage
- Renderer emits a crosswalk section per framework

## [0.4.0] — 2026-08-16

Additive, and entirely informative — no normative case changed, so every
conformance claim against 0.3.0 remains valid.

### Added — `patterns/` (18 patterns)

An informative catalogue of known failure shapes: symptom, mechanism, and the
obligations that would surface it. 12 cost patterns, 6 agent patterns.

Patterns are **diagnoses, not obligations**. Keeping them separate is what lets
a case statement stay short — the pattern carries the war story so the
obligation does not have to. They sit in their own `AACP-####` namespace, flat
with domain as metadata, applying to ourselves the same rule the catalog applies
to archetypes.

- `schema/pattern.schema.json`
- Linter validates patterns, checks `caught_by` resolves, and enforces flat
  identifier sequencing
- Renderer emits a patterns section

### The rule that earns the directory

**A pattern must terminate in a case identifier or declare itself a gap.** The
schema permits `caught_by: []` only alongside a `gap_note`, and the linter
reports every one prominently rather than passing silently.

That makes `patterns/` coverage validation pointed back at `catalog/`. A pattern
nobody can catch is a finding against the catalog, not an omission in the
pattern. The first pass found two:

- `AACP-0006` **Cancellation is not propagated** — nothing requires an abandoned
  request to stop costing money. AAC-0093 bounds spend and AAC-0007 bounds
  latency; neither covers this.
- `AACP-0007` **Volatile prompt prefix defeats caching** — nothing requires
  prompt construction to preserve cache prefixes, or hit rate to be monitored.
  Adjacent to AAC-0089, but that case is about routing rather than prompt
  layout.

### Design note — a deliberate exception to NON-GOALS

A pattern catalogue is a taxonomy, which `docs/NON-GOALS.md` forbids. The
exception is bounded by three conditions, now recorded there: no incumbent owns
this ground (OWASP LLM10 is a security framing, not an economic one); it is
explicitly non-normative and cannot be claimed as conformance; and every pattern
must terminate in a case or a gap note.

If any condition stops holding, the directory should be removed and the content
contributed upstream instead.

## [0.3.0] — 2026-08-16

Additive. Cost obligations were adequate in count but skewed in shape: all
three cost gates were runtime ceilings, and nothing gated cost at release.

### Added

- `AAC-0102` Cost regression is gated at release — MUST, gate. `AAC-0013`
  gated quality regression while cost was merely reported, so a change buying
  a small quality gain for a large spend increase shipped unopposed.
- `AAC-0103` Context growth is tracked across releases. Context grows by
  accretion and each addition is individually defensible; nothing in a
  per-release diff makes the accumulated total visible.
- `AAC-0104` Spend is attributable to tenant, feature and route. Without it a
  rising bill is observable but not diagnosable.
- `AAC-0105` Tool results are bounded before they enter context (A6, A7). Cost
  compounds with trajectory length, so it looks negligible in a single-call
  trace and dominates in aggregate.

### Design note

Cost did **not** become a new category. Archetype is the axis, dimension is the
tag, realization is orthogonal — cost is a quality attribute exactly like
security or latency, and promoting one dimension to a category would invite the
same for all seventeen.

Cost gates, cost guardrails and cost anti-patterns are three different things:
a gate is `dimension: cost` with `gate: true` at stage S3, a guardrail is the
same dimension realized at S4, and an anti-pattern is not an obligation at all.

### Noted, not fixed

`latency` carries a single obligation (`AAC-0007`) against 12 for cost. Likely
under-covered; not addressed here because it was out of scope for the change.

## [0.2.0] — 2026-08-16

Additive. Every conformance claim made against 0.1.0 remains valid.

Closes two gaps in the core block: obligations discharged at the runtime
gateway were largely absent, and the core block silently assumed a **single
model**. The second assumption is false for any system with a fallback path,
which AAC-0009 already mandates — so these apply far more widely than to
systems that deliberately built a router.

### Added — runtime enforcement (7 cases)

- `AAC-0091` Guardrail enforcement fails closed
- `AAC-0092` Streamed output is screened before it reaches the caller
- `AAC-0093` Per-caller quota and spend ceilings are enforced
- `AAC-0094` Only approved models are reachable
- `AAC-0095` Logged prompts and responses are redacted and retention-bounded
- `AAC-0096` Cached responses never cross a trust boundary
- `AAC-0097` Processing region is enforced and recorded

`AAC-0095` deliberately states a tension with `AAC-0011`: trace completeness
requires recording, privacy law requires not retaining, and both obligations
hold. The resolution is redaction at write time plus bounded retention, never
a trade between observability and privacy.

### Added — multi-model routing (4 cases)

- `AAC-0098` Every reachable model is evaluated, not just the primary
- `AAC-0099` The output contract holds on every route
- `AAC-0100` The serving route is recorded, with its reason and its cost
- `AAC-0101` Routing changes are gated like model changes

### Design note

A gateway is **not** a new archetype. The taxonomy's axes are who owns control
flow and what the output touches, and a gateway changes neither — it is a
deployment substrate. Its obligations therefore land in the core block and are
realized at stage S4, rather than fragmenting the archetype axis.

Routing splits across both axes: the router *component* is already A10 and owes
the judge obligations, while the obligations falling on a system that *contains*
a router are core.

Conditional obligations use `MAY` with the condition stated in the case, per the
existing level semantics — streaming, caching, residency and untrusted callers
are conditions, not universals.

Known gaps still open, unchanged from 0.1.0:

- **System prompt leakage** has no obligation. AAC-0006 covers PII and secrets,
  but prompt extraction is a distinct attack with distinct tests.
- **Model and artifact supply chain** is covered only by AAC-0012 (version
  pinning). Provenance and dependency integrity need their own obligations.
- **Corpus and memory poisoning** is covered only by AAC-0041. Retrieval-corpus
  poisoning for A3 has no case.

## [0.1.0] — 2026-08-16

First public draft. Identifiers are provisional until `1.0.0`; see
[docs/ID-POLICY.md](docs/ID-POLICY.md).

### Added

- 90 obligations across 10 archetypes — 16 core, 64 MUST, 54 release gates
- Archetype taxonomy, drawn on two axes only: who owns control flow, and what
  the output touches
- Realization axes: 7 verdict mechanisms, 6 lifecycle stages, 17 dimensions
- JSON Schema for a case, plus a linter enforcing identifier permanence and the
  no-product-names discipline in normative text
- Renderer producing the site from the catalog — the YAML is the master
- Licence split: specification CC BY 4.0, tooling Apache 2.0

### Changed from the unpublished 0.1 draft

- **Identifiers flattened.** Archetype-scoped identifiers (`C-01`, `A6-05`)
  became flat `AAC-####` with archetype as a tag. An obligation can belong to
  several archetypes and that assignment gets corrected as the taxonomy matures;
  encoding it in the identifier would force either a lie or a renumber. Old
  identifiers are retained as `legacy_id` and are not citable.

### Fixed

- AAC-0079 and AAC-0080 were marked as release gates while tagged to run only at
  S5, a stage that never blocks. Both are A9 obligations whose *capability* is
  verified pre-merge and which then *operate* in production, so S2 was added.
  Found by the linter rule rejecting gates that cannot fail anywhere.

[Unreleased]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/basantchoudhary/ai-assurance-catalog/releases/tag/v0.1.0
