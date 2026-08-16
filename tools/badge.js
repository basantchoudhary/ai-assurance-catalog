#!/usr/bin/env node
/*
 * Coverage report -> shields.io endpoint JSON.
 *
 *   npm run badge -- report.json > badge.json
 *
 * Publish badge.json anywhere reachable and point a shields endpoint at it:
 *   https://img.shields.io/endpoint?url=<raw url of badge.json>
 *
 * The badge shows covered/applicable, and its colour is driven by uncovered
 * MUSTs rather than by the ratio. A system at 90% coverage that is missing a
 * mandatory obligation is in a worse position than one at 60% with none
 * missing, and a badge that rewarded the ratio would say the opposite.
 */
const fs = require("fs");

const file = process.argv[2];
if (!file) { console.error("usage: badge.js <report.json>"); process.exit(2); }
const r = JSON.parse(fs.readFileSync(file, "utf8"));

const s = r.summary || {};
const n = (k) => s[k] ?? (r.results || []).filter((x) => x.status === k.replace("_", "-")).length;
const applicable = s.applicable ?? (r.results || []).length;
const covered = n("covered");
const musts = s.uncovered_musts ?? 0;
const failing = s.failing ?? 0;

const color =
  musts > 0 ? "critical"
  : failing > 0 ? "orange"
  : covered === applicable ? "brightgreen"
  : "yellow";

let message = `${covered}/${applicable}`;
if (musts) message += ` · ${musts} MUST uncovered`;
else if (failing) message += ` · ${failing} failing`;

process.stdout.write(JSON.stringify({
  schemaVersion: 1,
  label: "AI assurance",
  message,
  color,
}, null, 2) + "\n");
