# Separate Profile Storage Implementation Plan

**Goal:** Support the existing ignored private folder and an explicitly bound independent personal-data repository.

**Architecture:** One ignored local path configuration selects an initialized external instance. Only that standalone repository root receives a Git-marker exception. GitHub identity/remote/private-visibility verification belongs to the setup agent; ordinary Git operations stay ordinary.

**Constraints:** No live migration, remote creation, upload, schema changes or policy changes. No snapshot mirror, submodule, background crawler or per-push service. Use fictional temporary fixtures only.

- [x] Add failing CLI tests for binding, scoped Git exception, unsafe paths/configuration and copy/rollback.
- [x] Implement bind/unbind/status in setup storage and CLI, preserving legacy explicit destinations and safe writes.
- [x] Extend adversarial configuration and repository-boundary tests; run full suite.
- [x] Align setup/agent/docs with storage selection and non-destructive migration/rollback.
- [x] Independent code/privacy review, fix findings, rerun tests/link checks, verify live data untouched.

**Review focus:** malformed/linked configuration; nested or redirected Git metadata; public-repository tracking; concurrent binding changes; stale migration source/rollback after new edits.

**Validation:** `node --test`; `node tools/check-repository.mjs`; `git diff --check`. Temporary migration fixture must keep source and policy unchanged. Live migration remains a separate reported decision.

Final verification: 123 tests passed; 60 files and 83 local links checked. Independent review reproduced and resolved Git common-directory redirection, stale-bound initialization, and broad fixture copying; reviewer reran 30 related tests successfully. No live data/binding/remote changes.

First-time walkthrough: temporary fresh local creation/resume and malformed-binding recovery passed. Independent first-time documentation review and final code/privacy review found no blockers; explicit-path and archive wording inconsistencies were corrected.
