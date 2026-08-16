# Identifier policy

An identifier is the only part of this catalog that can never be changed. Once
`AAC-0055` appears in someone's test name, their span attribute, or an auditor's
evidence pack, it must mean the same obligation forever.

Everything below exists to protect that.

## The rules

1. **Flat and sequential.** `AAC-` followed by four digits, zero-padded, assigned
   in order of creation. No gaps.
2. **Archetype is metadata, never identity.** A case's `archetypes` field is a
   tag list and may change between versions. The identifier may not.
3. **Never reused.** A retired number is retired permanently.
4. **Never renumbered.** Not to close a gap, not to group related cases, not to
   make the catalog tidier.
5. **Case sensitive, always four digits.** `AAC-0055`, never `AAC-55`.

The linter enforces 1, 3 and 5 on every commit.

## Why flat, when archetype-scoped identifiers read better

Draft 0.1 used archetype-scoped identifiers — `C-11`, `A6-05` — and they are
genuinely more readable. They were still the wrong choice.

An obligation can belong to more than one archetype, and which archetypes it
belongs to is exactly the kind of thing that gets corrected as the taxonomy
matures. `A6-08` — injection arriving through tool output — applies just as much
to A7 and A9. The moment that is corrected, an archetype-scoped identifier either
lies about its own scope or has to be renumbered, and renumbering breaks every
citation.

MITRE ATT&CK hit precisely this problem: a technique can belong to several
tactics, so techniques are flat (`T1059`) with tactics as metadata. CWE and CVE
made the same call. This is the one decision in a catalog that cannot be undone
later, so it is made the durable way from the start.

Readability is recovered at the presentation layer: the rendered site displays
`AAC-0055` with an `A6` chip beside it. The cost is borne by the renderer, not by
the identifier.

Draft 0.1 identifiers are retained in each case's `legacy_id` field for
traceability. They are not citable and will not be maintained.

## Lifecycle

A case has one of three statuses:

| Status | Meaning | Stays in catalog |
|---|---|---|
| `active` | Current obligation | yes |
| `deprecated` | No longer considered an obligation; nothing replaces it | yes, forever |
| `superseded` | Replaced by one or more other cases, listed in `superseded_by` | yes, forever |

Deprecated and superseded cases are **never deleted**. A citation from three
years ago must still resolve, and an auditor reading an old evidence pack must
still be able to look up what was claimed. Both statuses require `deprecated_in`
to record the version in which the change happened.

Splitting a case into two is a supersession, not an edit: the original is marked
`superseded` with both successors listed, and two new identifiers are issued.

## What may change in place

Non-breaking corrections to an active case, without a new identifier:

- Typos and clarifications to `title` or `statement` that do not change what is
  being asked for
- Adding a `mechanism`, `stage`, or widening `archetypes`
- Corrections to `tool_class`

Anything that changes **what the case obliges you to do** — narrowing scope,
raising `level`, flipping `gate` — is a supersession. If in doubt, supersede.
Identifiers are cheap; broken citations are not.
