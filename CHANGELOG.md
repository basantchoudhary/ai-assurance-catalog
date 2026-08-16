# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning rules — and what counts as breaking for a catalog rather than for
code — are in [docs/VERSIONING.md](docs/VERSIONING.md).

Releases are quarterly on a published date, whether or not there is much to
ship. A quarter with no changes ships a release note saying so.

## [Unreleased]

Phase 1: crosswalks to OWASP LLM Top 10, NIST AI RMF, ISO/IEC 42001 and the
EU AI Act.

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

[Unreleased]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/basantchoudhary/ai-assurance-catalog/releases/tag/v0.1.0
