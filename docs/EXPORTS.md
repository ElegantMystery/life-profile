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
