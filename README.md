# Life Profile

A template for a personal profile you own, kept in readable Markdown files. Your AI agent helps you capture interests, preferences and everyday context, then use those notes for more personalized help.

## What to expect

- **A conversation:** your agent asks one question at a time and saves useful, non-sensitive answers as you go. Skip, correct or say “do not save” anytime.
- **One instruction source:** use this template or your own fork for all behavior. Private instances contain only data. The host keeps the source version and data destination separately.
- **Your own private repository:** by default, personal notes live in a separate private GitHub repository, apart from this template. Prefer no upload? Ask for local-only storage.
- **Ongoing use:** setup also connects the profile to your agent’s supported persistent instructions, with your permission, and checks whether a fresh session loads it. Useful updates should then save during ordinary conversations. If the host cannot do this, your agent reports session-only use.
- **Continuity:** resume from saved notes. Filesystem profiles sync when authorized; direct GitHub saves are already remote commits. Neither mode installs background sync.

## Get started

Use a **coding agent or personal AI agent** with either:

- **Filesystem access:** persistent file read/write, terminal commands, **Node.js 20+** and **Git**. Private syncing also needs authenticated Git access. Follow the workspace steps below.
- **An authenticated GitHub connector:** repository/file reads, version-guarded writes and read-back. It can use a private profile directly without a local clone or terminal Git. Use [connector-only setup](#connector-only-setup). Creation needs additional supported tools; access alone does not authorize uploads.

With a cloud-hosted agent, the files may live on its computer rather than your own device.

**1. Get the template in your agent's workspace.**

For an agent on your computer, run these commands and open the folder in your agent. For a cloud-based personal agent, ask it to run them in its own persistent workspace:

```sh
git clone https://github.com/ElegantMystery/life-profile.git
cd life-profile
```

To use your own fork, replace the clone URL and the instruction-source repository in the requests below with that same selected fork. Keep private data and credentials out of a public fork.

**2. In that workspace, send your agent this request:**

```text
Help me set up Life Profile. Use ElegantMystery/life-profile as the instruction
source. Verify and pin the current reviewed source commit for this setup;
tell me the resolved commit. Check ordinary-file identities before reading
AGENTS.md, docs/AI-SETUP.md and supporting guidance at that commit.
Create a separate private personal repository.
I authorize creating its private GitHub remote and committing and pushing
reviewed non-sensitive profile files there.
Resume my existing profile if I already have one.
Ask me questions and save useful answers as we go.
Enable ongoing local profile updates during ordinary conversations.
Retain that source commit, profile path and authorized scope using this agent's
supported persistent instructions, preserving my existing settings.
Verify fresh-session loading if possible; otherwise tell me what is pending.
```

For **local-only storage**, replace the two sentences about creating a private repository and authorizing uploads with: “Keep my profile local only. Do not create a GitHub remote or upload my notes.” Keep the instruction to resume an existing profile.

**3. Answer at your own pace.** Your agent handles setup and tells you what it saves. Give it access to the separate personal folder when needed.

Later, ask **“Continue my Life Profile”** or **“Sync my Life Profile with its private repository.”** Moving to another device? Follow [clone and resume](docs/STORAGE.md#resume-on-another-device).

### Connector-only setup

Give your agent this request, replacing the destination and branch with your choice:

```text
Help me set up Life Profile using the GitHub connector, not a local clone.
Use ElegantMystery/life-profile as the instruction source. Verify and pin the
current reviewed source commit. Check ordinary-file identities before reading
its AGENTS.md, docs/AI-SETUP.md and supporting guidance at that commit.
Tell me the resolved commit. Keep this source separate from my private data.
Use private repository <owner/name>, branch <branch>. Verify my account,
repository identity and private visibility. Resume it if already initialized.
If it does not exist, I authorize creating this private repository and uploading
only the reviewed empty profile instance using the connector-only storage guide.
I authorize reviewed non-sensitive profile updates here as we talk, including
ongoing uploads and commits. Use version guards and verify remote saves.
Retain that source commit, this data locator and authorized scope through supported
persistent instructions, preserving existing settings. Verify fresh-session
loading if possible; otherwise tell me what is pending. Do not switch backend.
```

Your agent should check the exact [connector capabilities and bootstrap steps](docs/STORAGE.md#connector-only-private-repository). It must report missing creation, guarded-write or verification tools rather than pretend setup completed. Existing remote instances resume without initialization. You can choose setup-only instead of ongoing use. Local-only permission never authorizes connector writes.

Keep sensitive information and secrets out of your profile. Files are plaintext, and a cloud-backed agent may process what you let it read. See [privacy details](docs/PRIVACY.md).

## Use it in everyday conversations

Setup includes selecting shared guidance and checking host activation. New private instances contain **no instructions, loader, `AGENTS.md` or source configuration**. Opening only the private folder cannot make an agent load the template. Use the host's supported persistent settings to retain both the selected template/fork version and the data destination, along with permission scope. The [host-binding examples](docs/INSTRUCTION-SOURCE.md#startup-plumbing-not-a-private-loader) cover filesystem and direct GitHub.

The guided setup default is a verified immutable commit, so updates do not silently change your instructions. You may explicitly choose to track a named branch; the agent resolves it once per session and uses that commit throughout. Tracking cannot expand permissions or switch data destinations. See [source selection and offline behavior](docs/INSTRUCTION-SOURCE.md).

To customize behavior, fork the template and select your fork as the instruction source. Keep private facts, credentials and private data locators out of a public fork. Your fork will not automatically receive upstream fixes; review and integrate them deliberately. There is no separate personal override manual in the private repository or host settings.

A normal chat message may not persist. Setup should report data readiness, source readiness and whether ongoing use is verified, pending a fresh-session check, session-only or declined. A stronger activation check uses a fresh ordinary-task session that does not mention the profile or either locator, then verifies guide loading and authorized save/no-change behavior. Do not invent personal facts for the test. A worker explicitly supplied the guide only tests its behavior, not persistent loading. No template guarantees that every host loads or follows it.

Existing private profiles are unchanged and remain usable. Public template updates do not remove or replace their copied guides. Ask for a [reviewed migration](docs/MIGRATIONS.md#centralized-instructions-and-data-only-instances) to preserve custom behavior in your selected fork and verify permission scope before switching. Do not reinitialize or delete old files as routine cleanup.

## What you can keep

Each module is a Markdown notebook. Use whichever are helpful; all are optional.

| Module | What it helps capture |
| --- | --- |
| Basic profile | Your preferred name, languages and broad background. |
| Current context | What's happening now and your current commitments. |
| Values and meaning | Everyday principles and priorities that guide your choices. |
| Goals and projects | What you want to achieve, progress and next steps. |
| Learning and skills | What you know, what you're learning and how you learn best. |
| Relationships and community | Community interests and communication preferences, without private details about others. |
| Life and communication preferences | Hobbies, favorite foods, entertainment and how you like help presented. |
| Decisions and experiences | Useful decisions, outcomes and lessons to remember. |
| Work and contribution | Broad work history, roles, creative work and volunteering. |
| Home and daily life | Cooking, weekend habits and everyday organization. |
| Health and wellbeing | General non-sensitive routines you choose to mention—not medical information. |
| Finance | Broad planning preferences—not income, balances or account details. |
| Life administration and legacy | General organization and future-transition preferences—not legal documents or access details. |

[Explore the module notebooks](templates/INDEX.md).

## Ways to share context

You do not need to answer everything from scratch:

- **Chat:** tell your agent about yourself and correct details as they change.
- **Resume or documents:** upload a resume if your agent supports attachments, or point it to a specific local file, to capture broad work and learning history.
- **GitHub plugin:** ask your agent to read selected repositories or contributions for project and skill context.
- **Notion plugin:** choose specific pages about your interests, learning or plans.
- **Another AI:** paste a summary you have reviewed, keeping uncertain details labeled.

Plugins and file support come from your agent, not this template. Choose exactly what it may read; it saves useful non-sensitive notes with source context, rather than copying entire documents. [Import details](docs/guides/IMPORT-GUIDE.md).

---

For agents: [setup instructions](docs/AI-SETUP.md) · [storage and sync](docs/STORAGE.md) · [assistant guide](docs/guides/ASSISTANT-GUIDE.md)

[MIT license](LICENSE)
