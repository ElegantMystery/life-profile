# AI-guided setup for developers

Use the coding assistant you already have. Life Profile supplies a portable interview guide and local file tools, not a model or an API integration. **A cloud-backed assistant may send conversation content and files it reads to its provider.** Local plaintext storage is not encryption and does not guarantee local AI processing. Decide what your assistant may read before connecting it.

## 1. Create an empty private instance

From this project folder, with Node.js 20 or newer:

```sh
node tools/setup.mjs init --dest "<absolute-new-private-folder>"
```

Replace the placeholder with an absolute path whose parent already exists, on storage you have verified is appropriate for private data. The destination must not exist, even as an empty folder. It must be outside this checkout and other Git working trees. Symlink/junction ancestors and paths beginning with two slash/backslash separators (UNC/double-slash spellings, including mixed separators) are refused. This is a spelling check, not network-filesystem detection: mapped Windows drives and mounted POSIX network filesystems can pass. Verify the destination's backing storage yourself before initializing or entering personal data. There is no force/overwrite option. Initialization copies only an explicit manifest of empty templates and guides; it never copies fictional examples, tools or Git history. The register and export allowlist start empty. An instance marker is written last.

The initializer requests owner-only POSIX modes; Windows permissions and encryption are not configured. Choose an appropriately protected location. It does not determine whether storage is local, network-backed or cloud-synced and cannot guarantee privacy. The error ABSOLUTE_NON_UNC_PATH_REQUIRED means only that an absolute, non-UNC path spelling is required. If creation fails partway, the new incomplete directory remains for inspection; existing files are never recursively removed. Do not claim it is initialized without the valid marker. Choose a new destination after inspecting/removing only the failed instance's files yourself.

## 2. Explicitly connect your assistant

Open the private instance's START-HERE.md and follow its session-start prompt. Give the assistant access to this folder deliberately; do not broaden it to your whole home directory. Have it identify the loaded ASSISTANT-GUIDE.md before proceeding. Nothing edits global agent configuration. For future sessions, repeat that prompt, or manually add a guide reference to a private project-scoped configuration supported by your assistant. This is not an automatic integration.

The guide starts with an optional alias/language, current focus and first useful task. Alternatively, authorize exact pasted context or specific files and ask for a small draft. No automatic workspace scan, chat-history import or account connection is provided. The assistant asks, interprets and drafts; the CLI makes no AI requests and has no interactive questionnaire. Stop after the basics and do useful work; all 13 modules are optional.

## 3. Review proposals before saving records

The assistant can save authorized notes as Markdown and pending candidates under `drafts/`. Follow the copied drafts/README.md. Drafts use `draft_version`, not `schema_version`, so the existing exporter rejects them. Keep uncertain claims in their original wording and source kind. The register schema remains 0.1.0.

```sh
node tools/setup.mjs check-draft --dest "<absolute-private-folder>" --draft basic.json
node tools/setup.mjs confirm --dest "<absolute-private-folder>" --draft basic.json --ids "<approved-id>,<another-approved-id>" --approve "<approval-digest>"
```

`check-draft` is read-only. It returns candidate IDs and a SHA-256 digest binding the entire draft and current register. It does not show personal text; the assistant must show the exact selected statements, metadata and any old records being retired for your review. After explicit approval, `confirm` requires those exact IDs and digest. Any intervening draft/register edit invalidates it. An assistant must not generate its own approval. The CLI cannot prove a human actually consented.

Confirmation validates first, preserves all source labels, admits only private/sensitive/unknown candidates, and leaves export-policy.json untouched. Confirmed inferences remain inferences. It appends selected records, optionally retires their explicitly named active supersession targets, and preserves unrelated records. Duplicate IDs, exact normalized active statements in the same domain, and ambiguous supersession are rejected; semantic contradictions still require human/assistant review. The command cannot confirm new candidates that reference other candidates as supersession targets.

Confirmed drafts are not deleted automatically. For partial approval, prepare a new draft with only unresolved candidates before a later confirmation; reusing confirmed IDs fails safely. Notes and module progress remain independent Markdown files. No new command performs general record edits, dispute resolution or deletion.

## 4. Resume and maintain gradually

The copied guide explains module interviews, minimal SETUP-PROGRESS.md checkpoints and one-at-a-time update proposals. Progress is maintained by the assistant with permission, not by a hidden state machine. Resume from the last agreed topic; skip without filling blanks or repeated prompting. Propose changes only when useful during actual work. No schedule or background monitoring is installed.

## Failure and safety boundaries

Setup writes use explicit private paths. Existing files are never overwritten by initialization. Confirmation is the sole intentional replacement operation: an approved new version of records.json is written using a same-directory temporary file and rename, with an exclusive `.setup.lock`. Existing lock/temp files, malformed instances, symlinks and hardlinked input files fail closed. The current register bytes are compared immediately before replacement.

Cooperating CLI processes are serialized. An external editor or malicious process can still race these checks; this is not an operating-system sandbox or transaction across every profile file. Do not edit the instance concurrently. A crash can leave `.setup.lock` or `.records.pending`; inspect the register and pending content, verify no writer is running, then deliberately recover or remove the stale files. Never automatically steal locks. Rename reduces partial-write risk but is not a guarantee against disk failure or power loss. No extra backup is created; manage private backups deliberately.

All guidance is original Markdown, not enforceable agent policy. A tool with direct write access could bypass confirmation. Claims and drafts do not grant permission to act or share. Export remains a separate, explicit allowlist workflow; no automatic export is added here.
