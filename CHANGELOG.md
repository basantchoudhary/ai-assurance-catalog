# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning rules — and what counts as breaking for a catalog rather than for
code — are in [docs/VERSIONING.md](docs/VERSIONING.md).

Releases are quarterly on a published date, whether or not there is much to
ship. A quarter with no changes ships a release note saying so.

## [Unreleased]

Phase 1: crosswalks to OWASP LLM Top 10, NIST AI RMF, ISO/IEC 42001 and the
EU AI Act.

Known gaps, surfaced by a first pass of the OWASP crosswalk against draft 0.1
and not yet closed:

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

[Unreleased]: https://github.com/basantchoudhary/ai-assurance-catalog/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/basantchoudhary/ai-assurance-catalog/releases/tag/v0.1.0
