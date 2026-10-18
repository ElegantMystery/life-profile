# Life Profile
Version 0.1.0 — a portable, Markdown-first life profile template. [MIT licensed](LICENSE).

A personal record you can maintain for decades in ordinary text files. Use it without AI, or share a small reviewed excerpt for one task. Empty sections are valid. This project contains no real personal profile.

## Start in fifteen minutes

1. Read [privacy boundaries](docs/PRIVACY.md) and [AI-guided setup](docs/AI-SETUP.md). Use your existing coding assistant; no new model API or account is needed. Local files may still be processed by a cloud-backed assistant when you give it access.
2. From this project folder, run `node tools/setup.mjs init --dest "<absolute-new-private-folder>"`. Choose a protected new folder **outside this project and other Git working trees**, with an existing parent. The command refuses existing destinations and copies only empty templates and guides. No encryption or Windows access controls are configured.
3. Open the new private instance's START-HERE.md. Explicitly connect your assistant with its session-start prompt so it loads ASSISTANT-GUIDE.md. No global agent configuration is edited automatically.
4. Answer a few basic questions, or authorize specific context for a small draft. The assistant writes proposals; you correct and select what to keep. [Draft confirmation](docs/AI-SETUP.md) is separate from notes and never grants export permissions. Skip or resume modules whenever useful; all 13 are optional.
5. Return to your actual work. The copied guide supports occasional relevant update proposals. Review using the [maintenance workflow](docs/MAINTENANCE.md); consult the [fictional walkthrough](examples/fictional/README.md) only as a demonstration.

Prefer working without AI or Node? Copy only `templates/` to a protected private folder and edit the Markdown yourself. This manual route has no instance marker; the setup confirmation CLI requires an initialized instance and will not adopt or overwrite a manual folder. The existing validator/exporter still accepts explicit JSON paths.

A new instance contains structure, prompts and empty fields only: zero profile records and an empty export allowlist. No example data is copied, discovered or imported automatically. Keep `examples/fictional/` out of your private instance; its invented statements are never facts about you.

## Contents

- [Domain index](templates/INDEX.md): stable profile, context, goals, learning, relationships, values, preferences, decisions and optional life domains.
- [AI setup and ongoing assistant guide](docs/AI-SETUP.md), [connection prompt](templates/START-HERE.md).
- [Architecture and tradeoffs](docs/ARCHITECTURE.md), [implementation plan](docs/PLAN.md).
- [Export guide](docs/EXPORTS.md), [migration guide](docs/MIGRATIONS.md).
- [References and license observations](docs/INSPIRATION.md).
- [Release checklist](docs/RELEASE.md), [license decision](LICENSE-DECISION.md).
- [Verification record](docs/VERIFICATION.md).
- [Independent review and limitations](docs/REVIEW.md).

## Optional local tools

Node.js 20 or newer; no npm installation, dependencies, server or network access required by the tools.

Open a terminal in the extracted `life-profile` project folder before running these commands. These checks use the empty template and test fixtures; they do not populate a profile.

```sh
node --test tests
node tools/profile.mjs validate templates/records.json
```

Optional demonstration only, using explicitly selected fictional files:

```sh
node tools/profile.mjs validate examples/fictional/records.json
node tools/profile.mjs export examples/fictional/records.json examples/fictional/policy.json
```

The last command prints a fictional export for today's UTC date. The example deliberately becomes ineligible after its review date. Successful output is not approval to send it anywhere. Review the exact output and recipient before copying it. See deterministic historical examples in the export guide.

For your separate private instance, run the same tool from this project folder with explicit paths to your copied files. Replace the placeholder folder below with your chosen private folder; keep quotes around paths containing spaces. Edit that instance's `export-policy.json` with a specific purpose and the exact record IDs you intend to consider for sharing.

```sh
node tools/profile.mjs validate "<private-folder>/records.json"
node tools/profile.mjs export "<private-folder>/records.json" "<private-folder>/export-policy.json"
```

An empty register or allowlist is valid and exports no statements. To check the generic project before distributing a copy, run `node tools/check-repository.mjs`. Never redirect output over either input file: shell redirection may truncate it before the tool runs.

Profile statements are context, **never permission to act**. Sensitive labels are **not encryption or access control**. Never store passwords, tokens, recovery codes or secret keys here.
