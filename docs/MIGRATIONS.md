# Versioning and portability

Project and register version: 0.1.0. Each register and export policy explicitly declares `schema_version`. Unknown versions fail validation; there is no silent coercion or automatic migration.

Keep Markdown as UTF-8 and JSON as UTF-8 without comments. IDs are stable, lowercase opaque identifiers; do not encode names or dates of birth. All date-only values use YYYY-MM-DD and UTC boundaries. Null review/expiry values mean unspecified, not permanently safe to share.

For a future migration: record source/target versions; create a protected backup with a deletion schedule; convert a copy; preserve IDs, provenance, uncertainty, confirmation and supersession; validate and compare entry counts and exclusions; inspect diffs; test exports; then replace the active instance. Retain the original until verified and deliberately expire its backup. A migration must never promote inference to fact or private to shareable.

No migration command is shipped because this is the first version. JSON Schema describes shape; the local validator additionally checks dates, ordering and references. New domains or fields require a versioned schema/tool update. Human notebooks remain usable independently of these tools.

## Basic notebook filename

New instances use `domains/basic.md` instead of `domains/stable-profile.md`. The structured-record domain remains `stable-profile`, and schema/instance versions remain 0.1.0. Existing private files, records and links are not changed automatically. If you choose to rename an existing notebook, back it up and update that instance's index and any local links deliberately; do not rerun initialization over an existing folder. The new default location likewise does not move an existing external instance.

## Centralized instructions and data-only instances

New initialization stores data/state only; old instances are not transformed by `init`, `bind`, normal saves or public updates. The strict two-field marker remains `{ "instance_version": "0.1.0", "kind": "life-profile-private" }`. Do not add instruction-source fields to it. The storage tools continue accepting existing markers and do not require an `AGENTS.md` or guide. Retain existing workflows until the user requests a reviewed switch.

There is no automatic migration/deletion command. A requested switch needs these explicit steps, with local or guarded remote edits as appropriate:

1. Stop competing edits and identify the current authorized host/data scope. Inspect only the selected legacy instruction files and relevant state. Make a protected recoverable backup within authorization; do not publish a migration diff containing personal information.
2. Review custom behavior, restrictions, routine-sync policy and exclusions. Move generic/customized behavior into the selected template fork, not a private override file or duplicate host manual. Sanitize it: no private facts, credentials, private locators or personal data may enter a public fork. If customization cannot be safely separated, leave migration pending instead of publishing it or dropping it. Creating/publishing a fork needs its own authorization.
3. Verify actual local/remote-write permissions from the user's current authorization. Legacy prose and saved activation status are not new grants. Preserve restrictions; clarify uncertain scope rather than inferring broader permission. Retain only source/data locators, granted scope and startup loading in the host's supported settings. Higher-priority host/platform rules remain intact.
4. Select and verify the fork/template commit (pinned default) or explicitly chosen tracking branch, then install the authorized binding outside private data. Verify its read-back. Test a fresh ordinary-task session; report pending/session-only when this cannot be done. Until the shared source and necessary custom behavior are ready, keep the legacy workflow rather than running two conflicting instruction authorities.
5. Preserve notebooks, index data, progress, skipped topics, record IDs/provenance and export policy. Compare before/after bytes or reviewed diffs. Blank/template instruction prose may be interleaved with real notes: never strip whole sections without reviewing them. Do not reinitialize, reset, rewrite history or assume any file is safe to delete.
6. Only after the user authorizes the specific cleanup, retire obsolete private `AGENTS.md`, copied guides/loaders/configuration and generic boilerplate with guarded recoverable changes and read-back. Keep any mixed custom/data content until separated and verified. A migration is not complete data-only storage while legacy instruction copies remain; report that cleanup pending honestly. Keep the protected original until the new workflow is verified and its retention/cleanup is deliberately decided.

This is an instruction-layout change, not a data-schema or export-policy migration. Public compatibility pointers do not update private copies. A fresh worker given both locators proves only guide consumption, not host persistence. See [source versions, fork tradeoffs and unavailable-source behavior](INSTRUCTION-SOURCE.md).
