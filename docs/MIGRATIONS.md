# Versioning and portability

Project and register version: 0.1.0. Each register and export policy explicitly declares `schema_version`. Unknown versions fail validation; there is no silent coercion or automatic migration.

Keep Markdown as UTF-8 and JSON as UTF-8 without comments. IDs are stable, lowercase opaque identifiers; do not encode names or dates of birth. All date-only values use YYYY-MM-DD and UTC boundaries. Null review/expiry values mean unspecified, not permanently safe to share.

For a future migration: record source/target versions; create a protected backup with a deletion schedule; convert a copy; preserve IDs, provenance, uncertainty, confirmation and supersession; validate and compare entry counts and exclusions; inspect diffs; test exports; then replace the active instance. Retain the original until verified and deliberately expire its backup. A migration must never promote inference to fact or private to shareable.

No schema conversion is needed for this version. The legacy-guide tools below change only the instruction layout. JSON Schema describes shape; the local validator additionally checks dates, ordering and references. New domains or fields require a versioned schema/tool update. Human notebooks remain usable independently of these tools.

## Basic notebook filename

New instances use `domains/basic.md` instead of `domains/stable-profile.md`. The structured-record domain remains `stable-profile`, and schema/instance versions remain 0.1.0. Existing private files, records and links are not changed automatically. If you choose to rename an existing notebook, back it up and update that instance's index and any local links deliberately; do not rerun initialization over an existing folder. The new default location likewise does not move an existing external instance.

## Centralized instructions and data-only instances

New initialization stores data/state only; old instances are not transformed by `init`, `bind`, normal saves or public updates. The strict two-field marker remains `{ "instance_version": "0.1.0", "kind": "life-profile-private" }`. Do not add instruction-source fields to it. The storage tools continue accepting existing markers and do not require an `AGENTS.md` or guide. Retain existing workflows until the user requests a reviewed switch.

Migration is never automatic. A requested switch needs these explicit steps, with local or guarded remote edits as appropriate:

1. Stop competing edits and identify the current authorized host/data scope. Inspect only the selected legacy instruction files and relevant state. Make a protected recoverable backup within authorization; do not publish a migration diff containing personal information.
2. Review custom behavior, restrictions, routine-sync policy and exclusions. Move generic/customized behavior into the selected template fork, not a private override file or duplicate host manual. Sanitize it: no private facts, credentials, private locators or personal data may enter a public fork. If customization cannot be safely separated, leave migration pending instead of publishing it or dropping it. Creating/publishing a fork needs its own authorization.
3. Verify actual local/remote-write permissions from the user's current authorization. Legacy prose and saved activation status are not new grants. Preserve restrictions; clarify uncertain scope rather than inferring broader permission. Retain only source/data locators, granted scope and startup loading in the host's supported settings. Higher-priority host/platform rules remain intact.
4. Select and verify the fork/template commit (pinned default) or explicitly chosen tracking branch, then install the authorized binding outside private data. Verify its read-back. Test a fresh ordinary-task session; report pending/session-only when this cannot be done. Until the shared source and necessary custom behavior are ready, keep the legacy workflow rather than running two conflicting instruction authorities.
5. Preserve notebooks, index data, progress, skipped topics, record IDs/provenance and export policy. Compare before/after bytes or reviewed diffs. Blank/template instruction prose may be interleaved with real notes: never strip whole sections without reviewing them. Do not reinitialize, reset, rewrite history or assume any file is safe to delete.
6. Only after the user authorizes the specific cleanup, retire obsolete private `AGENTS.md`, copied guides/loaders/configuration and generic boilerplate with guarded recoverable changes and read-back. Keep any mixed custom/data content until separated and verified. A migration is not complete data-only storage while legacy instruction copies remain; report that cleanup pending honestly. Keep the protected original until the new workflow is verified and its retention/cleanup is deliberately decided.

This is an instruction-layout change, not a data-schema or export-policy migration. Public compatibility pointers do not update private copies. A fresh worker given both locators proves only guide consumption, not host persistence. See [source versions, fork tradeoffs and unavailable-source behavior](INSTRUCTION-SOURCE.md).

