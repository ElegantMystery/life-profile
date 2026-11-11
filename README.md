# Life Profile

A template for a personal profile you own, kept in readable Markdown files. Your AI agent helps you capture interests, preferences and everyday context, then use those notes for more personalized help.

## What to expect

- **A conversation:** your agent asks one question at a time and saves useful, non-sensitive answers as you go. Skip, correct or say “do not save” anytime.
- **Your own private repository:** by default, personal notes live in a separate private GitHub repository, apart from this template. Prefer no upload? Ask for local-only storage.
- **Ongoing use:** setup also connects the profile to your agent’s supported persistent instructions, with your permission, and checks whether a fresh session loads it. Useful updates should then save during ordinary conversations. If the host cannot do this, your agent reports session-only use.
- **Continuity:** resume from saved notes and sync between devices when you ask. Sync is not automatic.

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
Enable ongoing local profile updates during ordinary conversations.
Retain the profile path and maintenance instruction using this agent's
supported persistent instructions, preserving my existing settings.
Verify fresh-session loading if possible; otherwise tell me what is pending.
```

For **local-only storage**, replace the two sentences about creating a private repository and authorizing uploads with: “Keep my profile local only. Do not create a GitHub remote or upload my notes.” Keep the instruction to resume an existing profile.

**3. Answer at your own pace.** Your agent handles setup and tells you what it saves. Give it access to the separate personal folder when needed.

Later, ask **“Continue my Life Profile”** or **“Sync my Life Profile with its private repository.”** Moving to another device? Follow [clone and resume](docs/STORAGE.md#resume-on-another-device).

Keep sensitive information and secrets out of your profile. Files are plaintext, and a cloud-backed agent may process what you let it read. See [privacy details](docs/PRIVACY.md).

## Use it in everyday conversations

Setup now includes activating ongoing use. New private instances contain an `AGENTS.md` entry point for compatible agents opened in that folder. Other workspaces and personal AI agents still need their supported persistent instructions to load the guide; the template cannot make unrelated chats do this.

For an existing profile or a host that needs a manual setup step, add this to the intended agent instruction scope. Replace `<profile-path>` with the absolute profile folder in that agent's workspace; no GitHub link is needed.

```text
My Life Profile is at <profile-path>. At the start of each session, read
ASSISTANT-GUIDE.md inside that folder and use its ongoing-conversation mode.
Read only notes relevant to my task. I authorize saving useful non-sensitive
personal facts, lasting preferences and explicit corrections as we talk.
Before finishing a substantive turn, check for useful updates; save and verify
them, or make no change if nothing useful was learned. Briefly report saves
or blockers. Honor “do not save,” privacy exclusions and my current instructions.
Do not start an interview unless I ask. This does not authorize uploads.
```

A normal chat message may not carry over to future sessions. Setup should report whether ongoing use was verified, is waiting for a fresh-session check, or is session-only. In a new conversation, ask “Which Life Profile are you using, and what will you save as we talk?” without repeating its path. This checks that host and scope only, not every agent. The agent should save eligible updates during the current turn, leave the profile unchanged when nothing useful was learned, and report blocked saves honestly.

For an existing profile, ask it to merge the current copied guide and private-instance `AGENTS.md` while preserving your custom instructions, exclusions and notes. Do not reinitialize the folder. No template can guarantee that every host loads or follows these instructions; test the host you actually use.

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
