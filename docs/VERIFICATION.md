# Verification evidence

Execution date: 2026-10-17. Runtime: Node.js v20.14.0 on Windows.

After independent review and additional missing-field coverage: 62 tests passed, 0 failed, 0 skipped. Both empty-template and fictional-profile validation passed. Historical fictional export emitted exactly pref-current. All local Markdown file links resolve, all JSON parses and the heuristic secret/identifier scan found no matches. See [final review](REVIEW.md).

Commands from the project root:

```sh
node --test tests/profile.test.mjs tests/setup.test.mjs tests/private-default.test.mjs
node tools/check-repository.mjs
node tools/profile.mjs validate templates/records.json
node tools/profile.mjs validate examples/fictional/records.json
node tools/profile.mjs export examples/fictional/records.json examples/fictional/policy.json --as-of 2026-10-17
```

Test-first evidence: suite was added before implementation; execution failed because tools/profile.mjs did not exist. No dependency installation is needed for the tests.

Behavior suite covers default exclusions, exact allowlists, omission of provenance, malformed metadata, unknown keys/versions, duplicate IDs, date boundaries, leap dates, supersession cycles, JSON text isolation, CLI success and failure without partial output.

The repository check verifies local Markdown file targets, JSON parsing and a heuristic scan for common key formats, email addresses and Windows personal paths. It does not validate remote availability, Markdown anchors, all secret formats, indirect identification or semantic truth. Manual review complements it. Public reference files and four license files were rechecked at pinned commits; one standalone LICENSE returned 404. See the inspiration document for exact references.

No real profile, private notes or messages are included. Fictional examples were authored for this project. The owner selected MIT licensing; the copyright attribution uses the verified public owner identity. No private contact details or credentials belong in the release.

## AI-guided setup milestone — 2026-10-18

Full suite: 86 passed, 0 failed, 0 skipped (62 existing tests plus 24 new setup tests). The new tests use disposable fictional instances only and exercise initialization refusal/preservation, unsafe destinations and links, empty starter contents, draft/export separation, selected digest-bound confirmation, source-kind preservation, exact deduplication, supersession, changed inputs, locks, temporary files and CLI errors.

The repository checker passed 53 files and 54 local Markdown links, with all JSON parsing and no heuristic secret/identifier matches. A separate read-only reviewer found no blocking defect and independently ran 23 setup tests in-process. The complete CLI subprocess tests also passed in the implementation session. See docs/AI-SETUP-DESIGN.md for the plan and review ledger; the assistant's behavioral guidance is not a security enforcement mechanism.

PR #1 follow-up: independently verified the network-path review finding. The guard checks spelling and directory ancestry, not backing filesystem type. Qualified the documentation and copied startup guide, renamed the path error to ABSOLUTE_NON_UNC_PATH_REQUIRED, and added regression cases for relative, forward-slash UNC, backslash UNC and mixed-separator spellings in both path entry points. The new test failed against the former error contract, then the full suite passed: 87 tests, 0 failures/skips. No mapped drive or network mount was created or accessed; their detection is explicitly not promised.

## Private default and basic notebook — 2026-10-19

Verified against main commit `6f41b9dd8b809c2af352a57bf305a4884400ad77` using Node.js v24.19.0 on Linux. Full suite: 104 passed, 0 failed, 0 skipped (87 baseline tests plus 17 new regression tests). The command above lists the test files explicitly because the older directory argument `node --test tests` is not accepted by this runtime. In the verification environment, the normal temporary directory had a Git marker, so disposable fixtures used a separate temporary filesystem without Git ancestry; the destination safeguards were not disabled. No Windows or macOS runtime was available for this change.

New coverage verifies checkout-root default resolution from an unrelated working directory, explicit private-root and external destinations, empty records/allowlist, `domains/basic.md`, unchanged `stable-profile` schema identifiers, digest-bound confirmation, directory/file/link overwrite refusal, symlink ancestors and child directories, other Git ancestors and nested metadata, source archives without Git metadata, and repeated initialization refusal. Actual Git checks confirm the `/private/` root rule applies, nested ordinary folders named private remain visible, and ordinary `git add .` stages no generated private files.

The new default tests were observed failing before implementation. Independent read-only review found that the initial checker exemption also skipped a regular root file named private, which the directory-only ignore rule would not protect. Added failing regular-file and symlink regressions, restricted the exemption to an actual root directory, and reran the full suite successfully. The checker never traverses that private directory; it still checks same-named regular files and nested directories and refuses symlinks.

Final checks: 54 generic files and 56 local Markdown links checked; JSON parsing and heuristic identifier checks passed; the empty template validated; `git diff --check` passed. Only disposable fictional fixtures were initialized. No existing private data was read, moved, renamed or migrated. Schema, exporter and instance versions remain unchanged.
