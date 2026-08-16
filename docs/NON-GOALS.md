# Non-goals

This catalog touches AI governance, AI security, LLMOps, SRE and audit. It
authors nothing in any of them. That restraint is the design, not a limitation —
it is what makes the artifact a join table rather than a seventh competing
framework in a field that already has six.

## What this project will never author

| Not this | Because it belongs to |
|---|---|
| Controls | ISO/IEC 42001, NIST AI RMF |
| Threat descriptions | OWASP LLM Top 10, MITRE ATLAS |
| Metric formulas or scorer implementations | Ragas, DeepEval, G-Eval, OpenAI Evals |
| Telemetry schemas | OpenTelemetry GenAI semantic conventions |
| Thresholds, SLOs, risk appetite | The adopting organisation |
| Test execution | The adopter's existing runner |
| A dashboard, a service, a product | Nobody needs another one |

## Cite, don't restate

Where a case overlaps an external framework, it **references** that framework's
identifier and does not paraphrase its content.

This is correctness by construction — you cannot get someone else's domain wrong
if you never restate it — and it is also what makes six adjacent communities
allies rather than rivals. A project that paraphrases OWASP competes with OWASP.
A project that cites `LLM01` gives OWASP a reason to link back.

The linter enforces the narrow version of this: a product name appearing in a
case's `title` or `statement` fails the build. Products may appear only in
informative realization examples, which version separately and are expected to
go stale.

## The two kinds of implementation

Code in this repository is permitted only if it is **horizontal** — it makes
other implementations interoperable. Code that *does the job* is vertical, and
vertical code acquires competitors.

**Permitted:** schema validation, the catalog linter, the YAML-to-site renderer,
adapters that translate another tool's output into a coverage report, the
archetype classifier as a questionnaire, crosswalk files, a CI action.

**Never:** scorers, an evaluation runner, a tracing library, a dashboard, a
hosted service.

The tripwire is simple. **If code in this repository ever evaluates something,
the boundary has been crossed.** Every line must validate the catalog, translate
between the catalog and another tool, or aggregate other tools' output.

An adapter for an eval library makes that library more valuable and makes this
project visibly dependent on it. That is the intended relationship, and it is
why adapters — not features — are the growth strategy.

## Scope of the obligations themselves

Cases describe **application-level** obligations: properties of a system built
on top of a model. Out of scope:

- Foundation-model evaluation and benchmarking — that is a model-provider
  concern with its own well-served literature
- Training-time concerns: dataset curation, fine-tuning procedure, alignment
- Fairness and bias measurement, which requires domain-specific protected
  attributes and legal context this catalog cannot supply generically
- Anything requiring a threshold to be meaningful

The last one is the sharpest boundary. "Latency must be within budget" is a
case. "p95 must be under 2 seconds" never will be, because the number belongs to
the adopter and any value published here would be wrong for almost everyone.

## The positioning test

If the project cannot be described in one sentence without the word *framework*,
scope has drifted.

> A catalog of test obligations for AI applications, organised by architecture
> archetype, mapped to the machinery that can discharge them.
