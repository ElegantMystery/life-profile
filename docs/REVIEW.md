# Final independent review

Reviewed 2026-10-17 by a separate read-only local review agent, with implementation-owner verification.

## Outcome

No confirmed export-filtering defect was found. Review covered explicit allowlists, missing metadata, privacy/source/confirmation filters, review and expiry boundaries, superseded records and cycles, CLI paths, and the README walkthrough. The reviewer independently checked the repository hygiene command, deterministic fictional export and 31 in-process behavioral checks. The full suite was also run successfully.

Concrete documentation improvements: state the command working directory; show explicit paths to a separate private instance; explain how to select record IDs; clarify that provenance links are not followed but operating-system input symlinks resolve normally; warn against redirecting output over input files. Added regression coverage for every missing required entry field and invalid identifier line breaks. Final suite: 62 passed, 0 failed, 0 skipped.

## Remaining limitations

- Semantic contradictions are not detected. Mark conflicting claims disputed and reconcile them manually before sharing.
- Labels, confirmation and source kind are supplied by the person. False labels or sensitive information hidden in prose can pass; human review is required.
- JSON preserves text boundaries but cannot prevent a recipient or AI from treating content as instructions.
- No encryption, authentication, filesystem sandbox, access controls, network integration, automatic synchronization or enforced deletion is provided.
- Explicit input paths may be anywhere the running process can read, including symlink targets. Tools do not write output files; shell redirection can overwrite files if misused.
- The historical `--as-of` option deliberately evaluates an earlier date; use it only for tests/history, never to evade current expiry. Normal operation uses UTC today.
- JSON Schema covers shape, not all semantic constraints; run the local validator. The CLI uses standard JSON parsing, so duplicate object member names use the last value. Avoid duplicate keys and inspect source files; this is not a hardened parser for adversarial input.
- The hygiene scanner is heuristic, not proof of absence of personal data or secrets. Remote links and Markdown anchors are not exhaustively checked.
- The original project is MIT licensed. Upstream references are pinned in the inspiration document. One upstream standalone LICENSE could not be verified; no material was copied from it.

The release content contains only the generic project and fictional examples. Private instances and local delivery archives are excluded.
