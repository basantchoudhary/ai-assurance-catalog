/*
 * junit XML -> partial coverage results.
 *
 * Translation only. This reads what a test runner already produced; it never
 * runs anything and never decides whether a result is acceptable.
 *
 * A test declares which obligation it discharges in one of two ways, checked in
 * this order:
 *
 *   1. A recorded property (preferred, unambiguous):
 *        def test_max_steps(record_property):
 *            record_property("aac", "AAC-0055")
 *      emits <property name="aac" value="AAC-0055"/>
 *
 *   2. An identifier anywhere in the test or class name:
 *        def test_aac_0055_max_steps(): ...
 *
 * Both forms accept several identifiers for one test. The property form is
 * preferred because a rename cannot silently break the link.
 */
const { XMLParser } = require("fast-xml-parser");

const ID = /AAC[-_]?(\d{4})/gi;

const ids = (s) => {
  if (!s) return [];
  const out = new Set();
  for (const m of String(s).matchAll(ID)) out.add(`AAC-${m[1]}`);
  return [...out];
};

const arr = (x) => (x === undefined ? [] : Array.isArray(x) ? x : [x]);

function extract(xml, opts = {}) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
  const doc = parser.parse(xml);

  // A junit file is either <testsuites><testsuite>… or a bare <testsuite>.
  const suites = doc.testsuites ? arr(doc.testsuites.testsuite) : arr(doc.testsuite);
  const results = [];

  for (const suite of suites) {
    for (const tc of arr(suite && suite.testcase)) {
      const name = tc["@name"] || "";
      const cls = tc["@classname"] || "";
      const props = arr(tc.properties && tc.properties.property);

      // Property form wins; fall back to scanning identifiers in the names.
      const declared = props.filter((p) => (p["@name"] || "").toLowerCase() === "aac");
      const cases = declared.length
        ? declared.flatMap((p) => ids(p["@value"]))
        : [...new Set([...ids(name), ...ids(cls)])];
      if (!cases.length) continue;

      // Per-test overrides, so a repository can mix mechanisms in one suite.
      const prop = (k) => {
        const p = props.find((x) => (x["@name"] || "").toLowerCase() === k);
        return p ? String(p["@value"]).split(/[,\s]+/).filter(Boolean) : null;
      };

      const outcome =
        tc.error !== undefined ? "error"
        : tc.failure !== undefined ? "fail"
        : tc.skipped !== undefined ? "unknown"
        : "pass";

      const ref = cls ? `${cls}::${name}` : name;
      for (const c of cases) {
        results.push({
          case: c,
          outcome,
          mechanisms: prop("aac.mechanism") || opts.mechanisms || ["M1"],
          stages: prop("aac.stage") || opts.stages || ["S2"],
          evidence: [{ type: "test", ref }],
          ...(outcome === "fail" || outcome === "error"
            ? { note: String((tc.failure && (tc.failure["@message"] || tc.failure)) || (tc.error && (tc.error["@message"] || tc.error)) || "").trim().slice(0, 300) || undefined }
            : {}),
        });
      }
    }
  }
  return results;
}

module.exports = { name: "junit", extract };
