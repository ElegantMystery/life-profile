# Life Profile

A template for a personal profile you own, kept in readable Markdown files. Your AI agent helps you capture interests, preferences and everyday context, then use those notes for more personalized help.

## What to expect

- **A conversation:** your agent asks one question at a time and saves useful, non-sensitive answers as you go. Skip, correct or say “do not save” anytime.
- **Your own private repository:** by default, personal notes live in a separate private GitHub repository, apart from this template. Prefer no upload? Ask for local-only storage.
- **Continuity:** resume from saved notes. With ongoing use enabled, your agent syncs the private repository at session start and after profile updates; no background service is installed.

## Get started

Use a **coding agent or personal AI agent** that can read and write persistent files and run terminal commands. Its environment needs **Node.js 20+** and **Git**. For private repository syncing, connect your GitHub account to the agent or sign in through GitHub CLI (`gh auth login`).

With a cloud-hosted agent, the files may live on its computer rather than your own device.

**1. Get the template in your agent's workspace.**

For an agent on your computer, run these commands and open the folder in your agent. For a cloud-based personal agent, ask it to run them in its own persistent workspace:

```sh
git clone https://github.com/ElegantMystery/life-profile.git
cd life-profile
```

**2. In that workspace, send your agent this request:**

```text
Help me set up Life Profile. Read AGENTS.md and docs/AI-SETUP.md first.
Create a separate private personal repository.
I authorize creating its private GitHub remote and committing and pushing
reviewed non-sensitive profile files there.
Resume my existing profile if I already have one.
Ask me questions and save useful answers as we go.
```

For **local-only storage**, replace the two sentences about creating a private repository and authorizing uploads with: “Keep my profile local only. Do not create a GitHub remote or upload my notes.” Keep the instruction to resume an existing profile.

**3. Answer at your own pace.** Your agent handles setup and tells you what it saves. Give it access to the separate personal folder when needed.

Later, ask **“Continue my Life Profile”** or **“Sync my Life Profile with its private repository.”** Moving to another device? Follow [clone and resume](docs/STORAGE.md#resume-on-another-device).

Keep sensitive information and secrets out of your profile. Files are plaintext, and a cloud-backed agent may process what you let it read. See [privacy details](docs/PRIVACY.md).

## Use it in everyday conversations

After setup, add this to your coding agent's global instructions, or send it to your personal AI agent and ask it to retain it using its supported persistent instructions. Replace `<profile-path>` with the absolute profile folder in that agent's workspace; no GitHub link is needed.

```text
My Life Profile is at <profile-path>. At the start of each session, read
ASSISTANT-GUIDE.md inside that folder and use its ongoing-conversation mode.
Read only notes relevant to my task. I authorize saving useful non-sensitive
personal facts, lasting preferences and explicit corrections as we talk.
Verify changes and briefly tell me what was saved. Honor “do not save.”
Do not start an interview unless I ask. Automatically commit and sync reviewed
profile changes to its verified private repository at session start and after
updates, without asking each time. Reconcile compatible edits from other agents;
ask only about genuinely conflicting facts. Never force-push or discard work.
```

For local-only use, replace the sync sentences with “Keep all updates local; do not commit or upload.” A normal chat message may not carry over to future sessions. Try a new conversation to confirm the agent loads the guide. For an existing profile, ask it to bring the copied guide up to date from this template while preserving your custom instructions and notes.

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

Plugins and file support come from your agent, not this template. Choose exactly what it may read; it saves useful non-sensitive notes with source context, rather than copying entire documents. [Import details](templates/IMPORT-GUIDE.md).

---

For agents: [setup instructions](docs/AI-SETUP.md) · [storage and sync](docs/STORAGE.md) · [assistant guide](templates/ASSISTANT-GUIDE.md)

[MIT license](LICENSE)