### Filesystem: check, review, retire

From the verified tools checkout, run `node tools/setup.mjs migration-check --dest "/absolute/instance"` (or omit `--dest` for the selected instance). Normal `status` also flags known legacy paths without reading their contents. Existing instance/binding guards still apply. The command is read-only: it checks the marker and reports only known guide paths and SHA-256 digests, never their text. Keep the report private. **legacy-review-required** means a candidate exists, not that its contents are disposable. **no-known-legacy-guides** is not proof of activation: check the host's existing loader configuration for other custom paths. No recursive notebook or account scan is needed. Normal notebook preferences, progress and export policy are data and are never candidates.

Review each candidate against the old template in private. Preserve stricter custom rules in the selected fork or host permission scope and test them before switching. Keep mixed personal content in the private instance: if separating it would require a notebook change, get that change reviewed separately; otherwise leave that file pending. Confirm the exact source repository, commit, host binding and actual permissions with the user. Stop on unavailable, incompatible or unverified sources; never fall back to a different version or execute a legacy file to finish the migration.

After the six steps above, stop all writers, including sync clients, and use a new owner-protected backup directory **outside** the instance and all repositories, on suitable storage. On POSIX create it with mode 0700; on Windows verify its ACL. Review/authorize the exact file and digest first. For each reviewed file run:

```sh
node tools/setup.mjs retire-guide --dest "/absolute/instance" --guide ASSISTANT-GUIDE.md \
  --sha256 "<digest-from-review>" --backup "/absolute/protected-backup" \
  --source-checkout "/absolute/verified-instruction-checkout" --source-commit "<full-reviewed-commit>"
```

The helper checks that the three canonical entry points are ordinary blobs at the supplied commit. This is a layout check, not proof of repository identity, compatible custom behavior, host installation, or permission to upload. The host must verify those separately. The helper copies the original bytes exclusively into the backup, checks them, rechecks the original digest, and only then unlinks that one file. It never changes host settings, notebooks, Git history or remote state. It refuses links, arbitrary filenames, stale reviews and backup collisions. Independent file operations require exclusive access; this is not an OS sandbox or multi-file transaction. Stop on any error, inspect the actual files before retrying, and never overwrite an earlier backup.

Rerun the check and verify the data/state against the pre-migration snapshot. Remove old host references to private guides on **each** host: future sessions must load only the selected canonical source. If anything fails, pause maintenance. Restore each missing guide byte-for-byte from its named backup (nested names use `--` for `/`, e.g. `notes--README.md`); create the destination only if absent, never overwrite concurrent edits. Verify its original digest and restore the previously reviewed host binding/scope before resuming. Do not roll back unrelated data. Commit/push cleanup or restoration only within actual repository write scope.

### Direct GitHub: same review, guarded retirement

No filesystem CLI, clone or local backup path is required. Follow [connector identity and read-back checks](STORAGE.md#connector-only-private-repository). At one verified private branch head, check the marker, then look for ordinary blobs at `AGENTS.md`, `ASSISTANT-GUIDE.md`, `IMPORT-GUIDE.md`, `START-HERE.md`, `drafts/README.md` and `notes/README.md`. Use complete tree metadata: an absent path in a truncated listing is unknown. Refuse links, submodules and unsafe ancestors. Record the reviewed paths, blob IDs and original commit privately; ensure that snapshot is recoverable. Review customization and host activation exactly as above, independently of remote write permission.

With explicit cleanup scope, retire **only** those reviewed blob versions. Prefer one deletion commit based on the reviewed parent with a server-guarded branch update. If only per-file expected-blob deletion is available, verify each deletion and the remaining snapshot before proceeding; stop on concurrent edits or uncertain results. Never implement a guard as a client-side read followed by an unconditional write. If guarded deletion or read-back is unavailable, report cleanup pending and leave existing files alone. Verify the resulting tree at its commit: the only changes are the approved deletions, data blob IDs and modes are unchanged, and fresh host startup resolves just the selected source. For rollback, use a new guarded commit restoring missing paths from the reviewed parent blobs, preserving intervening changes. Never reset or force-push the branch. If restoration would overwrite new content, stop for review.
