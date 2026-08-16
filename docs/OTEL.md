# Span attribute convention

A coverage report says what your CI verified. A span attribute says what your
**production system** verified, on this request, just now.

That is the difference between evidence you assemble and evidence that
accumulates — and it is the only way conformance becomes queryable rather than
declared.

## The attributes

| Attribute | Type | On | Meaning |
|---|---|---|---|
| `aac.case_id` | string or string[] | any span | Obligations this span discharges |
| `aac.catalog_version` | string | root span | Catalog release the identifiers refer to |
| `aac.outcome` | string | any span | `pass`, `fail`, `error` — optional, when the span itself decides |

```python
span.set_attribute("aac.case_id", "AAC-0055")
span.set_attribute("aac.catalog_version", "0.8.0")
```

A guardrail span that blocked a response carries `AAC-0006`. A harness span that
stopped an agent at its step budget carries `AAC-0055`. A gateway span that
refused an unapproved model carries `AAC-0094`.

## Why a separate namespace

`aac.*` is additive and conflicts with nothing. It does not redefine, wrap or
compete with the OpenTelemetry GenAI semantic conventions — `gen_ai.*` describes
*what the call was*, `aac.*` describes *which obligation it discharged*. A system
emits both, and neither has to know about the other.

That separation is deliberate. Telemetry schemas are OpenTelemetry's to own; see
[NON-GOALS.md](NON-GOALS.md). This is a convention for using their schema, not an
extension of it.

## What it buys you

**Coverage becomes a query.** Which obligations fired in production last week?
Which have never fired despite being marked covered in CI? A test that passes in
CI and whose span never appears in production is covering a code path nobody
runs — which the coverage report alone cannot tell you.

**Runtime obligations get real evidence.** The S4 and S5 obligations — guardrails
failing closed, quota enforcement, redaction — are discharged at request time.
Their evidence lives in traces, not in a test run.

**Audit evidence accumulates.** A year of spans carrying `aac.case_id` is
categorically stronger than a document, because it cannot be produced
retroactively.

## Trace-query evidence in a report

Once spans carry the attribute, a report can cite a saved query instead of a
test:

```json
{ "case": "AAC-0091", "status": "covered", "mechanisms": ["M5"], "stages": ["S4"],
  "evidence": [{ "type": "trace-query", "ref": "aac.case_id=AAC-0091 last 7d",
                 "url": "https://traces.example.internal/q/aac-0091" }] }
```

## Status

**Proposed, and unilateral.** Nothing here is registered with OpenTelemetry, and
this document does not claim otherwise.

The right long-term home for a conformance attribute is the GenAI semantic
conventions themselves. The right order is the one that works for conventions:
demonstrate use, then propose. Adopting it now costs an adopter one line and
risks nothing — the namespace is unclaimed, and if an official attribute ever
lands, mapping `aac.case_id` onto it is a rename.
