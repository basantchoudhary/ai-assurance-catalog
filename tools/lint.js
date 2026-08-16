#!/usr/bin/env node
/*
 * Catalog linter. Runs in CI on every change.
 *
 * Beyond schema validation this enforces the two disciplines that keep the
 * catalog a join table rather than a framework:
 *
 *   1. Identifiers are permanent. No reuse, no gaps, no renumbering.
 *   2. Normative text names no products. The catalog cites other people's
 *      work; it never restates it and never advertises for anyone.
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const Ajv = require("ajv/dist/2020");

const ROOT = path.join(__dirname, "..");
const load = (p) => yaml.load(fs.readFileSync(path.join(ROOT, p), "utf8"));

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "schema/case.schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const arch = load("taxonomy/archetypes.yaml");
const real = load("taxonomy/realization.yaml");
const ARCH_IDS = new Set(arch.archetypes.map((a) => a.id));
const DIMS = new Set(real.dimensions);
const MECH = new Set(real.mechanisms.map((m) => m.id));
const STAGES = new Set(real.stages.map((s) => s.id));

/*
 * Products that must never appear in a case's normative text. Naming a vendor
 * in an obligation turns a neutral catalog into a recommendation, and dates the
 * document the moment the market moves. Products belong only in the informative
 * realization examples, which are versioned separately.
 */
const PRODUCTS = [
  "langsmith", "langfuse", "braintrust", "phoenix", "ragas", "deepeval",
  "promptfoo", "geval", "g-eval", "litellm", "portkey", "helicone", "openai",
  "anthropic", "claude", "gpt-4", "gpt-5", "gemini", "llama", "weave", "vanta",
  "drata", "guardrails ai", "nemo", "lakera", "garak", "pyrit", "langgraph",
  "crewai", "pytest", "vitest", "label studio", "argilla",
];

const files = fs.readdirSync(path.join(ROOT, "catalog")).filter((f) => f.endsWith(".yaml")).sort();
const byId = new Map();

for (const f of files) {
  const doc = yaml.load(fs.readFileSync(path.join(ROOT, "catalog", f), "utf8"));

  if (!validate(doc)) {
    for (const e of validate.errors) err(f, `schema ${e.instancePath || "/"} ${e.message}`);
    continue;
  }
  if (`${doc.id}.yaml` !== f) err(f, `filename does not match id ${doc.id}`);
  if (byId.has(doc.id)) err(f, `duplicate id, also in ${byId.get(doc.id)._file}`);

  if (!DIMS.has(doc.dimension)) err(f, `unknown dimension "${doc.dimension}"`);
  for (const a of doc.archetypes) if (!ARCH_IDS.has(a)) err(f, `unknown archetype "${a}"`);
  for (const m of doc.mechanisms) if (!MECH.has(m)) err(f, `unknown mechanism "${m}"`);
  for (const s of doc.stages) if (!STAGES.has(s)) err(f, `unknown stage "${s}"`);

  // core is a presentational flag over an explicit archetype list; keep them honest
  const isAll = doc.archetypes.length === ARCH_IDS.size;
  if (doc.core && !isAll) err(f, "core: true but does not list every archetype");
  if (!doc.core && isAll) warn(f, "lists every archetype but core is false — intended?");

  // discipline: no vendors in normative text
  const normative = `${doc.title} ${doc.statement}`.toLowerCase();
  for (const p of PRODUCTS) {
    if (new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(normative)) {
      err(f, `product name "${p}" in normative text — cite a mechanism class instead`);
    }
  }

  // an obligation that cannot fail anywhere is not an obligation
  if (doc.gate && doc.stages.every((s) => s === "S5" || s === "S6")) {
    err(f, "gate: true but only runs at S5/S6, which never block");
  }

  doc._file = f;
  byId.set(doc.id, doc);
}

// identifiers are permanent: sequential, no gaps, no reuse
const nums = [...byId.keys()].map((id) => parseInt(id.slice(4), 10)).sort((a, b) => a - b);
nums.forEach((n, i) => {
  if (n !== i + 1) err("catalog", `id sequence breaks at AAC-${String(n).padStart(4, "0")} (expected ${i + 1})`);
});

for (const [id, doc] of byId) {
  for (const s of doc.superseded_by || []) {
    if (!byId.has(s)) err(doc._file, `superseded_by references unknown ${s}`);
  }
}

// crosswalks may only reference cases that exist
const cwDir = path.join(ROOT, "crosswalks");
if (fs.existsSync(cwDir)) {
  for (const f of fs.readdirSync(cwDir).filter((x) => x.endsWith(".yaml"))) {
    const cw = yaml.load(fs.readFileSync(path.join(cwDir, f), "utf8"));
    for (const m of cw.mappings || []) {
      for (const c of m.cases || []) {
        if (!byId.has(c)) err(`crosswalks/${f}`, `references unknown case ${c}`);
      }
    }
  }
}

// ---- report ----
const gates = [...byId.values()].filter((d) => d.gate).length;
const musts = [...byId.values()].filter((d) => d.level === "MUST").length;
const core = [...byId.values()].filter((d) => d.core).length;

console.log(`catalog: ${byId.size} cases  (${core} core, ${musts} MUST, ${gates} gates)`);
for (const w of warnings) console.log(`  warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  ERROR ${e}`);
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log("ok");
