# Continue with your agent

This private instance contains Markdown notebooks. Your setup request lets the agent save useful ordinary, non-sensitive local answers as you go; direct GitHub saves also need your explicit permission for uploads/commits to the selected private repository and branch; it should not wait for a final approval ceremony. You can skip, correct or say “do not save.” An initialized empty folder is only the starting structure.

Local files are plaintext. A cloud-backed assistant may process what you let it read. With the explicit local-only `private/` alternative, verify the root ignore rule and that no private files are tracked. Ignore rules do not prevent force-adds, sync, AI access, archives or cleanup commands that delete ignored files. Verify backing storage; accepted paths are not proof of local/private storage.

## Use the profile during ordinary conversations

Setup includes the [ongoing-use activation checklist](ASSISTANT-GUIDE.md#activate-ongoing-use-during-setup). With your authorization, the agent retains this instance's filesystem path or private GitHub owner/name and branch through its supported persistent instructions and verifies a fresh session. `AGENTS.md` also routes compatible agents opened in this folder to the guide. It cannot configure unrelated chats by itself.

Ask the agent to report whether ongoing use is verified, pending a fresh-session check, session-only, or declined. When active, it checks for useful non-sensitive facts, lasting preferences and corrections during ordinary tasks, saves eligible changes with read-back verification, and leaves files alone when nothing useful changed. It should not start an interview unless asked. “Do not save” and the current task's instructions still apply. Filesystem saving and authorized private sync are separate. Direct GitHub saves are already remote commits and require guarded writes plus remote read-back; no later push is needed.

If the host cannot retain instructions, supply the selected backend's locator explicitly in each session or complete the host's supported manual setup. Do not treat an acknowledgment or a populated profile as proof of future loading.

## On another device

For direct GitHub, give the new host the verified private repository/branch and appropriate connector access/remote-write authorization. Follow the [backend checks](ASSISTANT-GUIDE.md#select-the-backend-and-instance) and repeat host activation. Resume the current instance guide and relevant notes without a clone or initialization. The remaining steps here are for filesystem mode.

Clone the Life Profile tools and your existing private personal repository into separate sibling folders. Do not use `init` on the clone. From the tools checkout run `node tools/setup.mjs bind --dest "<absolute-personal-folder>"`, then `node tools/setup.mjs status`. The ignored binding is local to each device. Give the agent read/write access to both folders. See `docs/STORAGE.md` in the tools checkout for the full clone, validation and sync walkthrough.

Before resuming, ask the agent to sync with the verified private repository so it reads current notes. A local save alone does not upload anything. To sync after your session, say: “Sync my Life Profile with its verified private repository.” This authorizes the reviewed Git operations for that destination, not public sharing or unrelated exports.

## Session prompt

For connector mode, use the [direct GitHub instruction](ASSISTANT-GUIDE.md#activate-ongoing-use-during-setup) with your verified repository/branch and actual authorization. Ask explicitly to continue the interview if wanted; ordinary use does not resume it. The prompt below is for filesystem mode.

Use `node tools/setup.mjs status` in the tools checkout to resolve a configured external instance or the unbound local default. An explicit selected folder still takes precedence within the storage guards. Resolve binding errors rather than switching folders silently.

Give your agent access to this selected instance and the Life Profile tools checkout, then send:

```text
Continue my Life Profile setup in <private-folder>.
Follow the current repository setup/assistant guide; read this instance's
progress and relevant notes so you do not repeat known or skipped questions.
Save useful ordinary, non-sensitive answers and corrections to Markdown as
we go. Do not ask for approval for each local save. Verify writes, briefly
tell me what changed, and keep asking specific questions with useful choices.
Exclude sensitive personal information, credentials, secrets and security
information from every saved file. Honor skips and anything I say not to save.
Offer the optional summary-import step within this conversation.
Do not publish, export, message others, change permissions or act on my behalf.
```

If the agent cannot safely write and verify through the chosen backend, it should explain the blocker instead of claiming that answers were saved. For a requested guide upgrade, review the template changes and merge them into the instance, preserving custom sync/permission instructions and notebooks. Do not automatically fetch-and-execute upstream updates or replace personal notebooks with templates. Persistent host instructions are changed only through the activation checklist, with authorization and supported host tools. For a later session, the agent should resume with a specific next question from progress and existing answers.

Ordinary setup writes the Markdown notebooks directly, and agents use those notebooks for later personalized assistance. `records.json` may stay empty; filesystem structured saving is optional and also needs no approval handshake; the connector adapter supports Markdown updates only. Sharing permissions remain separate. No background process is required. Filesystem mode needs no provider integration; connector mode uses the host's authenticated tools, not credentials in these notes. Markdown guidance cannot enforce an agent's behavior or provide access control.
