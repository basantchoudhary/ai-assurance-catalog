#!/usr/bin/env node
/*
 * One-shot importer: lifts the case data out of the draft-0.1 HTML page and
 * writes it back out as the normative YAML catalog.
 *
 * Assigns flat AAC-#### identifiers in draft order and demotes the old
 * archetype-scoped identifier (C-01, A6-05) to `legacy_id`, so the already
 * published draft stays traceable. Run once; after that the YAML is the master.
 */
const fs = require("fs");
const path = require("path");

const SRC = process.argv[2];
const OUT = path.join(__dirname, "..", "catalog");
if (!SRC) { console.error("usage: import-from-draft.js <draft.html>"); process.exit(1); }

const html = fs.readFileSync(SRC, "utf8");

function block(name) {
  const start = html.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`could not find ${name}`);
  const eq = html.indexOf("=", start) + 1;
  const open = html[html.indexOf(html.slice(eq).match(/[\[{]/)[0], eq)];
  const close = open === "[" ? "]" : "}";
  let depth = 0, i = html.indexOf(open, eq);
  for (; i < html.length; i++) {
    if (html[i] === open) depth++;
    else if (html[i] === close) { depth--; if (depth === 0) break; }
  }
  return html.slice(html.indexOf(open, eq), i + 1);
}

const C = (id, level, dim, title, text, mech, stage, tool, gate) =>
  ({ id, level, dim, title, text, mech, stage, tool, gate });
const ARCH = eval("(" + block("ARCH") + ")");
const CASES = eval("(" + block("CASES") + ")");

// ---- YAML emitter: block scalars for prose, so nothing needs escaping ----
const seq = (a) => a.map((x) => `\n  - ${x}`).join("");
function folded(text, indent = "  ") {
  // literal block, newline-stripped; safe for arbitrary punctuation
  return `|-\n${indent}${text}`;
}

let n = 0;
const index = [];
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const a of ARCH) {
  for (const c of CASES[a.id]) {
    n += 1;
    const id = `AAC-${String(n).padStart(4, "0")}`;
    const archetypes = a.id === "CORE" ? ARCH.filter(x => x.id !== "CORE").map(x => x.id) : [a.id];
    const y =
`# ${id} — ${c.title}
# Normative. Edit here; the rendered site is generated from this file.
id: ${id}
legacy_id: ${c.legacy || c.id}
status: active
since: "0.1.0"

level: ${c.level}
dimension: ${c.dim}
gate: ${c.gate}

# Applies to these archetypes. CORE cases list every archetype explicitly
# rather than relying on an inheritance keyword, so a consumer never has to
# resolve the taxonomy to know whether a case applies.
archetypes:${seq(archetypes)}
core: ${a.id === "CORE"}

title: ${folded(c.title)}

statement: ${folded(c.text)}

# Realization is advisory: it names the class of machinery that can discharge
# the obligation, never a product. See docs/REALIZATION.md.
mechanisms:${seq(c.mech)}
stages:${seq(c.stage)}
tool_class: ${folded(c.tool)}

# Crosswalks to external frameworks live in /crosswalks, keyed by this id.
`;
    fs.writeFileSync(path.join(OUT, `${id}.yaml`), y);
    index.push({ id, legacy: c.id, arch: a.id, level: c.level, gate: c.gate, dim: c.dim });
  }
}

fs.writeFileSync(
  path.join(__dirname, "..", "catalog-index.json"),
  JSON.stringify({ count: index.length, cases: index }, null, 2) + "\n"
);

const gates = index.filter((x) => x.gate).length;
const musts = index.filter((x) => x.level === "MUST").length;
console.log(`wrote ${index.length} cases -> ${OUT}`);
console.log(`  MUST: ${musts}   SHOULD: ${index.filter(x=>x.level==="SHOULD").length}   MAY: ${index.filter(x=>x.level==="MAY").length}`);
console.log(`  gates: ${gates}`);
console.log(`  core: ${index.filter(x=>x.arch==="CORE").length}`);
