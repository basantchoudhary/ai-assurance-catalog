# Crosswalks

Mappings from catalog identifiers to external frameworks. Empty until Phase 1.

Crosswalks release **out of band** from the catalog. An external framework
revising its own identifiers must never force a version bump in `catalog/` —
that decoupling is what keeps obligations citable across years while the
frameworks around them churn.

## Planned

| File | Framework | Legal shape |
|---|---|---|
| `owasp-llm.yaml` | OWASP Top 10 for LLM Applications | Creative Commons — may quote |
| `nist-ai-rmf.yaml` | NIST AI RMF + Generative AI Profile | US government, freely redistributable |
| `iso-42001.yaml` | ISO/IEC 42001 Annex A | **Copyrighted and paywalled — cite clause identifiers only, never reproduce control text** |
| `eu-ai-act.yaml` | EU AI Act | Official Journal, public — may quote |

Four frameworks, four different licensing positions in one directory. Check
before quoting anything.

## Shape

```yaml
framework: owasp-llm-top-10
framework_version: "2025"
mappings:
  - external: LLM01
    external_name: Prompt Injection
    cases: [AAC-0004, AAC-0036, AAC-0058]
    relation: evidence-for
    note: >-
      AAC-0058 covers the tool-output vector specifically, which is the
      highest-yield variant against A6.
```

`relation` records how tight the mapping is:

- `evidence-for` — the case produces evidence supporting the external item.
  This is the default and is correct for nearly every ISO 42001 mapping.
- `tests-for` — the case directly tests the thing the external item describes.
  Appropriate for most OWASP entries.
- `partial` — the case covers one aspect; the external item needs more.

**Never claim one-to-one equivalence with a management-system control.** ISO
42001 controls govern *processes* — roles, impact assessment, lifecycle
management. A test obligation is at best evidence that a process operated. An
auditor who sees a case claimed as equivalent to a control will discount the
whole crosswalk, and they will be right to.

## Why do this early

Running the catalog against an established threat list is free coverage
validation. The first OWASP pass against draft 0.1 already surfaced three
missing obligations — system prompt leakage, model and artifact supply chain,
and retrieval-corpus poisoning. They are tracked in
[CHANGELOG.md](../CHANGELOG.md) under Unreleased.
