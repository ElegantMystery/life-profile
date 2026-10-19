# Private structured proposals

Drafts are not confirmed records and are not export inputs. Never put personal draft content in the public template checkout. Use a new lowercase opaque filename, such as `basic.json`; letters, digits and hyphens only, starting with a letter. No paths or identifiers about real people in filenames.

The draft envelope is distinct from the register:

```json
{
  "draft_version": "0.1.0",
  "entries": []
}
```

An empty draft is a format illustration, not a valid confirmation candidate. Each candidate uses all the existing register fields: id, domain, statement, source {kind, reference}, confirmation, sensitivity, subject, status, created, updated, review_due, expires and supersedes. Refer to schema/README.md in the tools checkout for enums and date rules.

Candidates must have `confirmation: pending`, `status: active` and sensitivity `private`, `sensitive` or `unknown`. Use `private` unless a stricter/unknown label is appropriate. Creation and update dates cannot be in the future. Source kind and uncertain wording must reflect evidence. Null review/expiry dates are permitted, but a null review date makes a record ineligible for export.

Use a new opaque ID. `supersedes` may name only existing active register IDs and must be explicitly reviewed; it is not a general merge command. Two candidates cannot retire the same old ID. Do not include already-confirmed candidates in a later proposal. Do not silently overwrite drafts or treat stored drafts as consent.

From the tools checkout:

```sh
node tools/setup.mjs check-draft --dest "<absolute-private-folder>" --draft basic.json
node tools/setup.mjs confirm --dest "<absolute-private-folder>" --draft basic.json --ids "<approved-id>" --approve "<approval-digest>"
```

The digest binds the exact draft and current register bytes. Present the full selected statements and metadata to the person before using it. Multiple approved IDs are comma-separated. The command preserves source kind, marks selected entries confirmed and retires only their explicit supersession targets. It leaves notes, draft files and export permissions unchanged. A caller can misuse the command; it does not authenticate consent.

After confirmation, retain or remove drafts according to the person's choice. They can contain private information even though they are excluded from exports. If a write is interrupted, inspect the register, `.setup.lock` and `.records.pending`; do not blindly rerun, steal a live lock or discard recoverable content.
