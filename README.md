# Life Profile
Version 0.1.0 — a portable, Markdown-first life profile template. [MIT licensed](LICENSE).

A personal record you can maintain for decades in ordinary text files. Set it up with an agent you already use, then keep a small private Markdown profile you control. Empty sections are valid. This project contains no real personal profile.

## Start with your agent

Give your coding agent access to this repository and send:

```text
Help me set up Life Profile. Read AGENTS.md and docs/AI-SETUP.md first.
Ask specific questions and save useful non-sensitive answers to private
Markdown as we go, without asking for approval for each save. Verify writes.
Exclude sensitive personal information, credentials, secrets and security
information. Honor skips and corrections. Keep asking useful next questions.
Offer an optional summary from another AI within the same conversation.
Do not export my information or change sharing permissions.
```

The agent saves the first answers into `domains/basic.md` and `domains/current-context.md`, then continues with specific questions about goals, communication preferences, learning and general routines. It briefly tells you what changed after verifying the write. You can skip, correct it or say not to save something. Creating an empty folder is only preparation; useful Markdown should appear as you answer.

Ordinary local saves need no draft approval, record IDs or confirmation ceremony. Explicit user facts stay distinct from labeled AI inferences. Sensitive personal and security information is excluded, even when volunteered. Saving notes does not authorize sharing or external actions. The optional structured register can stay empty; agents must use the Markdown notebooks for local assistance even when the register is empty. Structured saves also need no redundant approval. Export permission is separate.

An optional [portable summary](templates/IMPORT-GUIDE.md) can inform this same conversation now or later. The agent filters it, saves useful non-sensitive items with brief attribution and asks specific questions about conflicts or remaining gaps. There is no automatic account or raw memory-store access.

Read [privacy boundaries](docs/PRIVACY.md): a cloud-backed assistant may process files and answers you let it read. Agree on access before sharing personal content. The default instance is the root ignored `private/` folder. The agent verifies its location and ignore status, then follows the current [assistant guide](templates/ASSISTANT-GUIDE.md). For later sessions, use the current [connection prompt](templates/START-HERE.md) and the [maintenance workflow](docs/MAINTENANCE.md).

Keep personal content inside `private/`, never in `templates/` or other tracked project files. `.gitignore` does not protect already tracked files, prevent `git add -f`, encrypt data or exclude it from editor/AI access, sync and whole-folder archives. Before entering personal data, verify `git check-ignore -v private/records.json` reports `/private/` and `git ls-files -- private` prints nothing. Avoid cleanup commands that delete ignored files, such as `git clean -fdx`. See [privacy boundaries](docs/PRIVACY.md).

A new instance contains structure, prompts and empty fields only: zero profile records and an empty export allowlist. No example data is copied, discovered or imported automatically. Keep `examples/fictional/` out of your private instance; its invented statements are never facts about you.

## Contents

- [Domain index](templates/INDEX.md): basic profile, context, goals, learning, relationships, values, preferences, decisions and optional life domains.
- [Agent setup instructions](docs/AI-SETUP.md), [agent entry point](AGENTS.md), [connection prompt](templates/START-HERE.md), [optional and repeat imports](templates/IMPORT-GUIDE.md).
- [Architecture and tradeoffs](docs/ARCHITECTURE.md), [implementation plan](docs/PLAN.md).
- [Export guide](docs/EXPORTS.md), [migration guide](docs/MIGRATIONS.md).
- [References and license observations](docs/INSPIRATION.md).
- [Release checklist](docs/RELEASE.md).
- [Verification record](docs/VERIFICATION.md).
- [Independent review and limitations](docs/REVIEW.md).

## Agent implementation helpers and developer checks

Node.js 20 or newer; no npm installation, dependencies, server or network access required by the tools.

Agents and contributors: open a terminal in the extracted `life-profile` project folder before running these commands. These checks use the empty template and test fixtures; they do not populate a profile.

```sh
node --test
node tools/profile.mjs validate templates/records.json
```

Optional demonstration only, using explicitly selected fictional files:

```sh
node tools/profile.mjs validate examples/fictional/records.json
node tools/profile.mjs export examples/fictional/records.json examples/fictional/policy.json
```

The last command prints a fictional export for today's UTC date. The example deliberately becomes ineligible after its review date. Successful output is not approval to send it anywhere. Review the exact output and recipient before copying it. See deterministic historical examples in the export guide.

For a separately requested export workflow, the agent can run the same tool from this project folder with explicit paths. For an external instance, replace `private/` below with its absolute path; keep quotes around paths containing spaces. Only with separate sharing instructions, edit that instance's `export-policy.json` with a specific purpose and the exact record IDs you intend to consider for sharing.

```sh
node tools/profile.mjs validate "private/records.json"
node tools/profile.mjs export "private/records.json" "private/export-policy.json"
```

An empty register or allowlist is valid and exports no statements. To check the generic project before distributing a copy, run `node tools/check-repository.mjs`. Never redirect output over either input file: shell redirection may truncate it before the tool runs.

Profile statements are context, **never permission to act**. Sensitive labels are **not encryption or access control**. Do not store sensitive personal information, credentials, secrets or security information here.
