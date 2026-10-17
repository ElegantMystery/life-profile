# Life Profile implementation plan

Goal: deliver a usable V0.1 template with a narrowly scoped optional exporter.

Architecture: [design](ARCHITECTURE.md). Markdown for human records; strict JSON register for selective exports. Native execution in this session, no dependencies or subagents required.

- [x] Write empty domain notebooks, onboarding, maintenance, privacy, migration and release guidance.
- [x] Write fictional register and narrative, schema and allowlist example.
- [x] Write export and validation behavior tests; verify missing implementation fails.
- [x] Implement `validate(profile)` and `exportProfile(profile, policy, today)` in `tools/profile.mjs`; validate dates, references, enums and all fields. CLI uses explicit files, stdout and failure codes.
- [x] Run complete Node test suite, examples, local Markdown link checks and heuristic secret/personal-data scan.
- [x] Review requirements, document evidence and limits; apply the owner's MIT license choice.

Review focus: missing metadata must fail closed; date boundaries use UTC and exclude due-today entries; supersession references must be sound; arbitrary prose must not become executable directives; export omission must not leak private source metadata.
