# Versioning and release cadence

## The layers version independently

This is the structural decision the whole project rests on. Three layers, three
release trains, deliberately decoupled:

| Layer | Contents | Moves | Breaking change means |
|---|---|---|---|
| **Normative** | `catalog/`, `taxonomy/`, `schema/` | Slowly | A case's obligation changed, or the schema no longer accepts a previously valid case |
| **Crosswalks** | `crosswalks/` | With external standards | An external framework revised its own identifiers |
| **Realization** | Examples, adapters, tool references | Fast | An adapter's output format changed |

A vendor releasing a new product, or OWASP publishing a revision, must never
force a version bump in the normative layer. That decoupling is what keeps the
catalog citable across years while the tooling underneath it churns.

## Semantic versioning, applied to a catalog

`MAJOR.MINOR.PATCH`, where the compatibility contract is about **citations**,
not code.

- **PATCH** — clarifications, typo fixes, `tool_class` corrections. No case
  changes what it obliges.
- **MINOR** — new cases added; existing cases widened (extra mechanism, stage or
  archetype); new crosswalk entries. **Additive only.** A conformance claim made
  against an earlier MINOR remains valid.
- **MAJOR** — a case is superseded or deprecated, a `level` is raised, a `gate`
  flips on, or the schema drops a field. A previously conformant system may no
  longer be conformant without doing new work.

The practical test: if an adopter has to *do something* because of the release,
it is MAJOR. If they only gain options, it is MINOR.

Identifiers never change in any release. See [ID-POLICY.md](ID-POLICY.md).

## Cadence

**Quarterly** for the normative layer, on a published date, whether or not there
is much to ship. Crosswalks may release out of band when an external framework
revises.

The cadence matters more than the contents, and this is not a stylistic
preference. Standards win on maintenance, not on insight — MITRE ATT&CK did not
displace better-designed taxonomies because it was more elegant, it displaced
them because MITRE kept shipping while the elegant ones went stale. A dated
changelog with real entries is the single fastest way for a reader to tell this
apart from the several hundred abandoned AI governance repositories, and it is
the one signal that cannot be faked at launch.

If a quarter has no changes, that ships as a release note saying so.

## Conformance claims are version-pinned

A coverage report states which catalog version it was produced against:

```json
{ "catalog_version": "0.1.0", "generated": "...", "cases": [ ... ] }
```

A report without a version is not interpretable, because the set of obligations
it claims to cover is undefined. The report schema (Phase 2) makes the field
required.

## Pre-1.0

Below `1.0.0` the additive-only guarantee for MINOR is **not** in force. Cases
may be renumbered up until the `1.0.0` tag, after which the identifier policy
becomes absolute.

`1.0.0` ships when the crosswalks are complete and at least two independent
implementations have produced a valid coverage report — the same two-independent-
implementations bar the IETF applies before advancing a specification, and for the
same reason: a format proven by a single implementation silently encodes that
implementation's assumptions as normative.
