#!/usr/bin/env node
/*
 * Renders the catalog to a single self-contained HTML page.
 *
 * The YAML in catalog/ is the master. This file produces a build artifact and
 * nothing in site/ should ever be edited by hand.
 *
 * Horizontal code only: this reads the catalog and writes a document. It does
 * not evaluate anything. See docs/NON-GOALS.md.
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = path.join(__dirname, "..");
const load = (p) => yaml.load(fs.readFileSync(path.join(ROOT, p), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

const arch = load("taxonomy/archetypes.yaml");
const real = load("taxonomy/realization.yaml");

const cases = fs
  .readdirSync(path.join(ROOT, "catalog"))
  .filter((f) => f.endsWith(".yaml"))
  .sort()
  .map((f) => yaml.load(fs.readFileSync(path.join(ROOT, "catalog", f), "utf8")))
  .filter((c) => c.status === "active");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const patDir = path.join(ROOT, "patterns");
const patterns = !fs.existsSync(patDir) ? [] : fs
  .readdirSync(patDir)
  .filter((f) => f.endsWith(".yaml"))
  .sort()
  .flatMap((f) => {
    const d = yaml.load(fs.readFileSync(path.join(patDir, f), "utf8"));
    return d.patterns.filter((p) => p.status === "active").map((p) => ({ ...p, domain: d.domain }));
  });

const data = {
  version: pkg.version,
  archetypes: arch.archetypes,
  mechanisms: real.mechanisms,
  stages: real.stages,
  levels: real.levels,
  dimensions: real.dimensions,
  cases: cases.map((c) => ({
    id: c.id, legacy: c.legacy_id, level: c.level, dim: c.dimension, gate: c.gate,
    core: c.core, arch: c.archetypes, title: c.title.trim(), text: c.statement.trim(),
    mech: c.mechanisms, stage: c.stages, tool: c.tool_class.trim(),
  })),
};

const CSS = `
:root{
  --paper:#F1F2ED; --surface:#FBFBF8; --sunk:#E9EBE3;
  --ink:#141917; --ink-2:#4E5852; --ink-3:#7C8781;
  --rule:#D3D7CC; --rule-2:#C0C6B8;
  --accent:#2C5D4A; --accent-soft:#DDE8E1;
  --must:#9E3B22; --should:#8A6608; --may:#5F6B65;
  --must-bg:#F4E2DC; --should-bg:#F2EAD3; --may-bg:#E6E9E3;
  --serif:ui-serif,Charter,"Iowan Old Style","Source Serif Pro",Georgia,serif;
  --mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  --sans:system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#0E1211; --surface:#151A18; --sunk:#111614;
  --ink:#E6EAE4; --ink-2:#A2ADA6; --ink-3:#78837D;
  --rule:#28302C; --rule-2:#333D38;
  --accent:#74B294; --accent-soft:#1A2A22;
  --must:#E2896C; --should:#D2A63F; --may:#94A19A;
  --must-bg:#2B1A15; --should-bg:#2A2313; --may-bg:#1D2320;
}}
:root[data-theme="dark"]{
  --paper:#0E1211; --surface:#151A18; --sunk:#111614;
  --ink:#E6EAE4; --ink-2:#A2ADA6; --ink-3:#78837D;
  --rule:#28302C; --rule-2:#333D38;
  --accent:#74B294; --accent-soft:#1A2A22;
  --must:#E2896C; --should:#D2A63F; --may:#94A19A;
  --must-bg:#2B1A15; --should-bg:#2A2313; --may-bg:#1D2320;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:0 28px}
.prose{max-width:68ch}
p{margin:0 0 1em}
a{color:var(--accent);text-underline-offset:3px}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:2px}
code{font-family:var(--mono);font-size:.86em;background:var(--sunk);padding:.1em .35em;border-radius:3px}
.mast{border-bottom:1px solid var(--rule);background:var(--surface)}
.mast .wrap{padding-top:52px;padding-bottom:40px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0 0 20px;display:flex;gap:14px;flex-wrap:wrap}
.eyebrow span:not(:first-child){color:var(--ink-3)}
h1{font-family:var(--mono);font-weight:600;font-size:clamp(30px,4.6vw,48px);line-height:1.08;letter-spacing:-.025em;margin:0 0 22px;text-wrap:balance;max-width:20ch}
.standfirst{font-size:20px;line-height:1.5;color:var(--ink-2);max-width:62ch;margin:0 0 28px}
.meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:32px}
.meta-grid div{background:var(--surface);padding:12px 14px}
.meta-grid dt{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:0 0 4px}
.meta-grid dd{margin:0;font-family:var(--mono);font-size:13px}
section{padding:56px 0;border-bottom:1px solid var(--rule)}
.snum{font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--accent);text-transform:uppercase;display:block;margin-bottom:12px}
h2{font-family:var(--mono);font-weight:600;font-size:clamp(21px,2.6vw,28px);letter-spacing:-.015em;margin:0 0 18px;text-wrap:balance}
h3{font-family:var(--mono);font-weight:600;font-size:16px;margin:0}
.lede{font-size:19px;color:var(--ink-2);max-width:64ch;margin:0 0 26px}
.note{border-left:3px solid var(--accent);background:var(--surface);padding:16px 20px;margin:26px 0;max-width:68ch}
.note p:last-child{margin-bottom:0}
.note .tag{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:6px}
.tbl-scroll{overflow-x:auto;margin:22px 0;border:1px solid var(--rule);background:var(--surface)}
table{border-collapse:collapse;width:100%;min-width:560px;font-family:var(--sans);font-size:14px}
th{font-family:var(--mono);font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-3);text-align:left;padding:11px 14px;border-bottom:1px solid var(--rule);font-weight:600}
td{padding:11px 14px;border-bottom:1px solid var(--rule);vertical-align:top;color:var(--ink-2);line-height:1.5}
tr:last-child td{border-bottom:none}
td.k{font-family:var(--mono);font-size:12.5px;color:var(--ink);white-space:nowrap;font-weight:600}
.arch-list{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:28px}
.arch{background:var(--surface);padding:18px 20px;display:grid;grid-template-columns:64px 1fr auto;gap:18px;align-items:start}
.arch .aid{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--accent);padding-top:2px}
.arch .abody strong{display:block;font-family:var(--mono);font-size:15px;margin-bottom:4px}
.arch .abody p{margin:0;font-size:15.5px;color:var(--ink-2);line-height:1.55;max-width:60ch}
.arch .abody em{color:var(--ink-3);font-style:normal;font-family:var(--mono);font-size:12.5px;display:block;margin-top:6px}
.arch .acount{font-family:var(--mono);font-size:11px;color:var(--ink-3);text-align:right;white-space:nowrap;padding-top:4px}
.arch .acount b{display:block;font-size:19px;color:var(--ink)}
@media(max-width:660px){.arch{grid-template-columns:1fr;gap:8px}.arch .acount{text-align:left}}
.controls{position:sticky;top:0;z-index:30;background:var(--paper);padding:14px 0 12px;border-bottom:1px solid var(--rule)}
.tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.tabs button{font-family:var(--mono);font-size:11.5px;cursor:pointer;background:var(--surface);color:var(--ink-2);border:1px solid var(--rule);padding:6px 11px;border-radius:2px}
.tabs button:hover{border-color:var(--rule-2);color:var(--ink)}
.tabs button[aria-selected="true"]{background:var(--accent);border-color:var(--accent);color:var(--surface)}
.filterbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.filterbar input[type=search]{font-family:var(--sans);font-size:13.5px;padding:7px 11px;flex:1 1 230px;background:var(--surface);border:1px solid var(--rule);color:var(--ink);border-radius:2px}
.filterbar label{font-family:var(--mono);font-size:11.5px;color:var(--ink-2);display:flex;gap:6px;align-items:center;cursor:pointer;white-space:nowrap}
.filterbar .count{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);margin-left:auto}
.grouphdr{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;padding:34px 0 12px;border-bottom:1px solid var(--rule-2)}
.grouphdr .gid{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--accent);text-transform:uppercase}
.grouphdr .ghint{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);margin-left:auto}
.cases{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);border-top:none}
.case{background:var(--surface);padding:16px 18px;display:grid;grid-template-columns:1fr 268px;gap:26px}
@media(max-width:820px){.case{grid-template-columns:1fr;gap:12px}}
.case .lhs{min-width:0}
.caseline{display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px}
.cid{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--ink)}
.legacy{font-family:var(--mono);font-size:10px;color:var(--ink-3)}
.lvl{font-family:var(--mono);font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;padding:2px 6px;border-radius:2px;font-weight:600}
.lvl.MUST{color:var(--must);background:var(--must-bg)}
.lvl.SHOULD{color:var(--should);background:var(--should-bg)}
.lvl.MAY{color:var(--may);background:var(--may-bg)}
.dim{font-family:var(--mono);font-size:10.5px;color:var(--ink-3)}
.case h5{margin:0 0 5px;font-family:var(--serif);font-size:17px;font-weight:600;line-height:1.4;color:var(--ink)}
.case p{margin:0;font-size:15px;line-height:1.55;color:var(--ink-2);max-width:58ch}
.rhs{border-left:1px solid var(--rule);padding-left:22px;display:flex;flex-direction:column;gap:9px}
@media(max-width:820px){.rhs{border-left:none;border-top:1px dashed var(--rule);padding-left:0;padding-top:12px}}
.slot{display:grid;grid-template-columns:52px 1fr;gap:9px;align-items:start}
.slot .sk{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);padding-top:3px}
.chips{display:flex;flex-wrap:wrap;gap:4px}
.chip{font-family:var(--mono);font-size:11px;padding:2px 7px;border-radius:2px;background:var(--accent-soft);color:var(--accent);border:1px solid transparent;cursor:help;white-space:nowrap}
.chip.n{background:var(--sunk);color:var(--ink-2);border-color:var(--rule)}
.chip.gate{background:var(--must-bg);color:var(--must)}
.empty{background:var(--surface);border:1px solid var(--rule);padding:34px;text-align:center;font-family:var(--mono);font-size:13px;color:var(--ink-3)}
.matrix{overflow-x:auto;margin:26px 0;border:1px solid var(--rule);background:var(--surface)}
.matrix table{min-width:720px;font-family:var(--mono);font-size:12px}
.matrix th.rot{white-space:nowrap;font-size:9.5px;padding:11px 6px;text-align:center}
.matrix td{text-align:center;padding:7px 6px;font-variant-numeric:tabular-nums}
.matrix td:first-child,.matrix th:first-child{text-align:left;padding-left:14px;white-space:nowrap}
.matrix td:first-child{color:var(--ink);font-weight:600}
.cell{display:inline-block;min-width:22px;padding:2px 0;border-radius:2px}
.cell.on{background:var(--accent-soft);color:var(--accent);font-weight:600}
.cell.off{color:var(--ink-3);opacity:.4}
ul.plain{margin:16px 0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:12px;max-width:68ch}
ul.plain li{position:relative;padding-left:26px;color:var(--ink-2);font-size:16px;line-height:1.55}
ul.plain li::before{content:"—";position:absolute;left:0;top:0;color:var(--accent);font-family:var(--mono);font-size:13px;line-height:1.9}
ul.plain li strong{color:var(--ink)}
footer{padding:40px 0 64px;color:var(--ink-3);font-family:var(--mono);font-size:12px;line-height:1.7}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

const CLIENT = `
const D = window.__AAC__;
const MECH_LABEL = Object.fromEntries(D.mechanisms.map(m => [m.id, m.name]));
const STAGE_LABEL = Object.fromEntries(D.stages.map(s => [s.id, s.name]));
const ARCH_NAME = Object.fromEntries(D.archetypes.map(a => [a.id, a.name]));
const core = D.cases.filter(c => c.core);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");

document.getElementById("m-arch").textContent = D.archetypes.length;
document.getElementById("m-cases").textContent = D.cases.length;
document.getElementById("m-core").textContent = core.length;
document.getElementById("m-gate").textContent = D.cases.filter(c => c.gate).length;

document.getElementById("arch-list").innerHTML = D.archetypes.map(a => {
  const n = D.cases.filter(c => !c.core && c.arch.includes(a.id)).length;
  return \`<div class="arch"><div class="aid">\${a.id}</div>
    <div class="abody"><strong>\${esc(a.name)}</strong><p>\${esc(a.summary)}</p>
    <em>\${a.examples.map(esc).join(" · ")}</em></div>
    <div class="acount"><b>\${n}</b>added cases</div></div>\`;
}).join("");

const tabs = document.getElementById("tabs");
tabs.innerHTML = [\`<button role="tab" data-a="ALL" aria-selected="true">All \${D.cases.length}</button>\`,
  \`<button role="tab" data-a="CORE" aria-selected="false">Core · every shape</button>\`]
  .concat(D.archetypes.map(a => \`<button role="tab" data-a="\${a.id}" aria-selected="false">\${a.id} · \${esc(a.name)}</button>\`)).join("");

let sel = "ALL";
const q = document.getElementById("q"), mustonly = document.getElementById("mustonly"), gateonly = document.getElementById("gateonly");
const chip = (cls, txt, title) => \`<span class="chip \${cls}" title="\${esc(title)}">\${esc(txt)}</span>\`;

function caseHTML(c){
  return \`<article class="case" id="\${c.id}">
    <div class="lhs"><div class="caseline">
      <span class="cid">\${c.id}</span>
      \${c.core ? chip("","core","Owed by every archetype") : c.arch.map(a => chip("", a, ARCH_NAME[a])).join("")}
      <span class="lvl \${c.level}">\${c.level}</span><span class="dim">\${c.dim}</span>
      \${c.legacy ? \`<span class="legacy">was \${c.legacy}</span>\` : ""}
    </div>
    <h5>\${esc(c.title)}</h5><p>\${esc(c.text)}</p></div>
    <div class="rhs">
      <div class="slot"><span class="sk">Mech</span><span class="chips">\${c.mech.map(m => chip("", m, MECH_LABEL[m])).join("")}</span></div>
      <div class="slot"><span class="sk">Stage</span><span class="chips">\${c.stage.map(s => chip("n", s, STAGE_LABEL[s])).join("")}</span></div>
      <div class="slot"><span class="sk">Tool</span><span class="chips">\${chip("n", c.tool, "Tool class, never a product")}</span></div>
      <div class="slot"><span class="sk">Gate</span><span class="chips">\${c.gate ? chip("gate","Blocks release/request","Failure stops the deploy or the request") : chip("n","Alert only","Raises a signal, does not block")}</span></div>
    </div></article>\`;
}

function render(){
  const term = q.value.trim().toLowerCase();
  const pass = c => {
    if (mustonly.checked && c.level !== "MUST") return false;
    if (gateonly.checked && !c.gate) return false;
    if (term && !(c.id + " " + c.title + " " + c.text + " " + c.dim + " " + c.tool + " " + (c.legacy||"")).toLowerCase().includes(term)) return false;
    return true;
  };
  let out = "", shown = 0;
  const groups = sel === "ALL"
    ? [["CORE", "Core — owed by every shape", core]].concat(D.archetypes.map(a => [a.id, a.name, D.cases.filter(c => !c.core && c.arch.includes(a.id))]))
    : sel === "CORE"
      ? [["CORE", "Core — owed by every shape", core]]
      : [["CORE", "Core — owed by every shape", core],
         [sel, ARCH_NAME[sel], D.cases.filter(c => !c.core && c.arch.includes(sel))]];

  for (const [gid, gname, list0] of groups){
    const list = list0.filter(pass);
    if (!list.length) continue;
    shown += list.length;
    const inherited = sel !== "ALL" && sel !== "CORE" && gid === "CORE";
    out += \`<div class="grouphdr"><span class="gid">\${gid}</span><h3>\${esc(gname)}</h3>
      <span class="ghint">\${inherited ? "inherited in full by " + sel : list.length + " case" + (list.length === 1 ? "" : "s")}</span></div>
      <div class="cases">\${list.map(caseHTML).join("")}</div>\`;
  }
  document.getElementById("catalog-out").innerHTML = out || '<div class="empty">No cases match that filter.</div>';
  document.getElementById("count").textContent = shown + " shown";
}

tabs.addEventListener("click", e => {
  const b = e.target.closest("button[data-a]"); if (!b) return;
  sel = b.dataset.a;
  [...tabs.querySelectorAll("button")].forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
  render();
});
[q, mustonly, gateonly].forEach(el => el.addEventListener("input", render));
render();

const rows = D.archetypes.map(a => [a.id + " " + a.name, D.cases.filter(c => !c.core && c.arch.includes(a.id))]);
rows.push(["CORE (all shapes)", core]);
let mt = \`<table><thead><tr><th>Archetype</th>\${D.dimensions.map(d => \`<th class="rot">\${d}</th>\`).join("")}<th class="rot">total</th></tr></thead><tbody>\`;
for (const [label, list] of rows){
  const counts = D.dimensions.map(d => list.filter(c => c.dim === d).length);
  mt += \`<tr><td>\${esc(label)}</td>\${counts.map(n => \`<td><span class="cell \${n?"on":"off"}">\${n||"·"}</span></td>\`).join("")}<td><span class="cell on">\${list.length}</span></td></tr>\`;
}
document.getElementById("matrix").innerHTML = mt + "</tbody></table>";
`;

const mechRows = real.mechanisms.map((m) => `<tr><td class="k">${m.id}</td><td><strong>${esc(m.name)}</strong></td><td>${esc(m.summary)}</td></tr>`).join("");
const stageRows = real.stages.map((s) => `<tr><td class="k">${s.id}</td><td><strong>${esc(s.name)}</strong></td><td>${esc(s.summary)}</td></tr>`).join("");
const levelRows = real.levels.map((l) => `<tr><td class="k"><span class="lvl ${l.id}">${l.id}</span></td><td>${esc(l.summary)}</td></tr>`).join("");

const html = `<title>AI Assurance Catalog</title>
<style>${CSS}</style>
<header class="mast"><div class="wrap">
  <p class="eyebrow"><span>Working draft ${data.version}</span><span>Generated from catalog/</span><span>CC BY 4.0</span></p>
  <h1>AI Assurance Catalog</h1>
  <p class="standfirst">Test obligations for AI applications, organised by architecture archetype, mapped to the machinery that can discharge them.</p>
  <div class="prose"><p>Governance frameworks say a system must be validated. Threat taxonomies say what can go wrong. Telemetry conventions say how to record a call. Metric libraries say how to score one property. None of them tell an architect, at design review: <em>you are building this shape, therefore you owe these tests.</em> That binding is what this catalog is.</p></div>
  <dl class="meta-grid">
    <div><dt>Archetypes</dt><dd id="m-arch">—</dd></div>
    <div><dt>Obligations</dt><dd id="m-cases">—</dd></div>
    <div><dt>Core (all shapes)</dt><dd id="m-core">—</dd></div>
    <div><dt>Release gates</dt><dd id="m-gate">—</dd></div>
  </dl>
</div></header>
<main>
<section><div class="wrap prose">
  <span class="snum">Section 1 — Scope</span>
  <h2>What this is, and what it refuses to be</h2>
  <p class="lede">A catalog of obligations organised by application shape, each mapped to how it can be physically realised.</p>
  <p>It is not a benchmark, a metric implementation, a control set, or a vendor comparison. It does not tell you what score is good enough — thresholds belong to you, because they depend on your risk appetite and your users. It tells you which questions you are obliged to have an answer to, and which class of machinery can produce that answer.</p>
  <p>Levels follow RFC 2119 usage and bind only within an adopting organisation.</p>
  <div class="tbl-scroll"><table><thead><tr><th style="width:110px">Level</th><th>Meaning</th></tr></thead><tbody>${levelRows}</tbody></table></div>
  <div class="note"><span class="tag">The inheritance rule</span><p>Obligations compose downward. Every archetype owes the <strong>core</strong> block in full, so each archetype section lists only what is <em>new</em> about its risk surface. That is why this is ${data.cases.length} obligations rather than several hundred.</p></div>
  <div class="note"><span class="tag">Identifiers</span><p>Identifiers are flat and permanent — archetype is metadata, never identity, so re-tagging a case never breaks a citation. Draft 0.1's archetype-scoped identifiers are shown as <code>was A6-01</code> for traceability and are not citable.</p></div>
</div></section>

<section><div class="wrap">
  <div class="prose"><span class="snum">Section 2 — Taxonomy</span>
  <h2>Ten shapes, and the compositions of them</h2>
  <p class="lede">Archetypes are distinguished by who owns control flow and what the output touches — not by domain or sector.</p>
  <p>Those two questions are what actually change the test surface. A legal summariser and a medical summariser owe identical tests; a summariser and a tool-using agent do not. Real systems are usually two or three archetypes composed: classify each component, take the union, then test the seams between them.</p></div>
  <div class="arch-list" id="arch-list"></div>
</div></section>

<section><div class="wrap">
  <div class="prose"><span class="snum">Section 3 — Realization axes</span>
  <h2>From English to machinery</h2>
  <p class="lede">Every obligation carries three tags: the mechanism that computes the verdict, the stage where it runs, and whether failure blocks.</p>
  <p>Keeping these orthogonal is the point. The same obligation — <em>output must not leak PII</em> — is a deterministic detector in CI, a blocking gateway filter at runtime, and a sampled model-graded check in production. One sentence, three realizations, different machinery. A catalog that fused them would force you to pick a vendor before you had finished thinking.</p></div>
  <div class="tbl-scroll"><table><thead><tr><th style="width:74px">Code</th><th style="width:190px">Mechanism</th><th>Good for, and where it breaks</th></tr></thead><tbody>${mechRows}</tbody></table></div>
  <div class="tbl-scroll"><table><thead><tr><th style="width:74px">Code</th><th style="width:190px">Stage</th><th>Trigger, budget, and who sees a failure</th></tr></thead><tbody>${stageRows}</tbody></table></div>
  <p class="prose" style="font-size:15.5px;color:var(--ink-2)">Tool classes name a <em>class</em>, never a product. Products date the moment the market moves, and naming one turns a neutral catalog into a recommendation — so the linter fails the build if a product name appears in an obligation.</p>
</div></section>

<section><div class="wrap">
  <div class="prose"><span class="snum">Section 4 — The catalog</span>
  <h2>Obligations, in plain English</h2>
  <p class="lede">Select a shape. Core is always owed; the archetype block is what that shape adds on top.</p></div>
  <div class="controls">
    <div class="tabs" id="tabs" role="tablist" aria-label="Archetype"></div>
    <div class="filterbar">
      <input type="search" id="q" placeholder="Filter by keyword, dimension or identifier…" aria-label="Filter obligations">
      <label><input type="checkbox" id="mustonly"> MUST only</label>
      <label><input type="checkbox" id="gateonly"> Gates only</label>
      <span class="count" id="count"></span>
    </div>
  </div>
  <div id="catalog-out"></div>
</div></section>

<section><div class="wrap">
  <div class="prose"><span class="snum">Section 5 — Coverage matrix</span>
  <h2>Which shapes carry which risks</h2>
  <p class="lede">Archetype deltas only; the core row is listed separately since it would otherwise appear in every column.</p>
  <p>Read this as a design-review heat map. A dense column for your shape is where the test budget belongs. An empty cell for a risk you know you have means the classification is wrong.</p></div>
  <div class="matrix" id="matrix"></div>
</div></section>

<section><div class="wrap">
  <div class="prose"><span class="snum">Section 6 — Patterns</span>
  <h2>Why these obligations exist</h2>
  <p class="lede">Informative. ${patterns.length} known failure shapes, each terminating in the obligations that would surface it — or declaring itself a gap.</p>
  <p>A pattern is a diagnosis, not an obligation. Keeping the two apart is what lets a case statement stay short: the pattern carries the war story so the obligation does not have to. Nothing in this section is required for conformance.</p>
  <p>The rule that earns the section: a pattern must terminate in a case identifier or state what is missing. <strong>An uncaught pattern is a hole in the catalog</strong>, not an omission in the pattern — so this doubles as coverage validation, and the linter reports every one of them rather than passing silently.</p></div>
  <div class="tbl-scroll"><table style="min-width:820px"><thead><tr>
    <th style="width:96px">ID</th><th style="width:210px">Pattern</th><th>Symptom</th><th style="width:170px">Caught by</th>
  </tr></thead><tbody>
  ${patterns.map((p) => `<tr>
    <td class="k">${p.id}</td>
    <td><strong>${esc(p.name)}</strong><br><span style="font-family:var(--mono);font-size:10.5px;color:var(--ink-3)">${esc(p.domain)} · ${p.archetypes.join(" ")}</span></td>
    <td>${esc(p.symptom.trim())}</td>
    <td>${p.caught_by.length
      ? `<span class="chips">${p.caught_by.map((c) => `<span class="chip">${c}</span>`).join("")}</span>`
      : `<span class="chip gate">gap — no case</span>`}</td>
  </tr>`).join("")}
  </tbody></table></div>
</div></section>

<section><div class="wrap prose">
  <span class="snum">Section 7 — Using it</span>
  <h2>Turning the catalog into a test plan</h2>
  <ul class="plain">
    <li><strong>Classify.</strong> Decompose the system into archetypes — most are two or three. Write the classification down; it is the assumption everything rests on and the thing most likely to be wrong.</li>
    <li><strong>Take the union.</strong> Core, plus the deltas for each archetype present, plus seam cases for every boundary between them.</li>
    <li><strong>Realize each obligation.</strong> Name the mechanism, the stage, the tool and whether it gates. An obligation with no named tool is not planned, it is aspirational.</li>
    <li><strong>Register what you will not do.</strong> Any MUST you skip becomes an explicit accepted risk with an owner and a review date. An honest gap beats a green dashboard — and under a management-system audit, an identified, owned, dated gap is conformant while an undiscovered one is a finding.</li>
    <li><strong>Bind identifiers into code.</strong> Put the case identifier in the test name and in a span attribute. Once coverage is queryable from your traces, this stops being a document and becomes a control.</li>
    <li><strong>Feed incidents back.</strong> Every production failure becomes a new frozen case tagged to the archetype that produced it.</li>
  </ul>
</div></section>
</main>
<footer><div class="wrap prose">
  <p>AI Assurance Catalog ${data.version} · generated from <code>catalog/</code> — do not edit this page by hand.<br>
  Specification CC BY 4.0 · tooling Apache 2.0 · identifiers are stable and citable from test names and span attributes.</p>
</div></footer>
<script>window.__AAC__ = ${JSON.stringify(data)};</script>
<script>${CLIENT}</script>
`;

fs.mkdirSync(path.join(ROOT, "site"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "site", "index.html"), html);
console.log(`rendered ${data.cases.length} cases -> site/index.html (${(html.length / 1024).toFixed(0)} KB)`);
