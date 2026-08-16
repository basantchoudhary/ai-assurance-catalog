/*
 * promptfoo JSON output -> partial coverage results.
 *
 * Translation only. Reads what promptfoo already produced.
 *
 * An obligation is declared on the test case, checked in this order:
 *
 *   1. tests[].metadata.aac — "AAC-0029", or a list
 *   2. an assertion's `metric` name containing an identifier
 *   3. an identifier anywhere in the test description
 *
 * Output shape is read defensively. promptfoo has moved its envelope more than
 * once (`{results:[...]}`, `{results:{results:[...]}}`), and an adapter that
 * pins one shape breaks on upgrade for no good reason — so the row list is
 * located rather than assumed. If your version nests differently, point
 * `resultsPath` at it in aac.config.yaml rather than editing this file.
 */

const ID = /AAC[-_]?(\d{4})/gi;

const ids = (s) => {
  if (!s) return [];
  const out = new Set();
  for (const v of Array.isArray(s) ? s : [s]) {
    for (const m of String(v).matchAll(ID)) out.add(`AAC-${m[1]}`);
  }
  return [...out];
};

function locateRows(doc, resultsPath) {
  if (resultsPath) {
    return resultsPath.split(".").reduce((o, k) => (o == null ? o : o[k]), doc) || [];
  }
  const seen = new Set();
  const walk = (node, depth) => {
    if (!node || depth > 6 || seen.has(node)) return null;
    if (typeof node !== "object") return null;
    seen.add(node);
    // A results array is an array of objects carrying a success/pass verdict.
    if (Array.isArray(node)) {
      return node.length && node.some((r) => r && typeof r === "object" && ("success" in r || "pass" in r))
        ? node : null;
    }
    for (const k of ["results", "evalResults", "rows", "table"]) {
      if (node[k]) { const f = walk(node[k], depth + 1); if (f) return f; }
    }
    for (const v of Object.values(node)) { const f = walk(v, depth + 1); if (f) return f; }
    return null;
  };
  return walk(doc, 0) || [];
}

function extract(json, opts = {}) {
  const doc = typeof json === "string" ? JSON.parse(json) : json;
  const rows = locateRows(doc, opts.resultsPath);
  const results = [];

  for (const row of rows) {
    const test = row.testCase || row.test || row.vars || {};
    const asserts = row.gradingResult && Array.isArray(row.gradingResult.componentResults)
      ? row.gradingResult.componentResults : [];

    const cases = [
      ...ids(test.metadata && test.metadata.aac),
      ...(!(test.metadata && test.metadata.aac)
        ? [...asserts.flatMap((a) => ids(a.assertion && a.assertion.metric)), ...ids(test.description || row.description)]
        : []),
    ];
    const unique = [...new Set(cases)];
    if (!unique.length) continue;

    const passed = row.success !== undefined ? row.success : row.pass;
    const outcome = row.error ? "error" : passed === undefined ? "unknown" : passed ? "pass" : "fail";
    const ref = test.description || row.description || `promptfoo:${row.id || rows.indexOf(row)}`;

    for (const c of unique) {
      results.push({
        case: c,
        outcome,
        mechanisms: opts.mechanisms || ["M3"],
        stages: opts.stages || ["S3"],
        evidence: [{ type: "experiment", ref, ...(opts.url ? { url: opts.url } : {}) }],
        ...(outcome === "fail" && (row.gradingResult && row.gradingResult.reason)
          ? { note: String(row.gradingResult.reason).trim().slice(0, 300) } : {}),
      });
    }
  }
  return results;
}

module.exports = { name: "promptfoo", extract };
