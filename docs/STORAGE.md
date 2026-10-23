# Separate template and personal storage

Keep the public code/template checkout and personal data separate. For new users, default to **a separate personal-data repository with a PRIVATE GitHub remote**. Keep the code and data in sibling folders. **Local-only** storage is an explicit alternative. Resume existing instances in place; changing this recommendation does not migrate them. If GitHub is unavailable, prepare the separate local repository and explain that remote sync is pending; do not block useful local profile saving on a connection. These are storage choices within the same agent-led setup, not new onboarding methods.

## First-time checklist

These are implementation steps for the agent in the same guided setup. Prerequisites: Node.js 20+, file-write access and a terminal; Git for a data repository; an already-authorized GitHub connector or `gh` only if choosing GitHub. No npm installation or server is required.

Run `node --version` and, for repository storage, `git --version`. Run every `node tools/...` command from the **code checkout root**, not the personal-data directory. Use `git -C` for commands targeting the other repository. Replace example paths with the user's selected absolute path and quote paths with spaces. POSIX examples below work in Linux/macOS/WSL; on Windows use a full drive path such as `"D:\Profiles\personal-data"`, not a UNC path. An accepted path alone does not establish private storage.

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
   !drafts/README.md
   exports/
   backups/
   node_modules/
   ```

   Do **not** ignore `.life-profile.json`: this instance marker must travel with the profile. Do not ignore all JSON or all hidden files. Ignore rules do not remove already tracked files; inspect the index as well. They are exclusions, not a sensitive-content detector.
3. Review the files and stage the initialized profile explicitly. For a fresh instance, the following list includes its marker, notebooks, resume instructions and empty export policy. Inspect directory contents before staging them; for an existing instance use only reviewed paths appropriate to its contents.

   ```sh
   git -C "/absolute/personal-data" status --short --untracked-files=all
   git -C "/absolute/personal-data" add -- .gitignore .life-profile.json INDEX.md records.json export-policy.json ASSISTANT-GUIDE.md IMPORT-GUIDE.md START-HERE.md SETUP-PROGRESS.md domains/ notes/README.md drafts/README.md
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

If using a GitHub connector or the website instead of `gh`, create the same empty **private** repository, verify the account and destination, add its verified clone URL as the data repo's remote, and perform the same Git push/checks. If authentication is unavailable, leave the separate local repository intact and state what remains pending. Do not silently select another account or public destination.

## Everyday sync

The README ongoing-use prompt includes routine commits and sync at session start and after profile updates; no per-operation approval is needed. The self-contained [assistant guide](../templates/ASSISTANT-GUIDE.md#routine-private-repository-sync) is the authoritative routine-sync procedure, including automatic reconciliation of compatible concurrent edits. For a one-off sync, ask: “Sync my Life Profile with its verified private repository.” Both cover the necessary reviewed Git commits, pulls, merges and pushes to that destination. It does not authorize public sharing, changing export policy or uploading excluded content. There is no background synchronization; a local notebook save is not a remote backup.

Sync before using profile notes and after each batch of profile updates, rather than waiting for a session-end signal. Use a separate standalone clone per concurrently active agent, or hold exclusive access across the complete edit/sync sequence in a shared clone. The commands below show the linear-history path; use the assistant guide for divergence and bounded retries. In the **personal-data repository**:

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

   These examples use `origin` from initial setup; use the verified upstream remote if the existing repository uses another name. Stop at the first failed command. If both devices made commits, `pull --ff-only` may refuse divergent history. Preserve both sides and follow the assistant guide's reviewed merge procedure: automatically reconcile compatible edits and clarify genuinely conflicting facts. Abort a merge you started if ambiguity remains, retaining both committed versions. Never reset, force-push or discard notes to make sync pass. Retry verification after reconciliation. Authentication/network failures leave local saves intact; report sync as pending.
4. Report success only after successful remote operations, a clean working tree and `0 0` ahead/behind. If offline, say “saved locally; not synced” and retry later.

## Resume on another device

First sync the old device if available. Only pushed files can arrive on the new device; unpushed notes remain on the old device. Use a coding agent or personal AI agent with persistent file access, Node.js 20+ and Git in the new workspace, then authenticate to the GitHub account with access to the private repository. For a cloud-hosted agent, run the following commands in its persistent workspace; the folders need not be on the device used to chat with it. Verify its owner/name and private visibility.

From an existing parent directory outside other Git trees, clone into two new sibling folders:

```sh
git clone https://github.com/ElegantMystery/life-profile.git life-profile
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
<absolute-tools-folder>. Read the current AGENTS.md and docs/AI-SETUP.md.
Sync with its verified private repository before reading my notes; I authorize
the reviewed Git operations for that destination. Resolve any sync failure
before claiming the notes are current. Read progress and relevant notebooks,
avoid known or skipped questions, and save useful non-sensitive answers as we go.
Do not initialize a new profile, publish it, or change export policy.
```

If the tools or data clone already exists, inspect and update it instead of cloning over it. If offline, explain that only the locally available version can be resumed. Sync after the session before returning to the other device.

## Move existing data deliberately, without a mirror

The agent handles copying; the user does not need to copy folders manually. Before changing a live binding:

1. Report the exact source, new destination, scope and rollback plan. Stop concurrent profile writes and make a recoverable owner-protected local backup. Do not copy an existing `.git`, credentials or unrelated files blindly.
2. Copy the reviewed instance to a new external directory without overwriting anything. Reject links and unsafe files. Compare the copied file set and hashes, including the instance marker, register and export policy; verify source hashes still match the copy before activation. If data changed, stop and reconcile instead of switching.
3. Initialize Git in that new directory if requested, then bind and run `status` plus read-only profile validation. Verify the public repository still tracks no personal files. Do not automatically commit or push the copy.
4. Keep the old directory and backup untouched for rollback. Before new edits, `unbind` returns to the default; if the previous selection was external, re-bind its recorded path. After new edits, reconcile/copy them safely before switching back, or rollback would lose access to the latest changes. No automatic deletion or two-way synchronization is installed.

The copy is a one-time migration, not a snapshot mirror. After acceptance, the external directory becomes the single active profile. Archive/remove old copies only through a separate deliberate cleanup.

## Template updates and data migrations

For updates, inspect each repository's status first and preserve local edits. From a clean code checkout, `git pull --ff-only` updates the template. Separately, `git -C "/absolute/personal-data" pull --ff-only` updates personal history only if that repository has a configured upstream. A local-only repository needs no pull. Stop and reconcile divergent history or local changes; do not reset, force-push or overwrite notes to make an update work. Template updates do not overwrite notebooks, copied guides or local customization. Agents should follow current repository guidance while honoring personal exclusions. Schema version 0.1.0 and existing profile markers are unchanged by binding. A future schema migration needs its own reviewed transformation, backup, validation and rollback; never run it implicitly during a template pull or bind. Keep export policy unchanged unless separately authorized.
