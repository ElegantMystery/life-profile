# Optional structured-save inputs

Ordinary setup writes useful non-sensitive answers directly to Markdown. Those notebooks are the usable local profile, even when `records.json` is empty. No item-by-item approval is needed for either Markdown or structured saving. This folder is only an implementation staging area for the optional JSON register, not a user review queue.

Filter sensitive personal/security content before writing any input file. Do not retain raw imports or transcripts. Use an opaque lowercase filename such as `basic.json`; letters, digits and hyphens only, starting with a letter. Never include personal identifiers in filenames.

```json
{
  "draft_version": "0.1.0",
  "entries": []
}
```

The empty envelope illustrates the format; saving requires at least one entry. Entries use the existing register fields: id, domain, statement, source {kind, reference}, confirmation, sensitivity, subject, status, created, updated, review_due, expires and supersedes. See schema/README.md in the tools checkout. Do not invent fields or source dates.

Input entries use `confirmation: pending`, `status: active` and `sensitivity: private`. Pending here means not yet registered, not awaiting user approval. Sensitive and unknown sensitivity labels are refused; arbitrary prose still needs agent filtering. Creation/update dates cannot be future dates. Label AI-generated statements `ai_inference`; user answers/corrections are `user_statement`. Preserve uncertainty. Do not require source forms from the user.

```sh
node tools/setup.mjs save --dest "<absolute-private-folder>" --draft basic.json
```

This validates and saves all entries directly. An optional `--ids "<id>,<another-id>"` selects a subset as an agent implementation detail. No previous check, digest, approval flag or user confirmation exchange is required. `check-draft` is optional read-only validation/debugging and returns candidate IDs. The removed `confirm --approve` flow must not be reintroduced by older copied guides.

Saved direct user statements become `confirmed`; AI/third-party/unknown-source claims stay `pending` as evidence labels, with no consent gate. Source kinds and uncertainty remain intact. Use a new ID with explicit `supersedes` targets for a direct correction; the tool retires those active records and preserves old provenance. Duplicate IDs/text, unknown fields and ambiguous supersession fail. Unresolved semantic conflicts require a focused question; do not blindly replace an explicit user fact with an inference.

Saving leaves notebooks, the input batch and export policy unchanged. The agent can remove its own completed staging batch after a successful verified save rather than accumulating transcripts. Never resubmit saved IDs; create a fresh batch for remaining/new items. Do not delete pre-existing user files during cleanup. File locks, link checks and concurrent-register checks remain active. After interruption, inspect the register and pending files; never steal a live lock.

No local save grants permission to export, publish, contact others or perform unrelated actions.
