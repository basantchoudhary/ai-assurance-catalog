# Contributing

Read [docs/NON-GOALS.md](docs/NON-GOALS.md) first. Most rejected proposals are
rejected on scope, not quality.

## Proposing a new case

A case is in scope when all four hold:

1. It states an obligation **no existing case already covers**. Search
   `catalog/` before writing.
2. It names at least one **archetype** that owes it.
3. At least one **mechanism** could realistically produce a verdict. An
   obligation nobody can test is a principle, and principles belong in the
   frameworks this catalog cites.
4. It is **falsifiable without a threshold**. If the case only means something
   once a number is attached, the number belongs to the adopter and the case
   does not belong here.

Out of scope by construction: restating a threat from OWASP or ATLAS, naming a
product, setting a threshold, or anything at model rather than application level.

### Writing the statement

Plain English, addressed to an architect. State what must be true, then why it
matters — the second half is what makes a reviewer able to judge whether the case
earns its place.

Prefer the failure that is *invisible without the test*. "Accuracy is measured"
is weak. "Accuracy is reported per slice, because an aggregate that hides a
broken segment is worse than no score" is a case.

Do not name products. The linter fails the build on it.

### Mechanics

Copy an existing file in `catalog/`, take the **next** sequential identifier —
never fill a gap, there are none — and run:

```bash
npm run lint
```

New cases are additive and ship in a MINOR release. See
[docs/VERSIONING.md](docs/VERSIONING.md).

## Changing an existing case

Clarifications, added mechanisms or stages, and widened archetype tags may be
edited in place.

Anything that changes **what the case obliges you to do** — narrowing scope,
raising `level`, flipping `gate` on — is a supersession, not an edit. Mark the
original `superseded`, list the successor in `superseded_by`, and issue a new
identifier. Identifiers are cheap. Broken citations are not.

Full rules in [docs/ID-POLICY.md](docs/ID-POLICY.md).

## Crosswalks

Mappings to external frameworks live in `crosswalks/`, keyed by case identifier
and released out of band from the catalog.

Two constraints, one legal and one substantive:

- **Cite identifiers, never reproduce text.** ISO standards are copyrighted and
  paywalled; clause numbers may be referenced, control text may not be quoted.
  EU AI Act text is public, NIST AI RMF is freely redistributable, OWASP is
  Creative Commons. Four frameworks, four different legal shapes in one
  directory — check before quoting anything.
- **Mappings are many-to-many and usually coarse.** ISO 42001 controls govern
  *processes*; a case is at best **evidence supporting** a control, never
  equivalent to one. Claiming a one-to-one mapping is the fastest way to be
  dismissed by the first auditor who reads it.

## Reporting a gap

Gaps are as valuable as cases. If you ran the catalog against a real system and
something it should have caught was missing, open an issue with the archetype
and what failed in production. Incidents are the best source of new cases, and
running the catalog against an established threat list is free coverage
validation — the first OWASP crosswalk pass already surfaced three missing
obligations.

## Reviewing

Every case merges with a reviewer who is not the author. The reviewer's job is
the four scope tests above, in order, before considering the prose.
