# Adapters

Adapters read what your test tooling **already produced** and translate it into
a coverage report. They run nothing, score nothing, and judge nothing.

That constraint is the strategy, not modesty. An adapter for a test runner makes
that runner more valuable and makes this project visibly dependent on it, which
turns a potential rival into a beneficiary. Building our own scorer would
acquire six competitors overnight. See [NON-GOALS.md](NON-GOALS.md).

## Shipped

| Adapter | Reads | Typical mechanism |
|---|---|---|
| `junit` | junit XML from any runner | M1 deterministic assertion, M5 trace assertion |
| `promptfoo` | promptfoo JSON output | M3 model-graded, M2 programmatic metric |

Two, deliberately. `docs/VERSIONING.md` requires two independent
implementations before `1.0.0` — the same bar the IETF applies before advancing
a specification, for the same reason. A format proven by a single implementation
silently encodes that implementation's assumptions as normative, and you only
find out when the second one arrives.

## Declaring which obligation a test discharges

The unit of adoption is one identifier in one test. That is the whole ask.

**junit** — a recorded property, or an identifier in the test name:

```python
def test_agent_stops_at_step_budget(record_property):
    record_property("aac", "AAC-0055")
    ...

def test_aac_0055_stops_at_step_budget():   # equivalent, no plugin needed
    ...
```

The property form is preferred: a rename cannot silently break the link. Both
accept several identifiers for one test.

**promptfoo** — test metadata, or an assertion metric name:

```yaml
tests:
  - description: golden set across 6 vendors
    metadata: { aac: AAC-0001 }
```

## Per-test overrides

An adapter cannot infer the *mechanism* from a test result — a passing pytest
case might be a schema assertion or a trace assertion, and only the author
knows. So mechanisms and stages are declared per source in `aac.config.yaml`,
and overridden per test where a suite mixes them:

```xml
<properties>
  <property name="aac" value="AAC-0011"/>
  <property name="aac.mechanism" value="M5"/>
  <property name="aac.stage" value="S2 S4"/>
</properties>
```

## Configuration

`aac.config.yaml` lives in the adopting repository and declares three things:
what is being claimed about, where the adapter inputs are, and which obligations
are deliberately not implemented. Worked example:
[examples/aac.config.yaml](../examples/aac.config.yaml).

```bash
npm run build-report -- aac.config.yaml -o coverage-report.json
npm run validate-report -- coverage-report.json
```

## Merge rules

- **Worst outcome wins.** One failing check makes the obligation failing. An
  obligation covered by four tests where one fails is not 75% passing.
- **Evidence accumulates.** Every source that touched an obligation contributes
  a pointer, so a reviewer can follow all of them.
- **Declarations override adapters** for `accepted-risk` and `not-applicable`.
  A deliberate decision outranks an incidental test result.
- **Everything else becomes `not-covered`.** No adapter evidence and no
  declaration produces an explicit row saying so.

That last rule is the one that matters. A blind spot cannot be hidden by
omitting it, which is the only reason a coverage number means anything.

Two situations are reported rather than passed over silently: a **missing source
file** (its obligations would otherwise read as not-covered with no explanation)
and a **declaration for an obligation the subject does not owe**, which almost
always means the archetype classification is wrong.

## Writing another adapter

```js
module.exports = {
  name: "yourtool",
  // raw file contents + the source block from aac.config.yaml
  extract(raw, opts) {
    return [{
      case: "AAC-0001",
      outcome: "pass",              // pass | fail | error | unknown
      mechanisms: opts.mechanisms || ["M2"],
      stages: opts.stages || ["S3"],
      evidence: [{ type: "experiment", ref: "run/123" }],
    }];
  },
};
```

Register it in `tools/build-report.js` and add a fixture under
`examples/fixtures/`. CI rebuilds the example report and fails on any diff, so a
fixture is what keeps an adapter honest.

Read the output envelope **defensively**. Tools move their JSON shape between
versions, and an adapter that pins one shape breaks on upgrade for no good
reason — the promptfoo adapter locates its result rows rather than assuming a
path, and accepts an explicit `resultsPath` override when that fails.
