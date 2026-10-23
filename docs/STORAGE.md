# Separate template and personal storage

Keep the public code/template checkout and personal data separate. During guided setup, offer **local-only**, **a separate personal directory/repository**, or **decide later**. Do not make version control a prerequisite to answering questions. These are storage choices within the same agent-led setup, not new onboarding methods.

## First-time checklist

These are implementation steps for the agent in the same guided setup. Prerequisites: Node.js 20+, file-write access and a terminal; Git for a data repository; an already-authorized GitHub connector or `gh` only if choosing GitHub. No npm installation or server is required.

Run `node --version` and, for repository storage, `git --version`. Run every `node tools/...` command from the **code checkout root**, not the personal-data directory. Use `git -C` for commands targeting the other repository. Replace example paths with the user's selected absolute path and quote paths with spaces. POSIX examples below work in Linux/macOS/WSL; on Windows use a full drive path such as `"D:\Profiles\personal-data"`, not a UNC path. An accepted path alone does not establish private storage.

First inspect whether `.life-profile.local.json` or the selected profile already exists; do not print its personal contents. `status` succeeds only for a valid existing selected instance. A fresh checkout with neither binding nor `private/` is expected to fail `status`: choose one of the creation cases below. If a binding or directory already exists but status fails, use [recovery](#recover-a-missing-or-invalid-binding), not creation.

### A. New local-only profile (default)

Only when there is no binding and `private/` does not exist:

```sh
node tools/setup.mjs init
node tools/setup.mjs status
```

Expected: init reports `initialized: true`, zero records and zero allowed export IDs; status reports `mode: "local"` and the checkout's `private/` path. Then begin the interview and verify actual Markdown saves. No personal Git repository is created. In a Git checkout also verify `git check-ignore -v private/records.json` matches `/private/` and `git ls-files -- private` is empty; for an extracted archive there is no Git index to inspect.

### B. New separate personal-data directory/repository

Choose a new sibling directory; its parent must already exist outside other Git trees. **Do not pre-create the destination or clone an empty repository into it.**

```sh
node tools/setup.mjs init --dest "/absolute/new-personal-data"
git -C "/absolute/new-personal-data" init
node tools/setup.mjs bind --dest "/absolute/new-personal-data"
node tools/setup.mjs status
```

Expected: status reports `mode: "external"` and the selected path. Skip `git init` if only a separate non-Git directory is wanted. This creates no GitHub repository or remote and uploads nothing. Before any personal-data commit, configure the data repository's own exclusions and review its files as described below.

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

## Optional private GitHub remote

The agent performs initial identity and destination verification using the already-authorized GitHub connection before creating or configuring a remote. Confirm the signed-in account, intended owner/repository, and **PRIVATE** visibility; compare the actual fetch and push remote URLs with that repository. Public forks are not a private storage option. Never put personal data in the public template repository or change its visibility.

Useful read-only checks with GitHub CLI are `gh api user --jq .login`, `gh repo view OWNER/REPO --json nameWithOwner,visibility,url,sshUrl`, and `git -C /absolute/personal-data remote -v`. Do not guess the owner or repository identity. If credentials or authorization are unavailable, finish local setup and report the missing connection; do not manufacture credentials or grant permissions.

Before the first personal-data commit/upload, review the intended file set for credentials, sensitive data, raw imports, temporary files and accidental exports. Exclude secrets, environment files, keys, logs and temporary/lock files in the data repository's own ignore rules; the template's ignore rules do not apply to its sibling. Use explicit reviewed paths rather than blind `git add .`. Store no credential in the local binding or remote URL. A heuristic scan is not proof that arbitrary prose contains no sensitive content. Obtain specific authorization for any sensitive-data upload; never commit credentials. A private repository is access-controlled hosting, not encryption or a permanent privacy guarantee.

After verification and authorization, normal Git operations apply in the **data** directory. For example, inspect `git -C "/absolute/personal-data" status --short`, stage only reviewed paths with `git -C "/absolute/personal-data" add -- domains/basic.md`, and inspect `git -C "/absolute/personal-data" diff --cached --stat` before committing. Actual commit/push requires the user's authorization and reviewed destination; these examples do not grant it. Avoid printing private diffs into public conversations or PRs.

There is no prescribed data-repository branch name: use the existing branch rather than assuming `main`. A new repository also needs the user's Git author configuration before its first commit; do not invent their identity. Configure a verified remote only as part of an authorized GitHub setup. Ordinary commit/push/pull then apply. There is no custom per-push API check or background synchronization. Recheck destination/visibility when the remote, account, collaborators or repository visibility change. Git history retains earlier versions after a working-file deletion. Local export policy remains unchanged: data-repository permission does not authorize other exports, publishing or messages.

## Move existing data deliberately, without a mirror

The agent handles copying; the user does not need to copy folders manually. Before changing a live binding:

1. Report the exact source, new destination, scope and rollback plan. Stop concurrent profile writes and make a recoverable owner-protected local backup. Do not copy an existing `.git`, credentials or unrelated files blindly.
2. Copy the reviewed instance to a new external directory without overwriting anything. Reject links and unsafe files. Compare the copied file set and hashes, including the instance marker, register and export policy; verify source hashes still match the copy before activation. If data changed, stop and reconcile instead of switching.
3. Initialize Git in that new directory if requested, then bind and run `status` plus read-only profile validation. Verify the public repository still tracks no personal files. Do not automatically commit or push the copy.
4. Keep the old directory and backup untouched for rollback. Before new edits, `unbind` returns to the default; if the previous selection was external, re-bind its recorded path. After new edits, reconcile/copy them safely before switching back, or rollback would lose access to the latest changes. No automatic deletion or two-way synchronization is installed.

The copy is a one-time migration, not a snapshot mirror. After acceptance, the external directory becomes the single active profile. Archive/remove old copies only through a separate deliberate cleanup.

## Template updates and data migrations

For updates, inspect each repository's status first and preserve local edits. From a clean code checkout, `git pull --ff-only` updates the template. Separately, `git -C "/absolute/personal-data" pull --ff-only` updates personal history only if that repository has a configured upstream. A local-only repository needs no pull. Stop and reconcile divergent history or local changes; do not reset, force-push or overwrite notes to make an update work. Template updates do not overwrite notebooks, copied guides or local customization. Agents should follow current repository guidance while honoring personal exclusions. Schema version 0.1.0 and existing profile markers are unchanged by binding. A future schema migration needs its own reviewed transformation, backup, validation and rollback; never run it implicitly during a template pull or bind. Keep export policy unchanged unless separately authorized.
