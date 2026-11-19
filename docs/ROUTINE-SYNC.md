# Reviewed Git sync for a bound private profile

Use this workflow when the host has authorized routine Git sync to an existing private GitHub.com repository and branch. Start in the verified instruction checkout with Node.js 20+, Git 2.38+ and an authenticated GitHub CLI. The tools checkout must already bind the selected external data clone. Supply the account login, exact owner/repository and branch from the host’s independent selection on every call. The helper checks the current branch, its upstream and the remote’s effective fetch/push URLs. Network operations use canonical GitHub HTTPS, the selected GitHub CLI account and current private-repository metadata.

**Give every active writer its own standalone data clone and separately bound tools checkout.** Reserve that clone for the writer from the first read through verified sync. The helper lock serializes helper commands. Editors, notebook saves and other Git commands can operate between calls. A shared tools binding, shared writable checkout, linked worktree or an editor using another session’s clone cannot provide this isolation. If a dedicated clone is unavailable, leave concurrent editing pending. Use the existing [resume flow](STORAGE.md#resume-on-another-device) to prepare a second clone within the user's authorized scope.

## Session start

1. From the bound tools checkout, run the following before reading notes for an edit. Substitute the approved identifiers for the three placeholders.

   ```sh
   node tools/routine-sync.mjs inspect "<account>" "<owner/repo>" "<branch>"
   ```

2. `synced` means an authenticated fetch found a clean working tree and equal local and upstream commits. For `behind`, `ahead` or `diverged`, the helper returns immutable `base`, `local` and `remote` commit IDs. Privately inspect **every** incoming and outgoing commit since the base, including intermediate file versions, deletions, conflict resolutions and commit messages that a push will upload. Check changed filenames first. Read the affected hunks and relevant surrounding facts only in the authorized private environment. Keep notebook text, paths, diffs and Git diagnostics out of public logs. Preserve source labels, corrections and [privacy exclusions](PRIVACY.md).
3. Compare the meaning of both sides. A line added to one notebook can contradict a correction in another. For compatible edits, supply those same reviewed IDs. A behind-only branch fast-forwards. An ahead-only branch pushes the reviewed history. Compatible divergence produces one merge commit retaining both parents. The helper preflights the combined tree and checks its register before merging. If the proposed content is ambiguous, keep both versions and ask one focused question. A textual conflict leaves the working tree untouched for deliberate private reconciliation.

   ```sh
   node tools/routine-sync.mjs apply "<account>" "<owner/repo>" "<branch>" "<reviewed-local-id>" "<reviewed-remote-id>"
   ```

4. The helper attempts at most one normal push per call. With a clean worktree, a subsequent authenticated fetch that matches the local head establishes sync **at that check**. A new competing commit requires a fresh inspection. Allow at most one newly reviewed retry per sync checkpoint. Stop after repeated contention. Leave local work in place and report sync pending.

## After a local save

Review the smallest eligible diff, verify the saved content by reading it back and choose its exact paths. The local commit command has no network step. It accepts `INDEX.md`, `SETUP-PROGRESS.md`, `records.json` and ordinary non-executable Markdown files with simple lowercase, digit and hyphen names in `domains/` or `notes/`. For example:

```sh
node tools/routine-sync.mjs commit "<account>" "<owner/repo>" "<branch>" domains/preferences.md
```

The helper requires an empty staging area and uses a neutral commit message. Unrelated unstaged files stay in the working tree and prevent integration. Preserve an existing staged change for its owner; never clear the index or auto-stash to make sync pass. Skip the commit when nothing changed. Run `inspect` and, once reviewed, `apply` as above. The helper checks file paths and modes across committed history as well as the register structure. The agent judges privacy and semantic compatibility. Routine commits cannot change the instance marker, export policy, custom instruction files, raw drafts or other files outside the reviewed scope.

## Pending work and recovery

- `REVIEW_STALE`, `PUSH_PENDING` or `VERIFY_PENDING` can follow a race or a lost response. Inspect first to establish whether the commit already arrived. Follow the one-retry bound. A failed or uncertain push can still leave a complete local commit.
- For `AUTH_PENDING`, `FETCH_PENDING`, destination mismatch, branch protection or service unavailability, keep the local notes/commit and report remote sync pending. Restore access to the selected account/repository and repeat inspection before retrying. Keep branch protections intact.
- For a textual or factual conflict, retain both commits. Once the intended wording is known, reconcile the reviewed parents in the exclusive clone using an ordinary merge, inspect the full result privately, validate records and commit only the resolution. Rerun the helper on the new local and remote tips. A genuinely ambiguous fact or instruction needs clarification. Deletion-versus-edit needs deliberate review of whether the deletion should survive.
- For `CLONE_BUSY` or `INTEGRATION_PENDING`, preserve the index, worktree and both histories. A running helper owns its lock. After an interruption, first confirm exclusive ownership and that every prior helper has exited. Inspect local status and any unfinished Git operation privately. Resume a known reviewed resolution or leave pending for its owner. Remove only the stale `.git/life-profile-sync.lock` after confirming its owner has exited. Never discard uncommitted files, auto-abort another operation or force-push.
- A protected path in either history or an unsafe file blocks routine integration. Preserve the existing files. A separately authorized migration or deliberate recovery may be needed. A local commit does not authorize changing visibility, policy or destination.

Direct pushes suit occasional small, reviewed updates where the upstream branch allows them. When concurrent edits routinely exhaust the retry bound, or branch rules require independent review, use agent-specific branches and one authorized integration process after agreeing the new workflow with the user. The integrator still reviews conflicting facts across files. Pull requests help when a reviewer actually resolves ambiguity; they add little to an occasional compatible update.

This helper covers existing Git-backed filesystem profiles. Initial repository creation and the connector-only backend retain their [storage procedures](STORAGE.md). Existing private copies of instructions retain their selected workflow until a [reviewed migration](MIGRATIONS.md#centralized-instructions-and-data-only-instances).
