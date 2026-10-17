# Life Profile
Version 0.1.0 — a portable, Markdown-first life profile template. [MIT licensed](LICENSE).

A personal record you can maintain for decades in ordinary text files. Use it without AI, or share a small reviewed excerpt for one task. Empty sections are valid. This project contains no real personal profile.

## Start in fifteen minutes

1. Read [privacy boundaries](docs/PRIVACY.md) and [onboarding](docs/ONBOARDING.md).
2. Copy only `templates/` to a protected folder **outside this project**. Keep that private instance separate from the shareable template. Choose your own storage and backup controls; none are configured here.
3. Start with one useful preference and one current priority in the Markdown notebooks. Skip anything you do not want to record.
4. If exports are useful, add individually reviewed statements to `records.json` using the [schema guide](schema/README.md). Otherwise leave its entries empty.
5. Review using the [maintenance workflow](docs/MAINTENANCE.md). Consult the [fictional walkthrough](examples/fictional/README.md) for a completed example.

A new instance contains structure, prompts and empty fields only: zero profile records and an empty export allowlist. No example data is copied, discovered or imported automatically. Keep `examples/fictional/` out of your private instance; its invented statements are never facts about you.

## Contents

- [Domain index](templates/INDEX.md): stable profile, context, goals, learning, relationships, values, preferences, decisions and optional life domains.
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
