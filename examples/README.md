# Examples

## `coverage-report.example.json`

A complete coverage report for an illustrative system — **not a real one**. The
Phase 4 reference implementation replaces this with a report emitted from a
real repository's CI.

Subject: a batch document classifier that emits a typed record per invoice,
classified as `A1` + `A2`. That composition makes 43 obligations applicable.

```bash
npm run validate-report -- examples/coverage-report.example.json
```

```
invoice-classifier a3f19c2  [A1 A2]  catalog 0.5.0
  applicable      43
  covered         31  (2 failing)
  accepted risk   4
  not applicable  3
  not covered     5
  uncovered MUSTs 1
  uncovered gates 1
```

## It is deliberately imperfect

An all-green example would teach the wrong lesson. This one carries every state
the format supports, because each one means something different to a reader:

- **2 failing** — `AAC-0024` (dates normalising to the wrong locale for 3 of 40
  gold records) and `AAC-0102` (candidate 18% more expensive per successful
  task). Both are *working controls reporting real problems*, which is a
  materially better position than not checking. See
  [../docs/REPORT.md](../docs/REPORT.md).
- **4 accepted risks** — each with an owner and a review date. Under a
  management-system audit an identified, owned, dated gap is conformant; an
  undiscovered one is a finding.
- **3 not applicable** — the conditional `MAY` obligations whose condition
  genuinely fails: no streaming, no cache, single region.
- **5 not covered** — honest blind spots, including one MUST that is also a
  release gate. Nobody has got to it and nobody has accepted it.

That last line is the one worth keeping. The format makes "we have not done
this" a first-class answer, because the alternative is people quietly omitting
the row.

## The summary cannot lie

`summary` is derived. The validator recomputes every field and rejects a
mismatch:

```
ERROR summary.covered claims 43, results give 31
ERROR summary.not_covered claims 0, results give 5
```

A report cannot claim a headline its own rows do not support. For an artifact
intended to reach a release review or an auditor, that property is the point.

## What the validator does not do

It exits 0 with uncovered MUSTs present.

Whether a claim is good enough to ship is the release owner's decision, and the
threshold behind it belongs to the adopting organisation. The tool's job is to
make the numbers true and legible, not to make the judgement.
