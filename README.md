# AI Assurance Catalog

**Test obligations for AI applications, by architecture archetype.**

Status: **working draft 0.2.0** — identifiers are stable from the first tagged
release. Nothing here is externally binding.

---

## The gap this fills

Four bodies of work surround AI assurance and none of them occupy its centre.

| Layer | Who owns it | What it gives you | What it doesn't |
|---|---|---|---|
| Governance | ISO/IEC 42001, NIST AI RMF, EU AI Act | *That* a system must be validated | Which tests |
| Threats | OWASP LLM Top 10, MITRE ATLAS | What can go wrong, ranked | Whether it applies to **your** architecture |
| Telemetry | OpenTelemetry GenAI conventions | How to record a model call | What to assert over it |
| Metrics | Ragas, DeepEval, promptfoo, eval platforms | How to score one property | Which properties you owe |

There is no open, versioned, machine-readable catalog binding
**application archetype → test obligation → realization mechanism.**
That binding is what an architect needs at design review, and it is the one
thing nobody publishes. This is that catalog.

## What it is

101 obligations. Each one states, in plain English, something that must be true
of a system — tagged with which architecture archetypes owe it, which classes of
machinery can produce a verdict, at which lifecycle stage, and whether failure
blocks.

```yaml
id: AAC-0055
level: MUST
dimension: reliability
gate: true
archetypes: [A6]
title: Hard termination under every condition
statement: >-
  Maximum steps, wall-clock and token budget are enforced by the harness — not
  requested in the prompt — and the stop path is tested including its
  partial-result behaviour.
mechanisms: [M1, M5]      # deterministic assertion, trace assertion
stages: [S2, S4]          # CI pre-merge, runtime gateway
tool_class: Test runner + gateway
```

Twenty-seven of the 101 are **core** — owed by every AI application regardless of
shape. The rest are archetype deltas: what is *new* about that shape's risk
surface. That is why this is 101 cases and not several hundred.

## What it is not

This is a join table, not a framework. It deliberately authors none of the
following, and cites all of them:

- **Controls** — ISO 42001 and NIST own those
- **Threats** — OWASP and ATLAS own those
- **Metric implementations** — Ragas, DeepEval, G-Eval own those
- **Telemetry schemas** — OpenTelemetry owns that
- **Thresholds and SLOs** — the adopting team owns those
- **Test execution** — your existing runner owns that

See [docs/NON-GOALS.md](docs/NON-GOALS.md). The linter enforces part of this
mechanically: naming a product inside a case's normative text is a build error.

## Citing a case

The unit of adoption is one identifier in one test name. That costs nothing and
requires no buy-in to the rest.

```python
@pytest.mark.aac("AAC-0055")
def test_agent_stops_at_step_budget(): ...
```

```python
span.set_attribute("aac.case_id", "AAC-0055")
```

Identifiers are flat, permanent, and never reused — archetype is metadata, not
identity. See [docs/ID-POLICY.md](docs/ID-POLICY.md) for why, and for the
deprecation rules.

## Layout

```
catalog/        101 cases, one YAML file each — the normative master
taxonomy/       archetypes, mechanisms, stages, dimensions, levels
schema/         JSON Schema for a case
crosswalks/     mappings to OWASP, NIST AI RMF, ISO 42001, EU AI Act
tools/          linter and renderer — format only, never evaluation
docs/           identifier, versioning and scope policy
```

The rendered site is a build artifact. **The YAML is the master**; never edit
generated output.

```bash
npm install
npm run lint      # schema + identifier + discipline checks
npm run render    # YAML -> site
```

## Roadmap

- [x] **Phase 0** — normative core: catalog, schema, identifier policy, renderer
- [ ] **Phase 1** — crosswalks to OWASP LLM Top 10, NIST AI RMF, ISO 42001, EU AI Act
- [ ] **Phase 2** — coverage report schema (the artifact an auditor consumes)
- [ ] **Phase 3** — adapters: junit, promptfoo, DeepEval, eval-platform exports
- [ ] **Phase 4** — public reference implementation emitting a real report, failures included
- [ ] **Phase 5** — ecosystem plugs: OTel attribute convention, CI action, badge

Phases 0–2 are pure specification. Phase 3 is the first functional code, and all
of it is translation — reading other tools' output and emitting the report
format. Nothing in this repository will ever evaluate anything itself.

## Licence

Split deliberately, following the OWASP model:

- **Specification** — `catalog/`, `taxonomy/`, `crosswalks/`, `docs/`, `schema/` —
  [CC BY 4.0](LICENSE-SPEC.txt)
- **Code** — `tools/`, everything else — [Apache 2.0](LICENSE)

Apache 2.0 specifically for the patent grant, which is what corporate legal
looks for before allowing adoption.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The bar for a new case is that it states
an obligation no existing case covers, for a named archetype, with at least one
mechanism that could realistically produce a verdict. Cases that restate a
threat, name a product, or set a threshold are out of scope by construction.
