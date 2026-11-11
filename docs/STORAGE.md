# Separate template and personal storage

Keep the public code/template checkout and personal data separate. For new users, default to **a separate personal-data repository with a PRIVATE GitHub remote**. In filesystem mode, keep the code and data in sibling folders. Connector-only agents can instead use [direct GitHub storage](#connector-only-private-repository) without a local clone. **Local-only** storage is an explicit alternative. Resume existing instances in place; changing this recommendation does not migrate them. In filesystem mode, if GitHub is unavailable, prepare the separate local repository and explain that remote sync is pending; do not block useful authorized local saving. In connector mode, report the missing remote capability instead of silently changing storage. These are storage choices within the same agent-led setup, not new onboarding methods.

## Connector-only private repository

The portable [assistant guide](guides/ASSISTANT-GUIDE.md#direct-github-checks-and-saves) defines ongoing reads, explicit remote-write permission, server-enforced version guards, bounded conflict reconciliation and read-back. It is loaded from the host-selected template or fork at its verified source commit, never copied into new private data. Instruction source and private data destination are independent selections; see [source configuration](INSTRUCTION-SOURCE.md). The CLI remains filesystem-only: do not pass a GitHub URL to `--dest`, invent a local binding, require a durable clone, or weaken a storage guard to use the connector.

### Resume an existing remote instance

1. Obtain the selected `owner/name` and branch. Verify the authenticated account through supported service account/connection metadata (repository ownership or push permission does not identify the caller), exact repository identity, PRIVATE visibility and branch with the service. A URL, display name, cached guide or connector connection is insufficient. If caller identity is unavailable, report that specific check as pending separately from repository identity/private visibility; do not infer it from the owner or claim complete verification. Do not change visibility, permissions or repository protections to make access work.
2. Resolve the branch to a commit, inspect the selected paths' Git tree metadata there to rule out symlinks/submodules (ordinary file blob modes, not `120000` or `160000`), and fetch contents by the verified commit/blob IDs. A mutable file-content endpoint can follow a symlink introduced after the check. Repeat this path/type check at each newly fetched head during reconciliation and read-back. If the connector cannot establish safe file identity, report the verification gap rather than following a link. Read the valid `.life-profile.json` marker and data index, then only relevant notebooks/progress. Missing expected structure needs deliberate recovery, not initialization over existing data.
3. Follow the host-selected shared guide/version and the user's current authorization. New remote instances have no private guide or entry point; legacy instances remain usable with their existing workflow until a requested [reviewed migration](MIGRATIONS.md#centralized-instructions-and-data-only-instances). Preserve custom behavior in the selected fork and verify permission scope separately. Public updates and copied legacy permission prose grant no new authorization.
4. Verify connector capabilities before offering ongoing remote writes: reads exposing current versions, guarded updates and remote read-back. For multi-file corrections, prefer an atomic commit with an actual expected-head guard; otherwise verify/report each guarded sequential save separately. Follow the assistant guide on conflicts or uncertain responses. Never claim tested API behavior from local Git tests.

### Bootstrap a new private remote instance

New setup needs an explicit request to create the chosen private repository and upload the reviewed empty instance, plus a grant for subsequent personal-note uploads. An ordinary local setup request is not enough. Ask only for missing destination/scope. Use supported authenticated tools; do not invent an endpoint, manufacture access or request broader account authority.

1. **Pin the generic source.** Read the selected template or fork's setup guidance and initializer manifest in `tools/setup-storage.mjs` at one reviewed source commit. Prepare the same empty instance that `init` produces, not a copy of the whole public repository. If an ephemeral workspace with Node.js is available, run `init` into a new safe directory and review only its generated files. This needs no authenticated terminal Git, durable profile clone or personal local binding. All existing filesystem guards still apply to that staging step.
2. **For a connector-only host with no terminal,** use supported file-read and create/commit tools to assemble the manifest bytes from that same source commit. Copy only the initializer's explicit `FILES` list from `templates/`: 13 empty domain notebooks, `INDEX.md`, `SETUP-PROGRESS.md`, `records.json` and `export-policy.json`. Verify schema version `0.1.0`, zero record entries and zero allowed export IDs. Use the initializer's exact two-field `MARKER` content for `.life-profile.json` only for this new instance. This produces **18 persisted files** including the marker. Do not upload guides, `AGENTS.md`, loaders, source configuration or READMEs with instructions. Git cannot preserve empty directories: `drafts/` and `notes/` are optional until actual staging/note data is written; do not add instructional README or placeholder files to simulate them. This is new-instance generation, never recovery/adoption of an existing folder.
3. **Create and verify the destination.** Using a supported private-repository creation operation, create only the named PRIVATE repository, then read its identity/visibility back before uploading. Do not use “generate from template” if it copies tools/examples/history or an entire source tree. Do not initialize competing history with a generated README/license. If the target already exists, inspect it: resume a valid profile, or use the selected empty repository only when that target and its initialization are authorized. Never overwrite populated unrelated contents. Honor a different existing branch rather than guessing `main`.
4. **Upload and verify only the reviewed manifest.** Use supported guarded creation/update operations: create-if-absent paths or an expected empty/current branch head, including create-ref absence semantics for a new branch. Do not overwrite an existing file from stale source data. Prefer one guarded atomic commit of the full empty instance. Otherwise create and read back each file, and add `.life-profile.json` **last**, only after every expected file verifies. Do not upload examples, tools, Git history, raw drafts, environment files, machine bindings or personal data during bootstrap. The filesystem data-repository exclusions below are also useful if a local clone is later explicitly requested; ignore rules do not control API writes.
5. **Confirm readiness honestly.** Verify the selected remote branch has the expected data-only manifest contents, empty register/export allowlist and valid marker. Compare bytes/hashes with the pinned source, not only a successful commit response. If interrupted, inspect what this authorized bootstrap actually created and resume only missing verified steps; do not call an incomplete repository initialized or blindly recreate it. An unknown/uncertain result must be inspected before retrying. If a required operation is unavailable, report the exact missing capability and completed steps. Offer a supported user-assisted creation/upload or ephemeral generation route, but do not switch backend without agreement.

Only after remote readiness and note-upload authorization are established should the interview begin. Use the [activation checklist](guides/ASSISTANT-GUIDE.md#activate-ongoing-use-during-setup) to retain both instruction source/version and data repository/branch through an authorized supported host mechanism, not inside the private data. A connector is a storage backend, not a host-loading hook. Report remote readiness, verified saves and activation separately; no later Git push is needed for direct API commits. A fresh agent given a locator tests guide behavior, not installed automatic loading.

## First-time checklist

The checklist below is for filesystem mode.

These are implementation steps for the agent in the same guided setup. Prerequisites: Node.js 20+, file-write access and a terminal; Git for a data repository; an already-authorized GitHub connector or `gh` only if choosing GitHub. No npm installation or server is required.

Before running setup helpers, verify their code and data-template bytes match the selected instruction-source commit as required by [source selection](INSTRUCTION-SOURCE.md). Preserve dirty/unrelated checkout edits; use a separate verified clean snapshot or report the mismatch. Run `node --version` and, for repository storage, `git --version`. Run every `node tools/...` command from the **code checkout root**, not the personal-data directory. Use `git -C` for commands targeting the other repository. Replace example paths with the user's selected absolute path and quote paths with spaces. POSIX examples below work in Linux/macOS/WSL; on Windows use a full drive path such as `"D:\Profiles\personal-data"`, not a UNC path. An accepted path alone does not establish private storage.

First inspect whether `.life-profile.local.json` or the selected profile already exists; do not print its personal contents. `status` succeeds only for a valid existing selected instance. A fresh checkout with neither binding nor `private/` is expected to fail `status`: choose one of the creation cases below. If a binding or directory already exists but status fails, use [recovery](#recover-a-missing-or-invalid-binding), not creation.

### A. New separate personal-data directory/repository (default)

Choose a new sibling directory, normally `life-profile-personal` next to the tools checkout; its parent must already exist outside other Git trees. Replace `/absolute/new-personal-data` below with that actual absolute path. Verify the agent has write access to it. **Do not pre-create the destination or clone an empty repository into it.**

```sh
node tools/setup.mjs init --dest "/absolute/new-personal-data"
git -C "/absolute/new-personal-data" init
node tools/setup.mjs bind --dest "/absolute/new-personal-data"
node tools/setup.mjs status
```

Expected: status reports `mode: "external"` and the selected path. Skip `git init` if only a separate non-Git directory is wanted. This creates no GitHub repository or remote and uploads nothing. Before any personal-data commit, configure the data repository's own exclusions and review its files as described below. Continue with [private GitHub setup](#create-the-private-github-remote-and-first-push) to complete the default path. Bare `init` still selects `private/` when unbound; the explicit destination above is required for this default guided flow.

### B. New local-only profile (explicit alternative)

Only when there is no binding and `private/` does not exist:

```sh
node tools/setup.mjs init
node tools/setup.mjs status
```

Expected: init reports `initialized: true`, zero records and zero allowed export IDs; status reports `mode: "local"` and the checkout's `private/` path. Then begin the interview and verify actual Markdown saves. No personal Git repository is created. In a Git checkout also verify `git check-ignore -v private/records.json` matches `/private/` and `git ls-files -- private` is empty; for an extracted archive there is no Git index to inspect.

### C. Existing personal-data instance or repository

An existing folder must contain its valid `.life-profile.json` instance marker and profile files. For a previously cloned personal repository, bind it directly; do not run init again:

```sh
node tools/setup.mjs bind --dest "/absolute/existing-personal-data"
node tools/setup.mjs status
node tools/profile.mjs validate "/absolute/existing-personal-data/records.json"
```

For an existing default local `private/`, run status and resume without binding. An arbitrary folder, empty clone or missing/invalid marker is not an initialized instance. Preserve it and diagnose the situation; do not delete it to make init succeed or manufacture a marker. For an existing populated local profile that you want to relocate, follow [deliberate migration](#move-existing-data-deliberately-without-a-mirror).

## Binding behavior

`init` never overwrites an existing folder. Bind validates its marker and storage boundary, not the truth of its facts or absence of secrets. It does not initialize Git, create remotes or upload anything.

Binding stores only `data_directory` in the ignored `.life-profile.local.json` at the code checkout root. Do not commit that machine-specific file. `status` validates the selected instance and prints its local path; keep output private. `save` and `check-draft` may omit `--dest` when a binding exists. An explicit `--dest` overrides selection but does not permit an unbound Git repository. `init` with no destination selects the binding too and refuses to overwrite it. Malformed or unsafe configuration fails closed rather than silently falling back to a different profile.

`bind` may select a validated external non-Git instance or a standalone Git repository. Only the exact bound root may contain its own real `.git` directory. Code checkout descendants/ancestors, other Git ancestors, nested Git repositories on an accessed path, `.git` contents, path traversal, symlinks/junctions and Git worktree/submodule gitfiles remain forbidden. A bound target that later becomes unsafe is refused. If the bound directory disappears, implicit `init` fails; it never silently replaces missing data with an empty profile. Shared Git common directories, alternate object stores and linked core metadata are unsupported in v1. No storage guard is removed for the default private subtree.

Repeated binding to the same path is harmless. `node tools/setup.mjs unbind` only removes the selection and returns to the default local path; it never deletes either instance. Concurrent helper configuration writes use an exclusive lock. Do not remove another running process's lock. Inspect stale lock/pending files after interruption before retrying. Ordinary file edits still require agent readback and preservation of concurrent changes; this is not an OS sandbox.

## Recover a missing or invalid binding

If status fails with a binding present, stop collecting new answers until the intended destination is established. Do not run init at the missing path: that would risk starting a different empty profile. A moved, disconnected or unavailable data directory should first be located or made accessible again.

- If the same valid instance moved, verify it and run `bind --dest "/absolute/verified-location"`, then status and read-only record validation. Rebinding does not move data.
- If the config JSON is malformed but is a normal untracked local file, `unbind` can remove the selection. Then bind the verified existing instance. Do not guess a replacement path.
- To return deliberately to an existing default `private/`, run `unbind`, then status. If that folder is absent, unbind still succeeds but status fails; no profile has been restored or created.
- A linked/tracked configuration, invalid marker or unsafe Git layout needs diagnosis, not deletion or weaker guards. Preserve existing files. Config lock/pending errors may indicate another helper is active; do not remove a live lock.

Returning to an older copy after new answers were saved elsewhere requires reconciliation first; switching a path is not a merge or restore operation.

## Create the private GitHub remote and first push

The agent performs initial identity and destination verification using the already-authorized GitHub connection before creating or configuring a remote. Confirm the signed-in account, intended owner/repository, and **PRIVATE** visibility; compare the actual fetch and push remote URLs with that repository. Public forks are not a private storage option. Never put personal data in the public template repository or change its visibility.

Useful read-only checks with GitHub CLI are `gh api user --jq .login`, `gh repo view OWNER/REPO --json nameWithOwner,visibility,url,sshUrl`, and `git -C /absolute/personal-data remote -v`. Do not guess the owner or repository identity. If credentials or authorization are unavailable, finish local setup and report the missing connection; do not manufacture credentials or grant permissions.

Before the first personal-data commit/upload, review the intended file set for credentials, sensitive data, raw imports, temporary files and accidental exports. Exclude secrets, environment files, keys, logs and temporary/lock files in the data repository's own ignore rules; the template's ignore rules do not apply to its sibling. Use explicit reviewed paths rather than blind `git add .`. Store no credential in the local binding or remote URL. A heuristic scan is not proof that arbitrary prose contains no sensitive content. Exclude sensitive personal information and credentials entirely, as required by the profile privacy rules; never commit them. A private repository is access-controlled hosting, not encryption or a permanent privacy guarantee.

After verification and authorization, normal Git operations apply in the **data** directory. For example, inspect `git -C "/absolute/personal-data" status --short`, stage only reviewed paths with `git -C "/absolute/personal-data" add -- domains/basic.md`, and inspect `git -C "/absolute/personal-data" diff --cached --stat` before committing. Actual commit/push requires the user's authorization and reviewed destination; these examples do not grant it. Avoid printing private diffs into public conversations or PRs.

There is no prescribed data-repository branch name: use the existing branch rather than assuming `main`. A new repository also needs the user's Git author configuration before its first commit; do not invent their identity. Configure a verified remote only as part of an authorized GitHub setup. Ordinary commit/push/pull then apply. There is no custom per-push API check or background synchronization. Recheck destination/visibility when the remote, account, collaborators or repository visibility change. Git history retains earlier versions after a working-file deletion. Local export policy remains unchanged: data-repository permission does not authorize other exports, publishing or messages.

### Complete the first upload

When the user sends the README private-repository setup prompt, it explicitly authorizes private repository creation and reviewed profile commits/pushes. The local-only variant does not; honor the actual request rather than treating the README itself as authorization. Honor that authorization without asking for every command. For a request limited to local saves, obtain authorization before creating a remote or uploading. Ask only for genuinely missing owner/repository or Git author details; never invent them. The placeholders below must be replaced with the selected identity, absolute path and verified URLs.

1. In the initialized data repository, inspect `git config user.name` and `git config user.email` using `git -C "/absolute/personal-data"`. If absent, ask for the user's Git author name and email (a user-selected GitHub noreply email is fine), then set them with repository-local `git config user.name "<chosen-name>"` and `git config user.email "<chosen-email>"`. Do not change global Git configuration.
2. Create or merge a `.gitignore` in the **data** repository with these exclusions; preserve existing rules:

   ```gitignore
   .env
   .env.*
   *.pem
   *.key
   *.log
   *.tmp
   .setup.lock
   .records.pending
   .life-profile.local.json
   .life-profile.local.json.lock
   .life-profile.local.json.pending
   drafts/*
   exports/
   backups/
   node_modules/
   ```

   Do **not** ignore `.life-profile.json`: this instance marker must travel with the profile. Do not ignore all JSON or all hidden files. Ignore rules do not remove already tracked files; inspect the index as well. They are exclusions, not a sensitive-content detector.
3. Review the files and stage the initialized profile explicitly. For a fresh instance, the following list includes its marker, notebooks, progress data and empty export policy. Inspect directory contents before staging them; for an existing instance use only reviewed paths appropriate to its contents.

   ```sh
   git -C "/absolute/personal-data" status --short --untracked-files=all
   git -C "/absolute/personal-data" add -- .gitignore .life-profile.json INDEX.md records.json export-policy.json SETUP-PROGRESS.md domains/
   git -C "/absolute/personal-data" diff --cached --stat
   git -C "/absolute/personal-data" diff --cached --check
   git -C "/absolute/personal-data" commit -m "Initialize private Life Profile"
   ```

   Review staged content locally as well as the file list; do not paste personal diffs into public logs or issues. Keep `export-policy.json` unchanged. Do not commit if there are no staged changes.
4. After verifying the signed-in identity and selected owner/name, create an **empty private remote** and connect it. Do not add a GitHub-generated README, license or template, which would create competing history. With an authorized GitHub CLI session:

   ```sh
   gh api user --jq .login
   gh repo create OWNER/REPO --private --source "/absolute/personal-data" --remote origin
   gh repo view OWNER/REPO --json nameWithOwner,visibility,url,sshUrl
   git -C "/absolute/personal-data" remote -v
   ```

   Verify `PRIVATE` and that both remote URLs target the selected repository **before pushing**. This intentionally separates creation from upload. If the repo already exists, inspect its identity, visibility and history instead of recreating it. For a verified empty remote, use `git remote add origin "<verified-clone-url>"` in the data repo; if `origin` already exists, inspect it rather than overwriting it. For a populated personal repository, use the clone/resume flow and reconcile any separate local notes before uploading.
5. Push the current branch and set its upstream, without assuming a branch name:

   ```sh
   git -C "/absolute/personal-data" push -u origin HEAD
   git -C "/absolute/personal-data" fetch origin
   git -C "/absolute/personal-data" status --short --branch
   git -C "/absolute/personal-data" rev-list --left-right --count "HEAD...@{upstream}"
   ```

   A successful push, clean working tree, and `0 0` comparison after fetch establish that this branch is synchronized at the time checked. A failed push means the local commit exists but remote sync is incomplete. Report that distinction. After the interview has added notes, use the everyday workflow below to upload those new saves too.

For filesystem mode, if using a GitHub connector or the website to create the remote instead of `gh`, create the same empty **private** repository, verify the account and destination, add its verified clone URL as the data repo's remote, and perform the same Git push/checks. If authentication is unavailable, leave the separate local repository intact and state what remains pending. Do not silently select another account or public destination.

## Everyday sync

This section is for filesystem profiles with a local Git repository. Direct GitHub saves already commit remotely; use the guarded connector workflow above instead of adding a push step. Preserve any existing user-authorized routine-sync policy.

Ask the agent: “Sync my Life Profile with its verified private repository.” That request authorizes the necessary reviewed Git commits, pulls and pushes to that destination. It does not authorize public sharing, changing export policy or uploading excluded content. There is no background synchronization; a local notebook save is not a remote backup.

Before a session, sync so the agent reads current notes. After a session, sync again before switching devices. Use one device at a time when practical. In the **personal-data repository**:

1. Inspect `git status --short --branch`, `git remote -v` and the current branch/upstream. Verify destination/visibility during initial setup and whenever the destination or access changes. Stop if a merge/rebase is already in progress or the branch is detached. If no upstream exists, finish the first-push workflow rather than guessing one.
2. If local edits exist, review them and commit only intended non-sensitive profile paths. Preserve unrelated changes; do not blindly stage everything or auto-stash them. For example, after reviewing a changed preference and progress note:

   ```sh
   git -C "/absolute/personal-data" add -- domains/preferences.md SETUP-PROGRESS.md
   git -C "/absolute/personal-data" diff --cached --stat
   git -C "/absolute/personal-data" diff --cached --check
   git -C "/absolute/personal-data" commit -m "Update profile notes"
   ```

   Adapt the paths to the actual changes, including reviewed deletions. Skip the commit when nothing changed. If unrelated uncommitted files remain, resolve their handling before pulling.
3. With a clean working tree, pull and push:

   ```sh
   git -C "/absolute/personal-data" pull --ff-only
   git -C "/absolute/personal-data" push
   git -C "/absolute/personal-data" fetch origin
   git -C "/absolute/personal-data" status --short --branch
   git -C "/absolute/personal-data" rev-list --left-right --count "HEAD...@{upstream}"
   ```

   These examples use `origin` from initial setup; use the verified upstream remote if the existing repository uses another name. Stop at the first failed command. If both devices made commits, `pull --ff-only` may refuse divergent history. Preserve both sides, compare the affected notes and reconcile deliberately; clarify genuinely conflicting facts. Never reset, force-push or discard notes to make sync pass. Retry verification after reconciliation. Authentication/network failures leave local saves intact; report sync as pending.
4. Report success only after successful remote operations, a clean working tree and `0 0` ahead/behind. If offline, say “saved locally; not synced” and retry later.

## Resume on another device

For connector mode, authorize the new host's connector access, verify the same repository/branch, load the separately configured instruction source/version and repeat host activation. No clone or local binding is required. The remaining steps here are for filesystem mode.

First sync the old device if available. Only pushed files can arrive on the new device; unpushed notes remain on the old device. Use a coding agent or personal AI agent with persistent file access, Node.js 20+ and Git in the new workspace, then authenticate to the GitHub account with access to the private repository. For a cloud-hosted agent, run the following commands in its persistent workspace; the folders need not be on the device used to chat with it. Verify its owner/name and private visibility.

From an existing parent directory outside other Git trees, clone the selected instruction repository and data repository into two new sibling folders. Verify and select the externally configured source commit before running helpers; a fresh default-branch checkout is not a substitute for an existing pin. Replace both URLs with their independently verified destinations:

```sh
git clone "<verified-template-or-fork-clone-url>" life-profile
git clone "<verified-private-repository-clone-url>" life-profile-personal
cd life-profile
node tools/setup.mjs bind --dest "/absolute/path/to/life-profile-personal"
node tools/setup.mjs status
node tools/profile.mjs validate "/absolute/path/to/life-profile-personal/records.json"
```

Use the actual absolute data path on this device; it may differ from the old one. Do **not** run `init` on the clone. The committed `.life-profile.json` marker and profile files make it an existing instance. The ignored `.life-profile.local.json` binding belongs only to this tools checkout, so create it separately on every device. If the marker or required files are missing, recover them from the original instance/history; do not manufacture a marker or initialize over the clone.

Expected: status reports `mode: "external"` and the cloned data path, validation succeeds, and the notes/progress match the last pushed session. An empty `records.json` is normal; Markdown contains the usable profile. Give your agent access to both folders, including write access to the data folder, then paste:

```text
Continue my Life Profile in <absolute-personal-folder> using the tools at
<absolute-tools-folder>. Use my separately configured instruction source/version,
not a newly pulled branch as a substitute for my pin. Read its AGENTS.md and
docs/AI-SETUP.md at that verified source commit.
Sync with its verified private repository before reading my notes; I authorize
the reviewed Git operations for that destination. Resolve any sync failure
before claiming the notes are current. Read progress and relevant notebooks,
avoid known or skipped questions, and save useful non-sensitive answers as we go.
Do not initialize a new profile, publish it, or change export policy.
```

After selecting the cloned instance, repeat the [ongoing-use activation check](guides/ASSISTANT-GUIDE.md#activate-ongoing-use-during-setup) for this host. A status copied from another device does not verify its path or instruction loading here. Configure only the requested host scope and preserve custom instructions.

If the tools or data clone already exists, inspect and update it instead of cloning over it. If offline, explain that only the locally available version can be resumed. Sync after the session before returning to the other device.

## Move existing data deliberately, without a mirror

The agent handles copying; the user does not need to copy folders manually. Before changing a live binding:

1. Report the exact source, new destination, scope and rollback plan. Stop concurrent profile writes and make a recoverable owner-protected local backup. Do not copy an existing `.git`, credentials or unrelated files blindly.
2. Copy the reviewed instance to a new external directory without overwriting anything. Reject links and unsafe files. Compare the copied file set and hashes, including the instance marker, register and export policy; verify source hashes still match the copy before activation. If data changed, stop and reconcile instead of switching.
3. Initialize Git in that new directory if requested, then bind and run `status` plus read-only profile validation. Verify the public repository still tracks no personal files. Do not automatically commit or push the copy.
4. Keep the old directory and backup untouched for rollback. Before new edits, `unbind` returns to the default; if the previous selection was external, re-bind its recorded path. After new edits, reconcile/copy them safely before switching back, or rollback would lose access to the latest changes. No automatic deletion or two-way synchronization is installed.

The copy is a one-time migration, not a snapshot mirror. After acceptance, the external directory becomes the single active profile. Archive/remove old copies only through a separate deliberate cleanup.

## Template updates and data migrations

For updates, inspect each repository's status first and preserve local edits. From a clean code checkout, `git pull --ff-only` updates the template. Separately, `git -C "/absolute/personal-data" pull --ff-only` updates personal history only if that repository has a configured upstream. A local-only repository needs no pull. Stop and reconcile divergent history or local changes; do not reset, force-push or overwrite notes to make an update work. Template updates do not overwrite private data, copied legacy guides or custom behavior. A configured source pin stays at its exact commit after a pull; only an explicitly selected tracking branch can select a new verified commit next session. For a fork, review/integrate upstream changes deliberately and update the host source selection within authorization. Keep generic/custom behavior in the selected fork, not the private data or a second host manual. Use [reviewed migration](MIGRATIONS.md#centralized-instructions-and-data-only-instances) for old private guides; no automatic deletion or permission expansion occurs. Schema version 0.1.0 and the strict two-field marker remain unchanged. A future schema migration needs its own backup, validation and rollback; never run it implicitly during a pull or bind. Keep export policy unchanged unless separately authorized.
