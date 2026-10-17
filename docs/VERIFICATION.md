# Verification evidence

Execution date: 2026-10-17. Runtime: Node.js v20.14.0 on Windows.

After independent review and additional missing-field coverage: 62 tests passed, 0 failed, 0 skipped. Both empty-template and fictional-profile validation passed. Historical fictional export emitted exactly pref-current. All local Markdown file links resolve, all JSON parses and the heuristic secret/identifier scan found no matches. See [final review](REVIEW.md).

Commands from the project root:

```sh
node --test tests
node tools/check-repository.mjs
node tools/profile.mjs validate templates/records.json
node tools/profile.mjs validate examples/fictional/records.json
node tools/profile.mjs export examples/fictional/records.json examples/fictional/policy.json --as-of 2026-10-17
```

Test-first evidence: suite was added before implementation; execution failed because tools/profile.mjs did not exist. No dependency installation is needed for the tests.

Behavior suite covers default exclusions, exact allowlists, omission of provenance, malformed metadata, unknown keys/versions, duplicate IDs, date boundaries, leap dates, supersession cycles, JSON text isolation, CLI success and failure without partial output.

The repository check verifies local Markdown file targets, JSON parsing and a heuristic scan for common key formats, email addresses and Windows personal paths. It does not validate remote availability, Markdown anchors, all secret formats, indirect identification or semantic truth. Manual review complements it. Public reference files and four license files were rechecked at pinned commits; one standalone LICENSE returned 404. See the inspiration document for exact references.

No real profile, private notes or messages are included. Fictional examples were authored for this project. The owner selected MIT licensing; the copyright attribution uses the verified public owner identity. No private contact details or credentials belong in the release.
