# Minimal-context exports

The exporter accepts an explicit profile and policy path; it never discovers your home folder, reads Markdown, follows provenance links, uploads, or installs integrations. It reads only the two supplied JSON files and writes to stdout. Input paths can be outside the project, and operating-system symbolic links are resolved normally: this tool is not a filesystem sandbox. Use trusted local paths and check where they point. Shell output redirection is controlled by you; never redirect over either input file.

```sh
node tools/profile.mjs export examples/fictional/records.json examples/fictional/policy.json
node tools/profile.mjs export examples/fictional/records.json examples/fictional/policy.json --as-of 2026-10-17
```

The optional date is for reproducible tests/history only. Never use an old date to bypass current review or expiry. Normal exports use today's UTC date. Standard output contains JSON; redirecting it creates a sensitive copy you must manage. Errors go to stderr without profile content; invalid input produces no export.

A policy contains only `schema_version`, a nonempty `purpose` and an `allow_ids` array. Empty allowlists produce an empty export. Unknown IDs, duplicates, unknown keys and malformed profiles fail, rather than silently widening the scope.

Selected records still must be active, confirmed, user-stated, about self, labeled public or general, created and updated no later than the export date, not due for review and not expired. A non-null review date is mandatory for eligibility. Sensitive/private/unknown labels, AI inferences, third-party reports, unknown subjects, pending/disputed statements and superseded/archived entries are always excluded. **There is no unsafe override in V0.1.** Health and finance domains are always excluded regardless of label.

Only ID, domain, statement and review/expiry dates are emitted. Sources, source references, timestamps and supersession history stay private. Output includes purpose, export date and a no-authority reminder. Purpose itself is shared: do not place sensitive details there.

Before sharing, read every emitted value, verify it serves this recipient and task, check indirect identifiers and instructions hidden in prose, and set a disposal date with the recipient. The tool cannot recognize all personal data or enforce use, deletion, access permissions or AI behavior. Never share a full private instance merely because a tool asks for more context.

## Optional structured register and exports

This section concerns the separately curated `records.json`, not a prerequisite for saving notebook answers. For ordinary notes, follow the [assistant guide](../templates/ASSISTANT-GUIDE.md). Do not automatically synchronize notes into it. When structured records are useful, use the [direct-save contract](../templates/drafts/README.md); the answer itself is sufficient, not an approval token. Preserve schema, supersession and concurrent-write validation. Local saving never grants sharing permission; leave export policy unchanged unless separately instructed.

Review the content before reuse or export, validate the register, and select explicit IDs for a named purpose. Renew dates only after checking the claim. Retire outdated context; preserve only useful non-sensitive history. Private notebooks are never automatically imported or exported.

## Contradictions and supersession

Do not choose the newest statement automatically. Mark conflicting entries disputed (or keep new drafts pending), remove them from export policies and ask the person to resolve the difference. Scope differences explicitly, such as work versus leisure.

An explicit user correction resolves the difference without another approval. Create a new entry whose `supersedes` contains the old ID; mark the old entry `superseded`. Keep original creation/provenance, update its modified date, and explain the correction in a private notebook. The validator checks reference integrity; it cannot detect semantic contradictions. A superseded entry cannot be exported. An inference remains an inference even if confirmed: restate as a new user statement when appropriate.

## Notebook record block

Only if maintaining a structured claim alongside notes, this optional reference block may help (not parsed by the tool). It is not needed for ordinary notebook saves:

- Record ID:
- Statement or event:
- Source kind (user statement / AI inference / third-party report / unknown):
- Source reference (minimal, private):
- Confirmation (pending / confirmed / disputed):
- Sensitivity (unknown / public / general / private / sensitive):
- Created / updated (YYYY-MM-DD):
- Review due / expires (YYYY-MM-DD or none):
- Supersedes / conflicting IDs:
- Correction rationale:

Use the JSON register as the authoritative sharing decision. If it differs from the notebook, pause sharing and reconcile; there is no automatic synchronization.
